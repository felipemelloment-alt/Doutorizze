/**
 * 📱 API DE NOTIFICAÇÕES WHATSAPP
 * 
 * Gerencia todas as notificações enviadas via WhatsApp:
 * - Super Job Matches (4/4)
 * - Candidaturas aceitas/rejeitadas
 * - Confirmação de substituições
 * - Lembretes de atendimento
 */

import { base44 } from '@/api/base44Client';

// ═══════════════════════════════════════════════════════
// CORE - CRIAR E ENVIAR
// ═══════════════════════════════════════════════════════

/**
 * Criar notificação (ainda não enviada)
 */
export async function criarNotificacao(data) {
  const notification = await base44.entities.WhatsAppNotification.create({
    tipo: data.tipo,
    destinatario_user_id: data.destinatario_user_id || null,
    destinatario_professional_id: data.destinatario_professional_id || null,
    destinatario_whatsapp: data.destinatario_whatsapp,
    destinatario_nome: data.destinatario_nome,
    job_id: data.job_id || null,
    substituicao_id: data.substituicao_id || null,
    mensagem_texto: data.mensagem_texto,
    mensagem_template: data.mensagem_template || null,
    match_score: data.match_score || null,
    status: 'PENDING',
    metadata: data.metadata || null
  });
  
  return notification;
}

/**
 * Enviar notificação via Evolution API
 */
export async function enviarNotificacao(notificationId) {
  const notifications = await base44.entities.WhatsAppNotification.filter({ id: notificationId });
  const notification = notifications[0];
  
  if (!notification) {
    throw new Error('Notificação não encontrada');
  }
  
  if (notification.status === 'SENT' || notification.status === 'DELIVERED') {
    throw new Error('Notificação já foi enviada');
  }
  
  try {
    // Formatar número para E.164
    let numero = notification.destinatario_whatsapp.replace(/\D/g, '');
    if (numero.length === 11) {
      numero = '55' + numero;
    }
    
    // Enviar via Evolution API
    const response = await fetch('https://creditoodonto-evolution.cloudfy.live/message/sendText/Remarketing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '698A2AC7F52A-4C98-8452-53D933343047'
      },
      body: JSON.stringify({
        number: numero,
        text: notification.mensagem_texto
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Atualizar como enviada
      await base44.entities.WhatsAppNotification.update(notificationId, {
        status: 'SENT',
        sent_at: new Date().toISOString(),
        evolution_message_id: result.key?.id || null,
        evolution_response: result
      });
      
      return { success: true, result };
    } else {
      throw new Error(result.message || 'Falha ao enviar');
    }
  } catch (error) {
    // Incrementar retry
    const retryCount = (notification.retry_count || 0) + 1;
    const status = retryCount >= (notification.max_retries || 3) ? 'FAILED' : 'PENDING';
    
    await base44.entities.WhatsAppNotification.update(notificationId, {
      status,
      retry_count: retryCount,
      error_message: error.message,
      failed_at: status === 'FAILED' ? new Date().toISOString() : null
    });
    
    throw error;
  }
}

/**
 * Verificar se já foi enviada notificação (prevent duplicate)
 */
export async function jaEnviouNotificacao(tipo, referenceId, professionalId) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const query = {
    tipo,
    destinatario_professional_id: professionalId,
    status: { $in: ['SENT', 'DELIVERED', 'READ'] },
    created_date: { $gte: hoje.toISOString() }
  };
  
  // Adicionar referência (job ou substituição)
  if (tipo.includes('JOB') || tipo === 'SUPER_JOB_MATCH') {
    query.job_id = referenceId;
  } else {
    query.substituicao_id = referenceId;
  }
  
  const existing = await base44.entities.WhatsAppNotification.filter(query);
  
  return existing.length > 0;
}

/**
 * Marcar como lida (webhook callback)
 */
export async function marcarComoLida(evolutionMessageId) {
  const notifications = await base44.entities.WhatsAppNotification.filter({
    evolution_message_id: evolutionMessageId
  });
  
  if (notifications.length > 0) {
    await base44.entities.WhatsAppNotification.update(notifications[0].id, {
      status: 'READ',
      read_at: new Date().toISOString()
    });
  }
}

/**
 * Marcar como entregue (webhook callback)
 */
export async function marcarComoEntregue(evolutionMessageId) {
  const notifications = await base44.entities.WhatsAppNotification.filter({
    evolution_message_id: evolutionMessageId
  });
  
  if (notifications.length > 0) {
    await base44.entities.WhatsAppNotification.update(notifications[0].id, {
      status: 'DELIVERED',
      delivered_at: new Date().toISOString()
    });
  }
}

/**
 * Retentar envio de notificações falhadas
 */
export async function retentarFalhadas() {
  const falhadas = await base44.entities.WhatsAppNotification.filter({
    status: 'PENDING',
    retry_count: { $lt: 3 }
  });
  
  const results = [];
  
  for (const notif of falhadas) {
    try {
      await enviarNotificacao(notif.id);
      results.push({ id: notif.id, success: true });
    } catch (error) {
      results.push({ id: notif.id, success: false, error: error.message });
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════
// SUPER_JOB - MATCH 4/4
// ═══════════════════════════════════════════════════════

/**
 * Notificar profissional sobre match perfeito
 */
export async function notificarSuperJobMatch(jobId, professionalId, matchScore) {
  // Verificar se já enviou
  const jaEnviou = await jaEnviouNotificacao('SUPER_JOB_MATCH', jobId, professionalId);
  if (jaEnviou) {
    console.log('Notificação já enviada para este job/profissional');
    return null;
  }
  
  // Buscar dados
  const job = await base44.entities.Job.get(jobId);
  const professional = await base44.entities.Professional.get(professionalId);
  const unit = await base44.entities.CompanyUnit.get(job.unit_id);
  
  // Montar mensagem
  const mensagem = montarMensagemSuperJob(job, unit, professional, matchScore);
  
  // Criar notificação
  const notification = await criarNotificacao({
    tipo: 'SUPER_JOB_MATCH',
    destinatario_user_id: professional.user_id,
    destinatario_professional_id: professionalId,
    destinatario_whatsapp: professional.whatsapp,
    destinatario_nome: professional.nome_completo,
    job_id: jobId,
    mensagem_texto: mensagem,
    mensagem_template: 'super_job_match',
    match_score: matchScore,
    metadata: {
      empresa: unit.nome_fantasia,
      especialidade: job.especialidades_aceitas?.[0],
      cidade: job.cidade,
      uf: job.uf,
      tipo_remuneracao: job.tipo_remuneracao
    }
  });
  
  // Enviar imediatamente
  try {
    await enviarNotificacao(notification.id);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
  
  return notification;
}

/**
 * Montar mensagem de SUPER_JOB
 */
function montarMensagemSuperJob(job, unit, professional, matchScore) {
  let mensagem = `🎯 *MATCH PERFEITO!* (${matchScore}/4)\n\n`;
  mensagem += `Olá, ${professional.nome_completo}!\n\n`;
  mensagem += `Encontramos uma vaga *PERFEITA* para você! ✨\n\n`;
  
  mensagem += `🏢 *Empresa:* ${unit.nome_fantasia}\n`;
  mensagem += `💼 *Vaga:* ${job.titulo}\n`;
  mensagem += `🦷 *Especialidade:* ${job.especialidades_aceitas?.[0] || 'Clínica Geral'}\n`;
  mensagem += `📍 *Local:* ${job.cidade}/${job.uf}\n`;
  
  if (job.tipo_remuneracao === 'FIXO' && job.valor_proposto) {
    mensagem += `💰 *Salário:* R$ ${job.valor_proposto.toFixed(2)}\n`;
  }
  
  mensagem += `\n✅ *Por que é perfeito?*\n`;
  mensagem += `• 100% compatível com seu perfil\n`;
  mensagem += `• Especialidade ideal\n`;
  mensagem += `• Localização perfeita\n`;
  mensagem += `• Regime compatível\n\n`;
  
  mensagem += `🚀 *Acesse agora e candidate-se:*\n`;
  mensagem += `https://app.doutorizze.com/newjobs\n\n`;
  
  mensagem += `⚡ _Vagas com match perfeito são raras!_\n`;
  mensagem += `_Não perca esta oportunidade!_\n\n`;
  
  mensagem += `---\n`;
  mensagem += `_Doutorizze - Sua próxima oportunidade_`;
  
  return mensagem;
}

// ═══════════════════════════════════════════════════════
// SUBSTITUIÇÕES
// ═══════════════════════════════════════════════════════

/**
 * Notificar candidatura aceita
 */
export async function notificarCandidaturaAceita(substituicaoId, professionalId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  const professional = await base44.entities.Professional.get(professionalId);
  
  const mensagem = `✅ *VOCÊ FOI ESCOLHIDO!*\n\n` +
    `Parabéns, ${professional.nome_completo}!\n\n` +
    `Você foi escolhido para a substituição em *${substituicao.nome_clinica}*\n\n` +
    `📋 *Especialidade:* ${substituicao.especialidade_necessaria}\n` +
    `📅 *Data:* ${formatarDataSubstituicao(substituicao)}\n` +
    `📍 *Local:* ${substituicao.cidade}/${substituicao.uf}\n\n` +
    `⏳ Aguardando confirmação da clínica...\n` +
    `_Você será notificado assim que confirmarem._\n\n` +
    `---\n` +
    `_Doutorizze - Sistema de Substituições_`;
  
  const notification = await criarNotificacao({
    tipo: 'CANDIDATURA_ACEITA',
    destinatario_user_id: professional.user_id,
    destinatario_professional_id: professionalId,
    destinatario_whatsapp: professional.whatsapp,
    destinatario_nome: professional.nome_completo,
    substituicao_id: substituicaoId,
    mensagem_texto: mensagem,
    mensagem_template: 'candidatura_aceita'
  });
  
  try {
    await enviarNotificacao(notification.id);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
  
  return notification;
}

/**
 * Notificar candidatura rejeitada
 */
export async function notificarCandidaturaRejeitada(substituicaoId, professionalId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  const professional = await base44.entities.Professional.get(professionalId);
  
  const mensagem = `❌ *Candidatura não aprovada*\n\n` +
    `Olá, ${professional.nome_completo}\n\n` +
    `Infelizmente você não foi selecionado para a substituição em *${substituicao.nome_clinica}*\n\n` +
    `Não desanime! Continue se candidatando às vagas.\n` +
    `Existem muitas outras oportunidades esperando por você! 🚀\n\n` +
    `---\n` +
    `_Doutorizze - Sistema de Substituições_`;
  
  const notification = await criarNotificacao({
    tipo: 'CANDIDATURA_REJEITADA',
    destinatario_user_id: professional.user_id,
    destinatario_professional_id: professionalId,
    destinatario_whatsapp: professional.whatsapp,
    destinatario_nome: professional.nome_completo,
    substituicao_id: substituicaoId,
    mensagem_texto: mensagem,
    mensagem_template: 'candidatura_rejeitada'
  });
  
  try {
    await enviarNotificacao(notification.id);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
  
  return notification;
}

// ═══════════════════════════════════════════════════════
// ESTATÍSTICAS
// ═══════════════════════════════════════════════════════

/**
 * Estatísticas de notificações
 */
export async function estatisticasNotificacoes(filtros = {}) {
  const { tipo, dataInicio, dataFim } = filtros;
  
  const query = {};
  
  if (tipo) query.tipo = tipo;
  if (dataInicio) query.created_date = { $gte: dataInicio };
  if (dataFim) {
    query.created_date = query.created_date || {};
    query.created_date.$lte = dataFim;
  }
  
  const notificacoes = await base44.entities.WhatsAppNotification.filter(query);
  
  const stats = {
    total: notificacoes.length,
    pending: notificacoes.filter(n => n.status === 'PENDING').length,
    sent: notificacoes.filter(n => n.status === 'SENT').length,
    delivered: notificacoes.filter(n => n.status === 'DELIVERED').length,
    read: notificacoes.filter(n => n.status === 'READ').length,
    failed: notificacoes.filter(n => n.status === 'FAILED').length,
    taxa_entrega: 0,
    taxa_leitura: 0
  };
  
  const enviadas = stats.sent + stats.delivered + stats.read;
  if (enviadas > 0) {
    stats.taxa_entrega = Math.round(((stats.delivered + stats.read) / enviadas) * 100);
    stats.taxa_leitura = Math.round((stats.read / enviadas) * 100);
  }
  
  return stats;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function formatarDataSubstituicao(substituicao) {
  if (substituicao.tipo_data === 'IMEDIATO') {
    return new Date(substituicao.data_hora_imediata).toLocaleString('pt-BR');
  } else if (substituicao.tipo_data === 'DATA_ESPECIFICA') {
    return new Date(substituicao.data_especifica).toLocaleDateString('pt-BR');
  } else {
    return `${new Date(substituicao.periodo_inicio).toLocaleDateString('pt-BR')} até ${new Date(substituicao.periodo_fim).toLocaleDateString('pt-BR')}`;
  }
}
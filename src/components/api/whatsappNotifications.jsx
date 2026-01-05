/**
 * API DE NOTIFICACOES WHATSAPP
 *
 * Gerencia todas as notificacoes enviadas via WhatsApp:
 * - Super Job Matches (4/4)
 * - Candidaturas aceitas/rejeitadas
 * - Confirmacao de substituicoes
 * - Lembretes de atendimento
 *
 * SEGURANCA: Usa Cloud Function do Base44 para manter API keys no servidor
 */

import { base44 } from '@/api/base44Client';
import { enviarWhatsAppNotificacao } from '@/components/api/functions';

// ===============================================================
// CORE - CRIAR E ENVIAR
// ===============================================================

/**
 * Criar notificacao (ainda nao enviada)
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
 * Formatar numero para padrao E.164
 */
function formatarNumeroE164(numero) {
  let formatted = numero.replace(/\D/g, '');
  if (formatted.length === 11) {
    formatted = '55' + formatted;
  }
  return formatted;
}

/**
 * Enviar notificacao via Cloud Function (SEGURO)
 */
export async function enviarNotificacao(notificationId) {
  const notifications = await base44.entities.WhatsAppNotification.filter({ id: notificationId });
  const notification = notifications[0];

  if (!notification) {
    throw new Error('Notificacao nao encontrada');
  }

  if (notification.status === 'SENT' || notification.status === 'DELIVERED') {
    throw new Error('Notificacao ja foi enviada');
  }

  try {
    const numero = formatarNumeroE164(notification.destinatario_whatsapp);
    let result;

    // Cloud Function (SEGURO - API key no servidor)
    result = await enviarWhatsAppNotificacao({
      numero,
      mensagem: notification.mensagem_texto,
      notificationId
    });

    // Atualizar como enviada
    await base44.entities.WhatsAppNotification.update(notificationId, {
      status: 'SENT',
      sent_at: new Date().toISOString(),
      evolution_message_id: result?.key?.id || null,
      evolution_response: result
    });

    return { success: true, result };

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
 * Verificar se ja foi enviada notificacao (prevent duplicate)
 */
export async function jaEnviouNotificacao(tipo, referenceId, professionalId) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const query = {
    tipo,
    destinatario_professional_id: professionalId,
    status: { $in: ['SENT', 'DELIVERED', 'READ'] }
  };

  // Adicionar referencia (job ou substituicao)
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
 * Retentar envio de notificacoes falhadas
 */
export async function retentarFalhadas() {
  const falhadas = await base44.entities.WhatsAppNotification.filter({
    status: 'PENDING'
  });

  const results = [];

  for (const notif of falhadas) {
    if ((notif.retry_count || 0) < 3) {
      try {
        await enviarNotificacao(notif.id);
        results.push({ id: notif.id, success: true });
      } catch (error) {
        results.push({ id: notif.id, success: false, error: error.message });
      }
    }
  }

  return results;
}

// ===============================================================
// SUPER_JOB - MATCH 4/4
// ===============================================================

/**
 * Notificar profissional sobre match perfeito
 */
export async function notificarSuperJobMatch(jobId, professionalId, matchScore) {
  // Verificar se ja enviou
  const jaEnviou = await jaEnviouNotificacao('SUPER_JOB_MATCH', jobId, professionalId);
  if (jaEnviou) {
    console.log('Notificacao ja enviada para este job/profissional');
    return null;
  }

  // Buscar dados
  const jobs = await base44.entities.Job.filter({ id: jobId });
  const job = jobs[0];
  const professionals = await base44.entities.Professional.filter({ id: professionalId });
  const professional = professionals[0];
  const units = await base44.entities.CompanyUnit.filter({ id: job.unit_id });
  const unit = units[0];

  // Montar mensagem
  const mensagem = montarMensagemSuperJob(job, unit, professional, matchScore);

  // Criar notificacao
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
    console.error('Erro ao enviar notificacao:', error);
  }

  return notification;
}

/**
 * Montar mensagem de SUPER_JOB
 */
function montarMensagemSuperJob(job, unit, professional, matchScore) {
  let mensagem = `*MATCH PERFEITO!* (${matchScore}/4)\n\n`;
  mensagem += `Ola, ${professional.nome_completo}!\n\n`;
  mensagem += `Encontramos uma vaga *PERFEITA* para voce!\n\n`;

  mensagem += `*Empresa:* ${unit.nome_fantasia}\n`;
  mensagem += `*Vaga:* ${job.titulo}\n`;
  mensagem += `*Especialidade:* ${job.especialidades_aceitas?.[0] || 'Clinica Geral'}\n`;
  mensagem += `*Local:* ${job.cidade}/${job.uf}\n`;

  if (job.tipo_remuneracao === 'FIXO' && job.valor_proposto) {
    mensagem += `*Salario:* R$ ${job.valor_proposto.toFixed(2)}\n`;
  }

  mensagem += `\n*Por que e perfeito?*\n`;
  mensagem += `- 100% compativel com seu perfil\n`;
  mensagem += `- Especialidade ideal\n`;
  mensagem += `- Localizacao perfeita\n`;
  mensagem += `- Regime compativel\n\n`;

  mensagem += `*Acesse agora e candidate-se:*\n`;
  mensagem += `https://app.doutorizze.com/newjobs\n\n`;

  mensagem += `_Vagas com match perfeito sao raras!_\n`;
  mensagem += `_Nao perca esta oportunidade!_\n\n`;

  mensagem += `---\n`;
  mensagem += `_Doutorizze - Sua proxima oportunidade_`;

  return mensagem;
}

// ===============================================================
// SUBSTITUICOES
// ===============================================================

/**
 * Notificar candidatura aceita
 */
export async function notificarCandidaturaAceita(substituicaoId, professionalId) {
  const substituicoes = await base44.entities.SubstituicaoUrgente.filter({ id: substituicaoId });
  const substituicao = substituicoes[0];
  const professionals = await base44.entities.Professional.filter({ id: professionalId });
  const professional = professionals[0];

  const mensagem = `*PARABENS!* Voce foi ESCOLHIDO!\n\n` +
    `Ola, ${professional.nome_completo}!\n\n` +
    `Sua candidatura para a substituicao na *${substituicao.nome_clinica}* foi ACEITA!\n\n` +
    `*Data:* ${new Date(substituicao.data_especifica || substituicao.data_hora_imediata).toLocaleDateString('pt-BR')}\n` +
    `*Horario:* ${substituicao.horario_inicio} - ${substituicao.horario_fim}\n` +
    `*Local:* ${substituicao.cidade}/${substituicao.uf}\n\n` +
    `Acesse o app para ver todos os detalhes.\n\n` +
    `---\n_Doutorizze_`;

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
    console.error('Erro ao enviar notificacao:', error);
  }

  return notification;
}

/**
 * Notificar candidatura rejeitada
 */
export async function notificarCandidaturaRejeitada(substituicaoId, professionalId) {
  const substituicoes = await base44.entities.SubstituicaoUrgente.filter({ id: substituicaoId });
  const substituicao = substituicoes[0];
  const professionals = await base44.entities.Professional.filter({ id: professionalId });
  const professional = professionals[0];

  const mensagem = `Ola, ${professional.nome_completo}!\n\n` +
    `Infelizmente sua candidatura para a substituicao na *${substituicao.nome_clinica}* nao foi selecionada desta vez.\n\n` +
    `Mas nao desanime! Continue ativo no app que novas oportunidades aparecem a todo momento.\n\n` +
    `---\n_Doutorizze_`;

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
    console.error('Erro ao enviar notificacao:', error);
  }

  return notification;
}

// ===============================================================
// ESTATISTICAS
// ===============================================================

/**
 * Obter estatisticas de notificacoes
 */
export async function obterEstatisticas() {
  const todas = await base44.entities.WhatsAppNotification.list();

  const stats = {
    total: todas.length,
    enviadas: todas.filter(n => n.status === 'SENT').length,
    entregues: todas.filter(n => n.status === 'DELIVERED').length,
    lidas: todas.filter(n => n.status === 'READ').length,
    pendentes: todas.filter(n => n.status === 'PENDING').length,
    falhadas: todas.filter(n => n.status === 'FAILED').length,
    taxaEntrega: 0,
    taxaLeitura: 0
  };

  const enviadasTotal = stats.enviadas + stats.entregues + stats.lidas;
  if (enviadasTotal > 0) {
    stats.taxaEntrega = ((stats.entregues + stats.lidas) / enviadasTotal * 100).toFixed(1);
    stats.taxaLeitura = (stats.lidas / enviadasTotal * 100).toFixed(1);
  }

  return stats;
}
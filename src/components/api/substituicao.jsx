/**
 * 🚨 API DE SUBSTITUIÇÕES
 * 
 * Funções para gerenciar todo o sistema de substituição:
 * - Criar vagas (profissional ou clínica)
 * - Candidatar-se
 * - Escolher candidato
 * - Confirmar via WhatsApp
 * - Validar comparecimento
 * - Gerenciar suspensões
 */

import { base44 } from '@/api/base44Client';

// ═══════════════════════════════════════════════════════
// SUBSTITUIÇÕES - CRUD
// ═══════════════════════════════════════════════════════

/**
 * Criar nova vaga de substituição
 */
export async function criarSubstituicao(data) {
  // Validações básicas
  if (!data.criado_por_tipo) {
    throw new Error("Tipo de criador obrigatório");
  }
  
  if (!data.clinica_id) {
    throw new Error("Clínica obrigatória");
  }
  
  if (!data.responsavel_esta_ciente) {
    throw new Error("Responsável deve estar ciente");
  }
  
  // Validar remuneração
  if (data.tipo_remuneracao === 'DIARIA' && !data.valor_diaria) {
    throw new Error("Valor da diária obrigatório");
  }
  
  if (data.tipo_remuneracao === 'PORCENTAGEM' && (!data.procedimentos_porcentagem || data.procedimentos_porcentagem.length === 0)) {
    throw new Error("Adicione pelo menos um procedimento com porcentagem");
  }
  
  // Validar detalhes atendimento (se IMEDIATO)
  if (data.tipo_data === 'IMEDIATO' && !data.tipo_atendimento) {
    throw new Error("Tipo de atendimento obrigatório para substituições imediatas");
  }
  
  const substituicao = await base44.entities.SubstituicaoUrgente.create({
    ...data,
    status: 'RASCUNHO',
    total_candidatos: 0,
    visualizacoes: 0
  });
  
  return substituicao;
}

/**
 * Publicar vaga (mudar de RASCUNHO para ABERTA)
 */
export async function publicarSubstituicao(substituicaoId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  const now = new Date().toISOString();
  
  const updated = await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    status: 'ABERTA',
    publicada_em: now,
    expira_em: calcularExpiracao(substituicao.tipo_data)
  });
  
  // Disparar notificações para profissionais disponíveis
  await notificarProfissionaisDisponiveis(updated);
  
  return updated;
}

/**
 * Calcular data de expiração baseado no tipo
 */
function calcularExpiracao(tipoData) {
  const now = new Date();
  
  switch (tipoData) {
    case 'IMEDIATO':
      // Expira em 48 horas
      return new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
    case 'DATA_ESPECIFICA':
      // Expira 7 dias antes da data
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'PERIODO':
      // Expira 14 dias antes do início
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

/**
 * Listar vagas disponíveis para profissional
 */
export async function listarVagasDisponiveis(filters = {}) {
  const {
    especialidade,
    cidade,
    uf,
    tipo_data,
    tipo_profissional,
    limit = 20,
    offset = 0
  } = filters;
  
  const query = {
    status: 'ABERTA',
    ...(especialidade && { especialidade_necessaria: especialidade }),
    ...(cidade && { cidade }),
    ...(uf && { uf }),
    ...(tipo_data && { tipo_data }),
    ...(tipo_profissional && { tipo_profissional })
  };
  
  const vagas = await base44.entities.SubstituicaoUrgente.filter(query);
  
  return vagas;
}

/**
 * Buscar detalhes de uma vaga
 */
export async function buscarSubstituicao(substituicaoId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  // Incrementar visualizações
  await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    visualizacoes: (substituicao.visualizacoes || 0) + 1
  });
  
  return substituicao;
}

/**
 * Atualizar vaga (apenas criador)
 */
export async function atualizarSubstituicao(substituicaoId, data) {
  return await base44.entities.SubstituicaoUrgente.update(substituicaoId, data);
}

/**
 * Cancelar vaga
 */
export async function cancelarSubstituicao(substituicaoId, motivo) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    status: 'CANCELADA',
    observacoes: (substituicao.observacoes || '') + `\n\nCANCELADO: ${motivo}`
  });
  
  // Notificar candidatos
  await notificarCancelamento(substituicaoId);
  
  return substituicao;
}

// ═══════════════════════════════════════════════════════
// CANDIDATURAS
// ═══════════════════════════════════════════════════════

/**
 * Candidatar-se a uma vaga
 */
export async function candidatarSe(substituicaoId, professionalId, mensagem = null) {
  // Verificar se já está candidatado
  const jaSeCandidata = await base44.entities.CandidaturaSubstituicao.filter({
    substituicao_id: substituicaoId,
    professional_id: professionalId
  });
  
  if (jaSeCandidata.length > 0) {
    throw new Error("Você já se candidatou a esta vaga");
  }
  
  // Verificar se tem conflito de agenda
  const temConflito = await verificarConflitoAgenda(professionalId, substituicaoId);
  if (temConflito) {
    throw new Error("Você já tem compromisso neste horário");
  }
  
  // Criar candidatura
  const candidatura = await base44.entities.CandidaturaSubstituicao.create({
    substituicao_id: substituicaoId,
    professional_id: professionalId,
    mensagem_profissional: mensagem,
    disponibilidade_confirmada: true,
    status: 'AGUARDANDO'
  });
  
  // Atualizar contador
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    total_candidatos: (substituicao.total_candidatos || 0) + 1,
    status: 'EM_SELECAO'
  });
  
  // Notificar criador da vaga
  await notificarNovaCandidatura(substituicaoId, professionalId);
  
  return candidatura;
}

/**
 * Cancelar candidatura (antes de ser escolhido)
 */
export async function cancelarCandidatura(candidaturaId) {
  const candidatura = await base44.entities.CandidaturaSubstituicao.get(candidaturaId);
  
  if (candidatura.status !== 'AGUARDANDO') {
    throw new Error("Não é possível cancelar esta candidatura");
  }
  
  await base44.entities.CandidaturaSubstituicao.delete(candidaturaId);
  
  // Atualizar contador
  const substituicao = await base44.entities.SubstituicaoUrgente.get(candidatura.substituicao_id);
  await base44.entities.SubstituicaoUrgente.update(candidatura.substituicao_id, {
    total_candidatos: Math.max(0, (substituicao.total_candidatos || 0) - 1)
  });
  
  return true;
}

/**
 * Listar candidatos de uma vaga
 */
export async function listarCandidatos(substituicaoId) {
  const candidaturas = await base44.entities.CandidaturaSubstituicao.filter({
    substituicao_id: substituicaoId
  });
  
  // Buscar dados completos dos profissionais
  const candidatosCompletos = await Promise.all(
    candidaturas.map(async (candidatura) => {
      const professional = await base44.entities.Professional.get(candidatura.professional_id);
      return {
        ...candidatura,
        professional
      };
    })
  );
  
  return candidatosCompletos;
}

/**
 * Minhas candidaturas (profissional)
 */
export async function minhasCandidaturas(professionalId, status = null) {
  const query = {
    professional_id: professionalId,
    ...(status && { status })
  };
  
  const candidaturas = await base44.entities.CandidaturaSubstituicao.filter(query);
  
  // Buscar dados das substituições
  const candidaturasCompletas = await Promise.all(
    candidaturas.map(async (candidatura) => {
      const substituicao = await base44.entities.SubstituicaoUrgente.get(candidatura.substituicao_id);
      return {
        ...candidatura,
        substituicao
      };
    })
  );
  
  return candidaturasCompletas;
}

// ═══════════════════════════════════════════════════════
// ESCOLHA DE CANDIDATO
// ═══════════════════════════════════════════════════════

/**
 * Escolher candidato para vaga
 */
export async function escolherCandidato(substituicaoId, candidaturaId, userId) {
  const candidatura = await base44.entities.CandidaturaSubstituicao.get(candidaturaId);
  
  if (candidatura.substituicao_id !== substituicaoId) {
    throw new Error("Candidatura não pertence a esta vaga");
  }
  
  // Atualizar candidatura escolhida
  await base44.entities.CandidaturaSubstituicao.update(candidaturaId, {
    status: 'ESCOLHIDO',
    notificado_resultado: false
  });
  
  // Atualizar vaga
  const now = new Date().toISOString();
  await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    status: 'AGUARDANDO_CONFIRMACAO_CLINICA',
    profissional_escolhido_id: candidatura.professional_id,
    escolhido_em: now,
    escolhido_por_user_id: userId
  });
  
  // Marcar outros como rejeitados
  const outrasCandidaturas = await base44.entities.CandidaturaSubstituicao.filter({
    substituicao_id: substituicaoId,
    status: 'AGUARDANDO'
  });
  
  await Promise.all(
    outrasCandidaturas.map(c => 
      base44.entities.CandidaturaSubstituicao.update(c.id, {
        status: 'REJEITADO',
        notificado_resultado: false
      })
    )
  );
  
  // Disparar WhatsApp para responsável
  await enviarWhatsAppConfirmacao(substituicaoId);
  
  return candidatura;
}

/**
 * Gerar código de confirmação (6 dígitos)
 */
function gerarCodigoConfirmacao() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Enviar WhatsApp de confirmação
 */
async function enviarWhatsAppConfirmacao(substituicaoId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  const profissional = await base44.entities.Professional.get(substituicao.profissional_escolhido_id);
  
  const codigo = gerarCodigoConfirmacao();
  const linkConfirmacao = `https://app.doutorizze.com/confirmar-substituicao/${substituicaoId}?codigo=${codigo}`;
  
  // Atualizar com código
  await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    confirmacao_codigo: codigo,
    confirmacao_enviada_em: new Date().toISOString(),
    confirmacao_metodo: 'WHATSAPP'
  });
  
  // Montar mensagem
  const mensagem = montarMensagemWhatsApp(substituicao, profissional, codigo, linkConfirmacao);
  
  // Disparar via n8n webhook
  await fetch('https://seu-n8n.com/webhook/whatsapp-confirmacao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numero: substituicao.responsavel_whatsapp,
      mensagem,
      link: linkConfirmacao
    })
  });
  
  return true;
}

/**
 * Montar mensagem WhatsApp de confirmação
 */
function montarMensagemWhatsApp(substituicao, profissional, codigo, link) {
  const isProfissionalCriou = substituicao.criado_por_tipo === 'PROFISSIONAL';
  
  let mensagem = `🏥 *AUTORIZAÇÃO DE SUBSTITUIÇÃO*\n\n`;
  mensagem += `Olá, ${substituicao.responsavel_nome}!\n\n`;
  
  if (isProfissionalCriou) {
    mensagem += `O profissional que trabalha aí criou uma vaga de substituição:\n\n`;
    mensagem += `📋 *Motivo:* ${substituicao.motivo_profissional}\n\n`;
  } else {
    mensagem += `A *${substituicao.nome_clinica}* criou uma vaga e escolheu um profissional:\n\n`;
    mensagem += `📋 *Motivo:* ${substituicao.motivo_clinica}\n\n`;
  }
  
  mensagem += `👨‍⚕️ *Profissional escolhido:* ${profissional.nome_completo}\n`;
  mensagem += `⭐ Avaliação: ${profissional.media_avaliacoes || 'N/A'}/5\n`;
  mensagem += `🏆 Taxa comparecimento: ${profissional.taxa_comparecimento || 100}%\n`;
  mensagem += `🎓 Formado há ${profissional.tempo_formado_anos} anos\n\n`;
  
  mensagem += `🦷 *Especialidade:* ${substituicao.especialidade_necessaria}\n`;
  
  // Data formatada
  if (substituicao.tipo_data === 'IMEDIATO') {
    mensagem += `📅 *Data:* ${formatarDataHora(substituicao.data_hora_imediata)}\n`;
  } else if (substituicao.tipo_data === 'DATA_ESPECIFICA') {
    mensagem += `📅 *Data:* ${formatarData(substituicao.data_especifica)}\n`;
    mensagem += `⏰ *Horário:* ${substituicao.horario_inicio} - ${substituicao.horario_fim}\n`;
  } else {
    mensagem += `📅 *Período:* ${formatarData(substituicao.periodo_inicio)} até ${formatarData(substituicao.periodo_fim)}\n`;
  }
  
  mensagem += `📍 *Local:* ${substituicao.nome_clinica}\n`;
  mensagem += `${substituicao.endereco_completo} - ${substituicao.cidade}/${substituicao.uf}\n\n`;
  
  // Remuneração
  mensagem += `💰 *REMUNERAÇÃO:*\n`;
  if (substituicao.tipo_remuneracao === 'DIARIA') {
    mensagem += `Tipo: Diária de R$ ${substituicao.valor_diaria.toFixed(2)}\n`;
  } else {
    mensagem += `Tipo: Porcentagem por procedimento\n`;
    substituicao.procedimentos_porcentagem.forEach(p => {
      mensagem += `• ${p.procedimento}: ${p.porcentagem}%\n`;
    });
  }
  mensagem += `Forma: ${formatarFormaPagamento(substituicao.forma_pagamento)}\n`;
  mensagem += `Paga por: ${substituicao.quem_paga === 'CLINICA' ? 'Clínica' : 'Profissional'}\n\n`;
  
  // Atendimento (se imediato)
  if (substituicao.tipo_data === 'IMEDIATO' && substituicao.tipo_atendimento) {
    mensagem += `📋 *ATENDIMENTO:*\n`;
    mensagem += `Tipo: ${substituicao.tipo_atendimento === 'HORARIO_MARCADO' ? 'Horário marcado' : 'Ordem de chegada'}\n`;
    mensagem += `Pacientes: ${substituicao.total_pacientes_agendados || substituicao.estimativa_pacientes}\n`;
    if (substituicao.procedimentos_esperados) {
      mensagem += `Procedimentos: ${substituicao.procedimentos_esperados.join(', ')}\n`;
    }
    mensagem += `\n`;
  }
  
  mensagem += `⚠️ *VOCÊ AUTORIZA esta substituição?*\n\n`;
  mensagem += `*Código de Confirmação:* \`${codigo}\`\n\n`;
  mensagem += `✅ Para CONFIRMAR, responda: SIM ${codigo}\n`;
  mensagem += `❌ Para REJEITAR, responda: NAO ${codigo}\n\n`;
  mensagem += `Ou clique no link:\n`;
  mensagem += `👉 ${link}\n\n`;
  mensagem += `---\n`;
  mensagem += `_Esta confirmação garante segurança para ambas as partes_\n`;
  mensagem += `_Doutorizze - Sistema de Substituições_`;
  
  return mensagem;
}

/**
 * Confirmar substituição (via link ou WhatsApp)
 */
export async function confirmarSubstituicao(substituicaoId, codigo, aprovado, motivoRejeicao = null) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  // Validar código
  if (substituicao.confirmacao_codigo !== codigo) {
    throw new Error("Código de confirmação inválido");
  }
  
  const now = new Date().toISOString();
  
  if (aprovado) {
    // APROVADO!
    await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
      status: 'CONFIRMADA',
      confirmacao_recebida_em: now,
      confirmacao_resposta: 'APROVADO'
    });
    
    // Criar bloqueio de agenda
    await criarBloqueioAgenda(substituicaoId);
    
    // Notificar profissional escolhido
    await notificarConfirmacaoAprovada(substituicaoId);
    
    // Notificar criador da vaga
    await notificarCriadorConfirmada(substituicaoId);
    
  } else {
    // REJEITADO
    await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
      status: 'REJEITADA_CLINICA',
      confirmacao_recebida_em: now,
      confirmacao_resposta: 'REJEITADO',
      confirmacao_motivo_rejeicao: motivoRejeicao
    });
    
    // Voltar candidatura para AGUARDANDO
    const candidatura = await base44.entities.CandidaturaSubstituicao.filter({
      substituicao_id: substituicaoId,
      status: 'ESCOLHIDO'
    });
    
    if (candidatura.length > 0) {
      await base44.entities.CandidaturaSubstituicao.update(candidatura[0].id, {
        status: 'REJEITADO'
      });
    }
    
    // Limpar profissional escolhido
    await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
      profissional_escolhido_id: null,
      escolhido_em: null,
      status: 'EM_SELECAO' // Volta para seleção
    });
    
    // Notificar profissional e criador
    await notificarConfirmacaoRejeitada(substituicaoId, motivoRejeicao);
  }
  
  return true;
}

// ═══════════════════════════════════════════════════════
// BLOQUEIO DE AGENDA
// ═══════════════════════════════════════════════════════

/**
 * Criar bloqueio de agenda quando confirmado
 */
async function criarBloqueioAgenda(substituicaoId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  let dataInicio, dataFim, horarioInicio, horarioFim;
  
  if (substituicao.tipo_data === 'IMEDIATO' || substituicao.tipo_data === 'DATA_ESPECIFICA') {
    dataInicio = substituicao.data_especifica || new Date(substituicao.data_hora_imediata).toISOString().split('T')[0];
    dataFim = dataInicio;
    horarioInicio = substituicao.horario_inicio;
    horarioFim = substituicao.horario_fim;
  } else {
    dataInicio = substituicao.periodo_inicio;
    dataFim = substituicao.periodo_fim;
    horarioInicio = null;
    horarioFim = null;
  }
  
  await base44.entities.BloqueioAgenda.create({
    professional_id: substituicao.profissional_escolhido_id,
    substituicao_id: substituicaoId,
    tipo: 'SUBSTITUICAO',
    data_inicio: dataInicio,
    data_fim: dataFim,
    horario_inicio: horarioInicio,
    horario_fim: horarioFim,
    motivo: `Substituição confirmada - ${substituicao.nome_clinica}`,
    ativo: true
  });
  
  return true;
}

/**
 * Verificar conflito de agenda
 */
async function verificarConflitoAgenda(professionalId, substituicaoId) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  let dataVerificar;
  if (substituicao.tipo_data === 'DATA_ESPECIFICA') {
    dataVerificar = substituicao.data_especifica;
  } else if (substituicao.tipo_data === 'IMEDIATO') {
    dataVerificar = new Date(substituicao.data_hora_imediata).toISOString().split('T')[0];
  } else {
    dataVerificar = substituicao.periodo_inicio;
  }
  
  const bloqueios = await base44.entities.BloqueioAgenda.filter({
    professional_id: professionalId,
    ativo: true
  });
  
  // Verificar se tem bloqueio na data
  const temConflito = bloqueios.some(b => {
    return dataVerificar >= b.data_inicio && dataVerificar <= b.data_fim;
  });
  
  return temConflito;
}

// ═══════════════════════════════════════════════════════
// VALIDAÇÃO DE COMPARECIMENTO
// ═══════════════════════════════════════════════════════

/**
 * Validar comparecimento
 */
export async function validarComparecimento(substituicaoId, data) {
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  const user = await base44.auth.me();
  
  const validacao = await base44.entities.ValidacaoComparecimento.create({
    substituicao_id: substituicaoId,
    professional_id: substituicao.profissional_escolhido_id,
    clinica_id: substituicao.clinica_id,
    compareceu: data.compareceu,
    avaliacao_clinica: data.avaliacao_clinica || null,
    pontualidade: data.pontualidade || null,
    minutos_atraso: data.minutos_atraso || null,
    observacoes_clinica: data.observacoes_clinica || null,
    motivo_nao_comparecimento: data.motivo_nao_comparecimento || null,
    foi_justificado: false,
    validado_por_user_id: user.id
  });
  
  // Atualizar status da substituição
  await base44.entities.SubstituicaoUrgente.update(substituicaoId, {
    status: 'COMPLETA'
  });
  
  // Atualizar estatísticas do profissional
  await atualizarEstatisticasProfissional(substituicao.profissional_escolhido_id, data.compareceu);
  
  // Se não compareceu, aplicar punição
  if (!data.compareceu) {
    await aplicarPunicao(substituicao.profissional_escolhido_id, substituicaoId);
  }
  
  return validacao;
}

/**
 * Atualizar estatísticas do profissional
 */
async function atualizarEstatisticasProfissional(professionalId, compareceu) {
  const professional = await base44.entities.Professional.get(professionalId);
  
  const completadas = (professional.substituicoes_completadas || 0) + (compareceu ? 1 : 0);
  const naoCompareceu = (professional.substituicoes_nao_compareceu || 0) + (compareceu ? 0 : 1);
  const total = completadas + naoCompareceu;
  const taxa = total > 0 ? (completadas / total) * 100 : 100;
  
  await base44.entities.Professional.update(professionalId, {
    substituicoes_completadas: completadas,
    substituicoes_nao_compareceu: naoCompareceu,
    taxa_comparecimento: Math.round(taxa * 100) / 100
  });
}

/**
 * Aplicar punição por não comparecimento
 */
async function aplicarPunicao(professionalId, substituicaoId) {
  const professional = await base44.entities.Professional.get(professionalId);
  const faltas = (professional.substituicoes_nao_compareceu || 0) + 1;
  
  let diasSuspensao = 0;
  let tipoSuspensao = '';
  
  if (faltas === 1) {
    // 1ª falta: Apenas AVISO (0 dias)
    tipoSuspensao = 'NAO_COMPARECEU_1X';
    diasSuspensao = 0;
  } else if (faltas === 2) {
    // 2ª falta: 7 DIAS
    tipoSuspensao = 'NAO_COMPARECEU_2X';
    diasSuspensao = 7;
  } else if (faltas >= 3) {
    // 3ª+ falta: 30 DIAS
    tipoSuspensao = 'NAO_COMPARECEU_3X';
    diasSuspensao = 30;
  }
  
  if (diasSuspensao > 0) {
    const now = new Date();
    const termino = new Date(now.getTime() + diasSuspensao * 24 * 60 * 60 * 1000);
    
    await base44.entities.SuspensaoProfissional.create({
      professional_id: professionalId,
      tipo_suspensao: tipoSuspensao,
      dias_suspensao: diasSuspensao,
      inicia_em: now.toISOString(),
      termina_em: termino.toISOString(),
      motivo: `Não compareceu à substituição (${faltas}ª falta)`,
      substituicao_relacionada_id: substituicaoId,
      ativa: true,
      created_by_user_id: 'SYSTEM'
    });
    
    // Marcar profissional como suspenso
    await base44.entities.Professional.update(professionalId, {
      esta_suspenso: true,
      suspenso_ate: termino.toISOString(),
      motivo_suspensao: `${faltas}ª falta - ${diasSuspensao} dias de suspensão`
    });
    
    // Notificar profissional
    await notificarSuspensao(professionalId, diasSuspensao, faltas);
  } else {
    // Apenas aviso
    await notificarAviso(professionalId);
  }
}

// ═══════════════════════════════════════════════════════
// DISPONIBILIDADE
// ═══════════════════════════════════════════════════════

/**
 * Toggle disponibilidade (ON/OFF)
 */
export async function toggleDisponibilidade(professionalId, disponivel) {
  const status = disponivel ? 'ONLINE' : 'OFFLINE';
  
  await base44.entities.Professional.update(professionalId, {
    disponivel_substituicao: disponivel,
    status_disponibilidade_substituicao: status,
    ultima_atualizacao_status: new Date().toISOString()
  });
  
  return { disponivel, status };
}

/**
 * Buscar profissionais disponíveis
 */
export async function buscarProfissionaisDisponiveis(filters = {}) {
  const { especialidade, cidade, uf, tipo_profissional } = filters;
  
  const query = {
    disponivel_substituicao: true,
    status_disponibilidade_substituicao: 'ONLINE',
    esta_suspenso: false,
    ...(especialidade && { especialidade_principal: especialidade }),
    ...(cidade && { cidades_atendimento: cidade }),
    ...(uf && { uf_conselho: uf }),
    ...(tipo_profissional && { tipo_profissional })
  };
  
  return await base44.entities.Professional.filter(query);
}

// ═══════════════════════════════════════════════════════
// NOTIFICAÇÕES (Placeholders - implementar com n8n)
// ═══════════════════════════════════════════════════════

async function notificarProfissionaisDisponiveis(substituicao) {
  // Buscar profissionais online e disponíveis
  const profissionais = await base44.entities.Professional.filter({
    disponivel_substituicao: true,
    status_disponibilidade_substituicao: 'ONLINE',
    esta_suspenso: false
  });
  
  // Log sem PII
  // logger.debug(`Notificando ${profissionais.length} profissionais`);
}

async function notificarNovaCandidatura(substituicaoId, professionalId) {
  // Dispara notificação sem logar PII
  // Implementar via WhatsApp/Push
}

async function notificarCancelamento(substituicaoId) {
  // Notificar candidatos sobre cancelamento
  // Implementar via WhatsApp/Push
}

async function notificarConfirmacaoAprovada(substituicaoId) {
  const { notificarCandidaturaAceita } = await import('./whatsappNotifications');
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  if (substituicao.profissional_escolhido_id) {
    await notificarCandidaturaAceita(substituicaoId, substituicao.profissional_escolhido_id);
  }
}

async function notificarCriadorConfirmada(substituicaoId) {
  // Notificar criador sobre confirmação
  // Implementar via WhatsApp/Push
}

async function notificarConfirmacaoRejeitada(substituicaoId, motivo) {
  const { notificarCandidaturaRejeitada } = await import('./whatsappNotifications');
  const substituicao = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
  
  if (substituicao.profissional_escolhido_id) {
    await notificarCandidaturaRejeitada(substituicaoId, substituicao.profissional_escolhido_id);
  }
}

async function notificarSuspensao(professionalId, dias, faltas) {
  // Notificar profissional sobre suspensão
  // Implementar via WhatsApp/Push - sem logar PII
}

async function notificarAviso(professionalId) {
  // Notificar profissional sobre aviso
  // Implementar via WhatsApp/Push - sem logar PII
}

// ═══════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

function formatarDataHora(data) {
  return new Date(data).toLocaleString('pt-BR');
}

function formatarFormaPagamento(forma) {
  const map = {
    PIX_FINAL_DIA: 'PIX final do dia',
    DINHEIRO: 'Dinheiro',
    TRANSFERENCIA: 'Transferência bancária',
    CHEQUE: 'Cheque',
    OUTRO: 'Outro'
  };
  return map[forma] || forma;
}
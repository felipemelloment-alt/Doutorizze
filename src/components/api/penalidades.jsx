/**
 * 🚨 SISTEMA DE PENALIDADES PROGRESSIVAS
 * 
 * Gerencia bloqueios progressivos para prevenir abuso de ativação/desativação
 */

import { base44 } from '@/api/base44Client';

// ═══════════════════════════════════════════════════════
// CONFIGURAÇÃO DE NÍVEIS
// ═══════════════════════════════════════════════════════

export const NIVEIS_PENALIDADE = {
  0: { label: 'Sem penalidade', dias: 0, cor: 'green' },
  1: { label: 'Aviso', dias: 0, cor: 'yellow' },
  2: { label: 'Bloqueio 24h', dias: 1, cor: 'orange' },
  3: { label: 'Bloqueio 72h', dias: 3, cor: 'orange' },
  4: { label: 'Bloqueio 7 dias', dias: 7, cor: 'red' },
  5: { label: 'Bloqueio 30 dias', dias: 30, cor: 'red' },
  6: { label: 'Bloqueio permanente', dias: 999999, cor: 'red' }
};

// ═══════════════════════════════════════════════════════
// LIMITES
// ═══════════════════════════════════════════════════════

const LIMITE_ATIVACOES_DIA = 2;
const LIMITE_DESATIVACOES_DIA = 2;

// ═══════════════════════════════════════════════════════
// VERIFICAR SE PODE ATIVAR/DESATIVAR
// ═══════════════════════════════════════════════════════

/**
 * Verifica se profissional pode ativar disponibilidade
 */
export async function podeAtivar(professional) {
  // Verificar bloqueio
  if (professional.data_desbloqueio) {
    const agora = new Date();
    const desbloqueio = new Date(professional.data_desbloqueio);
    
    if (agora < desbloqueio) {
      const diasRestantes = Math.ceil((desbloqueio - agora) / (1000 * 60 * 60 * 24));
      return {
        pode: false,
        motivo: `Você está bloqueado por ${diasRestantes} dia(s)`,
        nivel: professional.nivel_penalidade
      };
    }
  }

  // Verificar limite de ativações
  if (professional.ativacoes_hoje >= LIMITE_ATIVACOES_DIA) {
    return {
      pode: false,
      motivo: `Limite de ${LIMITE_ATIVACOES_DIA} ativações por dia atingido`,
      nivel: professional.nivel_penalidade
    };
  }

  return { pode: true };
}

/**
 * Verifica se profissional pode desativar disponibilidade
 */
export function podeDesativar(professional) {
  // Verificar limite de desativações
  if (professional.desativacoes_hoje >= LIMITE_DESATIVACOES_DIA) {
    return {
      pode: false,
      motivo: `Limite de ${LIMITE_DESATIVACOES_DIA} desativações por dia atingido`
    };
  }

  return { pode: true };
}

// ═══════════════════════════════════════════════════════
// ATIVAR/DESATIVAR COM CONTROLE
// ═══════════════════════════════════════════════════════

/**
 * Ativar disponibilidade com controle de limites
 */
export async function ativarDisponibilidade(professionalId) {
  const professional = await base44.entities.Professional.get(professionalId);
  
  const verificacao = await podeAtivar(professional);
  if (!verificacao.pode) {
    throw new Error(verificacao.motivo);
  }

  const agora = new Date().toISOString();
  
  await base44.entities.Professional.update(professionalId, {
    disponivel_substituicao: true,
    status_disponibilidade_substituicao: 'ONLINE',
    ultima_atualizacao_status: agora,
    ultima_ativacao: agora,
    ativacoes_hoje: (professional.ativacoes_hoje || 0) + 1
  });

  return true;
}

/**
 * Desativar disponibilidade com controle de limites
 */
export async function desativarDisponibilidade(professionalId, justificativa) {
  if (!justificativa || justificativa.trim().length < 10) {
    throw new Error('Justificativa obrigatória (mínimo 10 caracteres)');
  }

  const professional = await base44.entities.Professional.get(professionalId);
  
  const verificacao = podeDesativar(professional);
  if (!verificacao.pode) {
    throw new Error(verificacao.motivo);
  }

  const agora = new Date().toISOString();
  
  await base44.entities.Professional.update(professionalId, {
    disponivel_substituicao: false,
    status_disponibilidade_substituicao: 'OFFLINE',
    ultima_atualizacao_status: agora,
    ultima_desativacao: agora,
    desativacoes_hoje: (professional.desativacoes_hoje || 0) + 1,
    justificativa_desativacao: justificativa
  });

  return true;
}

// ═══════════════════════════════════════════════════════
// APLICAR PENALIDADE
// ═══════════════════════════════════════════════════════

/**
 * Aplicar penalidade progressiva
 */
export async function aplicarPenalidade(professionalId, motivo) {
  const professional = await base44.entities.Professional.get(professionalId);
  
  const nivelAtual = professional.nivel_penalidade || 0;
  const novoNivel = Math.min(nivelAtual + 1, 6);
  const config = NIVEIS_PENALIDADE[novoNivel];
  
  const agora = new Date();
  const desbloqueio = new Date(agora.getTime() + config.dias * 24 * 60 * 60 * 1000);
  
  const historico = professional.historico_penalidades || [];
  historico.push({
    data: agora.toISOString(),
    nivel: novoNivel,
    motivo: motivo,
    dias_bloqueio: config.dias
  });

  await base44.entities.Professional.update(professionalId, {
    nivel_penalidade: novoNivel,
    data_desbloqueio: config.dias > 0 ? desbloqueio.toISOString() : null,
    historico_penalidades: historico,
    disponivel_substituicao: false,
    status_disponibilidade_substituicao: 'OFFLINE'
  });

  return {
    nivel: novoNivel,
    diasBloqueio: config.dias,
    dataDesbloqueio: desbloqueio
  };
}

// ═══════════════════════════════════════════════════════
// RESET DIÁRIO (SCHEDULED TASK)
// ═══════════════════════════════════════════════════════

/**
 * Resetar contadores diários (rodar à meia-noite)
 */
export async function resetContadoresDiarios() {
  const professionals = await base44.asServiceRole.entities.Professional.filter({
    $or: [
      { ativacoes_hoje: { $gt: 0 } },
      { desativacoes_hoje: { $gt: 0 } }
    ]
  });

  for (const prof of professionals) {
    await base44.asServiceRole.entities.Professional.update(prof.id, {
      ativacoes_hoje: 0,
      desativacoes_hoje: 0
    });
  }

  return professionals.length;
}

// ═══════════════════════════════════════════════════════
// VERIFICAR E DESBLOQUEAR
// ═══════════════════════════════════════════════════════

/**
 * Verificar e desbloquear profissionais com bloqueio expirado (rodar periodicamente)
 */
export async function desbloquearPenalidades() {
  const agora = new Date();
  
  const bloqueados = await base44.asServiceRole.entities.Professional.filter({
    data_desbloqueio: { $lte: agora.toISOString() }
  });

  for (const prof of bloqueados) {
    // Não resetar o nível, apenas remover bloqueio
    await base44.asServiceRole.entities.Professional.update(prof.id, {
      data_desbloqueio: null
    });
  }

  return bloqueados.length;
}

// ═══════════════════════════════════════════════════════
// SUPORTE
// ═══════════════════════════════════════════════════════

export const EMAIL_SUPORTE = 'felipe.mello@doutorizze.com.br';

/**
 * Verificar se deve mostrar botão de suporte
 */
export function deveMostrarBotaoSuporte(professional) {
  return (professional.nivel_penalidade || 0) >= 2;
}
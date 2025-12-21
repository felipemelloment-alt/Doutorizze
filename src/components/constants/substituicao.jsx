/**
 * 📋 CONSTANTES DO SISTEMA DE SUBSTITUIÇÃO
 */

// ═══════════════════════════════════════════════════════
// PROCEDIMENTOS ODONTOLÓGICOS
// ═══════════════════════════════════════════════════════

export const PROCEDIMENTOS_ODONTO = [
  // Endodontia
  { value: 'canal_anterior', label: 'Canal - Dente anterior', categoria: 'Endodontia' },
  { value: 'canal_pre_molar', label: 'Canal - Pré-molar', categoria: 'Endodontia' },
  { value: 'canal_molar', label: 'Canal - Molar', categoria: 'Endodontia' },
  { value: 'retratamento_canal', label: 'Retratamento de canal', categoria: 'Endodontia' },
  { value: 'apicectomia', label: 'Apicectomia', categoria: 'Endodontia' },
  
  // Dentística
  { value: 'restauracao_resina', label: 'Restauração - Resina composta', categoria: 'Dentística' },
  { value: 'restauracao_amalgama', label: 'Restauração - Amálgama', categoria: 'Dentística' },
  { value: 'restauracao_ionomero', label: 'Restauração - Ionômero', categoria: 'Dentística' },
  { value: 'clareamento', label: 'Clareamento dental', categoria: 'Dentística' },
  { value: 'faceta_resina', label: 'Faceta de resina', categoria: 'Dentística' },
  { value: 'faceta_porcelana', label: 'Faceta de porcelana', categoria: 'Dentística' },
  
  // Cirurgia
  { value: 'extracao_simples', label: 'Extração simples', categoria: 'Cirurgia' },
  { value: 'extracao_complexa', label: 'Extração complexa', categoria: 'Cirurgia' },
  { value: 'extracao_siso', label: 'Extração siso incluso', categoria: 'Cirurgia' },
  { value: 'implante', label: 'Implante unitário', categoria: 'Cirurgia' },
  { value: 'enxerto_osseo', label: 'Enxerto ósseo', categoria: 'Cirurgia' },
  { value: 'gengivoplastia', label: 'Gengivoplastia', categoria: 'Cirurgia' },
  
  // Periodontia
  { value: 'limpeza', label: 'Limpeza/Profilaxia', categoria: 'Periodontia' },
  { value: 'raspagem', label: 'Raspagem subgengival', categoria: 'Periodontia' },
  { value: 'tratamento_periodontal', label: 'Tratamento periodontal básico', categoria: 'Periodontia' },
  { value: 'cirurgia_periodontal', label: 'Cirurgia periodontal', categoria: 'Periodontia' },
  
  // Prótese
  { value: 'coroa_provisoria', label: 'Coroa provisória', categoria: 'Prótese' },
  { value: 'coroa_metalceramica', label: 'Coroa metalocerâmica', categoria: 'Prótese' },
  { value: 'coroa_porcelana', label: 'Coroa porcelana pura', categoria: 'Prótese' },
  { value: 'ponte_fixa', label: 'Ponte fixa', categoria: 'Prótese' },
  { value: 'protese_total', label: 'Prótese total', categoria: 'Prótese' },
  { value: 'protese_parcial', label: 'Prótese parcial removível', categoria: 'Prótese' },
  
  // Ortodontia
  { value: 'manutencao_aparelho', label: 'Manutenção aparelho fixo', categoria: 'Ortodontia' },
  { value: 'instalacao_aparelho', label: 'Instalação aparelho', categoria: 'Ortodontia' },
  { value: 'remocao_aparelho', label: 'Remoção aparelho', categoria: 'Ortodontia' },
  { value: 'contencao', label: 'Contenção', categoria: 'Ortodontia' },
  
  // Outros
  { value: 'urgencia', label: 'Urgência/Dor', categoria: 'Outros' },
  { value: 'consulta', label: 'Consulta avaliação', categoria: 'Outros' },
  { value: 'radiografia', label: 'Radiografia', categoria: 'Outros' },
  { value: 'documentacao', label: 'Documentação ortodôntica', categoria: 'Outros' },
  { value: 'outro', label: 'Outro procedimento', categoria: 'Outros' }
];

// ═══════════════════════════════════════════════════════
// ESPECIALIDADES
// ═══════════════════════════════════════════════════════

export const ESPECIALIDADES = [
  'Clínica Geral',
  'Endodontia',
  'Ortodontia',
  'Periodontia',
  'Implantodontia',
  'Prótese',
  'Cirurgia Bucomaxilofacial',
  'Dentística',
  'Odontopediatria',
  'Radiologia',
  'Estomatologia',
  'Patologia Oral',
  'DTM e Dor Orofacial',
  'Harmonização Orofacial'
];

// ═══════════════════════════════════════════════════════
// TIPOS DE REMUNERAÇÃO
// ═══════════════════════════════════════════════════════

export const TIPOS_REMUNERACAO = [
  { value: 'DIARIA', label: '💵 Diária (Valor fixo)', icon: '💵' },
  { value: 'PORCENTAGEM', label: '📊 Porcentagem (Por procedimento)', icon: '📊' }
];

// ═══════════════════════════════════════════════════════
// FORMAS DE PAGAMENTO
// ═══════════════════════════════════════════════════════

export const FORMAS_PAGAMENTO = [
  { value: 'PIX_FINAL_DIA', label: 'PIX final do dia' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'TRANSFERENCIA', label: 'Transferência bancária' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OUTRO', label: 'Outro' }
];

// ═══════════════════════════════════════════════════════
// TIPOS DE DATA
// ═══════════════════════════════════════════════════════

export const TIPOS_DATA = [
  { value: 'IMEDIATO', label: '⚡ IMEDIATO', desc: 'Próximas horas - HOJE', icon: '⚡' },
  { value: 'DATA_ESPECIFICA', label: '📅 DIA ESPECÍFICO', desc: 'Agendar para uma data', icon: '📅' },
  { value: 'PERIODO', label: '🗓️ PERÍODO', desc: 'Cobrir vários dias', icon: '🗓️' }
];

// ═══════════════════════════════════════════════════════
// TIPOS DE ATENDIMENTO
// ═══════════════════════════════════════════════════════

export const TIPOS_ATENDIMENTO = [
  { value: 'HORARIO_MARCADO', label: '📅 HORÁRIO MARCADO', desc: 'Pacientes com hora agendada', icon: '📅' },
  { value: 'ORDEM_CHEGADA', label: '🚶 ORDEM DE CHEGADA', desc: 'Fila, sem hora marcada', icon: '🚶' }
];

// ═══════════════════════════════════════════════════════
// COMPLEXIDADE DE PROCEDIMENTOS
// ═══════════════════════════════════════════════════════

export const COMPLEXIDADES = [
  { value: 'SIMPLES', label: 'Simples' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' }
];

// ═══════════════════════════════════════════════════════
// TIPOS DE VÍNCULO
// ═══════════════════════════════════════════════════════

export const TIPOS_VINCULO = [
  { value: 'CONTRATADO', label: 'Contratado (CLT)' },
  { value: 'AUTONOMO', label: 'Autônomo' },
  { value: 'SOCIO', label: 'Sócio' },
  { value: 'ASSOCIADO', label: 'Associado' }
];

// ═══════════════════════════════════════════════════════
// CARGOS RESPONSÁVEIS
// ═══════════════════════════════════════════════════════

export const CARGOS_RESPONSAVEL = [
  'Sócio',
  'Proprietário',
  'Diretor',
  'Gerente',
  'Coordenador',
  'Outro'
];

// ═══════════════════════════════════════════════════════
// MOTIVOS (PROFISSIONAL)
// ═══════════════════════════════════════════════════════

export const MOTIVOS_PROFISSIONAL = [
  'Viagem programada',
  'Doença',
  'Compromisso pessoal',
  'Férias',
  'Emergência familiar',
  'Outro'
];

// ═══════════════════════════════════════════════════════
// MOTIVOS (CLÍNICA)
// ═══════════════════════════════════════════════════════

export const MOTIVOS_CLINICA = [
  'Dentista titular de férias',
  'Dentista titular saiu/demitiu',
  'Dentista titular doente',
  'Aumento temporário de demanda',
  'Cobertura de horário',
  'Outro'
];

// ═══════════════════════════════════════════════════════
// STATUS SUBSTITUIÇÃO
// ═══════════════════════════════════════════════════════

export const STATUS_SUBSTITUICAO = {
  RASCUNHO: { label: 'Rascunho', color: 'gray', icon: '✏️' },
  ABERTA: { label: 'Aberta', color: 'green', icon: '🟢' },
  EM_SELECAO: { label: 'Em seleção', color: 'blue', icon: '👥' },
  AGUARDANDO_CONFIRMACAO_CLINICA: { label: 'Aguardando confirmação', color: 'yellow', icon: '⏳' },
  CONFIRMADA: { label: 'Confirmada', color: 'green', icon: '✅' },
  COMPLETA: { label: 'Completa', color: 'purple', icon: '🏆' },
  CANCELADA: { label: 'Cancelada', color: 'red', icon: '❌' },
  REJEITADA_CLINICA: { label: 'Rejeitada', color: 'red', icon: '🚫' }
};

// ═══════════════════════════════════════════════════════
// STATUS CANDIDATURA
// ═══════════════════════════════════════════════════════

export const STATUS_CANDIDATURA = {
  AGUARDANDO: { label: 'Aguardando', color: 'yellow', icon: '⏳' },
  ESCOLHIDO: { label: 'Escolhido', color: 'green', icon: '✅' },
  REJEITADO: { label: 'Rejeitado', color: 'red', icon: '❌' },
  EXPIRADO: { label: 'Expirado', color: 'gray', icon: '⌛' }
};

// ═══════════════════════════════════════════════════════
// PONTUALIDADE
// ═══════════════════════════════════════════════════════

export const PONTUALIDADE = [
  { value: 'ADIANTADO', label: 'Chegou adiantado' },
  { value: 'NO_HORARIO', label: 'Chegou no horário' },
  { value: 'ATRASADO', label: 'Chegou atrasado' }
];

// ═══════════════════════════════════════════════════════
// BADGES DE REPUTAÇÃO
// ═══════════════════════════════════════════════════════

export const BADGES = {
  CONFIAVEL: {
    icon: '🏆',
    label: 'CONFIÁVEL',
    desc: '95%+ comparecimento, 10+ substituições',
    color: 'yellow'
  },
  DESTAQUE: {
    icon: '⭐',
    label: 'DESTAQUE',
    desc: '4.8+ avaliação média',
    color: 'purple'
  },
  RAPIDO: {
    icon: '⚡',
    label: 'RÁPIDO',
    desc: 'Aceita em média < 2min',
    color: 'blue'
  },
  EXPERIENTE: {
    icon: '🎯',
    label: 'EXPERIENTE',
    desc: '50+ substituições',
    color: 'green'
  }
};

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Calcular badges do profissional
 */
export function calcularBadges(professional) {
  const badges = [];
  
  // CONFIÁVEL
  if (professional.taxa_comparecimento >= 95 && professional.substituicoes_completadas >= 10) {
    badges.push(BADGES.CONFIAVEL);
  }
  
  // DESTAQUE
  if (professional.media_avaliacoes >= 4.8) {
    badges.push(BADGES.DESTAQUE);
  }
  
  // EXPERIENTE
  if (professional.substituicoes_completadas >= 50) {
    badges.push(BADGES.EXPERIENTE);
  }
  
  return badges;
}

/**
 * Formatar data BR
 */
export function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
}

/**
 * Formatar data/hora BR
 */
export function formatarDataHora(data) {
  if (!data) return '';
  return new Date(data).toLocaleString('pt-BR');
}

/**
 * Formatar horário
 */
export function formatarHorario(time) {
  if (!time) return '';
  return time.substring(0, 5); // HH:MM
}

/**
 * Formatar valor BRL
 */
export function formatarValor(valor) {
  if (!valor) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Calcular anos de formado
 */
export function calcularAnosFormado(anoFormatura) {
  if (!anoFormatura) return 0;
  const anoAtual = new Date().getFullYear();
  return anoAtual - anoFormatura;
}

/**
 * Formatar texto de data baseado no tipo
 */
export function formatarTextoData(substituicao) {
  switch (substituicao.tipo_data) {
    case 'IMEDIATO':
      return formatarDataHora(substituicao.data_hora_imediata);
    case 'DATA_ESPECIFICA':
      return `${formatarData(substituicao.data_especifica)} - ${formatarHorario(substituicao.horario_inicio)} às ${formatarHorario(substituicao.horario_fim)}`;
    case 'PERIODO':
      return `${formatarData(substituicao.periodo_inicio)} até ${formatarData(substituicao.periodo_fim)}`;
    default:
      return '';
  }
}

/**
 * Validar CPF
 */
export function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  
  // Validação básica
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

/**
 * Validar WhatsApp
 */
export function validarWhatsApp(whatsapp) {
  const numeros = whatsapp.replace(/\D/g, '');
  return numeros.length === 11;
}

/**
 * Formatar WhatsApp
 */
export function formatarWhatsApp(whatsapp) {
  const numeros = whatsapp.replace(/\D/g, '');
  if (numeros.length === 11) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
  }
  return whatsapp;
}

/**
 * Calcular tempo restante
 */
export function calcularTempoRestante(dataExpiracao) {
  if (!dataExpiracao) return null;
  
  const agora = new Date();
  const expira = new Date(dataExpiracao);
  const diff = expira - agora;
  
  if (diff <= 0) return { expirado: true };
  
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    expirado: false,
    dias,
    horas,
    minutos,
    texto: dias > 0 
      ? `${dias}d ${horas}h` 
      : horas > 0 
        ? `${horas}h ${minutos}min` 
        : `${minutos}min`
  };
}

/**
 * Verificar se profissional pode se candidatar
 */
export function podeSeCandidata(professional, substituicao) {
  // Suspenso
  if (professional.esta_suspenso) {
    return { pode: false, motivo: 'Você está suspenso' };
  }
  
  // Tempo de formado
  const anosFormado = professional.tempo_formado_anos;
  if (anosFormado < substituicao.tempo_minimo_formado_anos) {
    return { 
      pode: false, 
      motivo: `Requer mínimo ${substituicao.tempo_minimo_formado_anos} anos de formado` 
    };
  }
  
  // Especialidade
  if (substituicao.especialidade_necessaria && 
      professional.especialidade_principal !== substituicao.especialidade_necessaria) {
    return { 
      pode: false, 
      motivo: `Especialidade necessária: ${substituicao.especialidade_necessaria}` 
    };
  }
  
  return { pode: true };
}

/**
 * Gerar cor baseado em taxa de comparecimento
 */
export function corTaxaComparecimento(taxa) {
  if (taxa >= 95) return 'green';
  if (taxa >= 85) return 'yellow';
  if (taxa >= 70) return 'orange';
  return 'red';
}
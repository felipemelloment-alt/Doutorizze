// ============================================
// FORMATADORES UTILITÁRIOS
// ============================================

// Formatar moeda brasileira
export function formatCurrency(value, showCurrency = true) {
  if (value === null || value === undefined) return showCurrency ? 'R$ 0,00' : '0,00';
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
  
  return showCurrency ? formatted : formatted.replace('R$', '').trim();
}

// Formatar número com separadores
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Formatar porcentagem
export function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined) return '0%';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

// Formatar CPF: 12345678900 → 123.456.789-00
export function formatCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ: 12345678000100 → 12.345.678/0001-00
export function formatCNPJ(cnpj) {
  if (!cnpj) return '';
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Formatar telefone: 62999998888 → (62) 99999-8888
export function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

// Formatar CEP: 74000000 → 74000-000
export function formatCEP(cep) {
  if (!cep) return '';
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Formatar data: 2024-01-15 → 15/01/2024
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  return d.toLocaleDateString('pt-BR', defaultOptions);
}

// Formatar data e hora
export function formatDateTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatar data relativa: "há 2 dias", "em 3 horas"
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  
  if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day');
  } else {
    return formatDate(date);
  }
}

// Formatar horário: 14:30
export function formatTime(time) {
  if (!time) return '';
  
  // Se for uma data completa, extrair horário
  if (time.includes('T') || time.includes(' ')) {
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  }
  
  // Se já for HH:MM
  if (/^\d{2}:\d{2}/.test(time)) {
    return time.slice(0, 5);
  }
  
  return time;
}

// Abreviar nome: "João Carlos Silva" → "João C. S."
export function abbreviateName(name, keepFirst = true) {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  if (keepFirst) {
    const first = parts[0];
    const rest = parts.slice(1).map(p => `${p[0]}.`).join(' ');
    return `${first} ${rest}`;
  }
  
  return parts.map(p => p[0]).join('. ') + '.';
}

// Capitalizar primeira letra de cada palavra
export function capitalizeWords(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s)\S/g, l => l.toUpperCase());
}

// Truncar texto com ellipsis
export function truncate(str, maxLength = 100, ellipsis = '...') {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

// Formatar tamanho de arquivo
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Formatar dias da semana
export function formatDiasSemana(dias) {
  if (!dias || dias.length === 0) return '';
  
  const diasMap = {
    SEG: 'Seg',
    TER: 'Ter',
    QUA: 'Qua',
    QUI: 'Qui',
    SEX: 'Sex',
    SAB: 'Sáb',
    DOM: 'Dom',
    INTEGRAL: 'Todos os dias'
  };
  
  if (dias.includes('INTEGRAL')) return 'Todos os dias';
  
  return dias.map(d => diasMap[d] || d).join(', ');
}

// Formatar registro profissional: GO12345 → GO-12345
export function formatRegistro(uf, numero) {
  if (!uf || !numero) return '';
  return `${uf.toUpperCase()}-${numero}`;
}

// Pluralizar palavras
export function pluralize(count, singular, plural) {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}
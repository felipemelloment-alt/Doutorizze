/**
 * SCHEMAS DE VALIDAÇÃO
 * Validações consistentes para formulários
 */

// Validações comuns
export const validators = {
  required: (value, fieldName = 'Campo') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email inválido';
    }
    return null;
  },

  cpf: (value) => {
    if (!value) return null;
    const cpf = value.replace(/\D/g, '');
    
    if (cpf.length !== 11) return 'CPF deve ter 11 dígitos';
    if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido';
    
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return 'CPF inválido';
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return 'CPF inválido';
    
    return null;
  },

  cnpj: (value) => {
    if (!value) return null;
    const cnpj = value.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return 'CNPJ deve ter 14 dígitos';
    if (/^(\d)\1{13}$/.test(cnpj)) return 'CNPJ inválido';
    
    return null; // Validação completa seria mais longa
  },

  phone: (value) => {
    if (!value) return null;
    const phone = value.replace(/\D/g, '');
    if (phone.length !== 11) {
      return 'Telefone deve ter 11 dígitos (DDD + número)';
    }
    return null;
  },

  minLength: (value, min, fieldName = 'Campo') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} deve ter no mínimo ${min} caracteres`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = 'Campo') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} deve ter no máximo ${max} caracteres`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Senha deve ter pelo menos uma letra maiúscula';
    if (!/[a-z]/.test(value)) return 'Senha deve ter pelo menos uma letra minúscula';
    if (!/[0-9]/.test(value)) return 'Senha deve ter pelo menos um número';
    return null;
  },

  arrayMinLength: (array, min, fieldName = 'Lista') => {
    if (!array || !Array.isArray(array)) return `${fieldName} inválida`;
    if (array.length < min) {
      return `Selecione pelo menos ${min} ${min === 1 ? 'item' : 'itens'}`;
    }
    return null;
  },

  dateFormat: (value) => {
    if (!value) return null;
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(value)) {
      return 'Data inválida. Use o formato DD/MM/AAAA';
    }
    return null;
  },

  timeFormat: (value) => {
    if (!value) return null;
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(value)) {
      return 'Horário inválido. Use o formato HH:MM';
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'URL inválida';
    }
  }
};

// Validar múltiplos campos
export function validateForm(fields, schema) {
  const errors = {};
  
  Object.entries(schema).forEach(([field, rules]) => {
    const value = fields[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Para no primeiro erro
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Exemplo de uso:
/*
const formSchema = {
  nome: [
    (v) => validators.required(v, 'Nome'),
    (v) => validators.minLength(v, 3, 'Nome')
  ],
  email: [
    (v) => validators.required(v, 'Email'),
    validators.email
  ],
  cpf: [
    (v) => validators.required(v, 'CPF'),
    validators.cpf
  ]
};

const { isValid, errors } = validateForm(formData, formSchema);
*/
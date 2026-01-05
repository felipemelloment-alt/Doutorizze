// ============================================
// PROTEÇÃO DE DADOS SENSÍVEIS (LGPD)
// ============================================

// Mascaramento de CPF: 123.456.789-00 → ***.***.789-**
export function maskCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `***.***${clean.slice(6, 9)}-**`;
}

// Mascaramento de CNPJ: 12.345.678/0001-00 → **.***.678/****-**
export function maskCNPJ(cnpj) {
  if (!cnpj) return '';
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return `**.***.${clean.slice(5, 8)}/****-**`;
}

// Mascaramento de telefone: (62) 99999-9999 → (62) ****-9999
export function maskPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return phone;
  const lastFour = clean.slice(-4);
  const ddd = clean.slice(0, 2);
  return `(${ddd}) ****-${lastFour}`;
}

// Mascaramento de email: joao.silva@gmail.com → jo***@gmail.com
export function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 2)}***@${domain}`;
}

// Mascaramento de nome: João Carlos Silva → João C. S.
export function maskName(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const initials = parts.slice(1).map(p => `${p[0]}.`).join(' ');
  return `${firstName} ${initials}`;
}

// Mascaramento de CRO/CRM: GO-12345 → GO-****5
export function maskRegistro(registro) {
  if (!registro) return '';
  const match = registro.match(/^([A-Z]{2})-?(\d+)$/i);
  if (!match) return registro;
  const [, uf, numero] = match;
  const lastDigit = numero.slice(-1);
  return `${uf.toUpperCase()}-****${lastDigit}`;
}

// Verificar se dado deve ser protegido
export function shouldProtect(fieldName) {
  const sensitiveFields = [
    'cpf',
    'cnpj',
    'whatsapp',
    'telefone',
    'email',
    'data_nascimento',
    'endereco',
    'cep',
    'numero_documento',
    'chave_pix',
    'conta_bancaria',
    'agencia'
  ];
  return sensitiveFields.some(f => 
    fieldName.toLowerCase().includes(f)
  );
}

// Sanitizar objeto removendo campos sensíveis para logs
export function sanitizeForLog(obj, fieldsToMask = []) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const defaultSensitiveFields = [
    'cpf', 'cnpj', 'whatsapp', 'telefone', 'phone',
    'email', 'password', 'senha', 'token', 'chave_pix',
    'conta', 'agencia', 'documento'
  ];
  
  const sensitiveFields = [...defaultSensitiveFields, ...fieldsToMask];
  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(f => lowerKey.includes(f))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLog(sanitized[key], fieldsToMask);
    }
  }
  
  return sanitized;
}

// Classe para proteção de dados em contexto
export class DataProtector {
  constructor(options = {}) {
    this.showFullData = options.isAdmin || false;
    this.userId = options.userId;
  }
  
  // Verificar se usuário pode ver dados completos
  canViewFullData(dataOwnerId) {
    return this.showFullData || this.userId === dataOwnerId;
  }
  
  // Proteger dados baseado no contexto
  protect(data, dataOwnerId) {
    if (this.canViewFullData(dataOwnerId)) {
      return data;
    }
    
    return {
      ...data,
      cpf: data.cpf ? maskCPF(data.cpf) : undefined,
      cnpj: data.cnpj ? maskCNPJ(data.cnpj) : undefined,
      whatsapp: data.whatsapp ? maskPhone(data.whatsapp) : undefined,
      telefone: data.telefone ? maskPhone(data.telefone) : undefined,
      email: data.email ? maskEmail(data.email) : undefined
    };
  }
}

// Hook para uso em componentes React
export function useDataProtection(isAdmin = false, userId = null) {
  const protector = new DataProtector({ isAdmin, userId });
  
  return {
    maskCPF,
    maskCNPJ,
    maskPhone,
    maskEmail,
    maskName,
    maskRegistro,
    canViewFull: (ownerId) => protector.canViewFullData(ownerId),
    protect: (data, ownerId) => protector.protect(data, ownerId)
  };
}
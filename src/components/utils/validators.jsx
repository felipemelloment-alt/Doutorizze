/**
 * VALIDADORES ROBUSTOS
 *
 * Validacoes completas para CPF, CNPJ, telefone, email, etc.
 */

/**
 * Valida CPF (com digitos verificadores)
 */
export function validarCPF(cpf) {
  if (!cpf) return false;

  // Remove caracteres nao numericos
  cpf = cpf.replace(/\D/g, '');

  // Verifica tamanho
  if (cpf.length !== 11) return false;

  // Verifica CPFs invalidos conhecidos
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcula primeiro digito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Calcula segundo digito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Valida CNPJ (com digitos verificadores)
 */
export function validarCNPJ(cnpj) {
  if (!cnpj) return false;

  cnpj = cnpj.replace(/\D/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Primeiro digito
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Segundo digito
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Valida telefone brasileiro
 */
export function validarTelefone(telefone) {
  if (!telefone) return false;
  const numeros = telefone.replace(/\D/g, '');
  return numeros.length === 10 || numeros.length === 11;
}

/**
 * Valida email
 */
export function validarEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida CRO/CRM
 */
export function validarRegistroConselho(registro) {
  if (!registro) return false;
  // Formato: CRO-12345 ou CRM-12345 ou apenas numeros
  const regex = /^(CRO|CRM)?-?\d{4,8}$/i;
  return regex.test(registro.trim());
}

/**
 * Valida data de nascimento (idade minima 18 anos)
 */
export function validarDataNascimento(data, idadeMinima = 18) {
  if (!data) return false;

  let nascimento;
  if (data.length === 8) {
    // Formato DDMMAAAA
    const dia = parseInt(data.substring(0, 2));
    const mes = parseInt(data.substring(2, 4)) - 1;
    const ano = parseInt(data.substring(4, 8));
    nascimento = new Date(ano, mes, dia);
  } else {
    nascimento = new Date(data);
  }

  if (isNaN(nascimento.getTime())) return false;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= idadeMinima;
}

export default {
  validarCPF,
  validarCNPJ,
  validarTelefone,
  validarEmail,
  validarRegistroConselho,
  validarDataNascimento,
};
import { base44 } from '@/api/base44Client';

/**
 * Cria uma nova pré-simulação de crédito
 */
export async function criarPreSimulacao(data) {
  // Buscar dados da clínica
  const clinicas = await base44.entities.CompanyUnit.filter({ id: data.clinica_id });
  const clinica = clinicas[0];
  if (!clinica) throw new Error('Clínica não encontrada');

  // Gerar tokens únicos
  const token_clinica = crypto.randomUUID();
  const token_paciente = crypto.randomUUID();

  const preSimulacao = await base44.entities.PreSimulacao.create({
    ...data,
    clinica_nome: clinica.nome_fantasia,
    token_clinica,
    token_paciente,
    status: 'PENDENTE',
    link_whatsapp_enviado: false,
    acessos_clinica: 0,
    acessos_paciente: 0,
    simulacao_completa: false,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  });

  return {
    id: preSimulacao.id,
    token_clinica,
    token_paciente
  };
}

/**
 * Envia link de crédito para o paciente via WhatsApp (Evolution API)
 */
export async function enviarLinkCreditoPaciente(presimulacao_id) {
  const resultado = await base44.entities.PreSimulacao.filter({ id: presimulacao_id });
  const pre = resultado[0];
  if (!pre) throw new Error('Pré-simulação não encontrada');

  const mensagem = `Olá ${pre.nome_paciente}!

A clínica *${pre.clinica_nome}* iniciou uma simulação de crédito para você.

💰 *Valor:* R$ ${pre.valor_tratamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
🦷 *Tratamento:* ${pre.tipo_tratamento}

Acesse: https://web.doutorizze.com.br/p/${pre.token_paciente}

⏰ Expira em 48 horas.

--
DoutorizzeAPP`;

  // Formatar número para E.164
  let numero = pre.whatsapp_paciente.replace(/\D/g, '');
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
      text: mensagem
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar WhatsApp: ${error}`);
  }

  // Atualizar status
  await base44.entities.PreSimulacao.update(presimulacao_id, {
    status: 'LINK_ENVIADO',
    link_whatsapp_enviado: true,
    data_link_enviado: new Date().toISOString()
  });

  return { success: true };
}

/**
 * Valida token de acesso (clínica ou paciente)
 */
export async function validarTokenCredito(token, tipo = 'paciente') {
  const campo = tipo === 'clinica' ? 'token_clinica' : 'token_paciente';
  const resultado = await base44.entities.PreSimulacao.filter({ [campo]: token });

  if (resultado.length === 0) {
    return { valid: false, error: 'TOKEN_INVALIDO' };
  }

  const pre = resultado[0];
  
  // Verificar expiração
  if (new Date(pre.expires_at) < new Date()) {
    await base44.entities.PreSimulacao.update(pre.id, { status: 'EXPIRADO' });
    return { valid: false, error: 'TOKEN_EXPIRADO' };
  }

  // Incrementar contador de acessos
  const campoAcesso = tipo === 'clinica' ? 'acessos_clinica' : 'acessos_paciente';
  await base44.entities.PreSimulacao.update(pre.id, {
    [campoAcesso]: (pre[campoAcesso] || 0) + 1
  });

  return { valid: true, presimulacao: pre };
}

/**
 * Atualiza resultado da simulação
 */
export async function atualizarResultadoSimulacao(presimulacao_id, resultado, status) {
  await base44.entities.PreSimulacao.update(presimulacao_id, {
    resultado_simulacao: resultado,
    simulacao_completa: true,
    status: status || 'APROVADO'
  });

  return { success: true };
}

/**
 * Busca pré-simulações por clínica
 */
export async function buscarPreSimulacoesPorClinica(clinica_id) {
  return await base44.entities.PreSimulacao.filter({ clinica_id }, '-created_date');
}

/**
 * Envia mensagem genérica via Evolution API
 */
export async function enviarWhatsAppEvolution(numero, mensagem) {
  // Formatar número para E.164
  let numeroFormatado = numero.replace(/\D/g, '');
  if (numeroFormatado.length === 11) {
    numeroFormatado = '55' + numeroFormatado;
  }

  const response = await fetch('https://creditoodonto-evolution.cloudfy.live/message/sendText/Remarketing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': '698A2AC7F52A-4C98-8452-53D933343047'
    },
    body: JSON.stringify({
      number: numeroFormatado,
      text: mensagem
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar WhatsApp: ${error}`);
  }

  return { success: true };
}
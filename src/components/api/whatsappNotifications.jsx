import { base44 } from '@/api/base44Client';

/**
 * API de Notificações WhatsApp
 * Integração com Evolution API para envio de mensagens
 */

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'http://164.152.59.49:5678';

/**
 * Formata número para padrão E.164 (Brasil)
 * @param {string} numero - Número no formato brasileiro (11999999999)
 * @returns {string} - Número no formato E.164 (5511999999999)
 */
export const formatarNumeroE164 = (numero) => {
  const apenasNumeros = numero.replace(/\D/g, '');
  
  if (apenasNumeros.length === 11) {
    return `55${apenasNumeros}`;
  }
  
  if (apenasNumeros.length === 10) {
    return `55${apenasNumeros}`;
  }
  
  return apenasNumeros;
};

/**
 * Envia notificação WhatsApp via Evolution API
 * @param {Object} params
 * @param {string} params.numero - Número no formato brasileiro
 * @param {string} params.mensagem - Mensagem a ser enviada (suporta markdown)
 * @param {string} params.tipo - Tipo da notificação
 * @param {string} params.userId - ID do usuário destinatário
 * @returns {Promise<Object>}
 */
export const enviarWhatsAppNotificacao = async ({ numero, mensagem, tipo, userId }) => {
  try {
    const numeroFormatado = formatarNumeroE164(numero);
    
    // Criar registro de notificação
    const notificacao = await base44.entities.WhatsAppNotification.create({
      tipo,
      destinatario_whatsapp: numeroFormatado,
      mensagem,
      user_id: userId,
      status: 'PENDING',
      retry_count: 0,
      max_retries: 3
    });

    // Enviar via webhook n8n
    const response = await fetch(`${N8N_BASE_URL}/webhook/whatsapp-notificacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero: numeroFormatado,
        mensagem,
        notificationId: notificacao.id
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar WhatsApp');
    }

    const data = await response.json();

    // Atualizar status para SENT
    await base44.entities.WhatsAppNotification.update(notificacao.id, {
      status: 'SENT',
      evolution_message_id: data.messageId || null
    });

    return { success: true, notificacao };
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    
    // Tentar retry se não excedeu o máximo
    if (notificacao && notificacao.retry_count < notificacao.max_retries) {
      setTimeout(() => {
        retryWhatsAppNotification(notificacao.id);
      }, 5000); // Retry após 5 segundos
    } else if (notificacao) {
      // Marcar como falha permanente
      await base44.entities.WhatsAppNotification.update(notificacao.id, {
        status: 'FAILED',
        error_message: error.message
      });
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Retry de envio de notificação WhatsApp
 */
const retryWhatsAppNotification = async (notificationId) => {
  try {
    const notificacao = await base44.entities.WhatsAppNotification.filter({ id: notificationId });
    if (!notificacao[0]) return;
    
    const notif = notificacao[0];
    
    // Incrementar contador de retry
    await base44.entities.WhatsAppNotification.update(notificationId, {
      retry_count: notif.retry_count + 1
    });

    // Tentar enviar novamente
    const response = await fetch(`${N8N_BASE_URL}/webhook/whatsapp-notificacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero: notif.destinatario_whatsapp,
        mensagem: notif.mensagem,
        notificationId: notificationId
      })
    });

    if (response.ok) {
      const data = await response.json();
      await base44.entities.WhatsAppNotification.update(notificationId, {
        status: 'SENT',
        evolution_message_id: data.messageId || null
      });
    } else {
      throw new Error('Retry falhou');
    }
  } catch (error) {
    console.error('Erro no retry WhatsApp:', error);
  }
};

/**
 * Envia OTP via WhatsApp
 */
export const enviarWhatsAppOTP = async ({ numero, codigo, userId }) => {
  const mensagem = `🔐 *Doutorizze*\n\nSeu código de verificação é:\n\n*${codigo}*\n\nEste código expira em 5 minutos.\n\n_Não compartilhe este código com ninguém._`;
  
  return enviarWhatsAppNotificacao({
    numero,
    mensagem,
    tipo: 'OTP',
    userId
  });
};

/**
 * Notifica Super Job Match (4/4) via WhatsApp
 */
export const notificarSuperJobMatch = async ({ numero, nomeProfissional, tituloVaga, cidade, uf, userId }) => {
  const mensagem = `⚡ *SUPER VAGA PARA VOCÊ!* ⚡\n\nOi, ${nomeProfissional}! 👋\n\n🎯 Encontramos uma vaga PERFEITA:\n*${tituloVaga}*\n\n📍 ${cidade}/${uf}\n\n✅ 100% compatível com seu perfil!\n\n👉 Acesse o app agora e candidate-se antes que acabe!`;
  
  return enviarWhatsAppNotificacao({
    numero,
    mensagem,
    tipo: 'SUPER_JOB_MATCH',
    userId
  });
};

/**
 * Notifica candidatura aceita via WhatsApp
 */
export const notificarCandidaturaAceita = async ({ numero, nomeProfissional, tituloVaga, nomeClinica, userId }) => {
  const mensagem = `🎉 *PARABÉNS!* 🎉\n\n${nomeProfissional}, você foi ESCOLHIDO!\n\n✅ Vaga: *${tituloVaga}*\n🏥 Clínica: *${nomeClinica}*\n\n📱 A clínica entrará em contato em breve.\n\nBoa sorte! 💪`;
  
  return enviarWhatsAppNotificacao({
    numero,
    mensagem,
    tipo: 'CANDIDATURA_ACEITA',
    userId
  });
};

/**
 * Notifica candidatura rejeitada via WhatsApp
 */
export const notificarCandidaturaRejeitada = async ({ numero, nomeProfissional, tituloVaga, userId }) => {
  const mensagem = `Olá, ${nomeProfissional}.\n\nInfelizmente você não foi selecionado para a vaga:\n*${tituloVaga}*\n\n😊 Não desanime! Outras oportunidades estão chegando.\n\n👉 Continue buscando no app!`;
  
  return enviarWhatsAppNotificacao({
    numero,
    mensagem,
    tipo: 'CANDIDATURA_REJEITADA',
    userId
  });
};

/**
 * Confirma substituição urgente via WhatsApp
 */
export const confirmarSubstituicaoWhatsApp = async ({ numero, nomeProfissional, data, horario, nomeClinica, userId }) => {
  const mensagem = `✅ *CONFIRMAÇÃO DE SUBSTITUIÇÃO*\n\n${nomeProfissional}, sua substituição foi confirmada!\n\n📅 Data: ${data}\n⏰ Horário: ${horario}\n🏥 Local: ${nomeClinica}\n\n⚠️ *IMPORTANTE:* Compareça no horário!\n\nBom trabalho! 💪`;
  
  return enviarWhatsAppNotificacao({
    numero,
    mensagem,
    tipo: 'CONFIRMACAO_SUBSTITUICAO',
    userId
  });
};

export default {
  enviarWhatsAppNotificacao,
  enviarWhatsAppOTP,
  notificarSuperJobMatch,
  notificarCandidaturaAceita,
  notificarCandidaturaRejeitada,
  confirmarSubstituicaoWhatsApp,
  formatarNumeroE164
};
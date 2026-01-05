import { base44 } from '@/api/base44Client';

// ============================================
// CLOUD FUNCTIONS DO BASE44
// ============================================
// Estas funcoes rodam no servidor do Base44,
// mantendo as credenciais seguras.

export const notifyRadarMatches = async (params) => {
  const response = await base44.functions.invoke('notifyRadarMatches', params);
  return response.data;
};

export const sendPushNotification = async (params) => {
  const response = await base44.functions.invoke('sendPushNotification', params);
  return response.data;
};

export const claudeAI = async (params) => {
  const response = await base44.functions.invoke('claudeAI', params);
  return response.data;
};

export const enviarWhatsAppOTP = async (params) => {
  const response = await base44.functions.invoke('enviarWhatsAppOTP', params);
  return response.data;
};

export const enviarEmailVerificacao = async (params) => {
  const response = await base44.functions.invoke('enviarEmailVerificacao', params);
  return response.data;
};

export const gerarCodigoTelegram = async (params) => {
  const response = await base44.functions.invoke('gerarCodigoTelegram', params);
  return response.data;
};

export const criarPostFeed = async (params) => {
  const response = await base44.functions.invoke('criarPostFeed', params);
  return response.data;
};

// ============================================
// FUNCAO SEGURA PARA WHATSAPP NOTIFICATIONS
// ============================================
// Esta funcao envia notificacoes WhatsApp usando
// a Evolution API de forma segura (API key no servidor)

export const enviarWhatsAppNotificacao = async (params) => {
  const response = await base44.functions.invoke('enviarWhatsAppNotificacao', params);
  return response.data;
};

// Wrapper para facilitar o uso
export async function enviarMensagemWhatsApp(numero, mensagem, metadata = {}) {
  try {
    const result = await enviarWhatsAppNotificacao({
      numero,
      mensagem,
      metadata
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar:', error.message);
    return { success: false, error: error.message };
  }
}
// ============================================
// SERVIÇO DE NOTIFICAÇÕES CENTRALIZADO
// ============================================

import { base44 } from "@/api/base44Client";
import { logger } from "@/components/utils/logger";

// Tipos de notificação
export const NOTIFICATION_TYPES = {
  // Vagas e Candidaturas
  NOVA_VAGA: 'NOVA_VAGA',
  CANDIDATURA_RECEBIDA: 'CANDIDATURA_RECEBIDA',
  CANDIDATURA_ACEITA: 'CANDIDATURA_ACEITA',
  CANDIDATURA_REJEITADA: 'CANDIDATURA_REJEITADA',
  
  // Substituições
  SUBSTITUICAO_CRIADA: 'SUBSTITUICAO_CRIADA',
  SUBSTITUICAO_CONFIRMADA: 'SUBSTITUICAO_CONFIRMADA',
  SUBSTITUICAO_CANCELADA: 'SUBSTITUICAO_CANCELADA',
  
  // Mensagens
  NOVA_MENSAGEM: 'NOVA_MENSAGEM',
  
  // Avaliações
  NOVA_AVALIACAO: 'NOVA_AVALIACAO',
  
  // Sistema
  CADASTRO_APROVADO: 'CADASTRO_APROVADO',
  CADASTRO_REJEITADO: 'CADASTRO_REJEITADO',
  LEMBRETE: 'LEMBRETE',
  ALERTA: 'ALERTA'
};

// Templates de notificação
const notificationTemplates = {
  [NOTIFICATION_TYPES.NOVA_VAGA]: {
    titulo: 'Nova vaga disponível!',
    template: 'Uma vaga de {{especialidade}} foi publicada em {{cidade}}',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.CANDIDATURA_RECEBIDA]: {
    titulo: 'Nova candidatura recebida!',
    template: '{{nome_profissional}} se candidatou à sua vaga',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.CANDIDATURA_ACEITA]: {
    titulo: 'Candidatura aceita!',
    template: 'Parabéns! Sua candidatura para {{titulo_vaga}} foi aceita',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.CANDIDATURA_REJEITADA]: {
    titulo: 'Atualização da candidatura',
    template: 'Sua candidatura para {{titulo_vaga}} não foi selecionada',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.SUBSTITUICAO_CONFIRMADA]: {
    titulo: 'Substituição confirmada!',
    template: 'Sua substituição em {{nome_clinica}} foi confirmada para {{data}}',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.NOVA_MENSAGEM]: {
    titulo: 'Nova mensagem',
    template: '{{remetente}} enviou uma mensagem',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.NOVA_AVALIACAO]: {
    titulo: 'Nova avaliação recebida!',
    template: 'Você recebeu uma avaliação de {{avaliador}}',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.CADASTRO_APROVADO]: {
    titulo: 'Cadastro aprovado!',
    template: 'Seu cadastro foi aprovado. Bem-vindo ao Doutorizze!',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.CADASTRO_REJEITADO]: {
    titulo: 'Cadastro precisa de ajustes',
    template: 'Seu cadastro precisa de correções: {{motivo}}',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.LEMBRETE]: {
    titulo: 'Lembrete',
    template: '{{mensagem}}',
    priority: 'medium'
  }
};

// Interpolar template com dados
function interpolateTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

// Criar notificação no banco
async function createNotification({
  tipo,
  user_id,
  data = {},
  action_url = null,
  entity_type = null,
  entity_id = null,
  channels = ['in_app']
}) {
  try {
    const template = notificationTemplates[tipo];
    if (!template) {
      logger.warn(`Template não encontrado para tipo: ${tipo}`);
      return null;
    }

    const notification = {
      user_id,
      tipo,
      titulo: data.titulo || template.titulo,
      mensagem: interpolateTemplate(template.template, data),
      action_url,
      entity_type,
      entity_id,
      priority: template.priority,
      channels: channels.join(','),
      lida: false,
      enviada_push: false,
      enviada_email: false,
      enviada_whatsapp: false
    };

    const result = await base44.entities.Notification.create(notification);
    
    logger.info(`[Notification] Criada: ${tipo} para user ${user_id}`);
    
    // Enviar por outros canais se necessário
    if (channels.includes('push')) {
      await sendPushNotification(user_id, notification);
    }
    if (channels.includes('email')) {
      await sendEmailNotification(user_id, notification);
    }
    if (channels.includes('whatsapp')) {
      await sendWhatsAppNotification(user_id, notification);
    }

    return result;
  } catch (error) {
    logger.error('[Notification] Erro ao criar:', error);
    return null;
  }
}

// Enviar push notification (placeholder - implementar com Cloud Function)
async function sendPushNotification(userId, notification) {
  try {
    // Implementar integração com serviço de push
    logger.debug(`[Push] Enviando para ${userId}`);
    
    // Atualizar flag
    if (notification.id) {
      await base44.entities.Notification.update(notification.id, {
        enviada_push: true,
        push_enviada_em: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('[Push] Erro:', error);
  }
}

// Enviar email (usando Cloud Function)
async function sendEmailNotification(userId, notification) {
  try {
    // Buscar email do usuário
    const users = await base44.entities.User.filter({ id: userId });
    if (users.length === 0) return;
    
    const user = users[0];
    
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: notification.titulo,
      body: `
        <h2>${notification.titulo}</h2>
        <p>${notification.mensagem}</p>
        ${notification.action_url ? 
          `<p><a href="${notification.action_url}">Ver detalhes</a></p>` 
          : ''
        }
      `
    });
    
    // Atualizar flag
    if (notification.id) {
      await base44.entities.Notification.update(notification.id, {
        enviada_email: true,
        email_enviada_em: new Date().toISOString()
      });
    }
    
    logger.debug(`[Email] Enviado para ${user.email}`);
  } catch (error) {
    logger.error('[Email] Erro:', error);
  }
}

// Enviar WhatsApp (usando Cloud Function)
async function sendWhatsAppNotification(userId, notification) {
  try {
    // Buscar WhatsApp do usuário
    const professionals = await base44.entities.Professional.filter({ user_id: userId });
    let whatsapp = null;
    
    if (professionals.length > 0) {
      whatsapp = professionals[0].whatsapp;
    } else {
      const owners = await base44.entities.CompanyOwner.filter({ user_id: userId });
      if (owners.length > 0) {
        whatsapp = owners[0].whatsapp;
      }
    }
    
    if (!whatsapp) return;
    
    // Usar Cloud Function para enviar WhatsApp
    await base44.functions.invoke('enviarWhatsAppNotificacao', {
      numero: whatsapp,
      mensagem: `*${notification.titulo}*\n\n${notification.mensagem}`
    });
    
    // Atualizar flag
    if (notification.id) {
      await base44.entities.Notification.update(notification.id, {
        enviada_whatsapp: true,
        whatsapp_enviada_em: new Date().toISOString()
      });
    }
    
    logger.debug(`[WhatsApp] Enviado para ${whatsapp}`);
  } catch (error) {
    logger.error('[WhatsApp] Erro:', error);
  }
}

// ============================================
// API PÚBLICA
// ============================================

export const NotificationService = {
  // Criar notificação genérica
  create: createNotification,
  
  // Notificações de vaga
  notifyNovaVaga: (userId, vagaData) => createNotification({
    tipo: NOTIFICATION_TYPES.NOVA_VAGA,
    user_id: userId,
    data: vagaData,
    action_url: `/DetalheVaga?id=${vagaData.vaga_id}`,
    entity_type: 'Job',
    entity_id: vagaData.vaga_id,
    channels: ['in_app', 'push']
  }),
  
  // Notificações de candidatura
  notifyCandidaturaRecebida: (clinicaUserId, candidaturaData) => createNotification({
    tipo: NOTIFICATION_TYPES.CANDIDATURA_RECEBIDA,
    user_id: clinicaUserId,
    data: candidaturaData,
    action_url: `/DetalheVaga?id=${candidaturaData.vaga_id}`,
    entity_type: 'Job',
    entity_id: candidaturaData.vaga_id,
    channels: ['in_app', 'push', 'email']
  }),
  
  notifyCandidaturaAceita: (profissionalUserId, candidaturaData) => createNotification({
    tipo: NOTIFICATION_TYPES.CANDIDATURA_ACEITA,
    user_id: profissionalUserId,
    data: candidaturaData,
    action_url: `/DetalheVaga?id=${candidaturaData.vaga_id}`,
    entity_type: 'Job',
    entity_id: candidaturaData.vaga_id,
    channels: ['in_app', 'push', 'whatsapp']
  }),
  
  notifyCandidaturaRejeitada: (profissionalUserId, candidaturaData) => createNotification({
    tipo: NOTIFICATION_TYPES.CANDIDATURA_REJEITADA,
    user_id: profissionalUserId,
    data: candidaturaData,
    channels: ['in_app']
  }),
  
  // Notificações de substituição
  notifySubstituicaoConfirmada: (profissionalUserId, substituicaoData) => createNotification({
    tipo: NOTIFICATION_TYPES.SUBSTITUICAO_CONFIRMADA,
    user_id: profissionalUserId,
    data: substituicaoData,
    action_url: `/DetalheSubstituicao?id=${substituicaoData.substituicao_id}`,
    entity_type: 'SubstituicaoUrgente',
    entity_id: substituicaoData.substituicao_id,
    channels: ['in_app', 'push', 'whatsapp']
  }),
  
  // Notificações de cadastro
  notifyCadastroAprovado: (userId) => createNotification({
    tipo: NOTIFICATION_TYPES.CADASTRO_APROVADO,
    user_id: userId,
    data: {},
    action_url: '/MeuPerfil',
    channels: ['in_app', 'push', 'email']
  }),
  
  notifyCadastroRejeitado: (userId, motivo) => createNotification({
    tipo: NOTIFICATION_TYPES.CADASTRO_REJEITADO,
    user_id: userId,
    data: { motivo },
    action_url: '/EditarPerfil',
    channels: ['in_app', 'email']
  }),
  
  // Notificação de mensagem
  notifyNovaMensagem: (userId, mensagemData) => createNotification({
    tipo: NOTIFICATION_TYPES.NOVA_MENSAGEM,
    user_id: userId,
    data: mensagemData,
    action_url: `/ChatThread?id=${mensagemData.thread_id}`,
    entity_type: 'ChatThread',
    entity_id: mensagemData.thread_id,
    channels: ['in_app', 'push']
  }),
  
  // Notificação de avaliação
  notifyNovaAvaliacao: (userId, avaliacaoData) => createNotification({
    tipo: NOTIFICATION_TYPES.NOVA_AVALIACAO,
    user_id: userId,
    data: avaliacaoData,
    action_url: '/MinhasAvaliacoes',
    channels: ['in_app']
  }),
  
  // Lembrete customizado
  sendLembrete: (userId, mensagem) => createNotification({
    tipo: NOTIFICATION_TYPES.LEMBRETE,
    user_id: userId,
    data: { mensagem },
    channels: ['in_app', 'push']
  })
};

export default NotificationService;
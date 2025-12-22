/**
 * SISTEMA DE NOTIFICAÇÕES BROWSER
 * Push Notifications nativas do navegador
 */

// Solicitar permissão
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Mostrar notificação
export function showBrowserNotification(title, options = {}) {
  if (Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    ...options
  });

  notification.onclick = () => {
    window.focus();
    if (options.url) {
      window.location.href = options.url;
    }
    notification.close();
  };

  return notification;
}

// Templates de notificações
export const notificationTemplates = {
  superMatch: (vagaTitulo, cidade) => ({
    title: '⚡ Super Match!',
    body: `Vaga perfeita: ${vagaTitulo} em ${cidade}`,
    icon: '/icon-192.png',
    tag: 'super-match',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver Vaga' },
      { action: 'dismiss', title: 'Ignorar' }
    ]
  }),

  novaCandidatura: (nomeProfissional, vaga) => ({
    title: '🎯 Nova Candidatura!',
    body: `${nomeProfissional} se candidatou para ${vaga}`,
    tag: 'candidatura'
  }),

  candidaturaAceita: (nomeClinica) => ({
    title: '🎉 Candidatura Aceita!',
    body: `${nomeClinica} quer entrar em contato!`,
    tag: 'aceita',
    requireInteraction: true
  }),

  mensagemChat: (remetente, preview) => ({
    title: `💬 ${remetente}`,
    body: preview,
    tag: 'chat'
  }),

  substituicaoUrgente: (especialidade, cidade) => ({
    title: '🚨 Substituição Urgente!',
    body: `${especialidade} - ${cidade} - HOJE`,
    tag: 'substituicao-urgente',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  })
};

// Agendar notificação
export function scheduleNotification(title, options, delay) {
  setTimeout(() => {
    showBrowserNotification(title, options);
  }, delay);
}

// Badge count (não lidas)
export function updateBadgeCount(count) {
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      navigator.setAppBadge(count);
    } else {
      navigator.clearAppBadge();
    }
  }
}
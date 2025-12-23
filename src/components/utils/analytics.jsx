// ============================================
// SISTEMA DE ANALYTICS E TRACKING
// ============================================

import { logger } from './logger';

// Eventos rastreáveis
export const EVENTS = {
  // Autenticação
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  
  // Navegação
  PAGE_VIEW: 'page_view',
  FEATURE_USED: 'feature_used',
  
  // Conversão - Profissional
  PROFILE_VIEWED: 'profile_viewed',
  CANDIDATURA_SENT: 'candidatura_sent',
  CANDIDATURA_ACCEPTED: 'candidatura_accepted',
  
  // Conversão - Clínica
  VAGA_CREATED: 'vaga_created',
  VAGA_PUBLISHED: 'vaga_published',
  PROFESSIONAL_CONTACTED: 'professional_contacted',
  
  // Substituições
  SUBSTITUICAO_CREATED: 'substituicao_created',
  SUBSTITUICAO_CONFIRMED: 'substituicao_confirmed',
  SUBSTITUICAO_COMPLETED: 'substituicao_completed',
  
  // Marketplace
  ITEM_LISTED: 'item_listed',
  ITEM_VIEWED: 'item_viewed',
  SELLER_CONTACTED: 'seller_contacted',
  
  // Engajamento
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  FAVORITED: 'favorited',
  SHARED: 'shared',
  
  // Notificações
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_CLICKED: 'notification_clicked',
  
  // Erros
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error'
};

// Storage key para sessão
const SESSION_KEY = 'doutorizze_session';
const EVENTS_KEY = 'doutorizze_events';

// Gerar ID de sessão único
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Obter ou criar sessão
function getSession() {
  let session = sessionStorage.getItem(SESSION_KEY);
  if (!session) {
    session = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, session);
  }
  return session;
}

// Buffer de eventos para batch sending
let eventBuffer = [];
let flushTimeout = null;

// Flush eventos para persistência/envio
function flushEvents() {
  if (eventBuffer.length === 0) return;
  
  const events = [...eventBuffer];
  eventBuffer = [];
  
  // Salvar no localStorage para persistência
  try {
    const stored = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    const combined = [...stored, ...events].slice(-1000); // Manter últimos 1000
    localStorage.setItem(EVENTS_KEY, JSON.stringify(combined));
  } catch (e) {
    logger.warn('Failed to persist analytics events');
  }
  
  // Log em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    events.forEach(e => logger.debug(`[Analytics] ${e.event}`, e.properties));
  }
}

// Agendar flush
function scheduleFlush() {
  if (flushTimeout) return;
  flushTimeout = setTimeout(() => {
    flushEvents();
    flushTimeout = null;
  }, 5000); // Flush a cada 5 segundos
}

// ============================================
// API PÚBLICA
// ============================================

export function trackEvent(eventName, properties = {}) {
  const event = {
    event: eventName,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: getSession(),
      url: window.location.pathname,
      user_agent: navigator.userAgent
    }
  };
  
  eventBuffer.push(event);
  scheduleFlush();
}

export function trackPageView(pageName, properties = {}) {
  trackEvent(EVENTS.PAGE_VIEW, {
    page_name: pageName,
    referrer: document.referrer,
    ...properties
  });
}

export function trackError(error, context = {}) {
  trackEvent(EVENTS.ERROR_OCCURRED, {
    error_message: error.message || String(error),
    error_stack: error.stack,
    ...context
  });
}

export function trackSearch(query, resultsCount, filters = {}) {
  trackEvent(EVENTS.SEARCH_PERFORMED, {
    query,
    results_count: resultsCount,
    filters
  });
}

export function trackConversion(type, properties = {}) {
  trackEvent(type, {
    conversion: true,
    ...properties
  });
}

// Identificar usuário (após login)
export function identifyUser(userId, userProperties = {}) {
  trackEvent('user_identified', {
    user_id: userId,
    ...userProperties
  });
}

// Obter estatísticas locais
export function getLocalStats() {
  try {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const todayEvents = events.filter(e => 
      e.properties?.timestamp?.startsWith(today)
    );
    
    return {
      total_events: events.length,
      today_events: todayEvents.length,
      page_views: events.filter(e => e.event === EVENTS.PAGE_VIEW).length,
      conversions: events.filter(e => e.properties?.conversion).length
    };
  } catch (e) {
    return { total_events: 0 };
  }
}

// Limpar dados antigos
export function cleanupOldEvents(daysToKeep = 30) {
  try {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    const filtered = events.filter(e => 
      new Date(e.properties?.timestamp) > cutoff
    );
    
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    logger.warn('Failed to cleanup analytics');
  }
}

// Exportar dados (LGPD compliance)
export function exportUserData() {
  try {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    return {
      events,
      exported_at: new Date().toISOString(),
      session_id: getSession()
    };
  } catch (e) {
    return { events: [], error: 'Failed to export' };
  }
}

// Limpar todos os dados do usuário (LGPD compliance)
export function clearUserData() {
  localStorage.removeItem(EVENTS_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  eventBuffer = [];
}

// Analytics object para export default
const analytics = {
  track: trackEvent,
  page: trackPageView,
  error: trackError,
  search: trackSearch,
  conversion: trackConversion,
  identify: identifyUser,
  stats: getLocalStats,
  cleanup: cleanupOldEvents,
  export: exportUserData,
  clear: clearUserData,
  EVENTS
};

export default analytics;
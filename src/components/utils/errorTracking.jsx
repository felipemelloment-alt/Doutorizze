/**
 * ERROR TRACKING
 * Sistema centralizado de logging de erros
 * Preparado para integrar Sentry ou outro serviço
 */

class ErrorTracker {
  constructor() {
    this.enabled = true;
    this.errors = [];
  }

  // Log error
  logError(error, context = {}) {
    if (!this.enabled) return;

    const errorLog = {
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context
    };

    this.errors.push(errorLog);
    console.error('🔴 Error tracked:', errorLog);

    // Aqui você pode enviar para Sentry:
    // Sentry.captureException(error, { extra: context });
  }

  // Log warning
  logWarning(message, context = {}) {
    console.warn('🟡 Warning:', message, context);
  }

  // Log info
  logInfo(message, context = {}) {
    console.info('🔵 Info:', message, context);
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Clear errors
  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

// Helper para envolver funções async com error tracking
export function withErrorTracking(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorTracker.logError(error, {
        ...context,
        function: fn.name,
        args: JSON.stringify(args)
      });
      throw error;
    }
  };
}

// Exemplo de uso:
/*
const fetchData = withErrorTracking(
  async () => {
    const data = await base44.entities.Job.list();
    return data;
  },
  { component: 'VagasPage', action: 'fetch_jobs' }
);
*/
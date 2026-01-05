/**
 * LOGGER SEGURO PARA PRODUCAO
 *
 * Em desenvolvimento: exibe todos os logs
 * Em producao: silencia logs sensiveis
 */

const getEnvConfig = () => {
  try {
    return {
      isDev: import.meta.env?.DEV ?? false,
      isDebugEnabled: import.meta.env?.VITE_DEBUG === 'true'
    };
  } catch {
    return { isDev: false, isDebugEnabled: false };
  }
};

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

export const logger = {
  debug: (...args) => {
    const { isDev, isDebugEnabled } = getEnvConfig();
    const minLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    if (minLevel <= LOG_LEVELS.DEBUG || isDebugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args) => {
    const { isDev } = getEnvConfig();
    const minLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    if (minLevel <= LOG_LEVELS.INFO) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    const { isDev } = getEnvConfig();
    const minLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    if (minLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (message, error = null) => {
    const { isDev } = getEnvConfig();
    const minLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    if (minLevel <= LOG_LEVELS.ERROR) {
      if (isDev && error) {
        console.error('[ERROR]', message, error);
      } else {
        console.error('[ERROR]', message);
      }
    }
  }
};

export const { debug, info, warn, error } = logger;
export default logger;
/**
 * LOGGER SEGURO PARA PRODUCAO
 *
 * Em desenvolvimento: exibe todos os logs
 * Em producao: silencia logs sensiveis
 */

const isDev = import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

const MIN_LEVEL = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

export const logger = {
  debug: (...args) => {
    if (MIN_LEVEL <= LOG_LEVELS.DEBUG || isDebugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args) => {
    if (MIN_LEVEL <= LOG_LEVELS.INFO) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    if (MIN_LEVEL <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (message, error = null) => {
    if (MIN_LEVEL <= LOG_LEVELS.ERROR) {
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
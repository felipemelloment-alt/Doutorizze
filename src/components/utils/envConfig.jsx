/**
 * CONFIGURACOES DE AMBIENTE
 *
 * Centraliza acesso a variaveis de ambiente
 */

export const envConfig = {
  // Ambiente
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isDebug: import.meta.env.VITE_DEBUG === 'true',

  // Evolution API (WhatsApp) - APENAS DEV
  evolutionApiUrl: import.meta.env.VITE_EVOLUTION_API_URL || '',
  evolutionApiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '',

  // Base44
  base44AppId: import.meta.env.VITE_BASE44_APP_ID || '',
};

export default envConfig;
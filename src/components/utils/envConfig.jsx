/**
 * CONFIGURACOES DE AMBIENTE
 *
 * Centraliza acesso a variaveis de ambiente
 *
 * IMPORTANTE: NÃO adicionar API keys ou secrets aqui!
 * Variáveis VITE_* são públicas no bundle.
 * Para secrets, usar backend functions com Deno.env.get()
 */

export const envConfig = {
  // Ambiente
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isDebug: import.meta.env.VITE_DEBUG === 'true',

  // Base44 App ID (público, ok no frontend)
  base44AppId: import.meta.env.VITE_BASE44_APP_ID || '',

  // Feature flags (públicos)
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH === 'true',
};

// ⚠️ REMOVIDO: EVOLUTION_API_KEY e EVOLUTION_API_URL
// Essas credenciais agora ficam APENAS no servidor (functions/)
// Use: base44.functions.invoke('sendWhatsAppMessage', {...})

export default envConfig;
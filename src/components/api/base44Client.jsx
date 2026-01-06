import { createClient } from '@base44/sdk';

// Cliente Base44 inicializado
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  baseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
});

export default base44;
// ============================================
// CONFIGURAÇÃO CENTRALIZADA DE CACHE E QUERIES
// ============================================

export const cacheConfig = {
  // Dados estáticos (raramente mudam)
  static: {
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 48 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  },
  
  // Dados de referência (mudam ocasionalmente)
  reference: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  },
  
  // Dados de listagem (mudam moderadamente)
  listing: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  },
  
  // Dados dinâmicos (mudam frequentemente)
  dynamic: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2
  },
  
  // Dados em tempo real (notificações, chat)
  realtime: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    retry: 1
  }
};

// Mapeamento de entidades para configurações de cache
export const entityCacheMap = {
  // Estáticos
  especialidades: 'static',
  estados: 'static',
  
  // Referência
  Professional: 'reference',
  CompanyUnit: 'reference',
  CompanyOwner: 'reference',
  
  // Listagem
  Job: 'listing',
  MarketplaceItem: 'listing',
  FeedPost: 'listing',
  SubstituicaoUrgente: 'listing',
  
  // Dinâmicos
  CandidaturaSubstituicao: 'dynamic',
  JobMatch: 'dynamic',
  
  // Tempo real
  Notification: 'realtime',
  ChatMessage: 'realtime'
};

// Helper para obter config de cache por entidade
export function getCacheConfig(entityName) {
  const cacheType = entityCacheMap[entityName] || 'listing';
  return cacheConfig[cacheType];
}

// Helper para criar queryOptions padronizadas
export function createQueryOptions(entityName, additionalOptions = {}) {
  return {
    ...getCacheConfig(entityName),
    ...additionalOptions
  };
}
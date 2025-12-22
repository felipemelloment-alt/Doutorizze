/**
 * API OPTIMIZER
 * Helpers para otimizar chamadas de API
 */

import { base44 } from '@/api/base44Client';

/**
 * Buscar múltiplas entities em paralelo
 */
export async function fetchInParallel(queries) {
  const results = await Promise.allSettled(queries);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Query ${index} failed:`, result.reason);
      return null;
    }
  });
}

/**
 * Buscar usuário completo com todas as entities relacionadas
 */
export async function fetchUserComplete(userId) {
  const [
    professionalResult,
    ownerResult,
    supplierResult,
    hospitalResult,
    institutionResult
  ] = await fetchInParallel([
    base44.entities.Professional.filter({ user_id: userId }),
    base44.entities.CompanyOwner.filter({ user_id: userId }),
    base44.entities.Supplier.filter({ user_id: userId }),
    base44.entities.Hospital.filter({ user_id: userId }),
    base44.entities.EducationInstitution.filter({ user_id: userId })
  ]);

  return {
    professional: professionalResult?.[0] || null,
    owner: ownerResult?.[0] || null,
    supplier: supplierResult?.[0] || null,
    hospital: hospitalResult?.[0] || null,
    institution: institutionResult?.[0] || null,
  };
}

/**
 * Cache em memória para evitar requests duplicados
 */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function cachedFetch(key, fetchFn) {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  
  return data;
}

// Limpar cache expirado
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if ((now - value.timestamp) > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 1000); // A cada 1 minuto
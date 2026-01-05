import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook para obter dados do profissional
 */
export function useProfessional(userId) {
  return useQuery({
    queryKey: ['professional', userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await base44.entities.Professional.filter({ user_id: userId });
      return result[0] || null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
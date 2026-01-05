import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook para obter dados da clínica
 */
export function useClinica(userId) {
  // Buscar owner
  const { data: owner, isLoading: loadingOwner } = useQuery({
    queryKey: ['companyOwner', userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await base44.entities.CompanyOwner.filter({ user_id: userId });
      return result[0] || null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar units
  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['companyUnits', owner?.id],
    queryFn: async () => {
      if (!owner?.id) return [];
      return await base44.entities.CompanyUnit.filter({ owner_id: owner.id });
    },
    enabled: !!owner?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    owner,
    units,
    primaryUnit: units[0] || null,
    isLoading: loadingOwner || loadingUnits,
  };
}
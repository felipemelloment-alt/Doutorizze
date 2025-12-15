import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await base44.auth.me();
        setUserId(user.id);

        // Verificar se é ADMIN (implementar lógica do seu sistema)
        // Por enquanto, verificar se tem CompanyOwner ou Professional
        const owners = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        const professionals = await base44.entities.Professional.filter({ user_id: user.id });

        if (owners.length > 0) {
          setRole("CLINICA");
        } else if (professionals.length > 0) {
          setRole("DENTISTA");
        } else {
          // Se não tem nenhum, pode ser ADMIN ou usuário novo
          setRole("ADMIN"); // Ajustar conforme sua lógica
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        setRole(null);
      }
      setLoading(false);
    };

    checkRole();
  }, []);

  return {
    role,
    loading,
    userId,
    isAdmin: role === "ADMIN",
    isClinic: role === "CLINICA",
    isDentist: role === "DENTISTA"
  };
}
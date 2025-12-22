import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook global para obter usuário atual
 * Evita repetição de código em todas as páginas
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const refresh = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { user, loading, error, refresh };
}
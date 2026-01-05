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
    let isMounted = true;

    const loadUser = async () => {
      // Timeout de segurança - máximo 5 segundos
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('useCurrentUser: Auth timeout');
          setUser(null);
          setError(new Error('Timeout'));
          setLoading(false);
        }
      }, 5000);

      try {
        setLoading(true);
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (isMounted) {
          setUser(currentUser);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn('useCurrentUser error:', err?.message || err);
        if (isMounted) {
          setError(err);
          setUser(null);
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
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
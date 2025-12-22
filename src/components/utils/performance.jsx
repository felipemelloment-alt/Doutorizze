/**
 * PERFORMANCE UTILITIES
 * Helpers para otimização de performance
 */

import { useEffect, useRef } from 'react';

// Debounce para search inputs
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Intersection Observer para lazy loading
export function useLazyLoad(callback, options = {}) {
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options]);

  return targetRef;
}

// Image lazy load com placeholder
export function LazyImage({ src, alt, className, placeholder = '/placeholder.png' }) {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'blur-sm' : ''} transition-all duration-300`}
      onLoad={() => setIsLoaded(true)}
    />
  );
}

// Otimizar queries com cache
export const queryConfig = {
  // Dados estáticos (especialidades, UFs)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Dados do usuário
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  
  // Listas dinâmicas
  lists: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  
  // Tempo real
  realtime: {
    staleTime: 0, // Sempre refetch
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
};

// Batch de queries paralelas
export async function batchQueries(queries) {
  return await Promise.allSettled(queries);
}

// Exemplo:
/*
const [profResult, jobsResult, unitsResult] = await batchQueries([
  base44.entities.Professional.filter({ user_id: userId }),
  base44.entities.Job.filter({ status: 'ABERTO' }),
  base44.entities.CompanyUnit.filter({ owner_id: ownerId })
]);
*/
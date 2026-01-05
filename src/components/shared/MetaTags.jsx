import { useEffect } from 'react';

/**
 * Componente para gerenciar meta tags dinâmicas
 * Melhora SEO e preview de links compartilhados
 */
export default function MetaTags({ 
  title, 
  description, 
  image, 
  url,
  type = 'website' 
}) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = `${title} | Doutorizze`;
    }

    // Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // Open Graph
    const ogTags = {
      'og:title': title || 'Doutorizze - Vagas para Dentistas e Médicos',
      'og:description': description || 'Encontre vagas, substituições e equipamentos',
      'og:image': image || '/og-image.png',
      'og:url': url || window.location.href,
      'og:type': type,
      'og:site_name': 'Doutorizze'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // Twitter Card
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title || 'Doutorizze',
      'twitter:description': description || 'Vagas para Dentistas e Médicos',
      'twitter:image': image || '/og-image.png'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
  }, [title, description, image, url, type]);

  return null;
}
import { useEffect } from 'react';

/**
 * Componente SEO Head - Meta tags dinâmicas para cada página
 */
export default function SEOHead({
  title = 'Doutorizze',
  description = 'Plataforma de vagas, substituições e marketplace para Dentistas e Médicos',
  keywords = 'dentista, médico, vagas, emprego, substituição, odontologia, medicina',
  image = '/og-default.png',
  canonical,
  noindex = false
}) {
  useEffect(() => {
    // Title
    document.title = title.includes('Doutorizze') ? title : `${title} | Doutorizze`;

    // Description
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);

    // Robots
    updateMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Open Graph
    const ogUrl = canonical || window.location.href;
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:url', ogUrl);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', 'Doutorizze');

    // Twitter Card
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);
  }, [title, description, keywords, image, canonical, noindex]);

  return null;
}

function updateMetaTag(attr, attrValue, content) {
  let meta = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, attrValue);
    document.head.appendChild(meta);
  }
  meta.content = content;
}
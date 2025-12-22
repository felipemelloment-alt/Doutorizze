/**
 * Analytics Helper - Google Analytics 4
 * Rastreia eventos importantes do app
 */

// Inicializar GA4 (chamar no Layout ou App root)
export function initAnalytics(measurementId) {
  if (typeof window === 'undefined') return;
  
  // Criar script tag
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Configurar dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId);
}

// Track page view
export function trackPageView(pageName) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }
}

// Track eventos customizados
export const analytics = {
  // VAGAS
  vagaVisualizada: (vagaId, titulo, cidade) => {
    window.gtag?.('event', 'vaga_visualizada', {
      event_category: 'Vagas',
      event_label: titulo,
      vaga_id: vagaId,
      cidade: cidade
    });
  },

  candidaturaEnviada: (vagaId, titulo, matchScore) => {
    window.gtag?.('event', 'candidatura_enviada', {
      event_category: 'Candidaturas',
      event_label: titulo,
      vaga_id: vagaId,
      match_score: matchScore
    });
  },

  vagaCriada: (vagaId, tipoVaga, valorProposto) => {
    window.gtag?.('event', 'vaga_criada', {
      event_category: 'Vagas',
      tipo_vaga: tipoVaga,
      valor: valorProposto
    });
  },

  // PROFISSIONAL
  perfilVisualizado: (professionalId, especialidade) => {
    window.gtag?.('event', 'perfil_visualizado', {
      event_category: 'Perfil',
      professional_id: professionalId,
      especialidade: especialidade
    });
  },

  contatoIniciado: (tipo, destino) => {
    window.gtag?.('event', 'contato_iniciado', {
      event_category: 'Contato',
      tipo_contato: tipo, // whatsapp, email, etc
      destino: destino
    });
  },

  // MARKETPLACE
  anuncioVisualizado: (itemId, categoria, preco) => {
    window.gtag?.('event', 'anuncio_visualizado', {
      event_category: 'Marketplace',
      item_id: itemId,
      categoria: categoria,
      preco: preco
    });
  },

  chatIniciado: (itemId) => {
    window.gtag?.('event', 'chat_iniciado', {
      event_category: 'Marketplace',
      item_id: itemId
    });
  },

  // SUBSTITUIÇÕES
  substituicaoVisualizada: (substituicaoId, tipo) => {
    window.gtag?.('event', 'substituicao_visualizada', {
      event_category: 'Substituições',
      substituicao_id: substituicaoId,
      tipo: tipo
    });
  },

  // CONVERSÃO
  cadastroCompleto: (userType, area) => {
    window.gtag?.('event', 'cadastro_completo', {
      event_category: 'Conversão',
      user_type: userType,
      area: area
    });
  },

  primeiraContratacao: (professionalId, clinicaId) => {
    window.gtag?.('event', 'primeira_contratacao', {
      event_category: 'Conversão',
      professional_id: professionalId,
      clinica_id: clinicaId,
      value: 1
    });
  }
};
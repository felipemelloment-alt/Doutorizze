// Sistema de pontuação automática para anúncios do marketplace

export const calcularScoreQualidade = (anuncio) => {
  let score = 0;

  // Fotos (até 30 pontos)
  if (anuncio.fotos && anuncio.fotos.length > 0) {
    score += anuncio.fotos.length * 10; // 10 pontos por foto, max 30
  }

  // Título completo (10 pontos)
  if (anuncio.titulo_item && anuncio.titulo_item.length >= 20) {
    score += 10;
  }

  // Descrição detalhada (20 pontos)
  if (anuncio.descricao && anuncio.descricao.length >= 100) {
    score += 20;
  } else if (anuncio.descricao && anuncio.descricao.length >= 50) {
    score += 10;
  }

  // Marca informada (10 pontos)
  if (anuncio.marca && anuncio.marca.trim().length > 0) {
    score += 10;
  }

  // Ano de fabricação (10 pontos)
  if (anuncio.ano_fabricacao) {
    score += 10;
  }

  // Condição clara (10 pontos)
  if (anuncio.condicao) {
    score += 10;
  }

  // WhatsApp verificado (10 pontos)
  if (anuncio.whatsapp_verificado) {
    score += 10;
  }

  return Math.min(score, 100);
};

export const calcularScoreConfiabilidade = (anuncio, historico = {}) => {
  let score = 50; // Base 50

  // Tempo de cadastro (até +20)
  if (historico.dias_cadastrado) {
    if (historico.dias_cadastrado >= 180) score += 20;
    else if (historico.dias_cadastrado >= 90) score += 15;
    else if (historico.dias_cadastrado >= 30) score += 10;
  }

  // Anúncios anteriores bem-sucedidos (até +20)
  if (historico.vendas_concluidas) {
    score += Math.min(historico.vendas_concluidas * 5, 20);
  }

  // Avaliações positivas (até +10)
  if (historico.avaliacoes_positivas) {
    score += Math.min(historico.avaliacoes_positivas * 2, 10);
  }

  // Penalidades
  if (anuncio.total_denuncias > 0) {
    score -= anuncio.total_denuncias * 15;
  }

  return Math.max(0, Math.min(score, 100));
};

export const verificarRegrasAutomaticas = (anuncio) => {
  const alertas = [];

  // Preço muito baixo (possível golpe)
  if (anuncio.preco < 100) {
    alertas.push({
      tipo: "PRECO_SUSPEITO",
      mensagem: "Preço muito baixo - pode ser golpe",
      severidade: "ALTA"
    });
  }

  // Título com palavras suspeitas
  const palavrasSuspeitas = ["urgente", "imperdível", "único dono", "perfeito estado"];
  const tituloLower = anuncio.titulo_item?.toLowerCase() || "";
  const descLower = anuncio.descricao?.toLowerCase() || "";
  
  palavrasSuspeitas.forEach(palavra => {
    if (tituloLower.includes(palavra) || descLower.includes(palavra)) {
      alertas.push({
        tipo: "LINGUAGEM_SUSPEITA",
        mensagem: `Uso de linguagem promocional excessiva: "${palavra}"`,
        severidade: "MEDIA"
      });
    }
  });

  // Sem fotos
  if (!anuncio.fotos || anuncio.fotos.length === 0) {
    alertas.push({
      tipo: "SEM_FOTOS",
      mensagem: "Anúncio sem fotos",
      severidade: "MEDIA"
    });
  }

  // Muitas denúncias
  if (anuncio.total_denuncias >= 3) {
    alertas.push({
      tipo: "DENUNCIAS_MULTIPLAS",
      mensagem: "Múltiplas denúncias recebidas",
      severidade: "CRITICA",
      bloquear: true
    });
  }

  return alertas;
};

export const aplicarRegrasBloqueio = (anuncio, alertas) => {
  const bloqueio = {
    deve_bloquear: false,
    motivo: null
  };

  // Bloquear se tiver alerta crítico
  const alertaCritico = alertas.find(a => a.severidade === "CRITICA");
  if (alertaCritico) {
    bloqueio.deve_bloquear = true;
    bloqueio.motivo = alertaCritico.mensagem;
    return bloqueio;
  }

  // Bloquear se score de qualidade muito baixo E score de confiabilidade baixo
  if (anuncio.score_qualidade < 30 && anuncio.score_confiabilidade < 40) {
    bloqueio.deve_bloquear = true;
    bloqueio.motivo = "Qualidade e confiabilidade muito baixas";
    return bloqueio;
  }

  return bloqueio;
};

export const calcularRankingFinal = (anuncio) => {
  // Score final = média ponderada
  const scoreQualidade = anuncio.score_qualidade || 0;
  const scoreConfiabilidade = anuncio.score_confiabilidade || 50;
  
  // 60% qualidade + 40% confiabilidade
  const scoreFinal = (scoreQualidade * 0.6) + (scoreConfiabilidade * 0.4);
  
  // Bonus por engajamento
  const bonusVisualizacoes = Math.min((anuncio.visualizacoes || 0) / 10, 5);
  const bonusFavoritos = Math.min((anuncio.favoritos || 0) * 2, 10);
  
  return Math.min(scoreFinal + bonusVisualizacoes + bonusFavoritos, 100);
};
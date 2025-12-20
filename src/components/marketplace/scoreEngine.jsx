// Motor de Score do Marketplace
// Calcula scores de qualidade, confiabilidade e ranking final

// Marcas conhecidas por vertical
const MARCAS_ODONTO = [
  "DABI ATLANTE", "CRISTÓFOLI", "GNATUS", "KAVO", "SCHUSTER", "STERMAX",
  "ALLIAGE", "BIO-ART", "SAEVO", "BIOTRON", "DENTSCLER", "MIDAS"
];

const MARCAS_MEDICINA = [
  "PHILIPS", "GE", "MINDRAY", "DIXTAL", "MAGNAMED", "BIOSYS",
  "ECAFIX", "TEB", "BIONET", "NIHON KOHDEN", "DATEX", "DRAGER"
];

/**
 * Calcula score de qualidade do anúncio (0-100)
 */
export function calcularScoreAnuncio(item) {
  let score = 0;

  // Preenchimento completo (+15)
  const camposObrigatorios = ['titulo_item', 'descricao', 'marca', 'condicao', 'preco', 'localizacao'];
  const preenchimentoCompleto = camposObrigatorios.every(campo => item[campo]);
  if (preenchimentoCompleto) score += 15;

  // Categoria/subcategoria ok (+10)
  if (item.categoria && item.subcategoria) score += 10;

  // Fotos >= 3 (+15)
  const totalFotos = (item.fotos?.length || 0);
  if (totalFotos >= 3) score += 15;

  // Foto placa/etiqueta (+10)
  if (item.foto_placa && !item.flag_sem_foto_placa) score += 10;

  // Descrição técnica mínima (>= 200 chars) (+10)
  if (item.descricao && item.descricao.length >= 200) score += 10;

  // Localização completa (+5)
  if (item.localizacao && item.localizacao.includes('-')) score += 5;

  // Preço dentro da faixa razoável (+10)
  // Considera preços entre R$ 100 e R$ 500.000 como razoáveis
  if (item.preco >= 100 && item.preco <= 500000) score += 10;

  // Vídeo (+5)
  if (item.video_url) score += 5;

  // Especificações técnicas preenchidas (+10)
  if (item.especificacoes && Object.keys(item.especificacoes).length > 0) score += 10;

  return Math.min(score, 100);
}

/**
 * Calcula score de confiabilidade do produto (0-100)
 */
export function calcularScoreProduto(item) {
  let score = 0;

  // Condição do produto
  const condicaoScores = {
    'NOVO': 20,
    'SEMINOVO': 15,
    'USADO': 10
  };
  score += condicaoScores[item.condicao] || 0;

  // Revisado em assistência (+20)
  if (item.especificacoes?.revisada === true || item.especificacoes?.revisado === true) {
    score += 20;
  }

  // Garantia
  const garantiaMeses = parseInt(item.especificacoes?.garantia_meses || 0);
  if (garantiaMeses >= 6) {
    score += 15;
  } else if (garantiaMeses >= 3) {
    score += 8;
  }

  // Nota fiscal (+10)
  if (item.especificacoes?.nota_fiscal === true) {
    score += 10;
  }

  // Tempo de uso informado (+10)
  if (item.ano_fabricacao) {
    score += 10;
  }

  // Marca conhecida (+10)
  const marcasConhecidas = item.tipo_mundo === "ODONTOLOGIA" ? MARCAS_ODONTO : MARCAS_MEDICINA;
  const marcaItem = (item.marca || "").toUpperCase().trim();
  const ehMarcaConhecida = marcasConhecidas.some(marca => 
    marcaItem.includes(marca) || marca.includes(marcaItem)
  );
  if (ehMarcaConhecida) score += 10;

  // Sem flags de risco (+15)
  if (!item.flag_sem_foto_placa && !item.flags_risco?.length) {
    score += 15;
  }

  // Laudo ANVISA (+10)
  if (item.especificacoes?.laudo_anvisa === true) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Calcula score de reputação do vendedor (0-100)
 */
export function calcularScoreVendedor(item, dadosVendedor = {}) {
  let score = 0;

  // WhatsApp verificado (+15)
  if (item.whatsapp_verificado === true) {
    score += 15;
  }

  // Identidade verificada (+10)
  if (dadosVendedor.identidade_verificada === true) {
    score += 10;
  }

  // Avaliações
  const mediaAvaliacoes = dadosVendedor.media_avaliacoes || 0;
  if (mediaAvaliacoes >= 4.5) {
    score += 20;
  } else if (mediaAvaliacoes >= 4.0) {
    score += 15;
  } else if (mediaAvaliacoes >= 3.5) {
    score += 8;
  }

  // Taxa de resposta (+10)
  if (dadosVendedor.taxa_resposta_rapida === true) {
    score += 10;
  }

  // Penalizações por denúncias confirmadas
  const denunciasConfirmadas = item.total_denuncias || 0;
  if (denunciasConfirmadas > 0) {
    score -= Math.min(denunciasConfirmadas * 10, 50); // Máximo -50
  }

  // Total de vendas (+10)
  const totalVendas = dadosVendedor.total_vendas || 0;
  if (totalVendas >= 10) {
    score += 10;
  } else if (totalVendas >= 5) {
    score += 5;
  }

  // Tempo de cadastro (+5)
  const diasCadastrado = dadosVendedor.dias_cadastrado || 0;
  if (diasCadastrado >= 180) { // 6 meses
    score += 5;
  }

  return Math.max(Math.min(score, 100), 0); // Entre 0 e 100
}

/**
 * Calcula bônus adicional (0-10)
 */
export function calcularBonus(item) {
  let bonus = 0;

  // Revisado + garantia >= 6 meses (+5)
  const revisado = item.especificacoes?.revisada === true || item.especificacoes?.revisado === true;
  const garantiaMeses = parseInt(item.especificacoes?.garantia_meses || 0);
  if (revisado && garantiaMeses >= 6) {
    bonus += 5;
  }

  // Vídeo (+2)
  if (item.video_url) {
    bonus += 2;
  }

  // Vendedor verificado (+3)
  if (item.whatsapp_verificado === true) {
    bonus += 3;
  }

  return Math.min(bonus, 10);
}

/**
 * Calcula o score de ranking final (0-100)
 */
export function calcularScoreRanking(scoreAnuncio, scoreProduto, scoreVendedor, bonus) {
  const scoreBase = (scoreAnuncio * 0.30) + (scoreProduto * 0.35) + (scoreVendedor * 0.25);
  const scoreFinal = scoreBase + bonus;
  return Math.min(Math.round(scoreFinal), 100);
}

/**
 * Verifica travas/regras de bloqueio
 */
export function verificarTravas(item, scoreRanking) {
  const travas = {
    pode_exibir: true,
    pode_destacar: true,
    motivos: []
  };

  // Bloqueio por moderação
  if (item.status === "SUSPENSO" || item.bloqueado_auto === true) {
    travas.pode_exibir = false;
    travas.motivos.push("Anúncio bloqueado pela moderação");
  }

  // Flags de risco críticas
  if (item.flags_risco?.includes("GOLPE_SUSPEITO")) {
    travas.pode_exibir = false;
    travas.motivos.push("Suspeita de golpe detectada");
  }

  // Score de produto baixo
  const scoreProduto = calcularScoreProduto(item);
  if (scoreProduto < 60) {
    travas.pode_destacar = false;
    travas.motivos.push("Score de produto abaixo do mínimo para destaque");
  }

  // Score de ranking muito baixo
  if (scoreRanking < 40) {
    travas.pode_destacar = false;
    travas.motivos.push("Score de ranking insuficiente");
  }

  return travas;
}

/**
 * Função principal: calcula todos os scores de um item
 */
export function calcularScoresCompletos(item, dadosVendedor = {}) {
  const scoreAnuncio = calcularScoreAnuncio(item);
  const scoreProduto = calcularScoreProduto(item);
  const scoreVendedor = calcularScoreVendedor(item, dadosVendedor);
  const bonus = calcularBonus(item);
  const scoreRanking = calcularScoreRanking(scoreAnuncio, scoreProduto, scoreVendedor, bonus);

  const travas = verificarTravas(item, scoreRanking);

  return {
    score_anuncio: scoreAnuncio,
    score_produto: scoreProduto,
    score_vendedor: scoreVendedor,
    score_bonus: bonus,
    score_ranking: scoreRanking,
    pode_exibir: travas.pode_exibir,
    pode_destacar: travas.pode_destacar,
    motivos_restricao: travas.motivos
  };
}

/**
 * Analisa detalhes do score (útil para debug/feedback)
 */
export function analisarScore(item, dadosVendedor = {}) {
  const scores = calcularScoresCompletos(item, dadosVendedor);
  
  return {
    ...scores,
    detalhes: {
      anuncio: {
        preenchimento_completo: ['titulo_item', 'descricao', 'marca', 'condicao', 'preco', 'localizacao'].every(c => item[c]),
        tem_fotos_suficientes: (item.fotos?.length || 0) >= 3,
        tem_foto_placa: !!item.foto_placa,
        descricao_detalhada: (item.descricao?.length || 0) >= 200,
        tem_video: !!item.video_url
      },
      produto: {
        condicao: item.condicao,
        revisado: item.especificacoes?.revisada || item.especificacoes?.revisado,
        garantia_meses: item.especificacoes?.garantia_meses || 0,
        marca: item.marca,
        ano_fabricacao: item.ano_fabricacao
      },
      vendedor: {
        whatsapp_verificado: item.whatsapp_verificado,
        media_avaliacoes: dadosVendedor.media_avaliacoes || 0,
        total_vendas: dadosVendedor.total_vendas || 0,
        denuncias: item.total_denuncias || 0
      }
    }
  };
}
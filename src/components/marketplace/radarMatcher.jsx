// Motor de Matching do Radar de Produtos

/**
 * Normaliza texto para comparação (remove acentos, lowercase)
 */
function normalizarTexto(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Verifica se um item match com um radar
 */
export function verificarMatch(item, radar) {
  // 1. Tipo mundo deve ser igual
  if (item.tipo_mundo !== radar.tipo_mundo) {
    return { match: false, motivo: "Tipo mundo diferente" };
  }

  // 2. Categoria (se definida no radar)
  if (radar.categoria && item.categoria !== radar.categoria) {
    return { match: false, motivo: "Categoria não bate" };
  }

  // 3. Subcategoria (se definida no radar)
  if (radar.subcategoria && item.subcategoria !== radar.subcategoria) {
    return { match: false, motivo: "Subcategoria não bate" };
  }

  // 4. Keywords (se definidas)
  if (radar.keywords && radar.keywords.length > 0) {
    const tituloNorm = normalizarTexto(item.titulo_item || "");
    const descricaoNorm = normalizarTexto(item.descricao || "");
    const marcaNorm = normalizarTexto(item.marca || "");
    
    const textoCompleto = `${tituloNorm} ${descricaoNorm} ${marcaNorm}`;
    
    const temKeyword = radar.keywords.some(keyword => {
      const keywordNorm = normalizarTexto(keyword);
      return textoCompleto.includes(keywordNorm);
    });

    if (!temKeyword) {
      return { match: false, motivo: "Nenhuma palavra-chave encontrada" };
    }
  }

  // 5. Marca (se definida)
  if (radar.marca) {
    const marcaRadarNorm = normalizarTexto(radar.marca);
    const marcaItemNorm = normalizarTexto(item.marca || "");
    
    if (!marcaItemNorm.includes(marcaRadarNorm) && !marcaRadarNorm.includes(marcaItemNorm)) {
      return { match: false, motivo: "Marca não bate" };
    }
  }

  // 6. Faixa de preço (se definida)
  if (radar.preco_min && item.preco < radar.preco_min) {
    return { match: false, motivo: "Preço abaixo do mínimo" };
  }
  if (radar.preco_max && item.preco > radar.preco_max) {
    return { match: false, motivo: "Preço acima do máximo" };
  }

  // 7. Localização (se definida)
  if (radar.cidade && radar.uf) {
    const localizacaoRadar = `${radar.cidade} - ${radar.uf}`.toLowerCase();
    const localizacaoItem = (item.localizacao || "").toLowerCase();
    
    if (localizacaoItem !== localizacaoRadar) {
      return { match: false, motivo: "Localização não bate" };
    }
  } else if (radar.uf) {
    // Apenas UF
    const localizacaoItem = (item.localizacao || "").toLowerCase();
    if (!localizacaoItem.includes(radar.uf.toLowerCase())) {
      return { match: false, motivo: "UF não bate" };
    }
  }

  // 8. Condição (se definida)
  if (radar.condicao && radar.condicao.length > 0) {
    if (!radar.condicao.includes(item.condicao)) {
      return { match: false, motivo: "Condição não aceita" };
    }
  }

  return { match: true, motivo: "Match completo" };
}

/**
 * Encontra todos os radares que fazem match com um item
 */
export async function encontrarRadaresMatch(item, base44Client) {
  try {
    // Buscar radares ativos do mesmo tipo_mundo
    const radares = await base44Client.entities.ProductRadar.filter({
      tipo_mundo: item.tipo_mundo,
      ativo: true
    });

    // Filtrar apenas não expirados
    const now = new Date();
    const radaresAtivos = radares.filter(r => {
      if (!r.data_expiracao) return true;
      return new Date(r.data_expiracao) > now;
    });

    // Verificar matches
    const matches = [];
    for (const radar of radaresAtivos) {
      // Anti-spam: não notificar se já foi notificado sobre este item
      if (radar.radar_notified_items?.includes(item.id)) {
        continue;
      }

      const resultado = verificarMatch(item, radar);
      if (resultado.match) {
        matches.push({ radar, motivo: resultado.motivo });
      }
    }

    return matches;
  } catch (error) {
    console.error("Erro ao buscar radares:", error);
    return [];
  }
}

/**
 * Processa notificações de radar para um item
 */
export async function processarNotificacoesRadar(item, base44Client, userId) {
  const matches = await encontrarRadaresMatch(item, base44Client);

  for (const { radar } of matches) {
    try {
      // Criar notificação
      await base44Client.entities.Notification.create({
        destinatario_id: radar.interessado_id,
        destinatario_tipo: radar.interessado_tipo,
        tipo: "NOVO_ITEM_MARKETPLACE",
        titulo: `🎯 Radar: ${item.titulo_item}`,
        mensagem: `Encontramos o produto que você procura! ${item.titulo_item} por R$ ${item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Corra antes que alguém compre!`,
        imagem_url: item.foto_frontal || item.fotos?.[0],
        dados_contexto: {
          marketplace_item_id: item.id,
          radar_id: radar.id,
          item_title: item.titulo_item,
          item_price: item.preco
        },
        acao_destino: {
          tipo: "TELA",
          destino: "MarketplaceDetail",
          parametros: { id: item.id }
        },
        canais_enviados: radar.notificar_whatsapp ? ["PUSH", "WHATSAPP"] : ["PUSH"],
        enviada_com_sucesso: false
      });

      // Atualizar radar
      const itemsNotificados = radar.radar_notified_items || [];
      await base44Client.entities.ProductRadar.update(radar.id, {
        notificacoes_recebidas: (radar.notificacoes_recebidas || 0) + 1,
        last_match_at: new Date().toISOString(),
        radar_notified_items: [...itemsNotificados, item.id]
      });

      console.log(`✅ Radar match notificado: usuário ${radar.interessado_id}`);
    } catch (error) {
      console.error("Erro ao notificar radar:", error);
    }
  }

  return matches.length;
}
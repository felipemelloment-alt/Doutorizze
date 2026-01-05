import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplace_item_id } = await req.json();

    if (!marketplace_item_id) {
      return Response.json({ error: "marketplace_item_id é obrigatório" }, { status: 400 });
    }

    // Buscar o item criado
    const items = await base44.asServiceRole.entities.MarketplaceItem.filter({ id: marketplace_item_id });
    const item = items[0];

    if (!item) {
      return Response.json({ error: "Item não encontrado" }, { status: 404 });
    }

    // Buscar radares ativos compatíveis
    const radares = await base44.asServiceRole.entities.ProductRadar.filter({
      tipo_mundo: item.tipo_mundo,
      ativo: true
    });

    const matches = [];

    for (const radar of radares) {
      let compativel = true;

      // Verificar nome do produto
      const nomeRadarLower = radar.nome_produto?.toLowerCase() || "";
      const tituloItemLower = item.titulo_item?.toLowerCase() || "";
      const descItemLower = item.descricao?.toLowerCase() || "";

      if (!tituloItemLower.includes(nomeRadarLower) && !descItemLower.includes(nomeRadarLower)) {
        compativel = false;
      }

      // Verificar preço máximo
      if (radar.preco_maximo > 0 && item.preco > radar.preco_maximo) {
        compativel = false;
      }

      // Verificar condição
      if (radar.condicao_preferida?.length > 0 && !radar.condicao_preferida.includes(item.condicao)) {
        compativel = false;
      }

      // Verificar localização
      if (radar.localizacao_preferida && !item.localizacao?.includes(radar.localizacao_preferida)) {
        compativel = false;
      }

      if (compativel) {
        matches.push(radar);

        // Criar notificação no app
        await base44.asServiceRole.entities.Notification.create({
          destinatario_id: radar.interessado_id,
          destinatario_tipo: radar.interessado_tipo,
          tipo: "NOVO_ITEM_MARKETPLACE",
          titulo: "🎯 Radar: Produto Encontrado!",
          mensagem: `Encontramos "${item.titulo_item}" por R$ ${item.preco.toLocaleString('pt-BR')} - ${item.localizacao}`,
          imagem_url: item.fotos?.[0] || null,
          dados_contexto: {
            marketplace_item_id: item.id
          },
          acao_destino: {
            tipo: "TELA",
            destino: "MarketplaceDetail",
            parametros: { id: item.id }
          },
          canais_enviados: ["PUSH"]
        });

        // Se o radar tem notificação WhatsApp ativa
        if (radar.notificar_whatsapp && radar.telefone_contato) {
          // Aqui você pode integrar com API do WhatsApp Business
          // Por ora, apenas marcamos que tentamos enviar
          await base44.asServiceRole.entities.ProductRadar.update(radar.id, {
            notificacoes_recebidas: (radar.notificacoes_recebidas || 0) + 1
          });
        }
      }
    }

    return Response.json({ 
      success: true, 
      matches_encontrados: matches.length,
      radares_notificados: matches.map(r => r.id)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
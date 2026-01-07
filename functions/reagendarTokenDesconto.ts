import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * 🔄 REAGENDAR TOKEN DE DESCONTO (2ª TENTATIVA)
 * 
 * Permite parceiro gerar 2ª tentativa de token (48h adicionais)
 * após primeira tentativa expirar.
 * 
 * Máximo 2 tentativas por solicitação.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { codigo_anterior } = await req.json();

    if (!codigo_anterior) {
      return Response.json({ error: 'código_anterior obrigatório' }, { status: 400 });
    }

    // Buscar token anterior
    const tokensAnteriores = await base44.asServiceRole.entities.TokenDesconto.filter({ 
      codigo: codigo_anterior 
    });

    if (tokensAnteriores.length === 0) {
      return Response.json({ error: 'Token anterior não encontrado' }, { status: 404 });
    }

    const tokenAnterior = tokensAnteriores[0];

    // Validar parceiro
    if (tokenAnterior.parceiro_id !== user.id) {
      return Response.json({ error: 'Token não pertence a você' }, { status: 403 });
    }

    // Validar tentativa
    if (tokenAnterior.tentativa_numero >= 2) {
      return Response.json({ 
        error: 'Limite de 2 tentativas atingido',
        motivo: 'LIMITE_TENTATIVAS'
      }, { status: 400 });
    }

    // Validar se expirou
    if (tokenAnterior.status !== 'EXPIRADO') {
      return Response.json({ 
        error: 'Só pode reagendar tokens expirados',
        status_atual: tokenAnterior.status
      }, { status: 400 });
    }

    // VALIDAR TOKENS DISPONÍVEIS DO PARCEIRO
    const parceiroType = tokenAnterior.parceiro_tipo === 'EDUCACAO' 
      ? 'EducationInstitution' 
      : tokenAnterior.parceiro_tipo === 'FORNECEDOR' 
        ? 'Supplier' 
        : 'Laboratorio';

    const parceiros = await base44.asServiceRole.entities[parceiroType].filter({ user_id: user.id });
    const parceiro = parceiros[0];

    if (!parceiro || (parceiro.tokens_disponiveis || 0) < 1) {
      return Response.json({ 
        error: 'Sem tokens disponíveis',
        tokens_disponiveis: parceiro?.tokens_disponiveis || 0
      }, { status: 400 });
    }

    // GERAR NOVO TOKEN (tentativa 2)
    const novoCodigo = `DESC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const agora = new Date();
    const novaValidade = new Date(agora.getTime() + 48 * 60 * 60 * 1000);

    const novoToken = await base44.asServiceRole.entities.TokenDesconto.create({
      codigo: novoCodigo,
      token_usuario_id: tokenAnterior.token_usuario_id,
      user_id: tokenAnterior.user_id,
      usuario_nome: tokenAnterior.usuario_nome,
      usuario_nivel: tokenAnterior.usuario_nivel,
      parceiro_id: tokenAnterior.parceiro_id,
      parceiro_tipo: tokenAnterior.parceiro_tipo,
      parceiro_nome: tokenAnterior.parceiro_nome,
      tipo_desconto: tokenAnterior.tipo_desconto,
      valor_desconto: tokenAnterior.valor_desconto,
      tentativa_numero: 2,
      validade_horas: 48,
      status: 'ATIVO',
      data_geracao: agora.toISOString(),
      data_validade: novaValidade.toISOString()
    });

    // DECREMENTAR TOKENS DO PARCEIRO
    await base44.asServiceRole.entities[parceiroType].update(parceiro.id, {
      tokens_disponiveis: Math.max(0, (parceiro.tokens_disponiveis || 10) - 1),
      tokens_usados_mes: (parceiro.tokens_usados_mes || 0) + 1
    });

    // ENVIAR WHATSAPP
    const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ 
      id: tokenAnterior.token_usuario_id 
    });

    if (tokenUsuario.length > 0) {
      const numeroWhatsApp = tokenUsuario[0].whatsapp;
      const mensagemDesconto = tokenAnterior.tipo_desconto === 'PERCENTUAL'
        ? `${tokenAnterior.valor_desconto}% de desconto`
        : `R$ ${tokenAnterior.valor_desconto.toFixed(2)} de desconto`;

      const mensagem = `🔄 *NOVA CHANCE - TOKEN RENOVADO*\n\n` +
        `Olá!\n\n` +
        `Seu token anterior expirou, mas geramos uma *2ª TENTATIVA*:\n\n` +
        `🎫 *Novo Código:* \`${novoCodigo}\`\n` +
        `💰 *Desconto:* ${mensagemDesconto}\n` +
        `📍 *Parceiro:* ${tokenAnterior.parceiro_nome}\n\n` +
        `⏰ *Válido por 48 HORAS*\n` +
        `Expira: ${novaValidade.toLocaleDateString('pt-BR')} às ${novaValidade.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
        `⚠️ *Esta é sua ÚLTIMA CHANCE!*\n` +
        `Não perca essa oportunidade.\n\n` +
        `_Doutorizze_`;

      try {
        const evolutionUrl = Deno.env.get('EVOLUTION_API_URL');
        const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE');
        const evolutionKey = Deno.env.get('EVOLUTION_API_KEY');

        await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionKey
          },
          body: JSON.stringify({
            number: `55${numeroWhatsApp}`,
            text: mensagem
          })
        });

        await base44.asServiceRole.entities.TokenDesconto.update(novoToken.id, {
          enviado_whatsapp: true,
          whatsapp_enviado_em: new Date().toISOString()
        });
      } catch (e) {
        console.error('Erro WhatsApp:', e);
      }
    }

    return Response.json({ 
      success: true,
      novo_token: {
        codigo: novoToken.codigo,
        data_validade: novoToken.data_validade,
        tentativa: 2
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * 🎫 GERAR TOKEN DE DESCONTO (48H)
 * 
 * REGRAS:
 * - Validade: 48 horas
 * - Máximo 2 tentativas por solicitação
 * - Usuário: máximo 3 créditos totais por parceiro
 * - Parceiro: 10 tokens/mês acumulativos
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      token_usuario_id, 
      parceiro_tipo, 
      valor_desconto, 
      tipo_desconto,
      tentativa_numero = 1
    } = await req.json();

    if (!token_usuario_id || !parceiro_tipo || !valor_desconto || !tipo_desconto) {
      return Response.json({ 
        error: 'Campos obrigatórios: token_usuario_id, parceiro_tipo, valor_desconto, tipo_desconto' 
      }, { status: 400 });
    }

    // Buscar token do usuário
    const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ id: token_usuario_id });
    
    if (tokenUsuario.length === 0) {
      return Response.json({ error: 'Token de usuário não encontrado' }, { status: 404 });
    }

    const tokenUser = tokenUsuario[0];

    // VALIDAR CRÉDITOS DO USUÁRIO (máximo 3 por parceiro)
    const tokensExistentes = await base44.asServiceRole.entities.TokenDesconto.filter({
      user_id: tokenUser.user_id,
      parceiro_id: user.id
    });

    const creditosUsados = tokensExistentes.filter(t => 
      t.status === 'USADO' && !t.negocio_fechado
    ).length;

    if (creditosUsados >= 3) {
      return Response.json({ 
        error: 'Usuário atingiu limite de 3 créditos sem fechar negócio',
        motivo: 'LIMITE_CREDITOS'
      }, { status: 400 });
    }

    // VALIDAR TENTATIVAS (máximo 2 por solicitação)
    if (tentativa_numero > 2) {
      return Response.json({ 
        error: 'Máximo de 2 tentativas por solicitação',
        motivo: 'LIMITE_TENTATIVAS'
      }, { status: 400 });
    }

    // VALIDAR TOKENS DO PARCEIRO
    let parceiroData;
    if (parceiro_tipo === 'EDUCACAO') {
      const inst = await base44.asServiceRole.entities.EducationInstitution.filter({ user_id: user.id });
      parceiroData = inst[0];
    } else if (parceiro_tipo === 'FORNECEDOR') {
      const sup = await base44.asServiceRole.entities.Supplier.filter({ user_id: user.id });
      parceiroData = sup[0];
    } else if (parceiro_tipo === 'LABORATORIO') {
      const lab = await base44.asServiceRole.entities.Laboratorio.filter({ user_id: user.id });
      parceiroData = lab[0];
    }

    if (!parceiroData) {
      return Response.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    if ((parceiroData.tokens_disponiveis || 0) < 1) {
      return Response.json({ 
        error: 'Você não tem tokens disponíveis',
        motivo: 'SEM_TOKENS',
        tokens_disponiveis: parceiroData.tokens_disponiveis || 0
      }, { status: 400 });
    }

    // GERAR CÓDIGO ÚNICO
    const codigo = `DESC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // VALIDADE = 48 HORAS
    const agora = new Date();
    const dataValidade = new Date(agora.getTime() + 48 * 60 * 60 * 1000);

    // CRIAR TOKEN DE DESCONTO
    const tokenDesconto = await base44.asServiceRole.entities.TokenDesconto.create({
      codigo,
      token_usuario_id,
      user_id: tokenUser.user_id,
      usuario_nome: tokenUser.nome_completo || 'Usuário',
      usuario_nivel: tokenUser.nivel?.toString() || '1',
      parceiro_id: user.id,
      parceiro_tipo,
      parceiro_nome: parceiroData.nome_fantasia || parceiroData.razao_social,
      tipo_desconto,
      valor_desconto: parseFloat(valor_desconto),
      tentativa_numero: parseInt(tentativa_numero),
      validade_horas: 48,
      status: 'ATIVO',
      data_geracao: agora.toISOString(),
      data_validade: dataValidade.toISOString(),
      negocio_fechado: false,
      credito_reposto: false
    });

    // DECREMENTAR TOKENS DO PARCEIRO
    const entityName = parceiro_tipo === 'EDUCACAO' 
      ? 'EducationInstitution' 
      : parceiro_tipo === 'FORNECEDOR' 
        ? 'Supplier' 
        : 'Laboratorio';

    await base44.asServiceRole.entities[entityName].update(parceiroData.id, {
      tokens_disponiveis: Math.max(0, (parceiroData.tokens_disponiveis || 10) - 1),
      tokens_usados_mes: (parceiroData.tokens_usados_mes || 0) + 1
    });

    // ENVIAR VIA WHATSAPP
    const numeroWhatsApp = tokenUser.whatsapp;
    const mensagemDesconto = tipo_desconto === 'PERCENTUAL'
      ? `${valor_desconto}% de desconto`
      : `R$ ${parseFloat(valor_desconto).toFixed(2)} de desconto`;

    const mensagem = `🎁 *DESCONTO EXCLUSIVO DOUTORIZZE*\n\n` +
      `Olá, ${tokenUser.nome_completo || 'Cliente'}!\n\n` +
      `Você ganhou *${mensagemDesconto}* em:\n` +
      `📍 *${parceiroData.nome_fantasia}*\n\n` +
      `🎫 *Código:* \`${codigo}\`\n\n` +
      `⏰ *VÁLIDO POR 48 HORAS*\n` +
      `Expira em: ${dataValidade.toLocaleDateString('pt-BR')} às ${dataValidade.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
      `⚠️ Apresente este código ao parceiro para garantir seu desconto!\n\n` +
      `_Doutorizze - Conectando Profissionais_`;

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

      await base44.asServiceRole.entities.TokenDesconto.update(tokenDesconto.id, {
        enviado_whatsapp: true,
        whatsapp_enviado_em: new Date().toISOString()
      });
    } catch (whatsappError) {
      console.error('Erro WhatsApp:', whatsappError);
    }

    return Response.json({ 
      success: true,
      token: {
        codigo: tokenDesconto.codigo,
        data_validade: tokenDesconto.data_validade,
        tentativa: tentativa_numero,
        tokens_restantes: Math.max(0, (parceiroData.tokens_disponiveis || 10) - 1)
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
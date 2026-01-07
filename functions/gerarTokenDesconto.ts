import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * 🎫 GERAR TOKEN DE DESCONTO
 * 
 * Usado por parceiros (escolas/fornecedores/labs) para gerar tokens de desconto
 * para clientes Doutorizze.
 * 
 * @param token_usuario_id - ID do TokenUsuario validado
 * @param parceiro_tipo - EDUCACAO, FORNECEDOR, LABORATORIO
 * @param valor_desconto - Valor do desconto (% ou R$)
 * @param tipo_desconto - PERCENTUAL ou VALOR_FIXO
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token_usuario_id, parceiro_tipo, valor_desconto, tipo_desconto } = await req.json();

    // Validar campos obrigatórios
    if (!token_usuario_id || !parceiro_tipo || !valor_desconto || !tipo_desconto) {
      return Response.json({ 
        error: 'Campos obrigatórios: token_usuario_id, parceiro_tipo, valor_desconto, tipo_desconto' 
      }, { status: 400 });
    }

    // Buscar o token do usuário
    const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ id: token_usuario_id });
    
    if (tokenUsuario.length === 0) {
      return Response.json({ error: 'Token de usuário não encontrado' }, { status: 404 });
    }

    if (!tokenUsuario[0].token_validado) {
      return Response.json({ error: 'Token não foi validado ainda' }, { status: 400 });
    }

    // Gerar código único
    const codigo = `DESC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Data de validade (30 dias)
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);

    // Buscar dados do parceiro
    let parceiroNome = '';
    if (parceiro_tipo === 'EDUCACAO') {
      const inst = await base44.asServiceRole.entities.EducationInstitution.filter({ user_id: user.id });
      parceiroNome = inst[0]?.nome_fantasia || 'Instituição';
    } else if (parceiro_tipo === 'FORNECEDOR') {
      const sup = await base44.asServiceRole.entities.Supplier.filter({ user_id: user.id });
      parceiroNome = sup[0]?.nome_fantasia || 'Fornecedor';
    } else if (parceiro_tipo === 'LABORATORIO') {
      const lab = await base44.asServiceRole.entities.Laboratorio.filter({ user_id: user.id });
      parceiroNome = lab[0]?.nome_fantasia || 'Laboratório';
    }

    // Criar token de desconto
    const tokenDesconto = await base44.asServiceRole.entities.TokenDesconto.create({
      codigo,
      token_usuario_id,
      user_id: tokenUsuario[0].user_id,
      parceiro_id: user.id,
      parceiro_tipo,
      parceiro_nome: parceiroNome,
      tipo_desconto,
      valor_desconto: parseFloat(valor_desconto),
      status: 'ATIVO',
      data_geracao: new Date().toISOString(),
      data_validade: dataValidade.toISOString(),
      usuario_nome: tokenUsuario[0].nome_completo,
      usuario_nivel: tokenUsuario[0].nivel
    });

    // Enviar via WhatsApp
    const numeroWhatsApp = tokenUsuario[0].whatsapp;
    const mensagemDesconto = tipo_desconto === 'PERCENTUAL'
      ? `${valor_desconto}% de desconto`
      : `R$ ${valor_desconto.toFixed(2)} de desconto`;

    const mensagem = `🎁 *DESCONTO EXCLUSIVO DOUTORIZZE*\n\n` +
      `Olá, ${tokenUsuario[0].nome_completo}!\n\n` +
      `Você ganhou um desconto de *${mensagemDesconto}* em:\n` +
      `📍 *${parceiroNome}*\n\n` +
      `🎫 *Código do Desconto:* \`${codigo}\`\n\n` +
      `✅ Válido até: ${new Date(dataValidade).toLocaleDateString('pt-BR')}\n\n` +
      `📲 Apresente este código ao parceiro para garantir seu desconto!\n\n` +
      `_Doutorizze - Conectando Profissionais_`;

    try {
      await fetch(Deno.env.get('EVOLUTION_API_URL') + '/message/sendText/' + Deno.env.get('EVOLUTION_INSTANCE'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('EVOLUTION_API_KEY')
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
      console.error('Erro ao enviar WhatsApp:', whatsappError);
    }

    return Response.json({ 
      success: true,
      token: tokenDesconto
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
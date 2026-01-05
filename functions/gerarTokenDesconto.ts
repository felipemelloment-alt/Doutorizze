import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { 
      token_usuario_id, 
      user_id,
      parceiro_tipo,
      desconto_tipo, 
      desconto_valor, 
      produto_categoria,
      observacoes 
    } = await req.json();

    // Verificar se parceiro tem tokens disponíveis
    let parceiro;
    if (parceiro_tipo === 'FORNECEDOR') {
      const suppliers = await base44.entities.Supplier.filter({ user_id: user.id });
      parceiro = suppliers[0];
    } else if (parceiro_tipo === 'INSTITUICAO') {
      const institutions = await base44.entities.EducationInstitution.filter({ user_id: user.id });
      parceiro = institutions[0];
    } else if (parceiro_tipo === 'LABORATORIO') {
      const labs = await base44.entities.Laboratorio.filter({ user_id: user.id });
      parceiro = labs[0];
    }

    if (!parceiro) {
      return Response.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    if (parceiro.tokens_disponiveis <= 0) {
      return Response.json({ error: 'Sem tokens disponíveis' }, { status: 400 });
    }

    // Verificar créditos do usuário para este parceiro
    const tokensExistentes = await base44.asServiceRole.entities.TokenDesconto.filter({
      user_id: user_id,
      parceiro_id: parceiro.id
    });

    const tentativasAnteriores = tokensExistentes.filter(t => 
      t.status === 'EXPIRADO' && !t.negocio_fechado
    ).length;

    if (tentativasAnteriores >= 3) {
      return Response.json({ 
        error: 'Limite de tentativas atingido para este usuário' 
      }, { status: 400 });
    }

    // Gerar código único do token de desconto
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const codigo = `DESC-${random}`;

    // Data de validade: 48 horas
    const dataValidade = new Date();
    dataValidade.setHours(dataValidade.getHours() + 48);

    // Criar token de desconto
    const tokenDesconto = await base44.asServiceRole.entities.TokenDesconto.create({
      codigo: codigo,
      token_usuario_id: token_usuario_id,
      user_id: user_id,
      parceiro_id: parceiro.id,
      parceiro_tipo: parceiro_tipo,
      parceiro_nome: parceiro.nome_fantasia || parceiro.razao_social,
      desconto_tipo: desconto_tipo,
      desconto_valor: desconto_valor,
      tentativa_numero: tentativasAnteriores + 1,
      negocio_fechado: false,
      credito_reposto: false,
      status: 'ATIVO',
      data_geracao: new Date().toISOString(),
      data_validade: dataValidade.toISOString(),
      produto_categoria: produto_categoria || '',
      observacoes: observacoes || '',
      enviado_whatsapp: false
    });

    // Decrementar tokens do parceiro
    await base44.asServiceRole.entities[parceiro_tipo === 'FORNECEDOR' ? 'Supplier' : 
      parceiro_tipo === 'INSTITUICAO' ? 'EducationInstitution' : 'Laboratorio']
      .update(parceiro.id, {
        tokens_disponiveis: parceiro.tokens_disponiveis - 1,
        tokens_usados_mes: parceiro.tokens_usados_mes + 1
      });

    // Enviar via WhatsApp (usando função existente)
    try {
      const tokenUsuarios = await base44.asServiceRole.entities.TokenUsuario.filter({ id: token_usuario_id });
      const tokenUsuario = tokenUsuarios[0];
      
      const usuarios = await base44.asServiceRole.entities.User.filter({ id: user_id });
      const usuarioDestino = usuarios[0];

      const mensagem = `🎉 *Token de Desconto Gerado!*\n\n` +
        `Parceiro: *${parceiro.nome_fantasia}*\n` +
        `Token: *${codigo}*\n` +
        `Desconto: *${desconto_tipo === 'PERCENTUAL' ? desconto_valor + '%' : 'R$ ' + desconto_valor}*\n` +
        `Válido até: *${new Date(dataValidade).toLocaleString('pt-BR')}*\n\n` +
        `⏰ Você tem 48 horas para utilizar este desconto!\n\n` +
        `Apresente este código ao parceiro para garantir seu desconto exclusivo Doutorizze.`;

      await base44.functions.invoke('sendWhatsAppMessage', {
        phone: usuarioDestino.whatsapp || usuarioDestino.phone,
        message: mensagem
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
      token: tokenDesconto,
      message: 'Token de desconto gerado e enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerar token de desconto:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
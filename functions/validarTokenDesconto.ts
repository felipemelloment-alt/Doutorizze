import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { codigo, negocio_fechado, valor_aplicado } = await req.json();

    if (!codigo) {
      return Response.json({ error: 'Código obrigatório' }, { status: 400 });
    }

    // Buscar token de desconto
    const tokens = await base44.asServiceRole.entities.TokenDesconto.filter({ 
      codigo: codigo.toUpperCase().trim()
    });

    if (tokens.length === 0) {
      return Response.json({ error: 'Token não encontrado' }, { status: 404 });
    }

    const tokenDesconto = tokens[0];

    // Verificar se token já foi usado
    if (tokenDesconto.status === 'USADO') {
      return Response.json({ error: 'Token já utilizado' }, { status: 400 });
    }

    // Verificar se token expirou
    if (new Date(tokenDesconto.data_validade) < new Date()) {
      await base44.asServiceRole.entities.TokenDesconto.update(tokenDesconto.id, {
        status: 'EXPIRADO'
      });
      return Response.json({ error: 'Token expirado' }, { status: 400 });
    }

    // Marcar como usado
    await base44.asServiceRole.entities.TokenDesconto.update(tokenDesconto.id, {
      status: 'USADO',
      data_uso: new Date().toISOString(),
      negocio_fechado: negocio_fechado,
      valor_desconto_aplicado: valor_aplicado || 0
    });

    // Se negócio foi fechado, repor crédito ao usuário
    if (negocio_fechado) {
      const tokensUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ 
        id: tokenDesconto.token_usuario_id 
      });
      
      if (tokensUsuario.length > 0) {
        const tokenUsuario = tokensUsuario[0];
        
        await base44.asServiceRole.entities.TokenUsuario.update(tokenUsuario.id, {
          creditos_usados: tokenUsuario.creditos_usados + 1,
          total_descontos_usados: tokenUsuario.total_descontos_usados + 1,
          valor_economizado: tokenUsuario.valor_economizado + (valor_aplicado || 0)
        });

        await base44.asServiceRole.entities.TokenDesconto.update(tokenDesconto.id, {
          credito_reposto: true
        });
      }
    } else {
      // Se não fechou, penalizar usuário
      const tokensUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ 
        id: tokenDesconto.token_usuario_id 
      });
      
      if (tokensUsuario.length > 0) {
        const tokenUsuario = tokensUsuario[0];
        
        await base44.asServiceRole.entities.TokenUsuario.update(tokenUsuario.id, {
          creditos_perdidos: tokenUsuario.creditos_perdidos + 1
        });
      }
    }

    return Response.json({
      success: true,
      message: negocio_fechado ? 'Token validado - negócio fechado!' : 'Token validado - negócio não fechado',
      token: tokenDesconto
    });

  } catch (error) {
    console.error('Erro ao validar token de desconto:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
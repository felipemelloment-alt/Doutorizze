import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ✅ VALIDAR E USAR TOKEN DE DESCONTO
 * 
 * AÇÕES:
 * - Valida código
 * - Marca como USADO
 * - Registra se negócio fechou ou não
 * - Repõe crédito se negocio_fechado = true
 * - Aplica penalidade se negocio_fechado = false
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { codigo, negocio_fechado, valor_final } = await req.json();

    if (!codigo || negocio_fechado === undefined) {
      return Response.json({ 
        error: 'Campos obrigatórios: codigo, negocio_fechado' 
      }, { status: 400 });
    }

    // BUSCAR TOKEN
    const tokens = await base44.asServiceRole.entities.TokenDesconto.filter({ codigo });

    if (tokens.length === 0) {
      return Response.json({ 
        success: false,
        error: 'Token não encontrado',
        motivo: 'CODIGO_INVALIDO'
      }, { status: 404 });
    }

    const token = tokens[0];

    // VALIDAR STATUS
    if (token.status !== 'ATIVO') {
      return Response.json({ 
        success: false,
        error: `Token ${token.status.toLowerCase()}`,
        motivo: token.status
      }, { status: 400 });
    }

    // VALIDAR VALIDADE (48h)
    const agora = new Date();
    const dataValidade = new Date(token.data_validade);
    
    if (agora > dataValidade) {
      await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
        status: 'EXPIRADO'
      });
      
      return Response.json({ 
        success: false,
        error: 'Token expirado',
        motivo: 'EXPIRADO',
        data_validade: token.data_validade
      }, { status: 400 });
    }

    // VALIDAR PARCEIRO
    if (token.parceiro_id !== user.id) {
      return Response.json({ 
        success: false,
        error: 'Este token não pertence ao seu estabelecimento',
        motivo: 'PARCEIRO_INVALIDO'
      }, { status: 403 });
    }

    // MARCAR COMO USADO
    const tokenAtualizado = await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
      status: 'USADO',
      data_uso: agora.toISOString(),
      negocio_fechado: negocio_fechado,
      valor_desconto_aplicado: valor_final ? parseFloat(valor_final) : null,
      usado_por_user_id: user.id
    });

    // REPOR CRÉDITO SE FECHOU NEGÓCIO
    if (negocio_fechado) {
      await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
        credito_reposto: true
      });

      // Buscar TokenUsuario e incrementar creditos_usados
      const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ 
        id: token.token_usuario_id 
      });

      if (tokenUsuario.length > 0) {
        await base44.asServiceRole.entities.TokenUsuario.update(tokenUsuario[0].id, {
          creditos_usados: (tokenUsuario[0].creditos_usados || 0) + 1,
          total_descontos_usados: (tokenUsuario[0].total_descontos_usados || 0) + 1,
          valor_economizado: (tokenUsuario[0].valor_economizado || 0) + (token.valor_desconto || 0)
        });
      }
    } else {
      // NÃO FECHOU = PENALIDADE
      const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ 
        id: token.token_usuario_id 
      });

      if (tokenUsuario.length > 0) {
        const creditosPerdidos = (tokenUsuario[0].creditos_perdidos || 0) + 1;
        
        await base44.asServiceRole.entities.TokenUsuario.update(tokenUsuario[0].id, {
          creditos_perdidos: creditosPerdidos
        });

        // Se atingiu 3 créditos perdidos = SUSPENDER
        if (creditosPerdidos >= 3) {
          await base44.asServiceRole.entities.TokenUsuario.update(tokenUsuario[0].id, {
            status: 'SUSPENSO'
          });
        }
      }
    }

    return Response.json({ 
      success: true,
      token: tokenAtualizado,
      usuario: {
        nome: token.usuario_nome,
        nivel: token.usuario_nivel
      },
      desconto: {
        tipo: token.tipo_desconto,
        valor: token.valor_desconto
      },
      negocio_fechado
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
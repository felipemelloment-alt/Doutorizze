import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ✅ VALIDAR TOKEN DE DESCONTO
 * 
 * Usado por parceiros para validar e marcar como usado um token de desconto.
 * 
 * @param codigo - Código do token (DESC-XXXX)
 * @param valor_final - Valor final após desconto aplicado (para registro)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { codigo, valor_final } = await req.json();

    if (!codigo) {
      return Response.json({ error: 'Código do token obrigatório' }, { status: 400 });
    }

    // Buscar token
    const tokens = await base44.asServiceRole.entities.TokenDesconto.filter({ codigo });

    if (tokens.length === 0) {
      return Response.json({ 
        success: false,
        error: 'Token não encontrado',
        motivo: 'CODIGO_INVALIDO'
      }, { status: 404 });
    }

    const token = tokens[0];

    // Validações
    if (token.status !== 'ATIVO') {
      return Response.json({ 
        success: false,
        error: `Token ${token.status.toLowerCase()}`,
        motivo: token.status
      }, { status: 400 });
    }

    // Verificar validade
    const agora = new Date();
    const dataValidade = new Date(token.data_validade);
    
    if (agora > dataValidade) {
      // Marcar como expirado
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

    // Verificar se o parceiro que está validando é o dono do token
    if (token.parceiro_id !== user.id) {
      return Response.json({ 
        success: false,
        error: 'Este token não pertence a você',
        motivo: 'PARCEIRO_INVALIDO'
      }, { status: 403 });
    }

    // Marcar como USADO
    const tokenAtualizado = await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
      status: 'USADO',
      data_uso: agora.toISOString(),
      valor_desconto_aplicado: valor_final ? parseFloat(valor_final) : null,
      usado_por_user_id: user.id
    });

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
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
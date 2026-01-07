import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * 🔍 VALIDAR TOKEN USUARIO
 * 
 * Valida se o token do usuário existe e está ativo.
 * Retorna dados do usuário para o parceiro gerar desconto.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token_id } = await req.json();

    if (!token_id) {
      return Response.json({ error: 'token_id obrigatório' }, { status: 400 });
    }

    // Buscar token
    const tokens = await base44.asServiceRole.entities.TokenUsuario.filter({ 
      token_id: token_id.trim().toUpperCase() 
    });

    if (tokens.length === 0) {
      return Response.json({ 
        valido: false,
        error: 'Token não encontrado'
      });
    }

    const tokenUsuario = tokens[0];

    if (tokenUsuario.status !== 'ATIVO') {
      return Response.json({ 
        valido: false,
        error: `Token ${tokenUsuario.status.toLowerCase()}`,
        status: tokenUsuario.status
      });
    }

    // Determinar tipo de parceiro atual
    let parceiroTipo = 'FORNECEDOR';
    
    const isEducacao = await base44.asServiceRole.entities.EducationInstitution.filter({ user_id: user.id });
    if (isEducacao.length > 0) parceiroTipo = 'EDUCACAO';
    
    const isLab = await base44.asServiceRole.entities.Laboratorio.filter({ user_id: user.id });
    if (isLab.length > 0) parceiroTipo = 'LABORATORIO';

    return Response.json({ 
      valido: true,
      token_usuario_id: tokenUsuario.id,
      user_id: tokenUsuario.user_id,
      user_nome: tokenUsuario.nome_completo || 'Cliente',
      tipo_conta: tokenUsuario.tipo_conta,
      nivel: tokenUsuario.nivel,
      cadastrado_desde: tokenUsuario.data_emissao,
      status: tokenUsuario.status,
      creditos_usados: tokenUsuario.creditos_usados || 0,
      creditos_perdidos: tokenUsuario.creditos_perdidos || 0,
      parceiro_tipo: parceiroTipo
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
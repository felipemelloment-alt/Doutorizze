import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { token_id } = await req.json();

    if (!token_id) {
      return Response.json({ error: 'Token ID obrigatório' }, { status: 400 });
    }

    // Buscar token do usuário
    const tokens = await base44.asServiceRole.entities.TokenUsuario.filter({ 
      token_id: token_id.toUpperCase().trim()
    });

    if (tokens.length === 0) {
      return Response.json({
        valido: false,
        message: 'Token não encontrado'
      });
    }

    const tokenUsuario = tokens[0];

    // Verificar status
    if (tokenUsuario.status !== 'ATIVO') {
      return Response.json({
        valido: false,
        message: 'Token inativo ou suspenso'
      });
    }

    // Buscar dados do usuário
    const usuarios = await base44.asServiceRole.entities.User.filter({ id: tokenUsuario.user_id });
    const usuarioInfo = usuarios[0];

    return Response.json({
      valido: true,
      usuario: {
        nome: usuarioInfo?.full_name || 'Não disponível',
        email: usuarioInfo?.email,
        tipo_conta: tokenUsuario.tipo_conta,
        especialidade: tokenUsuario.especialidade,
        nivel: tokenUsuario.nivel,
        cadastrado_desde: tokenUsuario.data_emissao,
        verificado: tokenUsuario.verificado,
        creditos_disponiveis: tokenUsuario.creditos_disponiveis
      },
      token_id: tokenUsuario.token_id,
      token_usuario_id: tokenUsuario.id
    });

  } catch (error) {
    console.error('Erro ao validar token:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
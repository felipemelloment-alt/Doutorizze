import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { tipo_conta, especialidade } = await req.json();

    // Verificar se já existe token para o usuário
    const tokensExistentes = await base44.entities.TokenUsuario.filter({ user_id: user.id });
    
    if (tokensExistentes.length > 0) {
      return Response.json({ 
        error: 'Usuário já possui token',
        token: tokensExistentes[0]
      }, { status: 400 });
    }

    // Gerar Token ID único (DTZ-YYYY-XXXX)
    const ano = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const tokenId = `DTZ-${ano}-${random}`;

    // Criar TokenUsuario
    const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.create({
      token_id: tokenId,
      user_id: user.id,
      tipo_conta: tipo_conta,
      especialidade: especialidade || '',
      nivel: 1,
      pontos: 0,
      creditos_disponiveis: 3,
      creditos_usados: 0,
      creditos_perdidos: 0,
      status: 'ATIVO',
      verificado: false,
      whatsapp_verificado: false,
      data_emissao: new Date().toISOString(),
      total_descontos_usados: 0,
      valor_economizado: 0
    });

    return Response.json({
      success: true,
      token: tokenUsuario,
      message: 'Token gerado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerar token:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, nomeUsuario } = await req.json();

    if (!userId || !nomeUsuario) {
      return Response.json({ error: 'userId e nomeUsuario são obrigatórios' }, { status: 400 });
    }

    // Gerar código único
    const primeiroNome = nomeUsuario.split(' ')[0].toUpperCase().substring(0, 4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `DOUT-${primeiroNome}-${random}`;

    // Calcular expiração (7 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Salvar no banco
    const telegramAccess = await base44.entities.TelegramAccess.create({
      user_id: userId,
      codigo: codigo,
      usado: false,
      expires_at: expiresAt.toISOString()
    });

    return Response.json({ 
      success: true,
      codigo,
      expires_at: expiresAt.toISOString(),
      id: telegramAccess.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
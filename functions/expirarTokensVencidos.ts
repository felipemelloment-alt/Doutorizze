import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * 🗑️ EXPIRAR TOKENS VENCIDOS
 * 
 * Scheduled task que roda a cada 6 horas.
 * Marca tokens ATIVOS que passaram de 48h como EXPIRADOS.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Validação admin (scheduled task)
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const agora = new Date();

    // Buscar tokens ATIVOS vencidos
    const tokens = await base44.asServiceRole.entities.TokenDesconto.filter({
      status: 'ATIVO'
    });

    const tokensVencidos = tokens.filter(t => new Date(t.data_validade) < agora);

    let tokensExpirados = 0;

    for (const token of tokensVencidos) {
      try {
        await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
          status: 'EXPIRADO'
        });

        tokensExpirados++;

        // Enviar notificação ao usuário
        await base44.asServiceRole.entities.Notification.create({
          user_id: token.user_id,
          tipo: 'ALERTA',
          titulo: '⏰ Token de desconto expirado',
          mensagem: `Seu desconto de ${token.tipo_desconto === 'PERCENTUAL' ? token.valor_desconto + '%' : 'R$ ' + token.valor_desconto.toFixed(2)} em ${token.parceiro_nome} expirou.`,
          priority: 'low',
          channels: 'in_app'
        });
      } catch (error) {
        console.error(`Erro ao expirar token ${token.codigo}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      tokens_verificados: tokens.length,
      tokens_expirados: tokensExpirados
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
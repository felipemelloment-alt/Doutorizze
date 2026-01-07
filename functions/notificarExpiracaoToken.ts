import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ⏰ NOTIFICAR EXPIRAÇÃO DE TOKENS (24H ANTES)
 * 
 * Scheduled task que roda a cada 6 horas.
 * Envia notificações 24h antes do token expirar.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Validação admin apenas (scheduled task)
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const agora = new Date();
    const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    const em25h = new Date(agora.getTime() + 25 * 60 * 60 * 1000);

    // Buscar tokens ATIVOS que expiram nas próximas 24-25h
    const tokens = await base44.asServiceRole.entities.TokenDesconto.filter({
      status: 'ATIVO',
      notificacao_expiracao_enviada: false
    });

    const tokensParaNotificar = tokens.filter(t => {
      const validade = new Date(t.data_validade);
      return validade >= em24h && validade <= em25h;
    });

    let notificacoesEnviadas = 0;

    for (const token of tokensParaNotificar) {
      try {
        // Buscar usuário
        const tokenUsuario = await base44.asServiceRole.entities.TokenUsuario.filter({ 
          id: token.token_usuario_id 
        });

        if (tokenUsuario.length === 0) continue;

        const numeroWhatsApp = tokenUsuario[0].whatsapp;
        if (!numeroWhatsApp) continue;

        const horasRestantes = Math.floor((new Date(token.data_validade) - agora) / (1000 * 60 * 60));
        
        const mensagemDesconto = token.tipo_desconto === 'PERCENTUAL'
          ? `${token.valor_desconto}% de desconto`
          : `R$ ${token.valor_desconto.toFixed(2)} de desconto`;

        const mensagem = `⏰ *SEU TOKEN EXPIRA EM ${horasRestantes}H!*\n\n` +
          `Olá!\n\n` +
          `Seu desconto Doutorizze está quase expirando:\n\n` +
          `🎫 *Código:* \`${token.codigo}\`\n` +
          `💰 *Desconto:* ${mensagemDesconto}\n` +
          `📍 *Parceiro:* ${token.parceiro_nome}\n\n` +
          `⏳ *EXPIRA EM ${horasRestantes} HORAS*\n` +
          `Data limite: ${new Date(token.data_validade).toLocaleString('pt-BR')}\n\n` +
          `⚠️ Não perca essa oportunidade!\n` +
          `Entre em contato com o parceiro e aproveite seu desconto.\n\n` +
          `_Doutorizze_`;

        // Enviar WhatsApp
        const evolutionUrl = Deno.env.get('EVOLUTION_API_URL');
        const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE');
        const evolutionKey = Deno.env.get('EVOLUTION_API_KEY');

        await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionKey
          },
          body: JSON.stringify({
            number: `55${numeroWhatsApp}`,
            text: mensagem
          })
        });

        // Marcar como enviado
        await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
          notificacao_expiracao_enviada: true
        });

        // Criar notificação in-app
        await base44.asServiceRole.entities.Notification.create({
          user_id: token.user_id,
          tipo: 'ALERTA',
          titulo: `⏰ Token expira em ${horasRestantes}h`,
          mensagem: `Seu desconto de ${mensagemDesconto} em ${token.parceiro_nome} expira em breve!`,
          priority: 'high',
          channels: 'in_app,push'
        });

        notificacoesEnviadas++;
      } catch (error) {
        console.error(`Erro ao notificar token ${token.codigo}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      tokens_verificados: tokens.length,
      notificacoes_enviadas: notificacoesEnviadas
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Esta função deve ser chamada via scheduled task
    // Buscar tokens que estão próximos de expirar

    const agora = new Date();
    const em12Horas = new Date(agora.getTime() + 12 * 60 * 60 * 1000);
    const em6Horas = new Date(agora.getTime() + 6 * 60 * 60 * 1000);
    const em2Horas = new Date(agora.getTime() + 2 * 60 * 60 * 1000);

    // Buscar tokens ativos que estão próximos de expirar
    const tokensAtivos = await base44.asServiceRole.entities.TokenDesconto.filter({ 
      status: 'ATIVO' 
    });

    for (const token of tokensAtivos) {
      const dataValidade = new Date(token.data_validade);
      
      // Buscar usuário
      const usuarios = await base44.asServiceRole.entities.User.filter({ id: token.user_id });
      if (usuarios.length === 0) continue;
      
      const usuario = usuarios[0];
      let mensagem = '';
      let enviar = false;

      // Verificar qual notificação enviar
      if (dataValidade <= em2Horas && dataValidade > agora) {
        mensagem = `🚨 *ÚLTIMO AVISO!*\n\n` +
          `Seu token de desconto para *${token.parceiro_nome}* expira em 2 HORAS!\n\n` +
          `Código: *${token.codigo}*\n` +
          `Desconto: *${token.desconto_tipo === 'PERCENTUAL' ? token.desconto_valor + '%' : 'R$ ' + token.desconto_valor}*\n\n` +
          `⏰ Não perca esta oportunidade!`;
        enviar = true;
      } else if (dataValidade <= em6Horas && dataValidade > em2Horas) {
        mensagem = `⚠️ *Atenção!*\n\n` +
          `Seu token de desconto para *${token.parceiro_nome}* expira em 6 horas!\n\n` +
          `Código: *${token.codigo}*\n` +
          `Desconto: *${token.desconto_tipo === 'PERCENTUAL' ? token.desconto_valor + '%' : 'R$ ' + token.desconto_valor}*\n\n` +
          `Entre em contato com o parceiro agora!`;
        enviar = true;
      } else if (dataValidade <= em12Horas && dataValidade > em6Horas) {
        mensagem = `⏰ *Lembrete*\n\n` +
          `Seu token de desconto para *${token.parceiro_nome}* expira em 12 horas!\n\n` +
          `Código: *${token.codigo}*\n` +
          `Desconto: *${token.desconto_tipo === 'PERCENTUAL' ? token.desconto_valor + '%' : 'R$ ' + token.desconto_valor}*\n\n` +
          `Aproveite enquanto é tempo!`;
        enviar = true;
      }

      if (enviar && mensagem) {
        try {
          // WhatsApp
          await base44.functions.invoke('sendWhatsAppMessage', {
            phone: usuario.whatsapp || usuario.phone,
            message: mensagem
          });

          // Push Notification
          await base44.functions.invoke('sendPushNotification', {
            user_id: usuario.id,
            title: 'Token expirando!',
            body: `Seu desconto para ${token.parceiro_nome} expira em breve`,
            data: { token_id: token.id, type: 'token_expiracao' }
          });

        } catch (notifError) {
          console.error('Erro ao enviar notificação:', notifError);
        }
      }

      // Verificar se já expirou
      if (dataValidade < agora && token.status === 'ATIVO') {
        await base44.asServiceRole.entities.TokenDesconto.update(token.id, {
          status: 'EXPIRADO'
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Notificações processadas',
      tokens_verificados: tokensAtivos.length
    });

  } catch (error) {
    console.error('Erro ao notificar expiração:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
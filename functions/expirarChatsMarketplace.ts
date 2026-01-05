import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Função para rodar via scheduled task
    // Expira chats após 48h

    const agora = new Date();

    // Buscar chats ativos
    const chatsAtivos = await base44.asServiceRole.entities.MarketplaceChat.filter({
      status: 'ATIVO'
    });

    let expirados = 0;

    for (const chat of chatsAtivos) {
      const expiraEm = new Date(chat.expira_em);
      
      if (expiraEm < agora) {
        // Expirar chat
        await base44.asServiceRole.entities.MarketplaceChat.update(chat.id, {
          status: 'EXPIRADO'
        });

        // Notificar ambas as partes
        const usuarios = [chat.comprador_id, chat.vendedor_id];
        
        for (const userId of usuarios) {
          try {
            await base44.functions.invoke('sendPushNotification', {
              user_id: userId,
              title: 'Chat expirado',
              body: 'O chat do marketplace expirou após 48h',
              data: { chat_id: chat.id, type: 'chat_expirado' }
            });
          } catch (notifError) {
            console.error('Erro ao notificar:', notifError);
          }
        }

        expirados++;
      }
    }

    return Response.json({
      success: true,
      message: 'Chats verificados',
      expirados: expirados,
      verificados: chatsAtivos.length
    });

  } catch (error) {
    console.error('Erro ao expirar chats:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
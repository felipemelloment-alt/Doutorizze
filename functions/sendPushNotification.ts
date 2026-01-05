import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * BACKEND FUNCTION - ENVIAR PUSH NOTIFICATION
 * 
 * Integra com Firebase Cloud Messaging (FCM)
 * Dispara notificações push para usuários
 * 
 * SETUP NECESSÁRIO:
 * 1. Criar projeto no Firebase Console
 * 2. Habilitar Cloud Messaging
 * 3. Gerar chave de servidor (Server Key)
 * 4. Adicionar secret: FIREBASE_SERVER_KEY
 * 5. Adicionar secret: FIREBASE_SENDER_ID
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, title, body, data, url } = await req.json();

    // Buscar token FCM do usuário (salvo no User entity)
    const targetUser = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (!targetUser || !targetUser[0]?.fcm_token) {
      return Response.json({ 
        error: 'User não tem FCM token registrado' 
      }, { status: 400 });
    }

    const fcmToken = targetUser[0].fcm_token;
    const serverKey = Deno.env.get('FIREBASE_SERVER_KEY');

    if (!serverKey) {
      return Response.json({ 
        error: 'FIREBASE_SERVER_KEY não configurado' 
      }, { status: 500 });
    }

    // Enviar via FCM
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title,
          body,
          icon: '/icon-192.png',
          click_action: url || '/',
          badge: '/badge-72.png'
        },
        data: data || {},
        priority: 'high'
      })
    });

    const result = await fcmResponse.json();

    if (!fcmResponse.ok) {
      throw new Error(result.error || 'Erro ao enviar push');
    }

    return Response.json({ 
      success: true,
      messageId: result.results?.[0]?.message_id 
    });

  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
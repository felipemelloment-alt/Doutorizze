import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { whatsapp, codigo } = await req.json();

    if (!whatsapp || !codigo) {
      return Response.json({ error: 'WhatsApp e código são obrigatórios' }, { status: 400 });
    }

    // Formatar número para E.164
    let numero = whatsapp.replace(/\D/g, '');
    if (numero.length === 11) {
      numero = '55' + numero;
    }

    const mensagem = `🔐 *DOUTORIZZE*

Seu código de verificação: *${codigo}*

Válido por 10 minutos.
Não compartilhe este código.`;

    const response = await fetch('https://creditoodonto-evolution.cloudfy.live/message/sendText/Remarketing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '698A2AC7F52A-4C98-8452-53D933343047'
      },
      body: JSON.stringify({
        number: numero,
        text: mensagem
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Falha ao enviar WhatsApp: ' + error }, { status: 500 });
    }

    const result = await response.json();

    return Response.json({ 
      success: true, 
      numero,
      messageId: result.key?.id 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
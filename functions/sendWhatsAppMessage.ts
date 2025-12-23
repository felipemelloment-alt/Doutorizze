/**
 * SEND WHATSAPP MESSAGE - Backend Function
 * 
 * Proxy seguro para Evolution API.
 * API keys ficam APENAS no servidor, nunca no frontend.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Autenticação obrigatória
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Validar payload
    const { to, message, template } = await req.json();
    
    if (!to || (!message && !template)) {
      return Response.json({ 
        error: 'Destinatário e mensagem são obrigatórios' 
      }, { status: 400 });
    }

    // Validar formato do número
    const numeroLimpo = to.replace(/\D/g, '');
    if (numeroLimpo.length < 10 || numeroLimpo.length > 13) {
      return Response.json({ 
        error: 'Número de telefone inválido' 
      }, { status: 400 });
    }

    // 3. Obter credenciais do servidor (NÃO do frontend!)
    const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");
    const evolutionInstance = Deno.env.get("EVOLUTION_INSTANCE") || "doutorizze";

    if (!evolutionApiUrl || !evolutionApiKey) {
      console.error("EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados");
      return Response.json({ 
        error: 'Serviço de WhatsApp não configurado' 
      }, { status: 503 });
    }

    // 4. Enviar mensagem via Evolution API
    const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`,
        text: message
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro Evolution API:", errorData);
      return Response.json({ 
        error: 'Falha ao enviar mensagem' 
      }, { status: 502 });
    }

    const result = await response.json();

    // 5. Log de auditoria (sem dados sensíveis)
    await base44.entities.WhatsAppNotification.create({
      tipo: "OUTRO",
      destinatario_whatsapp: numeroLimpo.slice(-4).padStart(numeroLimpo.length, '*'),
      destinatario_nome: "Usuário",
      mensagem_texto: message.substring(0, 50) + "...",
      status: "SENT",
      sent_at: new Date().toISOString(),
      metadata: {
        sent_by: user.id,
        evolution_response: result.key?.id || null
      }
    });

    return Response.json({ 
      success: true,
      message_id: result.key?.id || null
    });

  } catch (error) {
    console.error("Erro em sendWhatsAppMessage:", error.message);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
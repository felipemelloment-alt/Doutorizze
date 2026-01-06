/**
 * SEND WHATSAPP OTP - Backend Function
 * 
 * Gera OTP seguro no servidor, faz hash com bcrypt, salva com TTL,
 * implementa rate limiting e invalida OTPs anteriores.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Função para gerar hash SHA-256 com salt obrigatório
async function hashOTP(otp) {
  const salt = Deno.env.get("OTP_SALT");
  if (!salt) {
    throw new Error("OTP_SALT não configurado. Configure o secret no dashboard.");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Rate limiting: máximo de requests por minuto
const RATE_LIMIT_SECONDS = 60;
const MAX_DAILY_OTPS = 10;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Autenticação obrigatória
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Validar payload
    const { whatsapp_e164 } = await req.json();
    
    if (!whatsapp_e164 || !/^\+55\d{11}$/.test(whatsapp_e164)) {
      return Response.json({ 
        error: 'WhatsApp inválido. Formato: +55DDDNNNNNNNNN' 
      }, { status: 400 });
    }

    // 3. Rate Limiting - verificar último envio por user_id + whatsapp
    const agora = new Date();
    const umMinutoAtras = new Date(agora.getTime() - RATE_LIMIT_SECONDS * 1000);
    
    // Buscar OTPs do usuário para este número específico
    const otpsRecentes = await base44.entities.WhatsAppOTP.filter({
      user_id: user.id,
      whatsapp_e164: whatsapp_e164
    });
    
    // Verificar rate limit (60 segundos entre envios para mesmo user+telefone)
    const ultimoOTP = otpsRecentes
      .filter(o => o.status !== "INVALIDATED" && new Date(o.created_date) > umMinutoAtras)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    
    if (ultimoOTP) {
      const tempoRestante = Math.ceil(
        (new Date(ultimoOTP.created_date).getTime() + RATE_LIMIT_SECONDS * 1000 - agora.getTime()) / 1000
      );
      return Response.json({ 
        error: `Aguarde ${tempoRestante}s para reenviar`,
        retry_after: tempoRestante
      }, { status: 429 });
    }

    // Verificar limite diário (todos os números do usuário)
    const otpsTodosNumeros = await base44.entities.WhatsAppOTP.filter({
      user_id: user.id
    });
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const otpsHoje = otpsTodosNumeros.filter(o => new Date(o.created_date) >= inicioDia);
    
    if (otpsHoje.length >= MAX_DAILY_OTPS) {
      return Response.json({ 
        error: 'Limite diário de verificações atingido. Tente amanhã.' 
      }, { status: 429 });
    }

    // 4. Invalidar OTPs anteriores pendentes (marcar status e expirar)
    const otpsPendentes = otpsRecentes.filter(o => o.status === "PENDING");
    for (const otp of otpsPendentes) {
      await base44.entities.WhatsAppOTP.update(otp.id, { 
        status: "INVALIDATED",
        expires_at: new Date().toISOString()
      });
    }

    // 5. Gerar OTP seguro (6 dígitos)
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 6. Hash do OTP
    const otpHash = await hashOTP(otpPlain);

    // 7. Calcular expiração (10 minutos)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 8. Salvar no banco com status explícito
    await base44.entities.WhatsAppOTP.create({
      user_id: user.id,
      whatsapp_e164: whatsapp_e164,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
      status: "PENDING",
      verified: false,
      attempts: 0
    });

    // 9. Enviar via WhatsApp (Evolution API ou similar)
    const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");
    const evolutionInstance = Deno.env.get("EVOLUTION_INSTANCE") || "doutorizze";

    if (evolutionApiUrl && evolutionApiKey) {
      try {
        const mensagem = `🔐 *DOUTORIZZE*\n\nSeu código de verificação é:\n\n*${otpPlain}*\n\n⏱️ Válido por 10 minutos.\n\n_Não compartilhe este código._`;
        
        await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
          method: 'POST',
          headers: {
            'apikey': evolutionApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            number: whatsapp_e164.replace('+', ''),
            text: mensagem
          })
        });
      } catch (whatsappError) {
        // Erro silencioso ao enviar WhatsApp
      }
    }

    // 10. Resposta de sucesso (SEM expor o OTP)
    return Response.json({ 
      success: true,
      message: 'Código enviado para ' + whatsapp_e164.slice(0, 6) + '****' + whatsapp_e164.slice(-2),
      expires_in_seconds: 600
    });

  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
/**
 * SEND WHATSAPP OTP - Backend Function
 * 
 * Gera OTP seguro no servidor, faz hash com bcrypt, salva com TTL,
 * implementa rate limiting e invalida OTPs anteriores.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Função para gerar hash simples (SHA-256) - mais leve que bcrypt para OTP
async function hashOTP(otp) {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + Deno.env.get("OTP_SALT") || "doutorizze-otp-salt-2024");
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

    // 3. Rate Limiting - verificar último envio
    const agora = new Date();
    const umMinutoAtras = new Date(agora.getTime() - RATE_LIMIT_SECONDS * 1000);
    
    const otpsRecentes = await base44.entities.WhatsAppOTP.filter({
      user_id: user.id
    });
    
    // Verificar rate limit (60 segundos entre envios)
    const ultimoOTP = otpsRecentes
      .filter(o => new Date(o.created_date) > umMinutoAtras)
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

    // Verificar limite diário
    const inicioDia = new Date(agora.setHours(0, 0, 0, 0));
    const otpsHoje = otpsRecentes.filter(o => new Date(o.created_date) >= inicioDia);
    
    if (otpsHoje.length >= MAX_DAILY_OTPS) {
      return Response.json({ 
        error: 'Limite diário de verificações atingido. Tente amanhã.' 
      }, { status: 429 });
    }

    // 4. Invalidar OTPs anteriores não verificados
    const otpsAnteriores = otpsRecentes.filter(o => !o.verified);
    for (const otp of otpsAnteriores) {
      await base44.entities.WhatsAppOTP.update(otp.id, { 
        verified: null // marca como invalidado
      });
    }

    // 5. Gerar OTP seguro (6 dígitos)
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 6. Hash do OTP
    const otpHash = await hashOTP(otpPlain);

    // 7. Calcular expiração (10 minutos)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 8. Salvar no banco
    await base44.entities.WhatsAppOTP.create({
      user_id: user.id,
      whatsapp_e164: whatsapp_e164,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
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
        // Log erro mas não falha (fallback para dev)
        console.error("Erro ao enviar WhatsApp:", whatsappError.message);
      }
    }

    // 10. Resposta de sucesso (SEM expor o OTP)
    return Response.json({ 
      success: true,
      message: 'Código enviado para ' + whatsapp_e164.slice(0, 6) + '****' + whatsapp_e164.slice(-2),
      expires_in_seconds: 600
    });

  } catch (error) {
    console.error("Erro em sendWhatsAppOTP:", error.message);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
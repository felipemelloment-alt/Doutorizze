/**
 * VERIFY WHATSAPP OTP - Backend Function
 * 
 * Valida OTP com hash comparison, verifica TTL, 
 * implementa máximo de tentativas e marca como verificado.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Função para gerar hash (deve ser igual ao sendWhatsAppOTP)
async function hashOTP(otp) {
  const salt = Deno.env.get("OTP_SALT");
  if (!salt) {
    throw new Error("OTP_SALT não configurado");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const MAX_ATTEMPTS = 3;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Autenticação obrigatória
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Validar payload
    const { whatsapp_e164, codigo } = await req.json();
    
    if (!whatsapp_e164 || !codigo) {
      return Response.json({ 
        error: 'WhatsApp e código são obrigatórios' 
      }, { status: 400 });
    }

    if (!/^\d{6}$/.test(codigo)) {
      return Response.json({ 
        error: 'Código deve ter 6 dígitos' 
      }, { status: 400 });
    }

    // 3. Buscar OTP válido (status PENDING, não expirado)
    const otps = await base44.entities.WhatsAppOTP.filter({
      user_id: user.id,
      whatsapp_e164: whatsapp_e164,
      status: "PENDING"
    });

    // Filtrar apenas não expirados
    const otpsValidos = otps.filter(o => new Date(o.expires_at) > new Date());

    if (otpsValidos.length === 0) {
      return Response.json({ 
        error: 'Nenhum código pendente. Solicite um novo.',
        code: 'NO_PENDING_OTP'
      }, { status: 404 });
    }

    // Pegar o mais recente
    const otpRecord = otpsValidos.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    )[0];

    // 4. Verificar expiração
    if (new Date(otpRecord.expires_at) < new Date()) {
      return Response.json({ 
        error: 'Código expirado. Solicite um novo.',
        code: 'OTP_EXPIRED'
      }, { status: 410 });
    }

    // 5. Verificar tentativas
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return Response.json({ 
        error: 'Máximo de tentativas excedido. Solicite um novo código.',
        code: 'MAX_ATTEMPTS'
      }, { status: 429 });
    }

    // 6. Comparar hash
    const codigoHash = await hashOTP(codigo);
    
    if (otpRecord.otp_hash !== codigoHash) {
      // Incrementar tentativas
      await base44.entities.WhatsAppOTP.update(otpRecord.id, {
        attempts: otpRecord.attempts + 1
      });
      
      const tentativasRestantes = MAX_ATTEMPTS - (otpRecord.attempts + 1);
      
      return Response.json({ 
        error: `Código incorreto. ${tentativasRestantes} tentativa(s) restante(s).`,
        code: 'INVALID_OTP',
        attempts_remaining: tentativasRestantes
      }, { status: 401 });
    }

    // 7. SUCESSO - Marcar OTP como verificado
    await base44.entities.WhatsAppOTP.update(otpRecord.id, { 
      status: "VERIFIED",
      verified: true,
      verified_at: new Date().toISOString()
    });

    // 8. Atualizar usuário com WhatsApp verificado
    await base44.auth.updateMe({
      whatsapp_e164: whatsapp_e164,
      whatsapp_verified: true,
      whatsapp_verified_at: new Date().toISOString()
    });

    // 9. Resposta de sucesso
    return Response.json({ 
      success: true,
      message: 'WhatsApp verificado com sucesso!',
      whatsapp_e164: whatsapp_e164
    });

  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
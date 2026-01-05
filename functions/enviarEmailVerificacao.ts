import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { email, nome, token } = await req.json();

    if (!email || !nome || !token) {
      return Response.json({ error: 'Email, nome e token são obrigatórios' }, { status: 400 });
    }

    const linkVerificacao = `https://web.doutorizze.com.br/VerificarEmail?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FCD34D, #F97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">DOUTORIZZE</h1>
        </div>

        <div style="padding: 30px; background: #fff;">
          <h2>Olá, ${nome}!</h2>
          <p>Confirme seu email para ativar sua conta:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkVerificacao}"
               style="background: linear-gradient(135deg, #FCD34D, #F97316);
                      color: white;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 30px;
                      font-weight: bold;
                      display: inline-block;">
              VERIFICAR EMAIL
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Este link expira em 24 horas.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            Se você não solicitou esta verificação, ignore este email.
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
          Doutorizze - Conectando profissionais de saúde
        </div>
      </div>
    `;

    // Enviar email usando integração Core
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Confirme seu email - Doutorizze',
      body: html
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
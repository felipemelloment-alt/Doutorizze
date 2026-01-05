import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { substituicao_id, candidatura_id } = await req.json();

    // Buscar substituição
    const substituicoes = await base44.asServiceRole.entities.SubstituicaoUrgente.filter({ id: substituicao_id });
    if (substituicoes.length === 0) {
      return Response.json({ error: 'Substituição não encontrada' }, { status: 404 });
    }

    const substituicao = substituicoes[0];

    // Buscar candidatura
    const candidaturas = await base44.asServiceRole.entities.CandidaturaSubstituicao.filter({ id: candidatura_id });
    if (candidaturas.length === 0) {
      return Response.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    const candidatura = candidaturas[0];

    // Timer de 1 hora
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + 60 * 60 * 1000); // +1 hora

    // Atualizar candidatura escolhida
    await base44.asServiceRole.entities.CandidaturaSubstituicao.update(candidatura.id, {
      status: 'ESCOLHIDO',
      escolhido_em: agora.toISOString(),
      timer_confirmacao_inicio: agora.toISOString(),
      timer_confirmacao_fim: expiraEm.toISOString()
    });

    // Atualizar substituição
    await base44.asServiceRole.entities.SubstituicaoUrgente.update(substituicao.id, {
      status: 'EM_SELECAO',
      profissional_escolhido_id: candidatura.professional_id,
      escolhido_em: agora.toISOString(),
      escolhido_por_user_id: user.id,
      timer_confirmacao_expira_em: expiraEm.toISOString()
    });

    // Notificar profissional escolhido
    const professionals = await base44.asServiceRole.entities.Professional.filter({ id: candidatura.professional_id });
    if (professionals.length > 0) {
      const professional = professionals[0];
      const usuarios = await base44.asServiceRole.entities.User.filter({ id: professional.user_id });
      
      if (usuarios.length > 0) {
        const profUser = usuarios[0];
        
        // WhatsApp
        const mensagem = `🎉 *Você foi escolhido para uma substituição!*\n\n` +
          `Clínica: *${substituicao.nome_clinica}*\n` +
          `Local: ${substituicao.cidade}/${substituicao.uf}\n` +
          `Quando: ${substituicao.tipo_data === 'IMEDIATO' ? '🚨 HOJE/IMEDIATO' : substituicao.data_especifica}\n\n` +
          `⏰ *ATENÇÃO: Você tem 1 HORA para confirmar!*\n\n` +
          `Se não confirmar em 1 hora, a vaga será oferecida ao próximo da fila.\n\n` +
          `Confirme sua presença no app agora!`;

        try {
          await base44.functions.invoke('sendWhatsAppMessage', {
            phone: profUser.whatsapp || profUser.phone,
            message: mensagem
          });
        } catch (whatsappError) {
          console.error('Erro WhatsApp:', whatsappError);
        }

        // Push
        await base44.functions.invoke('sendPushNotification', {
          user_id: profUser.id,
          title: '🎉 Você foi escolhido!',
          body: 'Confirme em 1 hora ou perderá a vaga',
          data: { substituicao_id: substituicao.id, type: 'substituicao_escolhido' }
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Candidato escolhido com sucesso',
      timer_expira_em: expiraEm.toISOString()
    });

  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
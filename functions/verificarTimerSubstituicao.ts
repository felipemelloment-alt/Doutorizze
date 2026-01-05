import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Função para rodar via scheduled task
    // Verifica timers expirados e passa para o próximo da fila

    const agora = new Date();

    // Buscar substituições com timer ativo
    const substituicoes = await base44.asServiceRole.entities.SubstituicaoUrgente.filter({
      status: 'EM_SELECAO'
    });

    let processados = 0;

    for (const substituicao of substituicoes) {
      if (!substituicao.timer_confirmacao_expira_em) continue;

      const expiraEm = new Date(substituicao.timer_confirmacao_expira_em);
      
      // Se timer expirou
      if (expiraEm < agora) {
        // Buscar candidatura atual
        const candidaturasEscolhidas = await base44.asServiceRole.entities.CandidaturaSubstituicao.filter({
          substituicao_id: substituicao.id,
          status: 'ESCOLHIDO'
        });

        if (candidaturasEscolhidas.length > 0) {
          const candidaturaAtual = candidaturasEscolhidas[0];

          // Marcar como perdeu vaga
          await base44.asServiceRole.entities.CandidaturaSubstituicao.update(candidaturaAtual.id, {
            status: 'PERDEU_VAGA',
            perdeu_vaga_motivo: 'Não confirmou em 1 hora'
          });

          // Notificar profissional que perdeu
          const professionals = await base44.asServiceRole.entities.Professional.filter({ 
            id: candidaturaAtual.professional_id 
          });
          
          if (professionals.length > 0) {
            const professional = professionals[0];
            const usuarios = await base44.asServiceRole.entities.User.filter({ id: professional.user_id });
            
            if (usuarios.length > 0) {
              const profUser = usuarios[0];
              
              const mensagem = `😞 *Você perdeu a vaga de substituição*\n\n` +
                `Clínica: ${substituicao.nome_clinica}\n` +
                `Motivo: Não confirmou em 1 hora\n\n` +
                `A vaga foi oferecida ao próximo candidato da fila.`;

              try {
                await base44.functions.invoke('sendWhatsAppMessage', {
                  phone: profUser.whatsapp || profUser.phone,
                  message: mensagem
                });

                await base44.functions.invoke('sendPushNotification', {
                  user_id: profUser.id,
                  title: 'Vaga perdida',
                  body: 'Você não confirmou a tempo',
                  data: { substituicao_id: substituicao.id, type: 'substituicao_perdeu' }
                });
              } catch (notifError) {
                console.error('Erro notificação:', notifError);
              }
            }
          }

          // Buscar próximo da fila
          const proximasCandidaturas = await base44.asServiceRole.entities.CandidaturaSubstituicao.filter({
            substituicao_id: substituicao.id,
            status: 'AGUARDANDO'
          });

          const ordenadas = proximasCandidaturas.sort((a, b) => a.posicao_fila - b.posicao_fila);

          if (ordenadas.length > 0) {
            // Escolher próximo
            const proxima = ordenadas[0];
            const novoExpiraEm = new Date(agora.getTime() + 60 * 60 * 1000);

            await base44.asServiceRole.entities.CandidaturaSubstituicao.update(proxima.id, {
              status: 'ESCOLHIDO',
              escolhido_em: agora.toISOString(),
              timer_confirmacao_inicio: agora.toISOString(),
              timer_confirmacao_fim: novoExpiraEm.toISOString()
            });

            await base44.asServiceRole.entities.SubstituicaoUrgente.update(substituicao.id, {
              profissional_escolhido_id: proxima.professional_id,
              escolhido_em: agora.toISOString(),
              timer_confirmacao_expira_em: novoExpiraEm.toISOString()
            });

            // Notificar próximo escolhido
            const nextProfessionals = await base44.asServiceRole.entities.Professional.filter({ 
              id: proxima.professional_id 
            });
            
            if (nextProfessionals.length > 0) {
              const nextProfessional = nextProfessionals[0];
              const nextUsuarios = await base44.asServiceRole.entities.User.filter({ id: nextProfessional.user_id });
              
              if (nextUsuarios.length > 0) {
                const nextUser = nextUsuarios[0];
                
                const mensagem = `🎉 *Você foi escolhido para uma substituição!*\n\n` +
                  `Clínica: *${substituicao.nome_clinica}*\n` +
                  `Local: ${substituicao.cidade}/${substituicao.uf}\n\n` +
                  `⏰ *ATENÇÃO: Você tem 1 HORA para confirmar!*\n\n` +
                  `O candidato anterior perdeu a vaga por não confirmar a tempo.\n` +
                  `Confirme sua presença no app AGORA!`;

                try {
                  await base44.functions.invoke('sendWhatsAppMessage', {
                    phone: nextUser.whatsapp || nextUser.phone,
                    message: mensagem
                  });

                  await base44.functions.invoke('sendPushNotification', {
                    user_id: nextUser.id,
                    title: '🎉 Você foi escolhido!',
                    body: 'Confirme em 1 hora ou perderá a vaga',
                    data: { substituicao_id: substituicao.id, type: 'substituicao_escolhido' }
                  });
                } catch (notifError) {
                  console.error('Erro notificação próximo:', notifError);
                }
              }
            }

            processados++;
          } else {
            // Sem mais candidatos - marcar vaga como aberta novamente
            await base44.asServiceRole.entities.SubstituicaoUrgente.update(substituicao.id, {
              status: 'ABERTA',
              profissional_escolhido_id: null,
              timer_confirmacao_expira_em: null
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: 'Timers verificados',
      processados: processados
    });

  } catch (error) {
    console.error('Erro ao verificar timers:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
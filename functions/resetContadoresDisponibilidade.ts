import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Scheduled task - roda à meia-noite
    // Reseta contadores de ativação/desativação diários

    const professionals = await base44.asServiceRole.entities.Professional.filter({});

    let resetados = 0;

    for (const prof of professionals) {
      if ((prof.ativacoes_hoje || 0) > 0 || (prof.desativacoes_hoje || 0) > 0) {
        await base44.asServiceRole.entities.Professional.update(prof.id, {
          ativacoes_hoje: 0,
          desativacoes_hoje: 0
        });
        resetados++;
      }

      // Verificar se bloqueio expirou
      if (prof.data_desbloqueio) {
        const desbloqueio = new Date(prof.data_desbloqueio);
        const agora = new Date();

        if (agora >= desbloqueio) {
          await base44.asServiceRole.entities.Professional.update(prof.id, {
            data_desbloqueio: null
          });
        }
      }
    }

    return Response.json({
      success: true,
      message: 'Contadores resetados',
      resetados: resetados,
      total: professionals.length
    });

  } catch (error) {
    console.error('Erro ao resetar contadores:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
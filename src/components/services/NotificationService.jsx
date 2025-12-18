import { base44 } from "@/api/base44Client";

/**
 * Serviço de Notificações
 * Gerencia o disparo automático de notificações para eventos do sistema
 */

// Helper para criar notificação base
async function criarNotificacao({
  destinatarioId,
  destinatarioTipo,
  tipo,
  titulo,
  mensagem,
  linkDestino,
  dadosContexto = {},
  canais = ["PUSH"]
}) {
  try {
    await base44.entities.Notification.create({
      destinatario_id: destinatarioId,
      destinatario_tipo: destinatarioTipo,
      tipo,
      titulo,
      mensagem,
      lida: false,
      dados_contexto: dadosContexto,
      acao_destino: linkDestino ? {
        tipo: "TELA",
        destino: linkDestino
      } : undefined,
      canais_enviados: canais,
      data_envio: new Date().toISOString(),
      enviada_com_sucesso: true
    });
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
  }
}

/**
 * 1. MATCH PERFEITO (score 4/4)
 * Quando: Nova vaga criada que dá match perfeito com profissional
 */
export async function notificarMatchPerfeito({
  professionalId,
  profissionalTipo,
  jobId,
  tituloVaga,
  cidadeVaga
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "SUPER_JOBS",
    titulo: "⚡ Super Match Encontrado!",
    mensagem: `Uma vaga perfeita para você: ${tituloVaga} em ${cidadeVaga}`,
    linkDestino: `/DetalheVaga/${jobId}`,
    dadosContexto: {
      match_id: jobId
    },
    canais: ["PUSH", "WHATSAPP"]
  });
}

/**
 * 2. NOVA CANDIDATURA
 * Quando: Profissional se candidata à vaga
 */
export async function notificarNovaCandidatura({
  clinicaId,
  professionalId,
  nomeProfissional,
  tituloVaga,
  jobId
}) {
  await criarNotificacao({
    destinatarioId: clinicaId,
    destinatarioTipo: "CLINICA",
    tipo: "MATCH_CONTATADO",
    titulo: "🎯 Nova Candidatura Recebida!",
    mensagem: `${nomeProfissional} se candidatou para ${tituloVaga}`,
    linkDestino: `/VerProfissional/${professionalId}`,
    dadosContexto: {
      profissional_id: professionalId,
      match_id: jobId
    }
  });
}

/**
 * 3. CANDIDATURA ACEITA
 * Quando: Clínica aceita candidatura
 */
export async function notificarCandidaturaAceita({
  professionalId,
  profissionalTipo,
  nomeClinica,
  tituloVaga,
  jobId
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "MATCH_CONTATADO",
    titulo: "🎉 Parabéns! Candidatura Aceita",
    mensagem: `${nomeClinica} quer entrar em contato sobre ${tituloVaga}`,
    linkDestino: "/MinhasCandidaturas",
    dadosContexto: {
      match_id: jobId,
      clinica_id: nomeClinica
    },
    canais: ["PUSH", "EMAIL"]
  });
}

/**
 * 4. CANDIDATURA REJEITADA
 * Quando: Clínica rejeita candidatura
 */
export async function notificarCandidaturaRejeitada({
  professionalId,
  profissionalTipo,
  tituloVaga
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "VAGA_PREENCHIDA",
    titulo: "Candidatura Não Selecionada",
    mensagem: `Infelizmente não foi dessa vez para ${tituloVaga}. Continue buscando!`,
    linkDestino: "/NewJobs"
  });
}

/**
 * 5. CONTRATO CRIADO
 * Quando: Contratação é finalizada
 */
export async function notificarContratoCriado({
  professionalId,
  profissionalTipo,
  clinicaId,
  tokenDentista,
  tokenClinica,
  contractId
}) {
  // Notificar profissional
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "LEMBRETE_AVALIACAO",
    titulo: "✅ Contrato Criado!",
    mensagem: `Avalie após o trabalho usando o token: ${tokenDentista}`,
    linkDestino: `/AvaliarClinica?token=${tokenDentista}`,
    dadosContexto: {
      contract_id: contractId
    },
    canais: ["PUSH", "EMAIL", "WHATSAPP"]
  });

  // Notificar clínica
  await criarNotificacao({
    destinatarioId: clinicaId,
    destinatarioTipo: "CLINICA",
    tipo: "LEMBRETE_AVALIACAO",
    titulo: "✅ Contrato Criado!",
    mensagem: `Avalie após o trabalho usando o token: ${tokenClinica}`,
    linkDestino: `/AvaliarProfissional?token=${tokenClinica}`,
    dadosContexto: {
      contract_id: contractId
    },
    canais: ["PUSH", "EMAIL"]
  });
}

/**
 * 6. AVALIAÇÃO RECEBIDA
 * Quando: Recebe avaliação
 */
export async function notificarAvaliacaoRecebida({
  destinatarioId,
  destinatarioTipo,
  nota,
  avaliadorNome
}) {
  const isClinica = destinatarioTipo === "CLINICA";
  
  await criarNotificacao({
    destinatarioId,
    destinatarioTipo,
    tipo: "RECEBEU_AVALIACAO",
    titulo: "⭐ Nova Avaliação Recebida!",
    mensagem: `${avaliadorNome} avaliou você com ${nota} estrelas`,
    linkDestino: isClinica ? "/PerfilClinica" : "/MeuPerfil",
    canais: ["PUSH"]
  });
}

/**
 * 7. CADASTRO APROVADO
 * Quando: Admin aprova cadastro
 */
export async function notificarCadastroAprovado({
  userId,
  userTipo,
  nomeUsuario
}) {
  await criarNotificacao({
    destinatarioId: userId,
    destinatarioTipo: userTipo,
    tipo: "STATUS_APROVADO",
    titulo: "🎉 Cadastro Aprovado!",
    mensagem: `Parabéns ${nomeUsuario}! Seu cadastro foi aprovado. Bem-vindo ao NEW JOBS!`,
    linkDestino: userTipo === "CLINICA" ? "/DashboardClinica" : "/MeuPerfil",
    canais: ["PUSH", "EMAIL", "WHATSAPP"]
  });
}

/**
 * 8. PROMOÇÃO EXPIRANDO
 * Quando: Promoção expira em 24h
 */
export async function notificarPromocaoExpirando({
  fornecedorId,
  tituloPromocao,
  promocaoId
}) {
  await criarNotificacao({
    destinatarioId: fornecedorId,
    destinatarioTipo: "FORNECEDOR",
    tipo: "NOTICIA",
    titulo: "⏰ Promoção Expirando!",
    mensagem: `${tituloPromocao} expira em 24 horas. Renove ou edite agora!`,
    linkDestino: `/MinhasPromocoes`,
    dadosContexto: {
      marketplace_item_id: promocaoId
    }
  });
}

/**
 * 9. MATCH SEMELHANTE (score 3/4)
 * Quando: Nova vaga criada com match bom (score 3)
 */
export async function notificarMatchSemelhante({
  professionalId,
  profissionalTipo,
  jobId,
  tituloVaga,
  cidadeVaga
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "JOBS_SEMELHANTE",
    titulo: "💼 Nova Vaga para Você!",
    mensagem: `Vaga compatível com seu perfil: ${tituloVaga} em ${cidadeVaga}`,
    linkDestino: `/DetalheVaga/${jobId}`,
    dadosContexto: {
      match_id: jobId
    },
    canais: ["PUSH"]
  });
}

/**
 * 10. VAGA PREENCHIDA
 * Quando: Vaga que o profissional se candidatou foi preenchida
 */
export async function notificarVagaPreenchida({
  professionalId,
  profissionalTipo,
  tituloVaga
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "VAGA_PREENCHIDA",
    titulo: "Vaga Preenchida",
    mensagem: `A vaga ${tituloVaga} foi preenchida. Continue buscando outras oportunidades!`,
    linkDestino: "/NewJobs"
  });
}

/**
 * 11. NEW JOBS DESATIVADO
 * Quando: Profissional desativa o modo NEW JOBS
 */
export async function notificarNewJobsDesativado({
  professionalId,
  profissionalTipo
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "NEW_JOBS_DESATIVADO",
    titulo: "⚠️ NEW JOBS Desativado",
    mensagem: "Você não receberá notificações de vagas até reativar o NEW JOBS",
    linkDestino: "/MeuPerfil"
  });
}

/**
 * 12. PERFIL INCOMPLETO
 * Quando: Profissional tem perfil incompleto há 7 dias
 */
export async function notificarPerfilIncompleto({
  professionalId,
  profissionalTipo
}) {
  await criarNotificacao({
    destinatarioId: professionalId,
    destinatarioTipo: profissionalTipo,
    tipo: "PERFIL_INCOMPLETO",
    titulo: "📝 Complete Seu Perfil",
    mensagem: "Complete seu perfil para receber mais oportunidades de trabalho!",
    linkDestino: "/EditarPerfil",
    canais: ["PUSH", "EMAIL"]
  });
}

// Exportar todas as funções
export default {
  notificarMatchPerfeito,
  notificarNovaCandidatura,
  notificarCandidaturaAceita,
  notificarCandidaturaRejeitada,
  notificarContratoCriado,
  notificarAvaliacaoRecebida,
  notificarCadastroAprovado,
  notificarPromocaoExpirando,
  notificarMatchSemelhante,
  notificarVagaPreenchida,
  notificarNewJobsDesativado,
  notificarPerfilIncompleto
};
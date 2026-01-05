import React from "react";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Formata mensagem do WhatsApp baseado no contexto
 */
function formatarMensagem(context, contextData) {
  switch (context) {
    case "VAGA":
      return `Olá! Vi a vaga *${contextData.tituloVaga}* no NEW JOBS e tenho interesse.

Meu nome: ${contextData.nomeProfissional}
Especialidade: ${contextData.especialidade}
${contextData.registro}

Podemos conversar?`;

    case "PROFISSIONAL":
      return `Olá ${contextData.nomeProfissional}!

Somos da *${contextData.nomeClinica}* e vimos seu perfil no NEW JOBS.

Temos uma oportunidade de ${contextData.tipoVaga} que pode te interessar.

Podemos conversar?`;

    case "CLINICA":
      return `Olá! Encontrei a *${contextData.nomeClinica}* no NEW JOBS.

Sou ${contextData.nomeProfissional}, ${contextData.especialidade}.

Gostaria de saber sobre oportunidades disponíveis.`;

    case "PROMOCAO":
      return `Olá! Vi a promoção *${contextData.titulo}* no NEW JOBS.

Produto: ${contextData.titulo}
Preço: R$ ${contextData.precoPromocional?.toFixed(2)}

Gostaria de mais informações!`;

    case "SUPORTE":
      return `Olá! Preciso de ajuda com o app NEW JOBS.

Meu email: ${contextData.userEmail}

Problema: `;

    default:
      return contextData.message || "Olá! Encontrei você no NEW JOBS.";
  }
}

/**
 * Registra clique no WhatsApp
 */
async function registrarClique(context, contextId) {
  try {
    if (context === "VAGA" && contextId) {
      // Incrementar total de cliques na vaga
      const jobs = await base44.entities.Job.filter({ id: contextId });
      if (jobs[0]) {
        await base44.entities.Job.update(contextId, {
          total_visualizacoes: (jobs[0].total_visualizacoes || 0) + 1
        });
      }
    } else if (context === "PROMOCAO" && contextId) {
      // Incrementar cliques na promoção
      const promocoes = await base44.entities.Promotion.filter({ id: contextId });
      if (promocoes[0]) {
        await base44.entities.Promotion.update(contextId, {
          cliques: (promocoes[0].cliques || 0) + 1
        });
      }
    }
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
  }
}

/**
 * Componente WhatsAppButton
 * 
 * @param {string} phone - Número do WhatsApp (11 dígitos, sem +55)
 * @param {string} message - Mensagem customizada (opcional)
 * @param {string} context - Contexto da mensagem (VAGA|PROFISSIONAL|CLINICA|PROMOCAO|SUPORTE)
 * @param {object} contextData - Dados para formatar a mensagem
 * @param {string} className - Classes CSS adicionais
 * @param {string} contextId - ID da entidade para registrar clique (opcional)
 */
export default function WhatsAppButton({
  phone,
  message,
  context,
  contextData = {},
  className = "",
  contextId = null
}) {
  const handleClick = async () => {
    if (contextId) {
      await registrarClique(context, contextId);
    }
  };

  const mensagemFormatada = message || formatarMensagem(context, contextData);
  const phoneFormatado = phone.replace(/\D/g, ""); // Remove qualquer caractere não numérico
  const url = `https://wa.me/55${phoneFormatado}?text=${encodeURIComponent(mensagemFormatada)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 hover:shadow-xl transition-all shadow-lg ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      WhatsApp
    </a>
  );
}
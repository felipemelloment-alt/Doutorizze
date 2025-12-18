import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  PartyPopper,
  Star,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  Info,
  Award
} from "lucide-react";

export default function Contratar() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const queryClient = useQueryClient();
  const [confirmoContato, setConfirmoContato] = useState(false);
  const [confirmoTermos, setConfirmoTermos] = useState(false);
  const [sucessoTela, setSucessoTela] = useState(false);

  // Buscar match
  const { data: match, isLoading: loadingMatch } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const result = await base44.entities.JobMatch.filter({ id: matchId });
      return result[0] || null;
    },
    enabled: !!matchId
  });

  // Buscar professional
  const { data: professional } = useQuery({
    queryKey: ["professional", match?.professional_id],
    queryFn: async () => {
      if (!match?.professional_id) return null;
      const result = await base44.entities.Professional.filter({ id: match.professional_id });
      return result[0] || null;
    },
    enabled: !!match?.professional_id
  });

  // Buscar ratings do professional
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", professional?.id],
    queryFn: async () => {
      if (!professional?.id) return [];
      return await base44.entities.Rating.filter({ 
        avaliado_id: professional.id,
        avaliado_tipo: professional.tipo_profissional
      });
    },
    enabled: !!professional?.id
  });

  // Buscar job
  const { data: job } = useQuery({
    queryKey: ["job", match?.job_id],
    queryFn: async () => {
      if (!match?.job_id) return null;
      const result = await base44.entities.Job.filter({ id: match.job_id });
      return result[0] || null;
    },
    enabled: !!match?.job_id
  });

  // Buscar unit
  const { data: unit } = useQuery({
    queryKey: ["unit", job?.unit_id],
    queryFn: async () => {
      if (!job?.unit_id) return null;
      const result = await base44.entities.CompanyUnit.filter({ id: job.unit_id });
      return result[0] || null;
    },
    enabled: !!job?.unit_id
  });

  // Mutation para confirmar contratação
  const contratarMutation = useMutation({
    mutationFn: async () => {
      if (!match || !job || !professional || !unit) {
        throw new Error("Dados incompletos");
      }

      // Gerar tokens aleatórios
      const tokenDentista = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const tokenClinica = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Data de expiração (7 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 1. Criar JobContract
      await base44.entities.JobContract.create({
        job_id: job.id,
        professional_id: professional.id,
        unit_id: unit.id,
        token_dentista: tokenDentista,
        token_clinica: tokenClinica,
        token_created_at: new Date().toISOString(),
        token_expires_at: expiresAt.toISOString(),
        status: "ATIVO"
      });

      // 2. Atualizar JobMatch
      await base44.entities.JobMatch.update(match.id, {
        status_candidatura: "CONTRATADO"
      });

      // 3. Atualizar Professional
      await base44.entities.Professional.update(professional.id, {
        status_disponibilidade: "OCUPADO"
      });

      // 4. Atualizar Job
      await base44.entities.Job.update(job.id, {
        status: "PREENCHIDO"
      });

      return { tokenDentista, tokenClinica };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match"] });
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      
      // Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success("Contratação realizada com sucesso!");
      setSucessoTela(true);
    },
    onError: (error) => {
      toast.error("Erro ao confirmar contratação: " + error.message);
    }
  });

  const handleConfirmar = () => {
    if (!confirmoContato) {
      toast.error("Confirme que entrou em contato com o profissional");
      return;
    }
    if (!confirmoTermos) {
      toast.error("Confirme os termos da contratação");
      return;
    }

    contratarMutation.mutate();
  };

  if (loadingMatch || !match || !professional || !job || !unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const mediaAvaliacoes = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.nota, 0) / ratings.length)
    : 0;

  const tipoVagaConfig = {
    PLANTAO: "Plantão",
    FIXO: "Fixo",
    SUBSTITUICAO: "Substituição",
    TEMPORARIO: "Temporário"
  };

  // TELA DE SUCESSO
  if (sucessoTela) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 mb-3">Contratação Realizada!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Token enviado para o profissional via WhatsApp.
            <br />
            Vocês têm 7 dias para avaliarem um ao outro.
          </p>
          
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
                {professional.nome_completo?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-900">{professional.nome_completo}</p>
                <p className="text-sm text-gray-600">{professional.especialidade_principal}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Vaga:</strong> {job.titulo}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {job.cidade} - {job.uf}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(createPageUrl("MinhasVagas"))}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Ver Minhas Vagas
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-32">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-8 pb-16 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <PartyPopper className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Finalizar Contratação</h1>
              <p className="text-white/80 mt-1">Confirme os detalhes da contratação</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 space-y-6 relative z-10">
        {/* CARD RESUMO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          {/* PROFISSIONAL */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Profissional</h3>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                {professional.nome_completo?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-1">{professional.nome_completo}</h4>
                <p className="text-gray-600 mb-2">{professional.especialidade_principal}</p>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(mediaAvaliacoes) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {mediaAvaliacoes > 0 ? mediaAvaliacoes.toFixed(1) : "Sem avaliações"}
                    {ratings.length > 0 && ` (${ratings.length})`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LINHA DIVISÓRIA */}
          <div className="border-t-2 border-gray-200 my-6"></div>

          {/* VAGA */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Vaga</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{job.titulo}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Tipo</p>
                    <p className="font-semibold text-gray-900">{tipoVagaConfig[job.tipo_vaga]}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Local</p>
                    <p className="font-semibold text-gray-900">{job.cidade} - {job.uf}</p>
                  </div>
                </div>

                {job.dias_semana && job.dias_semana.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Dias</p>
                      <p className="font-semibold text-gray-900">{job.dias_semana.join(", ")}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                  <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Horário</p>
                    <p className="font-semibold text-gray-900">{job.horario_inicio} - {job.horario_fim}</p>
                  </div>
                </div>

                {job.valor_proposto && job.tipo_remuneracao !== "A_COMBINAR" && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl md:col-span-2">
                    <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Valor Proposto</p>
                      <p className="font-semibold text-green-700 text-lg">
                        R$ {job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARD CONFIRMAÇÃO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4">Confirmação</h3>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-400 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={confirmoContato}
                onChange={(e) => setConfirmoContato(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-yellow-400 cursor-pointer"
              />
              <span className="text-gray-700">
                Confirmo que entrei em contato com o profissional e acertamos os detalhes do trabalho
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-400 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={confirmoTermos}
                onChange={(e) => setConfirmoTermos(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-yellow-400 cursor-pointer"
              />
              <span className="text-gray-700">
                Confirmo os termos da contratação e concordo em avaliar o profissional após o trabalho
              </span>
            </label>
          </div>
        </motion.div>

        {/* CARD INFORMATIVO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Sistema de Avaliação</p>
              <p className="text-sm text-gray-700">
                Após confirmar, você e o profissional receberão tokens únicos para avaliação mútua. 
                Os tokens expiram em <strong>7 dias</strong>. Use-os para deixar sua avaliação sobre a experiência!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={contratarMutation.isPending}
            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={contratarMutation.isPending || !confirmoContato || !confirmoTermos}
            className="flex-2 md:flex-[2] py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {contratarMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                CONFIRMAR CONTRATAÇÃO
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
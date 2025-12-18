import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  PartyPopper,
  Star,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  CheckCircle2,
  Info,
  ChevronLeft,
  Award
} from "lucide-react";

export default function Contratar() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const queryClient = useQueryClient();
  const [confirmouContato, setConfirmouContato] = useState(false);
  const [confirmouTermos, setConfirmouTermos] = useState(false);
  const [sucesso, setSucesso] = useState(false);

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

  // Buscar profissional
  const { data: professional } = useQuery({
    queryKey: ["professional", match?.professional_id],
    queryFn: async () => {
      if (!match?.professional_id) return null;
      const result = await base44.entities.Professional.filter({ id: match.professional_id });
      return result[0] || null;
    },
    enabled: !!match?.professional_id
  });

  // Buscar vaga
  const { data: job } = useQuery({
    queryKey: ["job", match?.job_id],
    queryFn: async () => {
      if (!match?.job_id) return null;
      const result = await base44.entities.Job.filter({ id: match.job_id });
      return result[0] || null;
    },
    enabled: !!match?.job_id
  });

  // Buscar unidade
  const { data: unit } = useQuery({
    queryKey: ["unit", job?.unit_id],
    queryFn: async () => {
      if (!job?.unit_id) return null;
      const result = await base44.entities.CompanyUnit.filter({ id: job.unit_id });
      return result[0] || null;
    },
    enabled: !!job?.unit_id
  });

  // Mutation para contratar
  const contratarMutation = useMutation({
    mutationFn: async () => {
      if (!match || !job || !professional || !unit) {
        throw new Error("Dados incompletos");
      }

      // Gerar tokens aleatórios
      const tokenDentista = `DT-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const tokenClinica = `CL-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      
      // Calcular data de expiração (7 dias)
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 7);

      // 1. Criar JobContract
      const contract = await base44.entities.JobContract.create({
        job_id: job.id,
        professional_id: professional.id,
        unit_id: unit.id,
        token_dentista: tokenDentista,
        token_clinica: tokenClinica,
        token_created_at: new Date().toISOString(),
        token_expires_at: dataExpiracao.toISOString(),
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

      return contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match"] });
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      queryClient.invalidateQueries({ queryKey: ["jobMatches"] });
      
      // Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSucesso(true);
      toast.success("Contratação realizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao realizar contratação: " + error.message);
    }
  });

  const handleConfirmar = () => {
    if (!confirmouContato) {
      toast.error("Confirme que entrou em contato com o profissional");
      return;
    }
    if (!confirmouTermos) {
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
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  // Tela de sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden flex items-center justify-center p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl"
          >
            <CheckCircle2 className="w-14 h-14 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-gray-900 mb-3"
          >
            Contratação Realizada! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg mb-2"
          >
            Token de avaliação enviado para o profissional
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mb-8"
          >
            Você e {professional.nome_completo} receberão tokens para avaliação mútua após o término do contrato
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={() => navigate(createPageUrl("DashboardClinica"))}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-yellow-400 hover:text-yellow-600 transition-all"
            >
              Voltar ao Dashboard
            </button>
            <button
              onClick={() => navigate(createPageUrl("MinhasVagas"))}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Ver Minhas Vagas
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const tipoVagaConfig = {
    PLANTAO: { label: "Plantão", color: "bg-blue-100 text-blue-700" },
    FIXO: { label: "Fixo", color: "bg-green-100 text-green-700" },
    SUBSTITUICAO: { label: "Substituição", color: "bg-yellow-100 text-yellow-700" },
    TEMPORARIO: { label: "Temporário", color: "bg-purple-100 text-purple-700" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-8 pb-8 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Finalizar Contratação</h1>
              <p className="text-white/80">Confirme os dados antes de contratar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10 space-y-6">
        {/* CARD RESUMO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-6">Resumo da Contratação</h2>

          {/* PROFISSIONAL */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Profissional</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                {professional.nome_completo?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{professional.nome_completo}</h3>
                <p className="text-gray-600">{professional.especialidade_principal}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(professional.media_avaliacoes || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    {professional.media_avaliacoes?.toFixed(1) || "0.0"} ({professional.total_avaliacoes || 0})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LINHA DIVISÓRIA */}
          <div className="border-t-2 border-gray-100 my-6"></div>

          {/* VAGA */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">Vaga</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 text-lg">{job.titulo}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-3 py-1.5 ${tipoVagaConfig[job.tipo_vaga]?.color} font-semibold rounded-full text-xs`}>
                      {tipoVagaConfig[job.tipo_vaga]?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>{job.cidade} - {job.uf}</span>
              </div>

              {job.dias_semana && job.dias_semana.length > 0 && (
                <div className="flex items-start gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {job.dias_semana.map((dia) => (
                      <span key={dia} className="text-sm font-medium">{dia}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.horario_inicio && job.horario_fim && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span>{job.horario_inicio} - {job.horario_fim}</span>
                </div>
              )}

              {job.valor_proposto && job.tipo_remuneracao !== "A_COMBINAR" && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-bold text-green-700 text-lg">
                    R$ {job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
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
          <h2 className="text-xl font-black text-gray-900 mb-6">Confirmação</h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-yellow-50 hover:border-yellow-300">
              <input
                type="checkbox"
                checked={confirmouContato}
                onChange={(e) => setConfirmouContato(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              <span className={`flex-1 ${confirmouContato ? "text-gray-900 font-semibold" : "text-gray-700"}`}>
                Confirmo que entrei em contato com o profissional e acertamos os detalhes da contratação
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-yellow-50 hover:border-yellow-300">
              <input
                type="checkbox"
                checked={confirmouTermos}
                onChange={(e) => setConfirmouTermos(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              <span className={`flex-1 ${confirmouTermos ? "text-gray-900 font-semibold" : "text-gray-700"}`}>
                Confirmo os termos da contratação e estou ciente das responsabilidades
              </span>
            </label>
          </div>
        </motion.div>

        {/* CARD INFORMATIVO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Sistema de Avaliação</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Após confirmar a contratação, você e o profissional receberão tokens únicos para avaliação mútua. 
                O token expira em <span className="font-semibold">7 dias</span> após a criação. 
                Use o token para avaliar o profissional após o término do contrato.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-yellow-400 hover:text-yellow-600 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={contratarMutation.isPending || !confirmouContato || !confirmouTermos}
            className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {contratarMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              <>
                <Award className="w-6 h-6" />
                CONFIRMAR CONTRATAÇÃO
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
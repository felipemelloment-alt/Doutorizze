import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  Loader2
} from "lucide-react";
import TimerConfirmacao from "@/components/substituicoes/TimerConfirmacao";

export default function ConfirmarSubstituicaoTimer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const candidaturaId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [timerExpirou, setTimerExpirou] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro:", error);
      }
    };
    loadUser();
  }, []);

  const { data: candidatura, isLoading } = useQuery({
    queryKey: ['candidatura-timer', candidaturaId],
    queryFn: async () => {
      const candidaturas = await base44.entities.CandidaturaSubstituicao.filter({ id: candidaturaId });
      return candidaturas[0] || null;
    },
    enabled: !!candidaturaId,
    refetchInterval: 5000
  });

  const { data: substituicao } = useQuery({
    queryKey: ['substituicao-timer', candidatura?.substituicao_id],
    queryFn: async () => {
      const substituicoes = await base44.entities.SubstituicaoUrgente.filter({ id: candidatura.substituicao_id });
      return substituicoes[0] || null;
    },
    enabled: !!candidatura?.substituicao_id
  });

  const confirmarMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CandidaturaSubstituicao.update(candidatura.id, {
        status: 'ESCOLHIDO',
        confirmou_em: new Date().toISOString()
      });

      await base44.entities.SubstituicaoUrgente.update(substituicao.id, {
        status: 'CONFIRMADA'
      });
    },
    onSuccess: () => {
      toast.success("✅ Substituição confirmada com sucesso!");
      queryClient.invalidateQueries(['candidatura-timer']);
      queryClient.invalidateQueries(['substituicao-timer']);
      navigate("/MinhasCandidaturasSubstituicao");
    },
    onError: (error) => {
      toast.error("Erro ao confirmar: " + error.message);
    }
  });

  const recusarMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CandidaturaSubstituicao.update(candidatura.id, {
        status: 'REJEITADO',
        perdeu_vaga_motivo: 'Recusou a vaga'
      });

      await base44.entities.SubstituicaoUrgente.update(substituicao.id, {
        status: 'ABERTA',
        profissional_escolhido_id: null,
        timer_confirmacao_expira_em: null
      });
    },
    onSuccess: () => {
      toast.info("Vaga recusada");
      navigate("/MinhasCandidaturasSubstituicao");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!candidatura || !substituicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900">Candidatura não encontrada</p>
        </div>
      </div>
    );
  }

  if (candidatura.status !== 'ESCOLHIDO' || timerExpirou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900 mb-2">Tempo Esgotado</p>
          <p className="text-gray-600 mb-6">A vaga foi oferecida ao próximo candidato</p>
          <button
            onClick={() => navigate("/MinhasCandidaturasSubstituicao")}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl"
          >
            Ver Minhas Candidaturas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 py-8 mb-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl mx-auto mb-4">
            🎉
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Você Foi Escolhido!
          </h1>
          <p className="text-white/90 text-lg">Confirme sua presença agora</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Timer */}
        <TimerConfirmacao
          expiraEm={candidatura.timer_confirmacao_fim}
          onExpired={() => setTimerExpirou(true)}
        />

        {/* Detalhes da Vaga */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-black text-gray-900 mb-6">Detalhes da Substituição</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-gray-600">Clínica</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{substituicao.nome_clinica}</p>
              <p className="text-gray-600">{substituicao.endereco_completo}</p>
              <p className="text-gray-600">{substituicao.cidade}/{substituicao.uf}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <p className="text-sm font-semibold text-gray-600">Quando</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {substituicao.tipo_data === 'IMEDIATO' && '🚨 HOJE/IMEDIATO'}
                {substituicao.tipo_data === 'DATA_ESPECIFICA' && substituicao.data_especifica}
                {substituicao.tipo_data === 'PERIODO' && `${substituicao.periodo_inicio} a ${substituicao.periodo_fim}`}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-gray-600">Remuneração</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {substituicao.tipo_remuneracao === 'DIARIA' 
                  ? `R$ ${substituicao.valor_diaria}` 
                  : 'Porcentagem por procedimento'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-semibold text-gray-600">Contato</p>
              </div>
              <p className="font-bold text-gray-900">{substituicao.responsavel_nome}</p>
              <p className="text-gray-600">{substituicao.responsavel_cargo}</p>
            </div>
          </div>
        </motion.div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => recusarMutation.mutate()}
            disabled={recusarMutation.isPending || timerExpirou}
            className="py-5 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle className="w-6 h-6" />
            Recusar
          </button>

          <button
            onClick={() => confirmarMutation.mutate()}
            disabled={confirmarMutation.isPending || timerExpirou}
            className="py-5 bg-gradient-to-r from-green-400 to-green-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {confirmarMutation.isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                CONFIRMAR
              </>
            )}
          </button>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-1">⚠️ Atenção:</p>
              <p>Se você não confirmar em 1 hora, a vaga será automaticamente oferecida ao próximo candidato da fila.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
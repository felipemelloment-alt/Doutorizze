import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Star,
  Briefcase,
  CheckCircle,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { listarCandidatos, escolherCandidato } from "@/components/api/substituicao";
import { formatarTextoData, STATUS_SUBSTITUICAO } from "@/components/constants/substituicao";

export default function GerenciarCandidatos() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const substituicaoId = urlParams.get("id");
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: substituicao, isLoading: loadingVaga } = useQuery({
    queryKey: ["substituicao", substituicaoId],
    queryFn: async () => {
      return await base44.entities.SubstituicaoUrgente.get(substituicaoId);
    },
    enabled: !!substituicaoId
  });

  const { data: candidatos = [], isLoading: loadingCandidatos } = useQuery({
    queryKey: ["candidatos", substituicaoId],
    queryFn: async () => {
      return await listarCandidatos(substituicaoId);
    },
    enabled: !!substituicaoId
  });

  const escolherMutation = useMutation({
    mutationFn: async () => {
      return await escolherCandidato(substituicaoId, candidatoSelecionado.id, user.id);
    },
    onSuccess: () => {
      toast.success("Candidato escolhido! Aguardando confirmação da clínica.");
      queryClient.invalidateQueries(["substituicao", substituicaoId]);
      queryClient.invalidateQueries(["candidatos", substituicaoId]);
      setShowConfirmModal(false);
      setCandidatoSelecionado(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao escolher candidato");
    }
  });

  const handleEscolher = (candidato) => {
    setCandidatoSelecionado(candidato);
    setShowConfirmModal(true);
  };

  if (loadingVaga || loadingCandidatos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!substituicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50">😕</div>
          <h3 className="text-2xl font-bold text-gray-400 mb-4">Vaga não encontrada</h3>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_SUBSTITUICAO[substituicao.status] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 py-6 mb-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white font-bold mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              👥
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                {substituicao.especialidade_necessaria}
              </h1>
              <p className="text-white/90">{substituicao.nome_clinica}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Info da Vaga */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-black text-gray-900 mb-4">Informações da Vaga</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    statusConfig.color === "green" ? "bg-green-100 text-green-700" :
                    statusConfig.color === "blue" ? "bg-blue-100 text-blue-700" :
                    statusConfig.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                    statusConfig.color === "red" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Data e Horário</p>
                  <p className="font-bold text-gray-900">{formatarTextoData(substituicao)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Local</p>
                  <p className="text-gray-700">{substituicao.cidade}/{substituicao.uf}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Candidatos</p>
                  <p className="text-2xl font-black text-gray-900">{candidatos.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main - Lista de Candidatos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Candidatos</h3>
              <p className="text-gray-600 mb-6">
                Escolha o profissional ideal para esta substituição
              </p>

              {candidatos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">👤</div>
                  <p className="text-gray-400 font-bold">
                    Nenhum candidato ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidatos.map(candidato => (
                    <CandidatoCard
                      key={candidato.id}
                      candidato={candidato}
                      onEscolher={() => handleEscolher(candidato)}
                      disabled={substituicao.status !== "EM_SELECAO" && substituicao.status !== "ABERTA"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-4xl mx-auto mb-4">
                  ✅
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Confirmar Escolha
                </h3>
                <p className="text-gray-600">
                  Você está escolhendo <span className="font-bold">{candidatoSelecionado?.professional.nome_completo}</span> para esta substituição.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ Após confirmar, será enviada uma mensagem no WhatsApp do responsável da clínica para autorizar a substituição.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => escolherMutation.mutate()}
                  disabled={escolherMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {escolherMutation.isPending ? "Confirmando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CandidatoCard({ candidato, onEscolher, disabled }) {
  const prof = candidato.professional;

  return (
    <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-yellow-400 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
          {prof.nome_completo?.charAt(0)}
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-black text-gray-900 mb-1">
            {prof.nome_completo}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {prof.especialidade_principal} • {prof.tempo_formado_anos} anos de formado
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900">{prof.media_avaliacoes || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-bold text-gray-900">{prof.taxa_comparecimento || 100}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-gray-900">{prof.substituicoes_completadas || 0}</span>
            </div>
          </div>

          {candidato.mensagem_profissional && (
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-700 italic">
                "{candidato.mensagem_profissional}"
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onEscolher}
              disabled={disabled}
              className="flex-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Escolher Profissional
            </button>
            <a
              href={`https://wa.me/55${prof.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
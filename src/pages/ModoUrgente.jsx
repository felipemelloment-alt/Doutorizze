import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Zap,
  Bell,
  MapPin,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Volume2
} from "lucide-react";

export default function ModoUrgente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [modoAtivo, setModoAtivo] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Buscar profissional
  const { data: professional } = useQuery({
    queryKey: ["professional-urgente", user?.id],
    queryFn: async () => {
      const results = await base44.entities.Professional.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user?.id
  });

  // Buscar substituições urgentes na cidade do profissional
  const { data: substituicoesUrgentes = [], isLoading, refetch } = useQuery({
    queryKey: ["substituicoes-urgentes", professional?.cidades_atendimento],
    queryFn: async () => {
      const todas = await base44.entities.SubstituicaoUrgente.filter({ status: "ABERTA" });
      
      // Filtrar por cidade do profissional
      const cidadesProfissional = professional?.cidades_atendimento?.map(c => 
        c.toLowerCase().split(" - ")[0]
      ) || [];
      
      return todas.filter(s => {
        const cidadeSubst = s.cidade?.toLowerCase();
        return cidadesProfissional.some(c => cidadeSubst?.includes(c));
      });
    },
    enabled: !!professional && modoAtivo,
    refetchInterval: modoAtivo ? 30000 : false // Atualiza a cada 30s se modo ativo
  });

  // Candidatar-se
  const candidatarMutation = useMutation({
    mutationFn: async (substituicaoId) => {
      await base44.entities.CandidaturaSubstituicao.create({
        substituicao_id: substituicaoId,
        professional_id: professional.id,
        status: "PENDENTE"
      });
    },
    onSuccess: () => {
      toast.success("Candidatura enviada!");
      queryClient.invalidateQueries(["substituicoes-urgentes"]);
    },
    onError: () => toast.error("Erro ao se candidatar")
  });

  const toggleModo = () => {
    setModoAtivo(!modoAtivo);
    if (!modoAtivo) {
      toast.success("Modo urgente ativado! Buscando substituições...");
      refetch();
    } else {
      toast.info("Modo urgente desativado");
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${modoAtivo ? "bg-red-50" : "bg-gradient-to-br from-yellow-50 via-white to-pink-50"}`}>
      {/* Header */}
      <div className={`px-4 py-6 transition-colors ${modoAtivo ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-orange-500 to-yellow-500"}`}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <motion.div
              animate={modoAtivo ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${modoAtivo ? "bg-white/30" : "bg-white/20"}`}
            >
              <Zap className={`w-8 h-8 text-white ${modoAtivo ? "fill-white" : ""}`} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black text-white">Modo Urgente</h1>
              <p className="text-white/80">
                {modoAtivo ? "Buscando substituições na sua região..." : "Ative para receber alertas em tempo real"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Toggle principal */}
        <div className={`rounded-3xl p-6 shadow-xl transition-colors ${modoAtivo ? "bg-red-100 border-2 border-red-300" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ativar Modo Urgente</h2>
              <p className="text-gray-500 text-sm">
                {modoAtivo ? "Atualizando a cada 30 segundos" : "Receba alertas de substituições próximas"}
              </p>
            </div>
            <button
              onClick={toggleModo}
              className={`relative w-20 h-10 rounded-full transition-all ${
                modoAtivo 
                  ? "bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-300" 
                  : "bg-gray-300"
              }`}
            >
              <motion.div
                animate={{ x: modoAtivo ? 40 : 4 }}
                className="absolute top-1 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center"
              >
                {modoAtivo && <Zap className="w-4 h-4 text-red-500 fill-red-500" />}
              </motion.div>
            </button>
          </div>

          {modoAtivo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-red-200"
            >
              <div className="flex items-center gap-2 text-red-600">
                <Volume2 className="w-5 h-5" />
                <span className="font-medium">Notificações sonoras ativadas</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Lista de substituições urgentes */}
        {modoAtivo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Substituições Disponíveis
              </h2>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                Atualizar
              </button>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Buscando substituições...</p>
              </div>
            ) : substituicoesUrgentes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Nenhuma substituição no momento</h3>
                <p className="text-gray-500 text-sm">Continue com o modo ativo para receber alertas</p>
              </div>
            ) : (
              <AnimatePresence>
                {substituicoesUrgentes.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-lg border-2 border-red-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-red-500" /> URGENTE
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900">{sub.titulo || sub.especialidade_necessaria}</h3>
                        <p className="text-gray-500 text-sm">{sub.nome_clinica}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{sub.cidade} - {sub.uf}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span>{sub.horario_inicio} - {sub.horario_fim}</span>
                      </div>
                      {sub.valor_diaria && (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm col-span-2">
                          <DollarSign className="w-4 h-4" />
                          <span>R$ {sub.valor_diaria.toLocaleString("pt-BR")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(createPageUrl("DetalheSubstituicao") + `?id=${sub.id}`)}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => candidatarMutation.mutate(sub.id)}
                        disabled={candidatarMutation.isPending}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        {candidatarMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Aceitar
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Info quando desativado */}
        {!modoAtivo && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Como funciona?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-red-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ative o modo urgente</p>
                  <p className="text-sm text-gray-500">O sistema começa a buscar substituições na sua região</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-red-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Receba alertas em tempo real</p>
                  <p className="text-sm text-gray-500">Notificações sonoras quando surgir uma vaga</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-red-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Aceite rapidamente</p>
                  <p className="text-sm text-gray-500">Seja o primeiro a aceitar e garantir a substituição</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
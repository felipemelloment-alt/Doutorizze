import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Zap,
  ZapOff,
  Bell,
  BellOff,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { toggleDisponibilidade } from "@/components/api/substituicao";

export default function DisponibilidadeSubstituicao() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const professionals = await base44.entities.Professional.filter({ 
          user_id: currentUser.id 
        });
        if (professionals.length > 0) {
          setProfessional(professionals[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: professionalData } = useQuery({
    queryKey: ["professional", professional?.id],
    queryFn: async () => {
      return await base44.entities.Professional.get(professional.id);
    },
    enabled: !!professional,
    initialData: professional
  });

  const toggleMutation = useMutation({
    mutationFn: async (novoStatus) => {
      return await toggleDisponibilidade(professional.id, novoStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional", professional.id]);
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    }
  });

  const toggleNotificationMutation = useMutation({
    mutationFn: async (novoStatus) => {
      return await base44.entities.Professional.update(professional.id, {
        notificacao_som_ativa: novoStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional", professional.id]);
      toast.success("Notificações atualizadas!");
    }
  });

  if (!professionalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  const isOnline = professionalData.status_disponibilidade_substituicao === "ONLINE";
  const notificacoesAtivas = professionalData.notificacao_som_ativa !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className={`py-8 mb-8 transition-all ${
        isOnline 
          ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
          : "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"
      }`}>
        <div className="container mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
            {isOnline ? "⚡" : "💤"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            DISPONIBILIDADE
          </h1>
          <p className="text-white/90 text-lg">
            {isOnline ? "Você está ONLINE para substituições" : "Você está OFFLINE"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl">
        {/* Toggle Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl mb-6"
        >
          <div className="text-center mb-8">
            <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-6xl mb-6 ${
              isOnline 
                ? "bg-green-100 animate-pulse"
                : "bg-gray-100"
            }`}>
              {isOnline ? <Zap className="w-16 h-16 text-green-600" /> : <ZapOff className="w-16 h-16 text-gray-400" />}
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {isOnline ? "Você está ONLINE" : "Você está OFFLINE"}
            </h2>
            <p className="text-gray-600">
              {isOnline 
                ? "Profissionais online recebem notificações de vagas urgentes em tempo real"
                : "Ative para começar a receber oportunidades de substituição"}
            </p>
          </div>

          <button
            onClick={() => toggleMutation.mutate(!isOnline)}
            disabled={toggleMutation.isPending}
            className={`w-full py-6 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-2xl ${
              isOnline
                ? "bg-gray-500 text-white hover:bg-gray-600"
                : "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-[1.02]"
            }`}
          >
            {toggleMutation.isPending 
              ? "Atualizando..." 
              : isOnline 
                ? "🔴 FICAR OFFLINE" 
                : "🟢 FICAR ONLINE"}
          </button>
        </motion.div>

        {/* Configurações de Notificação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-6"
        >
          <h3 className="text-xl font-black text-gray-900 mb-4">Notificações</h3>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {notificacoesAtivas ? (
                <Bell className="w-6 h-6 text-yellow-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="font-bold text-gray-900">Som de Notificação</p>
                <p className="text-sm text-gray-600">
                  {notificacoesAtivas ? "Ativado" : "Desativado"}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleNotificationMutation.mutate(!notificacoesAtivas)}
              disabled={toggleNotificationMutation.isPending}
              className={`w-14 h-8 rounded-full transition-all relative ${
                notificacoesAtivas ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                notificacoesAtivas ? "right-1" : "left-1"
              }`} />
            </button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-6"
        >
          <h3 className="text-xl font-black text-gray-900 mb-4">Suas Estatísticas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-green-600 mb-1">
                {professionalData.substituicoes_completadas || 0}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-yellow-600 mb-1">
                {professionalData.taxa_comparecimento || 100}%
              </div>
              <div className="text-sm text-gray-600">Comparecimento</div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-blue-600 mb-1">
                {professionalData.media_avaliacoes?.toFixed(1) || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-purple-600 mb-1">
                {professionalData.total_avaliacoes || 0}
              </div>
              <div className="text-sm text-gray-600">Avaliações</div>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-2xl p-6"
        >
          <div className="flex gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Como funciona?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Quando ONLINE, você recebe notificações de vagas urgentes</li>
                <li>• Quanto mais rápido responder, maiores as chances de ser escolhido</li>
                <li>• Mantenha sua taxa de comparecimento alta para mais oportunidades</li>
                <li>• Você pode desativar a qualquer momento</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
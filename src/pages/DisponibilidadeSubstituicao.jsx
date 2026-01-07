import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Zap,
  ZapOff,
  Bell,
  BellOff,
  Info,
  X,
  Mail
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
        // Erro silencioso
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

  const [showJustificativaModal, setShowJustificativaModal] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const toggleMutation = useMutation({
    mutationFn: async ({ novoStatus, justificativa }) => {
      const hoje = new Date().toISOString().split('T')[0];
      const ativacoes = professionalData.ativacoes_hoje || 0;
      const desativacoes = professionalData.desativacoes_hoje || 0;
      const ultimaAtivacao = professionalData.ultima_ativacao || '';
      const ultimaDesativacao = professionalData.ultima_desativacao || '';

      // Verificar se última ação foi hoje
      const ultimaAcaoHoje = ultimaAtivacao.startsWith(hoje) || ultimaDesativacao.startsWith(hoje);

      // Se ativando
      if (novoStatus) {
        if (ultimaAcaoHoje && ativacoes >= 2) {
          throw new Error('Você já ativou 2 vezes hoje. Limite atingido.');
        }
        
        await base44.entities.Professional.update(professional.id, {
          disponivel_substituicao: true,
          status_disponibilidade_substituicao: 'ONLINE',
          ultima_atualizacao_status: new Date().toISOString(),
          ativacoes_hoje: ultimaAcaoHoje ? ativacoes + 1 : 1,
          ultima_ativacao: new Date().toISOString()
        });
      } else {
        // Desativando - exigir justificativa
        if (!justificativa || justificativa.trim().length < 10) {
          throw new Error('Justificativa obrigatória (mínimo 10 caracteres)');
        }

        if (ultimaAcaoHoje && desativacoes >= 2) {
          throw new Error('Você já desativou 2 vezes hoje. Limite atingido.');
        }

        await base44.entities.Professional.update(professional.id, {
          disponivel_substituicao: false,
          status_disponibilidade_substituicao: 'OFFLINE',
          ultima_atualizacao_status: new Date().toISOString(),
          desativacoes_hoje: ultimaAcaoHoje ? desativacoes + 1 : 1,
          ultima_desativacao: new Date().toISOString(),
          justificativa_desativacao: justificativa.trim()
        });
      }

      return { novoStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professional", professional.id]);
      toast.success("Status atualizado com sucesso!");
      setShowJustificativaModal(false);
      setJustificativa("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    }
  });

  const handleToggle = () => {
    const isOnline = professionalData.status_disponibilidade_substituicao === "ONLINE";
    
    // Se está desativando, mostrar modal de justificativa
    if (isOnline) {
      setShowJustificativaModal(true);
    } else {
      // Se está ativando, direto
      toggleMutation.mutate({ novoStatus: true, justificativa: null });
    }
  };

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
            onClick={handleToggle}
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

        {/* Contadores e Limites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-6"
        >
          <h3 className="text-xl font-black text-gray-900 mb-4">Ativações Hoje</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
              <div className="text-3xl font-black text-green-600 mb-1">
                {professionalData.ativacoes_hoje || 0}/2
              </div>
              <div className="text-sm text-gray-600">🟢 Ativações</div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 text-center border-2 border-red-200">
              <div className="text-3xl font-black text-red-600 mb-1">
                {professionalData.desativacoes_hoje || 0}/2
              </div>
              <div className="text-sm text-gray-600">🔴 Desativações</div>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Máximo de 2 ativações e 2 desativações por dia para evitar instabilidade.
            </p>
          </div>
        </motion.div>

        {/* Suporte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6 border-2 border-orange-200 mb-6"
        >
          <h3 className="text-lg font-black text-gray-900 mb-2">Precisa de Ajuda?</h3>
          <p className="text-sm text-gray-700 mb-4">
            Problemas técnicos ou dúvidas sobre o sistema de substituições?
          </p>
          <a
            href="mailto:felipe.mello@doutorizze.com.br?subject=Suporte - Disponibilidade Substituição"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            <Mail className="w-5 h-5" />
            Chamar Suporte
          </a>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
                <li>• Justificativa obrigatória ao desativar (segurança)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Justificativa */}
      {showJustificativaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900">Por que desativar?</h3>
              <button
                onClick={() => setShowJustificativaModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Justificativa obrigatória para garantir qualidade do sistema e evitar ativações/desativações excessivas.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Motivo da desativação *
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Ex: Preciso focar em atendimentos já agendados hoje..."
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 resize-none outline-none"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{justificativa.length}/200 caracteres</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowJustificativaModal(false);
                    setJustificativa("");
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (justificativa.trim().length < 10) {
                      toast.error("Justificativa deve ter no mínimo 10 caracteres");
                      return;
                    }
                    toggleMutation.mutate({ novoStatus: false, justificativa });
                  }}
                  disabled={toggleMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  {toggleMutation.isPending ? "Desativando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
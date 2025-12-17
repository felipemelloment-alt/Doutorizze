import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Settings,
  Briefcase,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Star,
  Clock,
  ArrowRight,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("TODAS");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await base44.entities.Notification.filter(
        { destinatario_id: user.id },
        "-created_date"
      );
      return result || [];
    },
    enabled: !!user,
  });

  const marcarComoLidaMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.update(notificationId, {
        lida: true,
        data_leitura: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: async () => {
      const naoLidas = notifications.filter(n => !n.lida);
      await Promise.all(
        naoLidas.map(n =>
          base44.entities.Notification.update(n.id, {
            lida: true,
            data_leitura: new Date().toISOString()
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.lida) {
      marcarComoLidaMutation.mutate(notification.id);
    }

    // Navegar para destino se houver
    if (notification.acao_destino?.tipo === "TELA" && notification.acao_destino?.destino) {
      navigate(createPageUrl(notification.acao_destino.destino));
    }
  };

  // Filtrar notificações
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "TODAS") return true;
    if (activeTab === "NAO_LIDAS") return !n.lida;
    if (activeTab === "VAGAS") return ["SUPER_JOBS", "JOBS_SEMELHANTE", "VAGA_NORMAL", "VAGA_PREENCHIDA"].includes(n.tipo);
    if (activeTab === "SISTEMA") return ["STATUS_APROVADO", "STATUS_REPROVADO", "PERFIL_INCOMPLETO"].includes(n.tipo);
    return true;
  });

  const naoLidas = notifications.filter(n => !n.lida).length;

  // Configuração de ícones e cores por tipo
  const getNotificationConfig = (tipo) => {
    const configs = {
      SUPER_JOBS: { icon: Briefcase, gradient: "from-yellow-400 to-orange-500", emoji: "⚡" },
      JOBS_SEMELHANTE: { icon: TrendingUp, gradient: "from-yellow-400 to-orange-500", emoji: "🎯" },
      VAGA_NORMAL: { icon: Briefcase, gradient: "from-blue-400 to-blue-600", emoji: "💼" },
      MENSAGEM_CHAT: { icon: MessageCircle, gradient: "from-blue-400 to-purple-600", emoji: "💬" },
      STATUS_APROVADO: { icon: CheckCircle2, gradient: "from-green-400 to-green-600", emoji: "✅" },
      STATUS_REPROVADO: { icon: AlertCircle, gradient: "from-red-400 to-red-600", emoji: "❌" },
      MATCH_VISUALIZADO: { icon: Star, gradient: "from-pink-400 to-red-500", emoji: "👁️" },
      MATCH_CONTATADO: { icon: Award, gradient: "from-pink-400 to-red-500", emoji: "💰" },
      VAGA_PREENCHIDA: { icon: CheckCircle2, gradient: "from-green-400 to-green-600", emoji: "🎉" },
      RECEBEU_AVALIACAO: { icon: Star, gradient: "from-yellow-400 to-orange-500", emoji: "⭐" },
    };
    return configs[tipo] || { icon: Bell, gradient: "from-gray-400 to-gray-600", emoji: "🔔" };
  };

  const tabs = [
    { value: "TODAS", label: "Todas", count: notifications.length },
    { value: "NAO_LIDAS", label: "Não lidas", count: naoLidas },
    { value: "VAGAS", label: "Vagas", count: notifications.filter(n => ["SUPER_JOBS", "JOBS_SEMELHANTE", "VAGA_NORMAL"].includes(n.tipo)).length },
    { value: "SISTEMA", label: "Sistema", count: notifications.filter(n => ["STATUS_APROVADO", "STATUS_REPROVADO"].includes(n.tipo)).length }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Gradiente */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-6 pb-8 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-start">
          {/* Lado Esquerdo */}
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-2">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Notificações</h1>
            {naoLidas > 0 && (
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white text-sm font-semibold px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {naoLidas} não {naoLidas === 1 ? "lida" : "lidas"}
              </div>
            )}
          </div>

          {/* Lado Direito - Config */}
          <button
            onClick={() => navigate(createPageUrl("NotificationSettings"))}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs/Filtros */}
      <div className="bg-white shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex overflow-x-auto gap-2 p-4 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-5 py-2.5 font-bold rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="max-w-4xl mx-auto p-4 space-y-3 pb-24">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Bell className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhuma notificação</h3>
              <p className="text-gray-400">Você está em dia! 🎉</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const config = getNotificationConfig(notification.tipo);
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`rounded-2xl p-4 shadow-lg border-l-4 relative overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
                    !notification.lida
                      ? "bg-white border-yellow-400"
                      : "bg-white border-gray-200 opacity-70"
                  }`}
                >
                  {/* Glow de fundo para não lidas */}
                  {!notification.lida && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-transparent opacity-50 pointer-events-none"></div>
                  )}

                  <div className="flex items-start gap-3 relative z-10">
                    {/* Ícone */}
                    <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        {notification.titulo}
                        {!notification.lida && (
                          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        )}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {notification.mensagem}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(notification.created_date), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Botão Ver */}
                    {notification.acao_destino?.destino && (
                      <button className="ml-auto text-yellow-500 font-semibold text-sm hover:text-yellow-600 flex items-center gap-1 flex-shrink-0">
                        Ver
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Botão Fixo - Marcar todas como lidas */}
      {naoLidas > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 left-4 right-4 max-w-4xl mx-auto"
        >
          <button
            onClick={() => marcarTodasComoLidasMutation.mutate()}
            disabled={marcarTodasComoLidasMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Marcar todas como lidas
          </button>
        </motion.div>
      )}
    </div>
  );
}
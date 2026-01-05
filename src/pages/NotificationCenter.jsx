import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
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
  Check,
  Zap,
  XCircle,
  UserPlus,
  FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componente Card de Notificação
function NotificationCard({ notification, index, onClick, config }) {
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onClick(notification)}
      className={`bg-white rounded-3xl p-4 shadow-lg border-2 relative overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all ${
        !notification.lida
          ? "border-yellow-400"
          : "border-gray-100 opacity-75"
      }`}
    >
      {/* Glow de fundo para não lidas */}
      {!notification.lida && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-transparent opacity-60 pointer-events-none"></div>
      )}

      <div className="flex items-start gap-3 relative z-10">
        {/* Ícone */}
        <div className={`w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
            {notification.titulo}
            {!notification.lida && (
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0"></span>
            )}
          </h4>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {notification.mensagem}
          </p>
          <div className="flex items-center gap-2">
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
          <button className="ml-auto text-orange-500 font-bold text-sm hover:text-orange-600 flex items-center gap-1 flex-shrink-0 px-3 py-2 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all">
            Ver
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

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
      MATCH_PERFEITO: { icon: Zap, gradient: "from-yellow-400 to-orange-500", emoji: "⚡" },
      CANDIDATURA_ACEITA: { icon: CheckCircle2, gradient: "from-green-400 to-green-600", emoji: "✅" },
      CANDIDATURA_REJEITADA: { icon: XCircle, gradient: "from-red-400 to-red-600", emoji: "❌" },
      NOVA_CANDIDATURA: { icon: UserPlus, gradient: "from-blue-400 to-blue-600", emoji: "👤" },
      AVALIACAO_RECEBIDA: { icon: Star, gradient: "from-yellow-400 to-orange-500", emoji: "⭐" },
      CONTRATO_CRIADO: { icon: FileText, gradient: "from-green-400 to-green-600", emoji: "📄" },
      SISTEMA: { icon: Bell, gradient: "from-gray-400 to-gray-600", emoji: "🔔" },
      // Tipos antigos (manter para compatibilidade)
      SUPER_JOBS: { icon: Zap, gradient: "from-yellow-400 to-orange-500", emoji: "⚡" },
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  // Agrupar notificações por data
  const groupNotificationsByDate = (notifications) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const grupos = {
      hoje: [],
      ontem: [],
      anteriores: []
    };

    notifications.forEach(notif => {
      const dataNotif = new Date(notif.created_date);
      dataNotif.setHours(0, 0, 0, 0);

      if (dataNotif.getTime() === hoje.getTime()) {
        grupos.hoje.push(notif);
      } else if (dataNotif.getTime() === ontem.getTime()) {
        grupos.ontem.push(notif);
      } else {
        grupos.anteriores.push(notif);
      }
    });

    return grupos;
  };

  const gruposDeNotificacoes = groupNotificationsByDate(filteredNotifications);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
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
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-xl"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Nenhuma notificação ainda</h3>
            <p className="text-gray-400">Quando houver novidades, você verá aqui</p>
          </motion.div>
        ) : (
          <>
            {/* HOJE */}
            {gruposDeNotificacoes.hoje.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Hoje</h2>
                <div className="space-y-3">
                  {gruposDeNotificacoes.hoje.map((notification, index) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      index={index}
                      onClick={handleNotificationClick}
                      config={getNotificationConfig(notification.tipo)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ONTEM */}
            {gruposDeNotificacoes.ontem.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Ontem</h2>
                <div className="space-y-3">
                  {gruposDeNotificacoes.ontem.map((notification, index) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      index={index}
                      onClick={handleNotificationClick}
                      config={getNotificationConfig(notification.tipo)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ANTERIORES */}
            {gruposDeNotificacoes.anteriores.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Anteriores</h2>
                <div className="space-y-3">
                  {gruposDeNotificacoes.anteriores.map((notification, index) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      index={index}
                      onClick={handleNotificationClick}
                      config={getNotificationConfig(notification.tipo)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
            className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {marcarTodasComoLidasMutation.isPending ? "Marcando..." : "Marcar todas como lidas"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
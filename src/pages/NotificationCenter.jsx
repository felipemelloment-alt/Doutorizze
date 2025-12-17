import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  MessageSquare,
  CheckCircle,
  Star,
  Image as ImageIcon,
  ShoppingBag,
  Newspaper,
  Settings,
  Trash2,
  Check,
  X,
  Megaphone,
  Zap
} from "lucide-react";

const iconMap = {
  SUPER_JOBS: Briefcase,
  JOBS_SEMELHANTE: Briefcase,
  VAGA_NORMAL: Briefcase,
  MENSAGEM_CHAT: MessageSquare,
  STATUS_APROVADO: CheckCircle,
  STATUS_REPROVADO: X,
  LEMBRETE_AVALIACAO: Star,
  NOVO_POST: ImageIcon,
  NOVO_ITEM_MARKETPLACE: ShoppingBag,
  NOTICIA: Newspaper,
  CURTIDA_POST: Star,
  COMENTARIO_POST: MessageSquare,
  MATCH_VISUALIZADO: CheckCircle,
  MATCH_CONTATADO: MessageSquare,
  VAGA_PREENCHIDA: CheckCircle,
  RECEBEU_AVALIACAO: Star,
};

const colorMap = {
  SUPER_JOBS: "bg-yellow-500",
  JOBS_SEMELHANTE: "bg-orange-500",
  VAGA_NORMAL: "bg-blue-500",
  MENSAGEM_CHAT: "bg-green-500",
  STATUS_APROVADO: "bg-emerald-500",
  STATUS_REPROVADO: "bg-red-500",
  LEMBRETE_AVALIACAO: "bg-purple-500",
  NOVO_POST: "bg-pink-500",
  NOVO_ITEM_MARKETPLACE: "bg-indigo-500",
  NOTICIA: "bg-cyan-500",
  CURTIDA_POST: "bg-rose-500",
  COMENTARIO_POST: "bg-teal-500",
  MATCH_VISUALIZADO: "bg-blue-400",
  MATCH_CONTATADO: "bg-green-400",
  VAGA_PREENCHIDA: "bg-emerald-400",
  RECEBEU_AVALIACAO: "bg-amber-500",
};

function NotificationCard({ notification, onMarkAsRead, onDelete, onClick }) {
  const Icon = iconMap[notification.tipo] || Bell;
  const colorClass = colorMap[notification.tipo] || "bg-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative transition-all hover:shadow-2xl cursor-pointer border-4 rounded-3xl overflow-hidden ${
          !notification.lida 
            ? "border-[#F9B500] bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 shadow-xl" 
            : "border-gray-200 bg-white hover:border-[#E94560]"
        }`}
        onClick={() => onClick(notification)}
      >
        {/* Elemento decorativo de raio */}
        {!notification.lida && (
          <div className="absolute top-2 right-2">
            <Zap className="w-5 h-5 text-[#F9B500] animate-pulse" />
          </div>
        )}

        <CardContent className="p-5 md:p-6">
          <div className="flex gap-4">
            <div className={`p-4 ${colorClass} rounded-2xl h-fit flex-shrink-0 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-black text-base md:text-lg text-gray-900 line-clamp-1">
                  {notification.titulo}
                </h3>
                {!notification.lida && (
                  <Badge className="bg-gradient-to-r from-[#F9B500] to-[#E94560] text-white font-black text-xs px-4 py-1 rounded-full shadow-lg">
                    NOVA 🔔
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-semibold">
                {notification.mensagem}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold">
                  {formatDistanceToNow(new Date(notification.created_date), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>

                <div className="flex gap-2">
                  {!notification.lida && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification);
                      }}
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold shadow-lg"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Ler</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification);
                    }}
                    className="h-9 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("todas");

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
      return await base44.entities.Notification.filter(
  { destinatario_id: user.id },
  "-created_date"
);
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.update(notificationId, {
        lida: true,
        data_leitura: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n) => !n.lida);
      await Promise.all(
        unreadNotifications.map((n) =>
          base44.entities.Notification.update(n.id, {
            lida: true,
            data_leitura: new Date().toISOString(),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const handleNotificationClick = (notification) => {
    // Marcar como lida
    if (!notification.lida) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navegar para o destino
    if (notification.acao_destino?.tipo === "TELA") {
      navigate(createPageUrl(notification.acao_destino.destino));
    } else if (notification.acao_destino?.tipo === "URL") {
      window.open(notification.acao_destino.destino, "_blank");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "todas") return true;
    if (activeTab === "nao-lidas") return !n.lida;
    if (activeTab === "vagas")
      return ["SUPER_JOBS", "JOBS_SEMELHANTE", "VAGA_NORMAL", "MATCH_VISUALIZADO", "MATCH_CONTATADO"].includes(n.tipo);
    if (activeTab === "mensagens")
      return ["MENSAGEM_CHAT", "COMENTARIO_POST"].includes(n.tipo);
    if (activeTab === "sistema")
      return ["STATUS_APROVADO", "STATUS_REPROVADO", "LEMBRETE_AVALIACAO", "RECEBEU_AVALIACAO"].includes(n.tipo);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.lida).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 gradient-yellow-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Bell className="w-12 h-12 text-white" />
          </div>
          <p className="text-2xl font-black text-gray-900">Carregando suas notificações...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 relative overflow-x-hidden">
      {/* Elementos decorativos de fundo */}
      <motion.div
        animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-20 left-10 opacity-20"
      >
        <Zap className="w-32 h-32 text-[#F9B500]" />
      </motion.div>
      <motion.div
        animate={{ rotate: [0, -10, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 4, delay: 1 }}
        className="absolute bottom-20 right-10 opacity-20"
      >
        <Megaphone className="w-40 h-40 text-[#E94560]" />
      </motion.div>

      {/* Hero Header */}
      <div className="relative gradient-yellow-pink py-8 md:py-12 lg:py-16 shadow-2xl">
        <div className="container mx-auto px-3 md:px-4">
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-5 bg-white rounded-3xl shadow-2xl"
              >
                <Bell className="w-12 h-12 text-[#E94560]" />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#F9B500] text-shadow-lg mb-3 tracking-tight">
              NOTIFICAÇÕES
            </h1>
            
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block bg-white px-8 py-3 rounded-full shadow-xl"
              >
                <p className="text-xl md:text-2xl font-black">
                  <span className="text-[#E94560]">{unreadCount}</span>{" "}
                  <span className="text-gray-900">
                    nova{unreadCount > 1 ? "s" : ""} mensagem{unreadCount > 1 ? "ns" : ""}
                  </span>{" "}
                  <span className="text-2xl">🔔</span>
                </p>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={() => navigate(createPageUrl("NotificationSettings"))}
                className="bg-white text-gray-900 border-0 font-black text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <Settings className="w-6 h-6 mr-2" />
                Configurações
              </Button>
              {unreadCount > 0 && (
                <Button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="gradient-yellow-pink text-white border-0 font-black text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Marcar todas lidas
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 lg:py-12 max-w-5xl relative z-10">{/* Tabs */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 md:mb-10">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-3 bg-white rounded-3xl shadow-2xl border-4 border-[#F9B500] gap-2">
            <TabsTrigger 
              value="todas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500 data-[state=active]:text-white font-black text-sm md:text-base py-4 md:py-5 rounded-2xl transition-all"
            >
              Todas
              {notifications.length > 0 && (
                <Badge className="ml-2 bg-gray-900 text-white font-black text-xs px-2.5 py-1">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="nao-lidas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-black text-sm md:text-base py-4 md:py-5 rounded-2xl transition-all"
            >
              Não Lidas
              {unreadCount > 0 && (
                <Badge className="ml-2 gradient-yellow-pink text-white font-black text-xs px-2.5 py-1 animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="vagas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-purple-500 data-[state=active]:text-white font-black text-sm md:text-base py-4 md:py-5 rounded-2xl transition-all"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Vagas
            </TabsTrigger>
            <TabsTrigger 
              value="mensagens"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-teal-500 data-[state=active]:text-white font-black text-sm md:text-base py-4 md:py-5 rounded-2xl transition-all"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <motion.div 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredNotifications.length === 0 ? (
            <Card className="border-4 border-[#F9B500] shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-12 md:p-20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-28 h-28 md:w-36 md:h-36 gradient-yellow-pink rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                >
                  <Bell className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                  NENHUMA NOTIFICAÇÃO
                </h3>
                <p className="text-lg md:text-xl text-gray-700 font-bold">
                  {activeTab === "nao-lidas"
                    ? "Você está em dia! Não há notificações não lidas. ✅"
                    : "Você não tem notificações ainda. 📭"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NotificationCard
                  notification={notification}
                  onMarkAsRead={(n) => markAsReadMutation.mutate(n.id)}
                  onDelete={(n) => deleteMutation.mutate(n.id)}
                  onClick={handleNotificationClick}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
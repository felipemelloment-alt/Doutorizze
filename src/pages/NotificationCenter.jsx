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
  X
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
    <Card
      className={`transition-all hover:shadow-xl cursor-pointer border-2 rounded-2xl overflow-hidden ${
        !notification.lida ? "border-[#F9B500] bg-gradient-to-r from-yellow-50 to-orange-50" : "border-gray-100 hover:border-[#F9B500]"
      }`}
      onClick={() => onClick(notification)}
    >
      <CardContent className="p-4 md:p-6 w-full max-w-full">
        <div className="flex gap-3 md:gap-4 w-full max-w-full overflow-hidden">
          <div className={`p-2 md:p-3 ${colorClass} rounded-xl h-fit flex-shrink-0`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-1 w-full">
              <h3 className="font-bold text-sm md:text-base text-gray-900 truncate flex-1">
                {notification.titulo}
              </h3>
              {!notification.lida && (
                <Badge className="bg-[#F9B500] text-white font-bold text-xs flex-shrink-0">
                  Nova
                </Badge>
              )}
            </div>

            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
              {notification.mensagem}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
              <span className="text-xs text-gray-500 truncate">
                {formatDistanceToNow(new Date(notification.created_date), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>

              <div className="flex gap-2 flex-shrink-0">
                {!notification.lida && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification);
                    }}
                    className="text-xs h-8 rounded-xl hover:bg-green-50"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Marcar lida</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 rounded-xl"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 px-4 py-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 w-full">
          <div className="flex items-start gap-3 md:gap-4 w-full max-w-full overflow-hidden">
            <div className="p-3 gradient-yellow-pink rounded-2xl shadow-xl flex-shrink-0">
              <Bell className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 truncate">Notificações</h1>
              {unreadCount > 0 && (
                <p className="text-sm md:text-base text-gray-600 truncate">
                  Você tem <span className="font-bold text-[#F9B500]">{unreadCount}</span> notificação
                  {unreadCount > 1 ? "ões" : ""} não lida{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("NotificationSettings"))}
              className="w-full sm:w-auto h-10 md:h-11 rounded-xl border-2 border-gray-200 hover:border-[#F9B500] font-bold"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            {unreadCount > 0 && (
              <Button 
                onClick={() => markAllAsReadMutation.mutate()}
                className="w-full sm:w-auto h-10 md:h-11 gradient-yellow-pink text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all border-0"
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar todas lidas
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2 bg-white rounded-2xl shadow-lg gap-2">
            <TabsTrigger 
              value="todas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500 data-[state=active]:text-white font-bold text-xs md:text-sm py-2 md:py-3 rounded-xl flex items-center justify-center"
            >
              <span className="truncate">Todas</span>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="nao-lidas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-bold text-xs md:text-sm py-2 md:py-3 rounded-xl flex items-center justify-center"
            >
              <span className="truncate">Não Lidas</span>
              {unreadCount > 0 && (
                <Badge className="ml-1 md:ml-2 bg-[#F9B500] text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="vagas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold text-xs md:text-sm py-2 md:py-3 rounded-xl flex items-center justify-center"
            >
              <Briefcase className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Vagas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mensagens"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-teal-500 data-[state=active]:text-white font-bold text-xs md:text-sm py-2 md:py-3 rounded-xl flex items-center justify-center"
            >
              <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Msgs</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-3 md:space-y-4 w-full max-w-full">
          {filteredNotifications.length === 0 ? (
            <Card className="border-4 border-gray-100 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 md:w-10 md:h-10 text-[#F9B500]" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-semibold">
                  {activeTab === "nao-lidas"
                    ? "Você está em dia! Não há notificações não lidas."
                    : "Você não tem notificações ainda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={(n) => markAsReadMutation.mutate(n.id)}
                onDelete={(n) => deleteMutation.mutate(n.id)}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
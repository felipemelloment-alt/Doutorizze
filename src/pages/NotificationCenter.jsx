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
  X } from
"lucide-react";

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
  RECEBEU_AVALIACAO: Star
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
  RECEBEU_AVALIACAO: "bg-amber-500"
};

function NotificationCard({ notification, onMarkAsRead, onDelete, onClick }) {
  const Icon = iconMap[notification.tipo] || Bell;
  const colorClass = colorMap[notification.tipo] || "bg-gray-500";

  return (
    <Card
      className={`transition-all hover:shadow-lg cursor-pointer ${
      !notification.lida ? "border-l-4 border-l-blue-500 bg-blue-50" : ""}`
      }
      onClick={() => onClick(notification)}>

      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`p-3 ${colorClass} rounded-xl h-fit`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {notification.titulo}
              </h3>
              {!notification.lida &&
              <Badge variant="secondary" className="bg-blue-600 text-white">
                  Nova
                </Badge>
              }
            </div>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {notification.mensagem}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.created_date), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>

              <div className="flex gap-2">
                {!notification.lida &&
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification);
                  }}>

                    <Check className="w-4 h-4 mr-1" />
                    Marcar como lida
                  </Button>
                }
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification);
                  }}
                  className="text-red-600 hover:text-red-700">

                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

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
    enabled: !!user
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.update(notificationId, {
        lida: true,
        data_leitura: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter((n) => !n.lida);
      await Promise.all(
        unreadNotifications.map((n) =>
        base44.entities.Notification.update(n.id, {
          lida: true,
          data_leitura: new Date().toISOString()
        })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notificações...</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="bg-red-500 text-[#ffffff] p-4 rounded-2xl shadow-xl flex-shrink-0">Notificações</h1>
              {unreadCount > 0 &&
              <p className="text-gray-600">
                  Você tem <span className="font-semibold text-blue-600">{unreadCount}</span> notificação
                  {unreadCount > 1 ? "ões" : ""} não lida{unreadCount > 1 ? "s" : ""}
                </p>
              }
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("NotificationSettings"))}>

              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            {unreadCount > 0 &&
            <Button onClick={() => markAllAsReadMutation.mutate()}>
                <Check className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            }
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="todas">
              Todas
              {notifications.length > 0 &&
              <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              }
            </TabsTrigger>
            <TabsTrigger value="nao-lidas">
              Não Lidas
              {unreadCount > 0 &&
              <Badge className="ml-2 bg-blue-600">
                  {unreadCount}
                </Badge>
              }
            </TabsTrigger>
            <TabsTrigger value="vagas">
              <Briefcase className="w-4 h-4 mr-2" />
              Vagas
            </TabsTrigger>
            <TabsTrigger value="mensagens">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mensagens
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ?
          <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-gray-600">
                  {activeTab === "nao-lidas" ?
                "Você está em dia! Não há notificações não lidas." :
                "Você não tem notificações ainda."}
                </p>
              </CardContent>
            </Card> :

          filteredNotifications.map((notification) =>
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={(n) => markAsReadMutation.mutate(n.id)}
            onDelete={(n) => deleteMutation.mutate(n.id)}
            onClick={handleNotificationClick} />

          )
          }
        </div>
      </div>
    </div>);

}
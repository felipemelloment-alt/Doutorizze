import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Briefcase, MessageSquare, Star, ArrowRight } from "lucide-react";

const iconMap = {
  SUPER_JOBS: Briefcase,
  JOBS_SEMELHANTE: Briefcase,
  VAGA_NORMAL: Briefcase,
  MENSAGEM_CHAT: MessageSquare,
  STATUS_APROVADO: Star,
  LEMBRETE_AVALIACAO: Star,
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

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

  const { data: notifications = [] } = useQuery({
    queryKey: ["notificationsBell", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const allNotifications = await base44.entities.Notification.filter(
  { destinatario_id: user.id },
  "-created_date",
  5
);
      return allNotifications;
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const handleNotificationClick = (notification) => {
    setOpen(false);
    
    // Marcar como lida
    if (!notification.lida) {
      base44.entities.Notification.update(notification.id, {
        lida: true,
        data_leitura: new Date().toISOString(),
      });
    }

    // Navegar
    if (notification.acao_destino?.tipo === "TELA") {
      navigate(createPageUrl(notification.acao_destino.destino));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Notificações</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">
              {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.tipo] || Bell;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      !notification.lida ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg h-fit">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.titulo}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {notification.mensagem}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_date), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!notification.lida && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <Separator />
        
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => {
              setOpen(false);
              navigate(createPageUrl("NotificationCenter"));
            }}
          >
            Ver todas as notificações
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
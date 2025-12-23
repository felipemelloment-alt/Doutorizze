import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Briefcase,
  UserPlus,
  MessageCircle,
  Star,
  Clock,
  AlertCircle,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { cacheConfig } from "@/components/config/queryConfig";

const notificationIcons = {
  NOVA_VAGA: Briefcase,
  CANDIDATURA_RECEBIDA: UserPlus,
  CANDIDATURA_ACEITA: Check,
  CANDIDATURA_REJEITADA: X,
  MENSAGEM: MessageCircle,
  AVALIACAO: Star,
  LEMBRETE: Clock,
  SUBSTITUICAO_CONFIRMADA: CheckCheck,
  ALERTA: AlertCircle,
  DEFAULT: Bell
};

const notificationColors = {
  NOVA_VAGA: "bg-blue-100 text-blue-600",
  CANDIDATURA_RECEBIDA: "bg-green-100 text-green-600",
  CANDIDATURA_ACEITA: "bg-emerald-100 text-emerald-600",
  CANDIDATURA_REJEITADA: "bg-red-100 text-red-600",
  MENSAGEM: "bg-purple-100 text-purple-600",
  AVALIACAO: "bg-yellow-100 text-yellow-600",
  LEMBRETE: "bg-orange-100 text-orange-600",
  SUBSTITUICAO_CONFIRMADA: "bg-teal-100 text-teal-600",
  ALERTA: "bg-red-100 text-red-600",
  DEFAULT: "bg-gray-100 text-gray-600"
};

function NotificationItem({ notification, onRead, onDelete, onClick }) {
  const Icon = notificationIcons[notification.tipo] || notificationIcons.DEFAULT;
  const colorClass = notificationColors[notification.tipo] || notificationColors.DEFAULT;
  
  const timeAgo = notification.created_date 
    ? formatDistanceToNow(new Date(notification.created_date), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.lida ? 'bg-blue-50/50' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className={`text-sm font-medium ${!notification.lida ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.titulo}
            </h4>
            {!notification.lida && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          
          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
            {notification.mensagem}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{timeAgo}</span>
            
            <div className="flex gap-1">
              {!notification.lida && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                  title="Marcar como lida"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationCenterComponent({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  // Buscar notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.Notification.filter({
        user_id: user.id
      });
      return results.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    ...cacheConfig.realtime
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Notification.update(id, { 
        lida: true,
        lida_em: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // Excluir notificação
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Notification.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.lida);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { 
          lida: true,
          lida_em: new Date().toISOString()
        })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.lida) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navegar para a ação da notificação
    if (notification.action_url) {
      navigate(notification.action_url);
    } else if (notification.entity_type && notification.entity_id) {
      // Navegação baseada no tipo de entidade
      const routes = {
        Job: 'DetalheVaga',
        SubstituicaoUrgente: 'DetalheSubstituicao',
        Professional: 'VerProfissional'
      };
      const route = routes[notification.entity_type];
      if (route) {
        navigate(createPageUrl(route) + `?id=${notification.entity_id}`);
      }
    }
    
    if (onClose) onClose();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.lida)
    : notifications;

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Notificações</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-orange-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-white text-orange-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Não lidas ({unreadCount})
          </button>
        </div>
      </div>

      {/* Lista de notificações */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full mx-auto" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'Nenhuma notificação não lida'
                : 'Nenhuma notificação'
              }
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => markAsReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onClick={handleNotificationClick}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {unreadCount > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            variant="ghost"
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook para badge de notificações
export function useNotificationBadge() {
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Notification.filter({
        user_id: user.id,
        lida: false
      });
    },
    ...cacheConfig.realtime
  });

  return notifications.length;
}
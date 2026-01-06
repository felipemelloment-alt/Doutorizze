import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, ChevronRight, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Chats() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar threads ativas
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["chatThreads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Buscar todas as threads do usuário
      const allThreads = await base44.entities.ChatThread.filter({
        status: "ATIVO"
      });

      // Filtrar apenas não expiradas
      const now = new Date();
      const activeThreads = allThreads.filter(t => new Date(t.expires_at) > now);

      // Atualizar threads expiradas
      const expiredThreads = allThreads.filter(t => new Date(t.expires_at) <= now);
      expiredThreads.forEach(t => {
        base44.entities.ChatThread.update(t.id, { status: "EXPIRADO" }).catch(() => {});
      });

      return activeThreads.sort((a, b) => 
        new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date)
      );
    },
    enabled: !!user,
    refetchInterval: 10000 // Atualizar a cada 10s
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 mb-6">
        <h1 className="text-3xl font-black text-white mb-2">Meus Chats</h1>
        <p className="text-white/90">Conversas do Marketplace</p>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {threads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum chat ativo</h2>
            <p className="text-gray-600 mb-6">
              Ao conversar sobre um produto do Marketplace, os chats aparecerão aqui.
            </p>
            <button
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              Ir para o Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const isBuyer = user.id === thread.buyer_user_id;
              const otherUserName = isBuyer ? thread.seller_name : thread.buyer_name;
              const unreadCount = isBuyer ? thread.unread_buyer : thread.unread_seller;
              const horasRestantes = Math.max(0, Math.floor((new Date(thread.expires_at) - new Date()) / (1000 * 60 * 60)));

              return (
                <motion.button
                  key={thread.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(createPageUrl(`ChatThread?id=${thread.id}`))}
                  className="w-full bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400 text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {otherUserName?.[0]?.toUpperCase() || "?"}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-bold text-gray-900">{otherUserName}</p>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 font-semibold mb-2 truncate">
                        {thread.item_title}
                      </p>

                      {thread.last_message_preview && (
                        <p className="text-sm text-gray-500 truncate mb-2">
                          {thread.last_message_preview}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {thread.last_message_at 
                            ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true, locale: ptBR })
                            : "Nova conversa"
                          }
                        </p>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          horasRestantes < 12 ? "text-red-600" : "text-gray-500"
                        }`}>
                          <Clock className="w-3 h-3" />
                          {horasRestantes}h restantes
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
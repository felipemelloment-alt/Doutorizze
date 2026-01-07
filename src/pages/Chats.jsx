import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  ChevronRight, 
  Inbox,
  Clock,
  ShoppingBag
} from "lucide-react";
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

  // Buscar threads do usuário
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["chatThreads", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const allThreads = await base44.entities.ChatThread.filter({
        status: "ATIVO"
      });

      // Filtrar threads do usuário
      const myThreads = allThreads.filter(
        t => t.buyer_user_id === user.id || t.seller_user_id === user.id
      );

      // Filtrar apenas não expiradas
      const now = new Date();
      const activeThreads = myThreads.filter(t => new Date(t.expires_at) > now);

      // Atualizar threads expiradas (side effect)
      const expiredThreads = myThreads.filter(t => new Date(t.expires_at) <= now && t.status === "ATIVO");
      expiredThreads.forEach(t => {
        base44.entities.ChatThread.update(t.id, { status: "EXPIRADO" });
      });

      // Ordenar por última atividade
      return activeThreads.sort((a, b) =>
        new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date)
      );
    },
    enabled: !!user,
    refetchInterval: 10000 // Refresh a cada 10 segundos
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* HEADER GRADIENTE */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 py-6 mb-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Meus Chats</h1>
              <p className="text-white/90">Conversas do Marketplace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Nenhum chat ativo
            </h3>
            <p className="text-gray-600 mb-6">
              Ao conversar sobre um produto do Marketplace, os chats aparecerão aqui.
            </p>
            <button
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            >
              Ir para o Marketplace
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread, index) => (
              <ChatCard
                key={thread.id}
                thread={thread}
                user={user}
                index={index}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatCard({ thread, user, index, navigate }) {
  const isBuyer = user.id === thread.buyer_user_id;
  const otherUserName = isBuyer ? thread.seller_name : thread.buyer_name;
  const unreadCount = isBuyer ? thread.unread_buyer : thread.unread_seller;

  // Calcular tempo restante
  const now = new Date();
  const expiresAt = new Date(thread.expires_at);
  const horasRestantes = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)));
  const isExpiringSoon = horasRestantes < 12;

  // Preview da última mensagem
  const preview = thread.last_message_preview || "Conversa iniciada";

  // Tempo desde última mensagem
  const lastMessageTime = thread.last_message_at || thread.created_date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(createPageUrl("ChatThread") + "?id=" + thread.id)}
      className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all cursor-pointer p-5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
          {otherUserName?.charAt(0).toUpperCase()}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-gray-900 truncate">
                  {otherUserName}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 font-semibold truncate flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                {thread.item_title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {preview}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(lastMessageTime), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            <div className={`flex items-center gap-1 font-bold ${
              isExpiringSoon ? "text-red-600" : "text-gray-500"
            }`}>
              <Clock className="w-3 h-3" />
              {horasRestantes}h restantes
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
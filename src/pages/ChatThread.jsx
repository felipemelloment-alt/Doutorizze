import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Send,
  Clock,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatThread() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const threadId = urlParams.get("id");

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

  // Buscar thread
  const { data: thread, isLoading: loadingThread } = useQuery({
    queryKey: ["chatThread", threadId],
    queryFn: async () => {
      const threads = await base44.entities.ChatThread.filter({ id: threadId });
      if (threads.length === 0) throw new Error("Thread não encontrada");
      return threads[0];
    },
    enabled: !!threadId,
    refetchInterval: 5000 // Atualizar a cada 5s
  });

  // Buscar mensagens
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["chatMessages", threadId],
    queryFn: async () => {
      const msgs = await base44.entities.ChatMessage.filter({ thread_id: threadId });
      return msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!threadId,
    refetchInterval: 3000 // Atualizar a cada 3s
  });

  // Marcar como lidas
  useEffect(() => {
    if (thread && user && messages.length > 0) {
      const isBuyer = user.id === thread.buyer_user_id;
      const unreadMessages = messages.filter(msg => 
        isBuyer ? !msg.read_by_buyer : !msg.read_by_seller
      );

      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msg => {
          base44.entities.ChatMessage.update(msg.id, {
            [isBuyer ? "read_by_buyer" : "read_by_seller"]: true
          }).catch(() => {});
        });

        // Zerar contador de não lidas
        base44.entities.ChatThread.update(thread.id, {
          [isBuyer ? "unread_buyer" : "unread_seller"]: 0
        }).catch(() => {});
      }
    }
  }, [messages, thread, user]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText) => {
      const isBuyer = user.id === thread.buyer_user_id;
      
      // Detectar padrões de risco
      const flagsRisco = [];
      const lowerText = messageText.toLowerCase();
      if (/\d{10,11}|\(\d{2}\)\s?\d{4,5}-?\d{4}/.test(messageText)) {
        flagsRisco.push("TELEFONE_DETECTADO");
      }
      if (/pix|transferência|transferencia|deposito|depósito/i.test(messageText)) {
        flagsRisco.push("PIX_DETECTADO");
      }
      if (/fora do app|fora da plataforma/i.test(lowerText)) {
        flagsRisco.push("NEGOCIACAO_EXTERNA");
      }

      const novaMensagem = await base44.entities.ChatMessage.create({
        thread_id: threadId,
        sender_user_id: user.id,
        sender_name: user.full_name,
        message_text: messageText,
        read_by_buyer: isBuyer,
        read_by_seller: !isBuyer,
        flags_risco: flagsRisco
      });

      // Atualizar thread
      await base44.entities.ChatThread.update(threadId, {
        last_message_at: new Date().toISOString(),
        last_message_preview: messageText.slice(0, 100),
        [isBuyer ? "unread_seller" : "unread_buyer"]: (thread[isBuyer ? "unread_seller" : "unread_buyer"] || 0) + 1
      });

      // Enviar push notification ao destinatário
      const recipientUserId = isBuyer ? thread.seller_user_id : thread.buyer_user_id;
      try {
        await fetch('http://164.152.59.49:5678/webhook/push-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: recipientUserId,
            title: `💬 Nova mensagem de ${user.full_name}`,
            body: messageText.slice(0, 100),
            data: { type: 'NOVA_MENSAGEM', thread_id: threadId }
          })
        });
      } catch (e) {
        console.error('Push notification error:', e);
      }

      return novaMensagem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["chatThread", threadId] });
      setNewMessage("");
    },
    onError: (error) => {
      toast.error("Erro ao enviar: " + error.message);
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (newMessage.length > 1000) {
      toast.error("Mensagem muito longa (máximo 1000 caracteres)");
      return;
    }
    sendMessageMutation.mutate(newMessage.trim());
  };

  if (loadingThread || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-4">Chat não encontrado</p>
          <button
            onClick={() => navigate(createPageUrl("Chats"))}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl"
          >
            Ver Meus Chats
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(thread.expires_at) < new Date();
  const isBuyer = user.id === thread.buyer_user_id;
  const otherUserName = isBuyer ? thread.seller_name : thread.buyer_name;
  
  const horasRestantes = Math.max(0, Math.floor((new Date(thread.expires_at) - new Date()) / (1000 * 60 * 60)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate(createPageUrl("Chats"))}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 mb-3"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
            {otherUserName?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{otherUserName}</p>
            <p className="text-sm text-gray-500">{thread.item_title}</p>
          </div>
        </div>
      </div>

      {/* Banner de Expiração */}
      <div className={`mx-4 mt-4 p-4 rounded-2xl border-2 ${
        isExpired 
          ? "bg-red-50 border-red-300"
          : horasRestantes < 12 
            ? "bg-yellow-50 border-yellow-300"
            : "bg-blue-50 border-blue-300"
      }`}>
        <div className="flex items-start gap-2">
          {isExpired ? (
            <>
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-bold">⚠️ Chat Expirado</p>
                <p>Este chat expirou e foi bloqueado. Não é mais possível enviar mensagens.</p>
              </div>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold">⏰ Chat expira em {horasRestantes}h</p>
                <p>Após 48h da criação, este chat será apagado automaticamente. Troque contatos se necessário.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div className="px-4 py-6 space-y-4 mb-24">
        {loadingMessages && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender_user_id === user.id;
          const hasRiskFlags = msg.flags_risco && msg.flags_risco.length > 0;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    isMe
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                      : "bg-white border-2 border-gray-200 text-gray-900"
                  } shadow-md`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.message_text}
                  </p>
                  
                  {hasRiskFlags && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-xs opacity-80 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Cuidado: troque contatos com segurança
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
        <form onSubmit={handleSendMessage} className="max-w-6xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isExpired ? "Chat expirado" : "Digite sua mensagem..."}
            disabled={isExpired || sendMessageMutation.isPending}
            maxLength={1000}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isExpired || !newMessage.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
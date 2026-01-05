import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MarketplaceChatModal({ 
  itemId, 
  vendedorId, 
  vendedorNome,
  isOpen, 
  onClose 
}) {
  const [user, setUser] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Buscar ou criar chat
  const { data: chat, isLoading } = useQuery({
    queryKey: ["marketplaceChat", itemId, user?.id],
    queryFn: async () => {
      if (!user || !itemId) return null;

      // Buscar chat existente
      const chats = await base44.entities.MarketplaceChat.filter({
        marketplace_item_id: itemId,
        comprador_id: user.id
      });

      if (chats.length > 0) {
        return chats[0];
      }

      // Criar novo chat (expira em 48h)
      const expiraEm = new Date();
      expiraEm.setHours(expiraEm.getHours() + 48);

      const novoChat = await base44.entities.MarketplaceChat.create({
        marketplace_item_id: itemId,
        comprador_id: user.id,
        comprador_nome: user.full_name,
        vendedor_id: vendedorId,
        vendedor_nome: vendedorNome,
        mensagens: [],
        status: "ATIVO",
        expira_em: expiraEm.toISOString(),
        ultima_mensagem_em: new Date().toISOString()
      });

      return novoChat;
    },
    enabled: !!user && !!itemId && isOpen
  });

  // Mutation para enviar mensagem
  const enviarMensagemMutation = useMutation({
    mutationFn: async (novaMensagem) => {
      if (!chat) throw new Error("Chat não encontrado");

      const mensagens = chat.mensagens || [];
      mensagens.push({
        remetente_id: user.id,
        mensagem: novaMensagem,
        timestamp: new Date().toISOString(),
        lida: false
      });

      return await base44.entities.MarketplaceChat.update(chat.id, {
        mensagens,
        ultima_mensagem_em: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceChat"] });
      setMensagem("");
      scrollToBottom();
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.mensagens]);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    enviarMensagemMutation.mutate(mensagem.trim());
  };

  // Verificar se expirou
  const chatExpirado = chat && chat.expira_em && new Date(chat.expira_em) < new Date();
  const horasRestantes = chat && chat.expira_em 
    ? Math.max(0, Math.floor((new Date(chat.expira_em) - new Date()) / (1000 * 60 * 60)))
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-black text-lg">Chat com {vendedorNome}</h3>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {chatExpirado ? "Chat expirado" : `Expira em ${horasRestantes}h`}
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Aviso fixo */}
          <div className="bg-yellow-50 border-b-2 border-yellow-200 p-3">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-800">
                <p className="font-bold mb-1">⚠️ Use este chat apenas para negociação inicial</p>
                <p className="text-xs">Este chat expira em 48h. Para contatos posteriores, use WhatsApp/telefone.</p>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : chatExpirado ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Chat expirado</p>
                  <p className="text-gray-500 text-sm">Entre em contato via WhatsApp</p>
                </div>
              </div>
            ) : (
              <>
                {chat?.mensagens?.map((msg, index) => {
                  const ehMinha = msg.remetente_id === user?.id;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${ehMinha ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${ehMinha ? "bg-yellow-400" : "bg-white"} rounded-2xl px-4 py-3 shadow-md`}>
                        <p className={`${ehMinha ? "text-gray-900" : "text-gray-800"} text-sm`}>{msg.mensagem}</p>
                        <p className={`${ehMinha ? "text-gray-700" : "text-gray-500"} text-xs mt-1`}>
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {!chatExpirado && (
            <form onSubmit={handleEnviar} className="p-4 bg-white border-t-2 border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  disabled={enviarMensagemMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!mensagem.trim() || enviarMensagemMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
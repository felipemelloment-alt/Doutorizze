import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Share2, Copy, Ticket, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareTokenButton({ onTokenShared }) {
  const [showModal, setShowModal] = useState(false);

  const { data: tokenUsuario, isLoading } = useQuery({
    queryKey: ['my-token'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const tokens = await base44.entities.TokenUsuario.filter({ user_id: user.id });
      return tokens[0] || null;
    },
    enabled: showModal
  });

  const handleShare = () => {
    if (!tokenUsuario) {
      toast.error("Token não encontrado");
      return;
    }

    const mensagem = `Meu Token Doutorizze:\n${tokenUsuario.token_id}`;
    
    if (onTokenShared) {
      onTokenShared(mensagem);
    }
    
    setShowModal(false);
    toast.success("Token compartilhado!");
  };

  const handleCopy = () => {
    if (tokenUsuario?.token_id) {
      navigator.clipboard.writeText(tokenUsuario.token_id);
      toast.success("Token copiado!");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        <Ticket className="w-5 h-5" />
        Compartilhar Token
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Compartilhar Token</h3>
                  <p className="text-sm text-gray-600">Seu Token ID Doutorizze</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : tokenUsuario ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-gray-600 mb-2 text-center">Seu Token ID</p>
                    <p className="font-mono text-2xl font-black text-center text-gray-900 tracking-wider">
                      {tokenUsuario.token_id}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleShare}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Compartilhar no Chat
                    </button>

                    <button
                      onClick={handleCopy}
                      className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      Copiar Token
                    </button>

                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-4 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Você ainda não possui um Token ID</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
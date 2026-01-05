import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppSafeButton({ 
  phone, 
  message, 
  buttonText = "Entrar em Contato", 
  className = "",
  children 
}) {
  const [showModal, setShowModal] = useState(false);

  const abrirWhatsApp = () => {
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setShowModal(false);
  };

  const fecharModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className}
      >
        {children || buttonText}
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={fecharModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
            >
              {/* Ícone de Alerta */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>

              {/* Título */}
              <h2 className="text-xl font-black text-center text-gray-900 mb-4">
                ATENÇÃO!
              </h2>

              {/* Texto Legal */}
              <p className="text-sm text-gray-700 text-center mb-6 leading-relaxed">
                A <strong>DOUTORIZZE</strong> NÃO SE RESPONSABILIZA por qualquer
                CONTRATAÇÃO, NEGOCIAÇÃO, DIVULGAÇÃO, COMPRA ou QUALQUER OUTRO TIPO
                DE TRANSAÇÃO entre usuários da plataforma.
                <br/><br/>
                NÃO temos parceria com nenhuma empresa ou usuário.
                <br/><br/>
                Você fica CIENTE e ASSUME toda responsabilidade entre as partes
                nessa conversa.
              </p>

              {/* Pergunta */}
              <p className="text-center font-bold text-gray-900 mb-6">
                Você está ciente e deseja continuar?
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={fecharModal}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={abrirWhatsApp}
                  className="flex-1 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all"
                >
                  Estou Ciente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2 } from "lucide-react";
import { usePushNotifications } from "@/components/hooks/usePushNotifications";

export default function PushPermission({ onClose, onSuccess }) {
  const { requestPermission, loading, error, isSupported } = usePushNotifications();
  const [step, setStep] = useState('request'); // 'request', 'success', 'denied'

  if (!isSupported) {
    return null; // Navegador não suporta push notifications
  }

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } else {
      setStep('denied');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
        >
          {step === 'request' && (
            <>
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Ativar Notificações</h3>
                <p className="text-white/90">Receba alertas sobre vagas, candidaturas e mensagens</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>🔔 Você será notificado sobre:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                    <li>• Novas vagas compatíveis com seu perfil</li>
                    <li>• Candidaturas recebidas</li>
                    <li>• Mensagens no chat</li>
                    <li>• Atualizações importantes</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all"
                  >
                    Agora Não
                  </button>
                  <button
                    onClick={handleRequestPermission}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Ativando...
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        Ativar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Notificações Ativadas!</h3>
              <p className="text-gray-600">Você receberá alertas sobre oportunidades</p>
            </div>
          )}

          {step === 'denied' && (
            <>
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Permissão Negada</h3>
                <p className="text-gray-600 mb-4">
                  Para ativar notificações, você precisa permitir nas configurações do navegador
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
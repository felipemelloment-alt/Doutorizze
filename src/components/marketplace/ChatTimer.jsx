import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatTimer({ expiraEm }) {
  const [tempoRestante, setTempoRestante] = useState("");
  const [horasRestantes, setHorasRestantes] = useState(48);
  const [expirado, setExpirado] = useState(false);

  useEffect(() => {
    const calcular = () => {
      const agora = new Date();
      const expiracao = new Date(expiraEm);
      const diff = expiracao - agora;

      if (diff <= 0) {
        setExpirado(true);
        setTempoRestante("Expirado");
        setHorasRestantes(0);
        return;
      }

      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setHorasRestantes(horas);
      setTempoRestante(`${horas}h ${minutos}m`);
    };

    calcular();
    const interval = setInterval(calcular, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [expiraEm]);

  if (expirado) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-bold text-red-900">Chat Expirado</p>
            <p className="text-sm text-red-700">Este chat está encerrado após 48 horas</p>
          </div>
        </div>
      </div>
    );
  }

  const urgente = horasRestantes < 6;

  return (
    <motion.div
      animate={urgente ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: urgente ? Infinity : 0, duration: 1.5 }}
      className={`rounded-xl p-4 border-2 ${
        urgente 
          ? 'bg-orange-50 border-orange-300' 
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Clock className={`w-6 h-6 ${urgente ? 'text-orange-600' : 'text-blue-600'}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600">
            {urgente ? '⚠️ Chat expirando em breve' : 'Tempo restante'}
          </p>
          <p className={`text-xl font-black ${urgente ? 'text-orange-600' : 'text-blue-600'}`}>
            {tempoRestante}
          </p>
        </div>
      </div>

      {urgente && (
        <p className="text-xs text-orange-700 mt-2">
          Finalize a negociação logo ou o chat será encerrado
        </p>
      )}
    </motion.div>
  );
}
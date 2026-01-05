import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TimerConfirmacao({ expiraEm, onExpired }) {
  const [tempoRestante, setTempoRestante] = useState("");
  const [percentual, setPercentual] = useState(100);
  const [urgente, setUrgente] = useState(false);

  useEffect(() => {
    const calcularTempo = () => {
      const agora = new Date();
      const expiracao = new Date(expiraEm);
      const diff = expiracao - agora;

      if (diff <= 0) {
        setTempoRestante("EXPIRADO");
        setPercentual(0);
        if (onExpired) onExpired();
        return;
      }

      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);

      setTempoRestante(`${horas}h ${minutos}m ${segundos}s`);
      
      // Calcular percentual (1 hora = 100%)
      const totalMs = 60 * 60 * 1000;
      const percent = (diff / totalMs) * 100;
      setPercentual(Math.max(0, Math.min(100, percent)));

      // Marcar como urgente se faltam menos de 15 minutos
      setUrgente(diff < 15 * 60 * 1000);
    };

    calcularTempo();
    const interval = setInterval(calcularTempo, 1000);

    return () => clearInterval(interval);
  }, [expiraEm, onExpired]);

  if (tempoRestante === "EXPIRADO") {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <p className="font-black text-red-900 text-lg">Tempo Esgotado!</p>
            <p className="text-sm text-red-700">A vaga será oferecida ao próximo candidato</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ scale: urgente ? [1, 1.02, 1] : 1 }}
      transition={{ repeat: urgente ? Infinity : 0, duration: 1 }}
      className={`rounded-2xl p-6 border-2 ${
        urgente 
          ? 'bg-red-50 border-red-400' 
          : percentual < 50 
            ? 'bg-orange-50 border-orange-300'
            : 'bg-blue-50 border-blue-300'
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <Clock className={`w-8 h-8 ${urgente ? 'text-red-600' : 'text-blue-600'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {urgente ? '🚨 URGENTE - Confirme agora!' : 'Tempo para confirmar'}
          </p>
          <p className={`text-3xl font-black ${urgente ? 'text-red-600' : 'text-blue-600'}`}>
            {tempoRestante}
          </p>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentual}%` }}
          className={`h-full ${
            urgente 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : percentual < 50
                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                : 'bg-gradient-to-r from-blue-400 to-blue-500'
          }`}
        />
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        {urgente 
          ? '⚠️ Faltam menos de 15 minutos!' 
          : 'Se não confirmar a tempo, a vaga vai para o próximo da fila'}
      </p>
    </motion.div>
  );
}
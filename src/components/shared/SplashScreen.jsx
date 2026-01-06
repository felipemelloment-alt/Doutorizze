import React from "react";
import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500"
    >
      {/* Logo/Texto Principal - SEM animação complexa */}
      <div className="text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-black text-white mb-2 text-shadow-lg">
          Doutorizze
        </h1>
        <p className="text-white/90 text-xl font-semibold">
          Conectando profissionais de saúde
        </p>
      </div>

      {/* Spinner simples e rápido */}
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </motion.div>
  );
}
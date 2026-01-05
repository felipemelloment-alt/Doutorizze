import React from "react";
import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500"
    >
      {/* Logo/Texto Principal */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl md:text-7xl font-black text-white mb-2 text-shadow-lg">
          Doutorizze
        </h1>
        <p className="text-white/90 text-xl font-semibold">
          Conectando profissionais de saúde
        </p>
      </motion.div>

      {/* Animação de Loading - Dots */}
      <div className="flex gap-2 mb-12">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeInOut"
            }}
            className="w-4 h-4 bg-white rounded-full shadow-lg"
          />
        ))}
      </div>

      {/* Versão do App */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 text-white/70 text-sm font-semibold"
      >
        v1.0.0
      </motion.div>

      {/* Elementos Decorativos */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "linear"
        }}
        className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 25,
          ease: "linear"
        }}
        className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"
      />
    </motion.div>
  );
}
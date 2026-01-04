import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Briefcase, MapPin, CheckCircle } from "lucide-react";

export default function PhoneMockup() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      {/* Notificação flutuante - Match */}
      <motion.div
        className="absolute -top-4 -left-8 z-20"
        animate={{
          y: [0, -10, 0],
          rotate: [-2, 2, -2]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">Match 98%!</span>
        </div>
      </motion.div>

      {/* Notificação flutuante - Nova Vaga */}
      <motion.div
        className="absolute -bottom-2 -right-6 z-20"
        animate={{
          y: [0, 8, 0],
          rotate: [2, -2, 2]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span className="text-sm font-bold">Nova vaga!</span>
        </div>
      </motion.div>

      {/* Celular com efeito 3D */}
      <motion.div
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        {/* Frame do celular */}
        <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] border-4 border-slate-700 shadow-2xl shadow-purple-500/20 overflow-hidden">
          {/* Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

          {/* Tela */}
          <div className="absolute inset-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] overflow-hidden">
            {/* Header do app */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 pt-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500" />
                <span className="text-white font-bold text-sm">DOUTORIZZE</span>
              </div>
              <div className="bg-slate-800/50 rounded-full px-3 py-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-400/50" />
                <span className="text-slate-400 text-xs">Buscar vagas...</span>
              </div>
            </div>

            {/* Cards de profissionais */}
            <div className="p-3 space-y-3">
              <MiniCard
                name="Dr. João Silva"
                specialty="Ortodontia"
                location="São Paulo"
                rating={5}
              />
              <MiniCard
                name="Dra. Maria Santos"
                specialty="Endodontia"
                location="Rio de Janeiro"
                rating={5}
              />
              <MiniCard
                name="Dr. Pedro Costa"
                specialty="Implantes"
                location="Belo Horizonte"
                rating={4}
              />
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 flex justify-around">
                {['🏠', '🔍', '💼', '👤'].map((icon, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      i === 0 ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-slate-700/50'
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reflexo de luz */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[3rem] pointer-events-none" />
        </div>

        {/* Sombra 3D */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[20px] bg-purple-500/30 blur-xl rounded-full"
          style={{
            transform: `translateX(-50%) translateX(${mousePosition.x * 2}px)`
          }}
        />
      </motion.div>
    </div>
  );
}

function MiniCard({ name, specialty, location, rating }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {name.split(' ')[1]?.[0] || name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-xs truncate">{name}</p>
          <p className="text-cyan-400 text-[10px]">{specialty}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-2 h-2 text-slate-400" />
            <span className="text-slate-400 text-[10px]">{location}</span>
            <div className="flex ml-2">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-green-400" />
        </div>
      </div>
    </div>
  );
}
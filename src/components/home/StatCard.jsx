import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function StatCard({ icon: Icon, value, label, color, delay = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && value > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const gradients = {
    cyan: "from-cyan-500 to-cyan-400",
    magenta: "from-pink-500 to-fuchsia-400",
    purple: "from-purple-500 to-violet-400"
  };

  const glows = {
    cyan: "shadow-cyan-500/30",
    magenta: "shadow-pink-500/30",
    purple: "shadow-purple-500/30"
  };

  const borderColors = {
    cyan: "hover:border-cyan-500/50",
    magenta: "hover:border-pink-500/50",
    purple: "hover:border-purple-500/50"
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`
        relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 
        border border-slate-700/50 ${borderColors[color]}
        transition-all duration-300 group cursor-pointer
        hover:shadow-xl ${glows[color]}
      `}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[color]} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />

      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${gradients[color]} flex items-center justify-center mb-4 shadow-lg ${glows[color]}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        <p className="text-4xl font-black text-white mb-1">
          {count.toLocaleString('pt-BR')}+
        </p>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
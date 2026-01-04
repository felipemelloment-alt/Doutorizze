import React from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, Briefcase, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FeaturedJobCard({ job, unit, delay = 0 }) {
  const navigate = useNavigate();

  const tipoVagaLabels = {
    PLANTAO: "Plantão",
    FIXO: "Fixo",
    SUBSTITUICAO: "Substituição",
    TEMPORARIO: "Temporário"
  };

  const tipoVagaColors = {
    PLANTAO: "from-orange-500 to-amber-500",
    FIXO: "from-green-500 to-emerald-500",
    SUBSTITUICAO: "from-blue-500 to-cyan-500",
    TEMPORARIO: "from-purple-500 to-violet-500"
  };

  const isUrgente = job.tipo_vaga === "PLANTAO" || job.tipo_vaga === "SUBSTITUICAO";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => navigate(createPageUrl("DetalheVaga") + `?id=${job.id}`)}
      className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Neon border glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl" />
        <div className="absolute inset-[1px] bg-slate-900/90 rounded-2xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-slate-700/50">
              <span className="text-xl">
                {unit?.nome_fantasia?.[0]?.toUpperCase() || "🏥"}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold truncate max-w-[180px]">{job.titulo}</h3>
              <p className="text-slate-400 text-sm truncate max-w-[180px]">
                {unit?.nome_fantasia || "Clínica"}
              </p>
            </div>
          </div>
          {isUrgente && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full border border-red-500/30">
              <Zap className="w-3 h-3 text-red-400 fill-red-400" />
              <span className="text-red-400 text-xs font-bold">Urgente</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${tipoVagaColors[job.tipo_vaga] || tipoVagaColors.FIXO}`}>
            {tipoVagaLabels[job.tipo_vaga] || job.tipo_vaga}
          </span>
          {job.especialidades_aceitas?.[0] && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30">
              {job.especialidades_aceitas[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4 text-pink-400" />
            <span>{job.cidade} - {job.uf}</span>
          </div>
          {job.valor_proposto ? (
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <DollarSign className="w-4 h-4" />
              <span>R$ {job.valor_proposto.toLocaleString('pt-BR')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-cyan-400">
              <DollarSign className="w-4 h-4" />
              <span>A combinar</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-purple-400">
          Ver Detalhes
        </button>
      </div>
    </motion.div>
  );
}
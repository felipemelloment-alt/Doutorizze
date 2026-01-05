import React from "react";
import { Shield, Star } from "lucide-react";

export default function ScoreBadge({ score, tipo = "qualidade", size = "md" }) {
  const getColorClass = (value) => {
    if (value >= 80) return "from-green-400 to-green-600";
    if (value >= 60) return "from-yellow-400 to-orange-500";
    if (value >= 40) return "from-orange-400 to-red-500";
    return "from-red-400 to-red-600";
  };

  const getLabel = () => {
    if (score >= 80) return tipo === "qualidade" ? "Excelente" : "Confiável";
    if (score >= 60) return tipo === "qualidade" ? "Bom" : "Verificado";
    if (score >= 40) return tipo === "qualidade" ? "Regular" : "Básico";
    return tipo === "qualidade" ? "Simples" : "Novo";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${getColorClass(score)} text-white font-bold rounded-full ${sizeClasses[size]} shadow-md`}>
      {tipo === "qualidade" ? <Star className={iconSize} /> : <Shield className={iconSize} />}
      <span>{getLabel()}</span>
      <span className="opacity-80">{score}%</span>
    </div>
  );
}
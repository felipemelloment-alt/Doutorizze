import React, { useRef, useState, useEffect } from "react";
import { MapPin, Clock, DollarSign, Zap } from "lucide-react";
import { formatarTextoData } from "@/components/constants/substituicao";

/**
 * 🎬 STORIES DE SUBSTITUIÇÕES
 * 
 * - Para CLÍNICAS: Mostra profissionais ONLINE disponíveis (com match de cidade)
 * - Para PROFISSIONAIS: Mostra vagas abertas de substituição (com match)
 * - Separado por área (ODONTOLOGIA vs MEDICINA)
 */

export default function SubstituicoesStories({ items, userType, onItemClick }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicar itens 2x para loop infinito
  const duplicatedItems = [...items, ...items];

  // Auto-scroll INFINITO SEAMLESS
  useEffect(() => {
    if (!scrollRef.current || isPaused || items.length === 0) return;

    const container = scrollRef.current;
    
    const animate = () => {
      if (!container || isPaused) return;
      
      container.scrollLeft += 0.5;
      
      const singleSetWidth = container.scrollWidth / 2;
      
      if (container.scrollLeft >= singleSetWidth) {
        container.scrollLeft = 0;
      }
    };

    const interval = setInterval(animate, 20);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => {
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (items.length === 0) return null;

  const titulo = userType === "CLINICA" 
    ? "⚡ DENTISTAS/MÉDICOS ONLINE - SUBSTITUIÇÕES ⚡"
    : "⚡ CLÍNICAS BUSCANDO SUBSTITUTOS - URGENTE ⚡";

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-3 mb-3 shadow-lg">
      {/* Título */}
      <div className="px-4 mb-2">
        <h2 className="text-center font-black text-xs text-white tracking-wide uppercase animate-pulse">
          {titulo}
        </h2>
      </div>

      {/* Carrossel SEM BARRA DE SCROLL */}
      <div
        ref={scrollRef}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        className="flex gap-4 px-4 overflow-x-auto"
        style={{ 
          scrollBehavior: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {duplicatedItems.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            onClick={() => onItemClick(item)}
            className="flex-shrink-0 w-[140px] bg-white rounded-2xl p-3 border-3 border-yellow-400 hover:border-red-500 transition-all active:scale-95 shadow-xl hover:shadow-2xl ring-2 ring-yellow-300"
          >
            {/* Badge Identificação - SEMPRE VISÍVEL */}
            <div className={`flex items-center justify-center gap-1 mb-2 px-2 py-1 rounded-full ${
              item.isUrgente 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
            }`}>
              <Zap className="w-3 h-3" />
              <span className="text-[9px] font-black">
                {item.isUrgente ? "URGENTE AGORA" : "SUBSTITUIÇÃO"}
              </span>
            </div>

            {/* Foto circular */}
            <div className="relative mb-2 mx-auto">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-r from-yellow-400 to-orange-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {item.nome?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Badge Online (apenas profissionais) */}
              {userType === "CLINICA" && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Nome */}
            <div className="text-center mb-2">
              <h3 className="text-xs font-black text-gray-900 truncate leading-tight">
                {item.nome}
              </h3>
              <p className="text-[10px] text-yellow-600 font-bold truncate">
                {item.especialidade}
              </p>
            </div>

            {/* Localização */}
            <div className="flex items-center justify-center gap-1 mb-2 px-2 py-1 bg-white rounded-lg">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="text-[9px] text-gray-700 font-semibold truncate">
                {item.cidade}/{item.uf}
              </span>
            </div>

            {/* Info Extra */}
            {userType === "PROFISSIONAL" && (
              <>
                {/* Data */}
                {item.dataTexto && (
                  <div className="flex items-center gap-1 mb-1 text-[9px] text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span className="truncate">{item.dataTexto}</span>
                  </div>
                )}
                
                {/* Remuneração */}
                {item.remuneracao && (
                  <div className="flex items-center gap-1 text-[9px] text-green-600 font-bold">
                    <DollarSign className="w-3 h-3" />
                    <span className="truncate">{item.remuneracao}</span>
                  </div>
                )}
              </>
            )}

            {/* Badge Status (profissionais) */}
            {userType === "CLINICA" && item.statusBadge && (
              <div className={`mt-2 px-2 py-1 rounded-full text-center ${
                item.statusBadge === "ONLINE" 
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                <span className="text-[9px] font-bold">{item.statusBadge}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
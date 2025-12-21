import React, { useRef, useState, useEffect } from "react";
import { MapPin } from "lucide-react";

/**
 * Stories Unificado - Substituições + Vagas Fixas em um único carrossel
 */
export default function StoriesUnificado({ substituicoes, vagas, userType, onSubstituicaoClick, onVagaClick }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Combinar todos os itens
  const allItems = [
    ...substituicoes.map(item => ({ ...item, tipo: 'substituicao' })),
    ...vagas.map(item => ({ ...item, tipo: 'vaga' }))
  ];

  // Duplicar para loop infinito
  const duplicatedItems = [...allItems, ...allItems];

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current || isPaused || allItems.length === 0) return;

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
  }, [isPaused, allItems.length]);

  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => setTimeout(() => setIsPaused(false), 3000);

  if (allItems.length === 0) return null;

  return (
    <div className="relative overflow-hidden py-3 px-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      {/* Carrossel */}
      <div
        ref={scrollRef}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        className="flex gap-2.5 overflow-x-auto relative z-10"
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
            onClick={() => {
              if (String(item.id).includes('-dup-')) {
                const realId = String(item.id).split('-dup-')[0];
                item.tipo === 'substituicao' 
                  ? onSubstituicaoClick({ ...item, id: realId })
                  : onVagaClick({ ...item, id: realId });
              } else {
                item.tipo === 'substituicao' 
                  ? onSubstituicaoClick(item)
                  : onVagaClick(item);
              }
            }}
            className="flex-shrink-0 w-[90px] bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-lg hover:shadow-2xl transition-all active:scale-95 hover:bg-white"
          >
            {/* Badge Localização compacto */}
            <div className="flex items-center justify-center gap-0.5 mb-1.5 px-1.5 py-0.5 bg-gray-900/90 rounded-md">
              <MapPin className="w-2.5 h-2.5 text-red-500" />
              <span className="text-[8px] text-pink-400 font-bold truncate">
                {item.cidade}-{item.uf}
              </span>
            </div>

            {/* Foto Circular compacta */}
            <div className="relative mb-1.5 mx-auto">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white">
                {item.foto ? (
                  <img
                    src={item.foto}
                    alt={item.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {item.nome?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nome compacto */}
            <h3 className="text-[10px] font-black text-gray-900 truncate text-center leading-tight mb-0.5">
              {item.nome}
            </h3>

            {/* Especialidade compacta */}
            <p className="text-[8px] text-gray-600 font-semibold truncate text-center mb-1.5">
              {item.especialidade}
            </p>

            {/* Badge Tipo compacto */}
            <div className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-gray-900/90 rounded-md ${
              item.tipo === 'substituicao'
                ? 'text-orange-400'
                : 'text-blue-400'
            }`}>
              <span className="text-[8px] font-bold truncate">
                {item.tipo === 'substituicao' ? 'URGENTE' : 'VAGA'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
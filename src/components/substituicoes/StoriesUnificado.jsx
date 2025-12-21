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
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 py-4 px-4 mb-4">
      {/* Carrossel */}
      <div
        ref={scrollRef}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        className="flex gap-3 overflow-x-auto"
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
            className="flex-shrink-0 w-[110px] bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {/* Badge Localização */}
            <div className="flex items-center justify-center gap-1 mb-2 px-2 py-1 bg-purple-100 rounded-full">
              <MapPin className="w-3 h-3 text-purple-600" />
              <span className="text-[9px] text-purple-900 font-bold truncate">
                {item.cidade} - {item.uf}
              </span>
            </div>

            {/* Foto Circular */}
            <div className="relative mb-2 mx-auto">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                {item.foto ? (
                  <img
                    src={item.foto}
                    alt={item.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {item.nome?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nome */}
            <h3 className="text-xs font-black text-gray-900 truncate text-center mb-1">
              {item.nome}
            </h3>

            {/* Especialidade */}
            <p className="text-[10px] text-gray-600 font-bold truncate text-center mb-2">
              {item.especialidade}
            </p>

            {/* Badge Tipo */}
            <div className={`px-2 py-1 rounded-full text-center ${
              item.tipo === 'substituicao'
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-blue-500 text-white'
            }`}>
              <span className="text-[9px] font-black uppercase">
                {item.tipo === 'substituicao' ? 'SUBSTITUIÇÃO' : 'VAGA FIXA'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Header padronizado para páginas
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  emoji,
  stats,
  actions,
  onBack,
  gradient = 'from-yellow-400 via-orange-500 to-pink-500'
}) {
  const navigate = useNavigate();

  return (
    <div className={`bg-gradient-to-r ${gradient} pt-8 pb-24 px-4 relative overflow-hidden`}>
      {/* Decoração */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Botão Voltar */}
        {onBack && (
          <button
            onClick={() => typeof onBack === 'function' ? onBack() : navigate(-1)}
            className="flex items-center gap-2 text-white font-semibold mb-4 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Ícone Grande */}
            {(Icon || emoji) && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg flex-shrink-0">
                {emoji ? (
                  <span className="text-4xl md:text-5xl">{emoji}</span>
                ) : (
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                )}
              </div>
            )}

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/90 text-lg">{subtitle}</p>
              )}
              
              {/* Stats inline */}
              {stats && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {stats.map((stat, index) => (
                    <span key={index} className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm">
                      {stat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex gap-2 w-full md:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
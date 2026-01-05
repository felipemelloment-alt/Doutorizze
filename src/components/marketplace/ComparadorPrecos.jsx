import React from "react";
import { TrendingDown, Flame, Tag } from "lucide-react";
import { motion } from "framer-motion";

export default function ComparadorPrecos({ item }) {
  const { preco, preco_com_desconto, preco_mercado } = item;

  // Calcular economia
  const precoFinal = preco_com_desconto || preco;
  const economiaReais = preco_mercado ? (preco_mercado - precoFinal) : 0;
  const economiaPercent = preco_mercado ? ((economiaReais / preco_mercado) * 100) : 0;

  // Super promoção = mais de 30% de desconto OU R$1000+ de economia
  const isSuperPromocao = economiaPercent >= 30 || economiaReais >= 1000;

  // Verificar se tem desconto aplicado
  const temDesconto = preco_com_desconto && preco_com_desconto < preco;

  return (
    <div className="space-y-3">
      {/* Preço Principal */}
      <div className="flex items-baseline gap-3">
        {temDesconto && (
          <span className="text-2xl text-gray-400 line-through font-semibold">
            R$ {preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className="text-4xl font-black text-gray-900">
          R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        {temDesconto && (
          <span className="px-3 py-1 bg-red-500 text-white font-bold rounded-lg text-sm">
            -{(((preco - preco_com_desconto) / preco) * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Campo Promocional */}
      {item.campo_promocional && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
        >
          <Flame className="w-5 h-5" />
          {item.campo_promocional}
        </motion.div>
      )}

      {/* Comparação com Mercado */}
      {preco_mercado && economiaReais > 0 && (
        <div className={`rounded-2xl p-4 border-2 ${
          isSuperPromocao 
            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300' 
            : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isSuperPromocao ? (
                <>
                  <Flame className="w-6 h-6 text-red-600" />
                  <span className="font-black text-red-600 text-lg">SUPER PROMOÇÃO!</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Abaixo do Mercado</span>
                </>
              )}
            </div>
            {isSuperPromocao && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-2xl"
              >
                🔥
              </motion.div>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Preço de mercado:</span>
              <span className="font-semibold text-gray-700">
                R$ {preco_mercado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Você economiza:</span>
              <span className={`font-black text-lg ${isSuperPromocao ? 'text-red-600' : 'text-green-600'}`}>
                R$ {economiaReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({economiaPercent.toFixed(0)}%)
              </span>
            </div>
          </div>

          {isSuperPromocao && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs text-red-700 font-bold text-center">
                ⚡ Economia excepcional! Aproveite antes que acabe!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Badge de Desconto */}
      {!preco_mercado && temDesconto && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 flex items-center gap-2">
          <Tag className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-bold text-yellow-700">
            Desconto de R$ {(preco - preco_com_desconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
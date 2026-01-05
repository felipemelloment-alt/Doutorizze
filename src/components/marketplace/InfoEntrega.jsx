import React from "react";
import { Truck, CreditCard, MapPin, Package } from "lucide-react";

export default function InfoEntrega({ item }) {
  const coberturaLabels = {
    LOCAL: "Entrega local",
    ESTADUAL: "Todo o estado",
    REGIONAL: "Região",
    NACIONAL: "Todo Brasil"
  };

  const formaPagamentoLabels = {
    PIX: "PIX",
    DINHEIRO: "Dinheiro",
    CARTAO_CREDITO: "Cartão de Crédito",
    CARTAO_DEBITO: "Cartão de Débito",
    BOLETO: "Boleto",
    TRANSFERENCIA: "Transferência",
    PARCELADO: "Parcelado"
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
        <Package className="w-6 h-6 text-blue-600" />
        Entrega e Pagamento
      </h3>

      {/* Informações de Frete */}
      {item.informacoes_frete && (
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">Frete</span>
          </div>
          
          {item.informacoes_frete.frete_gratis ? (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-center mb-2">
              🎉 FRETE GRÁTIS
            </div>
          ) : item.informacoes_frete.valor_frete ? (
            <p className="text-gray-700">
              <span className="font-semibold">Valor: </span>
              R$ {item.informacoes_frete.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ) : (
            <p className="text-gray-600 text-sm">A combinar</p>
          )}

          {item.informacoes_frete.prazo_entrega && (
            <p className="text-gray-700 text-sm mt-1">
              <span className="font-semibold">Prazo: </span>
              {item.informacoes_frete.prazo_entrega}
            </p>
          )}

          {item.informacoes_frete.observacoes && (
            <p className="text-gray-600 text-sm mt-2">
              {item.informacoes_frete.observacoes}
            </p>
          )}
        </div>
      )}

      {/* Cobertura de Entrega */}
      {item.cobertura_entrega && (
        <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-4">
          <MapPin className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Cobertura</p>
            <p className="font-bold text-gray-900">{coberturaLabels[item.cobertura_entrega]}</p>
          </div>
        </div>
      )}

      {/* Formas de Pagamento */}
      {item.formas_pagamento && item.formas_pagamento.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900">Formas de Pagamento</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.formas_pagamento.map((forma, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold"
              >
                {formaPagamentoLabels[forma] || forma}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
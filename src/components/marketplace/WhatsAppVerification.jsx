import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppVerification({ telefone, onVerified }) {
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState("inicial"); // inicial, codigo_enviado, verificado
  const [loading, setLoading] = useState(false);

  const enviarCodigo = async () => {
    setLoading(true);
    // Simular envio de código (em produção, chamar API)
    setTimeout(() => {
      setEtapa("codigo_enviado");
      setLoading(false);
      toast.success("Código enviado para seu WhatsApp!");
    }, 1000);
  };

  const verificarCodigo = async () => {
    setLoading(true);
    // Simular verificação (em produção, validar código)
    setTimeout(() => {
      if (codigo.length === 6) {
        setEtapa("verificado");
        setLoading(false);
        toast.success("✅ WhatsApp verificado com sucesso!");
        onVerified(true);
      } else {
        setLoading(false);
        toast.error("Código inválido");
      }
    }, 1000);
  };

  if (etapa === "verificado") {
    return (
      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-green-700">WhatsApp Verificado</p>
          <p className="text-sm text-green-600">({telefone?.slice(0, 2)}) {telefone?.slice(2, 7)}-{telefone?.slice(7)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {etapa === "inicial" && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-gray-900 mb-1">Verificação Recomendada</p>
              <p className="text-sm text-gray-700 mb-3">
                Anúncios com WhatsApp verificado têm maior visibilidade e confiança dos compradores.
              </p>
              <p className="text-sm text-gray-600">
                Número: ({telefone?.slice(0, 2)}) {telefone?.slice(2, 7)}-{telefone?.slice(7)}
              </p>
            </div>
          </div>
          <Button
            onClick={enviarCodigo}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:shadow-lg"
          >
            <Phone className="w-4 h-4 mr-2" />
            {loading ? "Enviando..." : "Verificar WhatsApp"}
          </Button>
        </div>
      )}

      {etapa === "codigo_enviado" && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 mb-1">Código Enviado!</p>
              <p className="text-sm text-gray-700">Digite o código de 6 dígitos que enviamos para seu WhatsApp</p>
            </div>
          </div>
          
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-center text-2xl font-bold tracking-widest"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => setEtapa("inicial")}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={verificarCodigo}
              disabled={codigo.length !== 6 || loading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600"
            >
              {loading ? "Verificando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
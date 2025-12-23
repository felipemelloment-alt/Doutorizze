import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Phone, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function WhatsAppVerificationSection({ user, onVerified }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState("input"); // input | aguardando | verificando
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.whatsapp_e164) {
      setWhatsapp(formatarWhatsApp(user.whatsapp_e164.replace("+55", "")));
    }
  }, [user]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatarWhatsApp = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e) => {
    const valor = e.target.value;
    setWhatsapp(formatarWhatsApp(valor));
  };

  const enviarCodigo = async () => {
    const numerosApenas = whatsapp.replace(/\D/g, "");
    
    if (numerosApenas.length !== 11) {
      toast.error("WhatsApp deve ter 11 dígitos");
      return;
    }

    setLoading(true);
    try {
      const whatsappE164 = `+55${numerosApenas}`;
      
      // Chamar backend function segura (OTP gerado no servidor)
      const response = await base44.functions.invoke('sendWhatsAppOTP', {
        whatsapp_e164: whatsappE164
      });

      if (response.data?.error) {
        toast.error(response.data.error);
        if (response.data.retry_after) {
          setCountdown(response.data.retry_after);
        }
        setLoading(false);
        return;
      }
      
      toast.success(response.data?.message || "Código enviado!");
      setEtapa("aguardando");
      setCountdown(60);
    } catch (error) {
      toast.error("Erro ao enviar código: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const verificarCodigo = async () => {
    if (codigo.length !== 6) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      const numerosApenas = whatsapp.replace(/\D/g, "");
      const whatsappE164 = `+55${numerosApenas}`;

      // Chamar backend function segura (validação com hash no servidor)
      const response = await base44.functions.invoke('verifyWhatsAppOTP', {
        whatsapp_e164: whatsappE164,
        codigo: codigo
      });

      if (response.data?.error) {
        toast.error(response.data.error);
        
        if (response.data.code === 'OTP_EXPIRED' || response.data.code === 'MAX_ATTEMPTS') {
          setEtapa("input");
        }
        
        if (response.data.code === 'INVALID_OTP') {
          setCodigo("");
        }
        
        setLoading(false);
        return;
      }

      // Sucesso!
      toast.success("✅ WhatsApp verificado com sucesso!");
      setEtapa("verificado");
      if (onVerified) onVerified(whatsappE164);
    } catch (error) {
      toast.error("Erro ao verificar: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  if (user?.whatsapp_verified && etapa !== "verificado") {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">WhatsApp Verificado</p>
            <p className="text-sm text-gray-600">{user.whatsapp_e164}</p>
          </div>
        </div>
        <button
          onClick={() => setEtapa("input")}
          className="text-sm text-green-700 font-semibold hover:underline"
        >
          Alterar número
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">Verificar WhatsApp</p>
          <p className="text-sm text-gray-600">Use em anúncios do Marketplace</p>
        </div>
      </div>

      {etapa === "input" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número do WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={handleWhatsAppChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
            />
          </div>

          <button
            onClick={enviarCodigo}
            disabled={loading || countdown > 0}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : countdown > 0 ? (
              <>
                <Clock className="w-5 h-5" />
                Aguarde {countdown}s
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Código
              </>
            )}
          </button>
        </div>
      )}

      {etapa === "aguardando" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Código enviado para {whatsapp}</p>
                <p>Verifique suas mensagens no WhatsApp e digite o código abaixo.</p>
                <p className="text-xs mt-2 text-blue-600">⏱️ O código expira em 10 minutos</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Verificação</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold tracking-wider focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setEtapa("input");
                setCodigo("");
              }}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Alterar Número
            </button>
            <button
              onClick={verificarCodigo}
              disabled={loading || codigo.length !== 6}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {countdown > 0 ? (
            <p className="text-xs text-center text-gray-500">Reenviar código em {countdown}s</p>
          ) : (
            <button
              onClick={enviarCodigo}
              disabled={loading}
              className="w-full text-sm text-green-600 font-semibold hover:underline"
            >
              Reenviar código
            </button>
          )}
        </div>
      )}

      {etapa === "verificado" && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg mb-1">WhatsApp Verificado!</p>
          <p className="text-sm text-gray-600">Agora você pode usar este número em seus anúncios</p>
        </div>
      )}
    </div>
  );
}
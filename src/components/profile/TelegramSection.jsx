import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { MessageCircle, Copy, CheckCircle2, ExternalLink, Sparkles, RefreshCw } from "lucide-react";

export default function TelegramSection({ user }) {
  const [codigo, setCodigo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [jaUsado, setJaUsado] = useState(false);

  // Verificar se já tem código ativo
  useEffect(() => {
    const verificarCodigoExistente = async () => {
      if (!user?.id) return;
      
      try {
        const codigos = await base44.entities.TelegramAccess.filter({
          user_id: user.id
        });

        if (codigos.length > 0) {
          const codigoAtivo = codigos.find(c => !c.usado && new Date(c.expires_at) > new Date());
          const codigoUsado = codigos.find(c => c.usado);
          
          if (codigoUsado) {
            setJaUsado(true);
            setCodigo(codigoUsado.codigo);
          } else if (codigoAtivo) {
            setCodigo(codigoAtivo.codigo);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar código:", error);
      }
    };
    
    verificarCodigoExistente();
  }, [user?.id]);

  const gerarCodigo = async () => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setLoading(true);
    try {
      // Verificar se já tem código ativo
      const codigos = await base44.entities.TelegramAccess.filter({
        user_id: user.id,
        usado: false
      });

      const codigoAtivo = codigos.find(c => new Date(c.expires_at) > new Date());

      if (codigoAtivo) {
        // Já tem código válido, usar o existente
        setCodigo(codigoAtivo.codigo);
        toast.success("Código recuperado!");
      } else {
        // Gerar novo código via backend function
        const result = await base44.functions.invoke('gerarCodigoTelegram', {
          userId: user.id,
          nomeUsuario: user.full_name || "USER"
        });
        
        setCodigo(result.data.codigo);
        toast.success("Código gerado com sucesso!");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao gerar código: " + (error.message || "Tente novamente"));
    }
    setLoading(false);
  };

  const copiarCodigo = () => {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopiado(false), 3000);
  };

  // Se já usou, mostrar mensagem de sucesso
  if (jaUsado) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Você já faz parte!</h3>
            <p className="text-gray-600">Comunidade Doutorizze no Telegram</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4">
          <p className="text-gray-600 text-sm">Seu código utilizado:</p>
          <p className="text-lg font-bold text-green-600">{codigo}</p>
        </div>

        <a
          href="https://t.me/DoutorizzeBot"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[#0088cc] text-white font-black rounded-2xl hover:bg-[#0077b5] transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          ACESSAR COMUNIDADE
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-purple-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">Comunidade Doutorizze</h3>
          <p className="text-gray-600">Grupo exclusivo no Telegram</p>
        </div>
      </div>

      {/* Benefícios */}
      <div className="bg-white rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-gray-700">Dicas de IA para profissionais de saúde</span>
        </div>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-gray-700">Vídeos explicativos exclusivos</span>
        </div>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-gray-700">Networking com colegas</span>
        </div>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-gray-700">Novidades em primeira mão</span>
        </div>
      </div>

      {/* Área do código */}
      {!codigo ? (
        <button
          onClick={gerarCodigo}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Gerando...
            </>
          ) : (
            "GERAR CÓDIGO DE ACESSO"
          )}
        </button>
      ) : (
        <div className="space-y-4">
          {/* Código */}
          <div className="bg-white rounded-2xl p-4 border-2 border-purple-300">
            <p className="text-sm text-gray-600 mb-2">Seu código de acesso:</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-purple-600 tracking-wider">
                {codigo}
              </span>
              <button
                onClick={copiarCodigo}
                className="p-2 bg-purple-100 rounded-xl hover:bg-purple-200 transition-all"
              >
                {copiado ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Copy className="w-6 h-6 text-purple-600" />
                )}
              </button>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
            <h4 className="font-bold text-gray-900 mb-2">Como entrar:</h4>
            <ol className="text-sm text-gray-700 space-y-2">
              <li>1. Clique no botão abaixo para abrir o Telegram</li>
              <li>2. Envie seu código para o bot: <strong>{codigo}</strong></li>
              <li>3. O bot vai verificar e liberar seu acesso!</li>
            </ol>
          </div>

          {/* Botão Telegram */}
          <a
            href="https://t.me/DoutorizzeBot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#0088cc] text-white font-black rounded-2xl hover:bg-[#0077b5] transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            ABRIR TELEGRAM
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      )}
    </div>
  );
}
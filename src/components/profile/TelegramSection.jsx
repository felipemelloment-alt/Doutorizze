import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

export default function TelegramSection() {
  const [user, setUser] = useState(null);
  const [codigo, setCodigo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Verificar se já tem código ativo
        const acessos = await base44.entities.TelegramAccess.filter({
          user_id: currentUser.id,
          usado: false
        });
        
        if (acessos[0]) {
          const acesso = acessos[0];
          const dataExpiracao = new Date(acesso.expires_at);
          
          // Se ainda não expirou, mostra o código
          if (dataExpiracao > new Date()) {
            setCodigo(acesso.codigo);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };
    
    loadUser();
  }, []);

  const gerarCodigo = async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      // Chamar cloud function para gerar código
      const result = await base44.functions.invoke('gerarCodigoTelegram', {
        userId: user.id,
        nomeUsuario: user.full_name
      });

      if (result.data?.codigo) {
        setCodigo(result.data.codigo);
        toast.success('Código gerado com sucesso!');
      } else {
        throw new Error('Código não retornado');
      }
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      toast.error('Erro ao gerar código. Tente novamente.');
    }
    setLoading(false);
  };

  const copiarCodigo = () => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const abrirTelegram = () => {
    window.open('https://t.me/DoutorizzeBot', '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
          <Send className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Comunidade Telegram</h3>
          <p className="text-sm text-gray-600">Grupo exclusivo para profissionais</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Benefícios */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-900">🎯 O que você encontra:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Dicas exclusivas de IA para profissionais</li>
            <li>• Vídeos explicativos e tutoriais</li>
            <li>• Networking com outros profissionais</li>
            <li>• Novidades e atualizações em primeira mão</li>
          </ul>
        </div>

        {/* Código Gerado */}
        {codigo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-5 border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Código Gerado</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <p className="text-2xl font-mono font-bold text-center text-gray-900 tracking-wider">
                {codigo}
              </p>
            </div>

            <button
              onClick={copiarCodigo}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all mb-2"
            >
              {copiado ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Código
                </>
              )}
            </button>

            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-800 font-medium">
                📱 <strong>Próximo passo:</strong>
              </p>
              <ol className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                <li>1. Clique no botão abaixo</li>
                <li>2. Envie o código para o bot</li>
                <li>3. Pronto! Você entrará no grupo 🎉</li>
              </ol>
            </div>

            <button
              onClick={abrirTelegram}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              Abrir Telegram Bot
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Código válido por 30 dias
            </p>
          </motion.div>
        ) : (
          /* Gerar Código */
          <button
            onClick={gerarCodigo}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                GERAR CÓDIGO DE ACESSO
              </>
            )}
          </button>
        )}

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Importante:</strong> O código é pessoal e intransferível. Não compartilhe com terceiros.
          </p>
        </div>
      </div>
    </div>
  );
}
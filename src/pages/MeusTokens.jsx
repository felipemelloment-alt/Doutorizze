import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Copy,
  Shield
} from "lucide-react";

export default function MeusTokens() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro:", error);
      }
    };
    loadUser();
  }, []);

  const { data: tokenUsuario } = useQuery({
    queryKey: ['token-usuario', user?.id],
    queryFn: async () => {
      const tokens = await base44.entities.TokenUsuario.filter({ user_id: user.id });
      return tokens[0] || null;
    },
    enabled: !!user
  });

  const { data: tokensDesconto = [] } = useQuery({
    queryKey: ['tokens-desconto', user?.id],
    queryFn: async () => {
      return await base44.entities.TokenDesconto.filter({ user_id: user.id });
    },
    enabled: !!user
  });

  const handleCopyToken = () => {
    if (tokenUsuario?.token_id) {
      navigator.clipboard.writeText(tokenUsuario.token_id);
      toast.success("Token copiado!");
    }
  };

  const tokensAtivos = tokensDesconto.filter(t => t.status === 'ATIVO');
  const tokensUsados = tokensDesconto.filter(t => t.status === 'USADO' && t.negocio_fechado);
  const tokensExpirados = tokensDesconto.filter(t => t.status === 'EXPIRADO');

  if (!user || !tokenUsuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Ticket className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Meu Token Doutorizze</h1>
              <p className="text-sm text-gray-600">Seus descontos exclusivos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Token ID Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Seu Token ID</p>
                <p className="text-xs opacity-70">Use para receber descontos exclusivos</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-4">
              <p className="font-mono text-3xl font-black text-center tracking-wider">
                {tokenUsuario.token_id}
              </p>
            </div>

            <button
              onClick={handleCopyToken}
              className="w-full py-4 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copiar Token
            </button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-green-600">{tokenUsuario.creditos_usados}</p>
            <p className="text-sm text-gray-600 font-medium">Utilizados</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <Ticket className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-blue-600">{tokenUsuario.creditos_disponiveis}</p>
            <p className="text-sm text-gray-600 font-medium">Disponíveis</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-red-600">{tokenUsuario.creditos_perdidos}</p>
            <p className="text-sm text-gray-600 font-medium">Perdidos</p>
          </motion.div>
        </div>

        {/* Valor Economizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 border-2 border-green-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Economizado</p>
                <p className="text-4xl font-black text-green-600">
                  R$ {tokenUsuario.valor_economizado?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <Award className="w-20 h-20 text-green-300" />
          </div>
        </motion.div>

        {/* Tokens Ativos */}
        {tokensAtivos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Tokens Ativos ({tokensAtivos.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {tokensAtivos.map((token) => (
                <div key={token.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{token.parceiro_nome}</p>
                      <p className="text-sm text-gray-500">Código: {token.codigo}</p>
                    </div>
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold text-sm">
                      {token.desconto_tipo === 'PERCENTUAL' 
                        ? `${token.desconto_valor}% OFF` 
                        : `R$ ${token.desconto_valor} OFF`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <p className="text-gray-600">
                      Expira em: <span className="font-bold text-orange-600">
                        {new Date(token.data_validade).toLocaleString('pt-BR')}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Aviso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-bold mb-2">⚠️ Importante:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cada token tem validade de 48 horas</li>
                <li>Se fechar negócio, seu crédito é reposto</li>
                <li>Se não fechar, perde o crédito permanentemente</li>
                <li>Máximo 3 tentativas por parceiro</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
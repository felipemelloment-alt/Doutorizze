import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export default function MeusTokens() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: tokenUsuario } = useQuery({
    queryKey: ["tokenUsuario", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const tokens = await base44.entities.TokenUsuario.filter({ user_id: user.id });
      return tokens[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: tokensDesconto = [], isLoading } = useQuery({
    queryKey: ["tokensDesconto", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.TokenDesconto.filter({ user_id: user.id });
    },
    enabled: !!user?.id
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  const tokensAtivos = tokensDesconto.filter(t => t.status === 'ATIVO').length;
  const tokensUsados = tokensDesconto.filter(t => t.status === 'USADO' && t.negocio_fechado).length;
  const tokensPerdidos = tokensDesconto.filter(t => t.status === 'USADO' && !t.negocio_fechado).length;
  const tokensExpirados = tokensDesconto.filter(t => t.status === 'EXPIRADO').length;

  const creditosDisponiveis = tokenUsuario?.creditos_disponiveis || 3;
  const creditosUsados = tokenUsuario?.creditos_usados || 0;
  const creditosPerdidos = tokenUsuario?.creditos_perdidos || 0;
  const valorEconomizado = tokenUsuario?.valor_economizado || 0;

  const statusConfig = {
    ATIVO: { 
      label: "Ativo", 
      color: "bg-green-100 text-green-700 border-green-300", 
      icon: Clock,
      desc: "Use antes de expirar!" 
    },
    USADO: { 
      label: "Usado", 
      color: "bg-blue-100 text-blue-700 border-blue-300", 
      icon: CheckCircle2,
      desc: "Desconto aplicado" 
    },
    EXPIRADO: { 
      label: "Expirado", 
      color: "bg-red-100 text-red-700 border-red-300", 
      icon: XCircle,
      desc: "Passou da validade" 
    },
    CANCELADO: { 
      label: "Cancelado", 
      color: "bg-gray-100 text-gray-700 border-gray-300", 
      icon: XCircle,
      desc: "Cancelado pelo parceiro" 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">Meus Tokens Doutorizze</h1>
          <p className="text-white/80">Seus descontos exclusivos</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Resumo de Créditos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 shadow-xl mb-6 border-2 border-yellow-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Resumo de Créditos</h2>
              <p className="text-gray-600">Seu histórico de descontos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 text-center shadow">
              <div className="text-3xl font-black text-green-600 mb-1">{creditosDisponiveis}</div>
              <div className="text-sm text-gray-600">Disponíveis</div>
            </div>

            <div className="bg-white rounded-2xl p-4 text-center shadow">
              <div className="text-3xl font-black text-blue-600 mb-1">{creditosUsados}</div>
              <div className="text-sm text-gray-600">✅ Fechou</div>
            </div>

            <div className="bg-white rounded-2xl p-4 text-center shadow">
              <div className="text-3xl font-black text-red-600 mb-1">{creditosPerdidos}</div>
              <div className="text-sm text-gray-600">❌ Não Fechou</div>
            </div>

            <div className="bg-white rounded-2xl p-4 text-center shadow">
              <div className="text-3xl font-black text-purple-600 mb-1">
                R$ {valorEconomizado.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">💰 Economizado</div>
            </div>
          </div>
        </motion.div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <Clock className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-3xl font-black text-gray-900 mb-1">{tokensAtivos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <CheckCircle2 className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-3xl font-black text-gray-900 mb-1">{tokensUsados}</div>
            <div className="text-sm text-gray-600">Usados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <XCircle className="w-8 h-8 text-red-500 mb-2" />
            <div className="text-3xl font-black text-gray-900 mb-1">{tokensExpirados}</div>
            <div className="text-sm text-gray-600">Expirados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
            <div className="text-3xl font-black text-gray-900 mb-1">{tokensPerdidos}</div>
            <div className="text-sm text-gray-600">Não Fechou</div>
          </motion.div>
        </div>

        {/* Lista de Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
            <h2 className="text-2xl font-black text-white">Histórico de Tokens</h2>
          </div>

          <div className="p-6">
            {tokensDesconto.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">Você ainda não possui tokens de desconto</p>
                <p className="text-sm text-gray-400 mt-2">Solicite ao parceiro durante uma negociação</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tokensDesconto
                  .sort((a, b) => new Date(b.data_geracao) - new Date(a.data_geracao))
                  .map((token, index) => {
                    const config = statusConfig[token.status];
                    const StatusIcon = config.icon;
                    const valorDesconto = token.tipo_desconto === "PERCENTUAL"
                      ? `${token.valor_desconto}%`
                      : `R$ ${token.valor_desconto.toFixed(2)}`;

                    const horasRestantes = Math.max(0, 
                      Math.floor((new Date(token.data_validade) - new Date()) / (1000 * 60 * 60))
                    );

                    return (
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-6 rounded-2xl border-2 ${config.color} hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="w-8 h-8" />
                            <div>
                              <h3 className="font-black text-gray-900 text-lg">{token.parceiro_nome}</h3>
                              <p className="text-sm text-gray-600">{config.desc}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-purple-600">{valorDesconto}</div>
                            <p className="text-xs text-gray-500">off</p>
                          </div>
                        </div>

                        <div className="bg-white/50 rounded-xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Código:</span>
                            <code className="px-3 py-1 bg-gray-800 text-white rounded-lg font-mono font-bold">
                              {token.codigo}
                            </code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tentativa:</span>
                            <span className="font-bold text-gray-900">{token.tentativa_numero}ª</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Gerado em: {new Date(token.data_geracao).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={`font-bold ${token.status === 'ATIVO' && horasRestantes < 24 ? 'text-red-600' : 'text-gray-700'}`}>
                            {token.status === 'ATIVO' 
                              ? `⏰ ${horasRestantes}h restantes`
                              : `Expira: ${new Date(token.data_validade).toLocaleDateString('pt-BR')}`
                            }
                          </span>
                        </div>

                        {token.status === 'USADO' && (
                          <div className={`mt-3 p-3 rounded-xl ${
                            token.negocio_fechado 
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}>
                            <p className="text-sm font-bold">
                              {token.negocio_fechado ? "✅ Negócio fechado - Crédito reposto" : "❌ Não fechou - Crédito perdido"}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Informações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mt-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-2">Como funcionam os tokens?</p>
              <ul className="space-y-1">
                <li>• Você pode ter até 3 créditos por parceiro</li>
                <li>• Cada token é válido por 48 horas</li>
                <li>• Se fechar negócio: crédito é reposto ✅</li>
                <li>• Se não fechar: crédito é perdido ❌</li>
                <li>• Após 3 créditos perdidos: perde o benefício</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
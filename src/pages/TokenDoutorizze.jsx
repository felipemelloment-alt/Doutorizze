import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Award,
  TrendingUp,
  Gift,
  Ticket,
  Star,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

export default function TokenDoutorizze() {
  const navigate = useNavigate();
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

  // Buscar token do usuário
  const { data: token, isLoading: loadingToken } = useQuery({
    queryKey: ["userToken", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const tokens = await base44.entities.TokenUsuario.filter({ user_id: user.id });
      return tokens.length > 0 ? tokens[0] : null;
    },
    enabled: !!user,
  });

  // Buscar cupons do usuário
  const { data: cupons = [], isLoading: loadingCupons } = useQuery({
    queryKey: ["userCupons", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await base44.entities.TokenDesconto.filter({ user_id: user.id });
      return result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user,
  });

  const cuponsAtivos = cupons.filter((c) => c.status === "ATIVO");
  const cuponsUsados = cupons.filter((c) => c.status === "USADO");
  const cuponsExpirados = cupons.filter((c) => c.status === "EXPIRADO");

  const nivelInfo = {
    1: { nome: "Iniciante", cor: "from-gray-400 to-gray-600", emoji: "🌟" },
    2: { nome: "Bronze", cor: "from-orange-400 to-orange-600", emoji: "🥉" },
    3: { nome: "Prata", cor: "from-gray-300 to-gray-500", emoji: "🥈" },
    4: { nome: "Ouro", cor: "from-yellow-400 to-yellow-600", emoji: "🥇" },
    5: { nome: "Diamante", cor: "from-cyan-400 to-blue-600", emoji: "💎" },
  };

  const proximoNivel = token ? Math.min(5, token.nivel + 1) : 2;
  const pontosProximoNivel = proximoNivel * 1000; // Exemplo: 1000 pontos por nível

  if (loadingToken || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Token não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Entre em contato com o suporte para ativar seu Token Doutorizze
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-xl"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const nivel = nivelInfo[token.nivel] || nivelInfo[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4 font-semibold relative z-10"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="relative z-10 text-center">
          <div className="text-7xl mb-4">{nivel.emoji}</div>
          <h1 className="text-4xl font-black text-white mb-2">
            Nível {token.nivel} - {nivel.nome}
          </h1>
          <p className="text-white/90 text-xl font-bold">{token.token_id}</p>
        </div>
      </div>

      {/* Card do Token */}
      <div className="px-6 -mt-12 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${nivel.cor} rounded-3xl p-8 shadow-2xl relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">Meus Pontos</p>
                <p className="text-5xl font-black text-white">{token.pontos || 0}</p>
              </div>
              <div className="text-right">
                <div className="flex gap-2 mb-2">
                  {token.verificado && (
                    <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <p className="text-white text-xs font-bold">✓ Verificado</p>
                    </div>
                  )}
                  {token.whatsapp_verificado && (
                    <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <p className="text-white text-xs font-bold">✓ WhatsApp</p>
                    </div>
                  )}
                </div>
                <p className="text-white/80 text-sm">
                  {token.especialidade || "Profissional de Saúde"}
                </p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((token.pontos || 0) / pontosProximoNivel) * 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-white/80 text-sm mt-2 text-center">
              {pontosProximoNivel - (token.pontos || 0)} pontos para o próximo nível
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <Ticket className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-gray-900">{cuponsAtivos.length}</p>
            <p className="text-xs text-gray-600">Cupons Ativos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-gray-900">
              {token.total_descontos_usados || 0}
            </p>
            <p className="text-xs text-gray-600">Cupons Usados</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-gray-900">
              R$ {(token.valor_economizado || 0).toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-gray-600">Economizado</p>
          </div>
        </div>
      </div>

      {/* Tabs de Cupons */}
      <div className="px-6">
        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="ativos">
              Ativos ({cuponsAtivos.length})
            </TabsTrigger>
            <TabsTrigger value="usados">
              Usados ({cuponsUsados.length})
            </TabsTrigger>
            <TabsTrigger value="expirados">
              Expirados ({cuponsExpirados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="space-y-4">
            {cuponsAtivos.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  Nenhum cupom ativo
                </h3>
                <p className="text-gray-400">
                  Ganhe pontos para desbloquear descontos incríveis!
                </p>
              </div>
            ) : (
              cuponsAtivos.map((cupom) => (
                <CupomCard key={cupom.id} cupom={cupom} />
              ))
            )}
          </TabsContent>

          <TabsContent value="usados" className="space-y-4">
            {cuponsUsados.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-400">Nenhum cupom usado ainda</p>
              </div>
            ) : (
              cuponsUsados.map((cupom) => (
                <CupomCard key={cupom.id} cupom={cupom} usado />
              ))
            )}
          </TabsContent>

          <TabsContent value="expirados" className="space-y-4">
            {cuponsExpirados.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-400">Nenhum cupom expirado</p>
              </div>
            ) : (
              cuponsExpirados.map((cupom) => (
                <CupomCard key={cupom.id} cupom={cupom} expirado />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CupomCard({ cupom, usado = false, expirado = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl p-6 shadow-lg ${
        usado || expirado ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-black">
              {cupom.desconto_tipo === "PERCENTUAL"
                ? `${cupom.desconto_valor}%`
                : "R$"}
            </div>
            <div>
              <h3 className="font-black text-gray-900">{cupom.codigo}</h3>
              <p className="text-sm text-gray-600">{cupom.parceiro_nome}</p>
            </div>
          </div>

          {cupom.produto_categoria && (
            <Badge className="bg-orange-100 text-orange-700 mb-2">
              {cupom.produto_categoria}
            </Badge>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Desconto:</strong>{" "}
              {cupom.desconto_tipo === "PERCENTUAL"
                ? `${cupom.desconto_valor}% OFF`
                : `R$ ${cupom.desconto_valor}`}
            </p>
            <p>
              <strong>Validade:</strong>{" "}
              {new Date(cupom.data_validade).toLocaleDateString("pt-BR")}
            </p>
            {usado && cupom.data_uso && (
              <p>
                <strong>Usado em:</strong>{" "}
                {new Date(cupom.data_uso).toLocaleDateString("pt-BR")}
              </p>
            )}
            {cupom.observacoes && (
              <p className="text-xs text-gray-500 mt-2">{cupom.observacoes}</p>
            )}
          </div>
        </div>

        <Badge
          className={
            usado
              ? "bg-purple-100 text-purple-700"
              : expirado
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }
        >
          {usado ? "Usado" : expirado ? "Expirado" : "Ativo"}
        </Badge>
      </div>
    </motion.div>
  );
}
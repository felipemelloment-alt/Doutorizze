import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Zap,
  Calendar,
  Users,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import { minhasCandidaturas } from "@/components/api/substituicao";

export default function DashboardSubstituicoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const professionals = await base44.entities.Professional.filter({ 
          user_id: currentUser.id 
        });
        if (professionals.length > 0) {
          setProfessional(professionals[0]);
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: candidaturas = [] } = useQuery({
    queryKey: ["minhasCandidaturasSubstituicao", professional?.id],
    queryFn: async () => {
      return await minhasCandidaturas(professional.id);
    },
    enabled: !!professional
  });

  const { data: vagasDisponiveis = [] } = useQuery({
    queryKey: ["vagasDisponiveisCount"],
    queryFn: async () => {
      return await base44.entities.SubstituicaoUrgente.filter({
        status: "ABERTA"
      });
    },
    enabled: !!professional
  });

  const candidaturasAguardando = candidaturas.filter(c => c.status === "AGUARDANDO").length;
  const candidaturasEscolhido = candidaturas.filter(c => c.status === "ESCOLHIDO").length;

  // Calcular taxa de preenchimento
  const vagasPreenchidas = vagasDisponiveis.filter(v => v.status === "PREENCHIDA").length;
  const totalVagas = vagasDisponiveis.length;
  const taxaPreenchimento = totalVagas > 0 ? ((vagasPreenchidas / totalVagas) * 100).toFixed(1) : 0;

  // Calcular tempo médio de resposta (em minutos)
  const candidaturasComResposta = candidaturas.filter(c => c.status === "ESCOLHIDO" && c.created_date && c.updated_date);
  const tempoMedioResposta = candidaturasComResposta.length > 0
    ? candidaturasComResposta.reduce((acc, c) => {
        const created = new Date(c.created_date);
        const updated = new Date(c.updated_date);
        const diffMinutos = Math.floor((updated - created) / (1000 * 60));
        return acc + diffMinutos;
      }, 0) / candidaturasComResposta.length
    : 0;

  const isOnline = professional?.status_disponibilidade_substituicao === "ONLINE";

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className={`py-8 mb-8 transition-all ${
        isOnline 
          ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
          : "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
                ⚡
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                SUBSTITUIÇÕES
              </h1>
              <p className="text-white/90">
                {isOnline ? "🟢 Você está ONLINE" : "⚪ Você está OFFLINE"}
              </p>
            </div>
            <button
              onClick={() => navigate(createPageUrl("DisponibilidadeSubstituicao"))}
              className={`px-6 py-4 font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all ${
                isOnline 
                  ? "bg-white text-green-600"
                  : "bg-white text-gray-600"
              }`}
            >
              {isOnline ? "⚡ ONLINE" : "💤 OFFLINE"}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            title="Vagas Disponíveis"
            value={vagasDisponiveis.length}
            color="blue"
            onClick={() => navigate(createPageUrl("VagasDisponiveis"))}
          />
          <StatCard
            icon={Clock}
            title="Aguardando"
            value={candidaturasAguardando}
            color="yellow"
            onClick={() => navigate(createPageUrl("MinhasCandidaturasSubstituicao"))}
          />
          <StatCard
            icon={CheckCircle}
            title="Escolhido"
            value={candidaturasEscolhido}
            color="green"
            onClick={() => navigate(createPageUrl("MinhasCandidaturasSubstituicao"))}
          />
          <StatCard
            icon={Star}
            title="Completadas"
            value={professional.substituicoes_completadas || 0}
            color="purple"
          />
        </div>

        {/* Métricas Adicionais */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Taxa de Preenchimento</h3>
                <p className="text-sm text-gray-600">Vagas preenchidas vs total</p>
              </div>
            </div>
            <div className="text-5xl font-black text-green-600">{taxaPreenchimento}%</div>
            <p className="text-sm text-gray-500 mt-2">{vagasPreenchidas} de {totalVagas} vagas preenchidas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tempo Médio de Resposta</h3>
                <p className="text-sm text-gray-600">Aceitação de candidaturas</p>
              </div>
            </div>
            <div className="text-5xl font-black text-blue-600">
              {tempoMedioResposta < 60 
                ? `${Math.round(tempoMedioResposta)}min`
                : `${(tempoMedioResposta / 60).toFixed(1)}h`
              }
            </div>
            <p className="text-sm text-gray-500 mt-2">Baseado em {candidaturasComResposta.length} respostas</p>
          </motion.div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(createPageUrl("VagasDisponiveis"))}
              className="p-6 rounded-2xl border-2 border-gray-200 hover:border-yellow-400 transition-all text-left"
            >
              <Calendar className="w-8 h-8 text-yellow-500 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Ver Vagas</h4>
              <p className="text-sm text-gray-600">Procurar oportunidades</p>
            </button>
            <button
              onClick={() => navigate(createPageUrl("MinhasCandidaturasSubstituicao"))}
              className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all text-left"
            >
              <Users className="w-8 h-8 text-blue-500 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Candidaturas</h4>
              <p className="text-sm text-gray-600">Acompanhar status</p>
            </button>
            <button
              onClick={() => navigate(createPageUrl("DisponibilidadeSubstituicao"))}
              className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 transition-all text-left"
            >
              <Zap className="w-8 h-8 text-green-500 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Disponibilidade</h4>
              <p className="text-sm text-gray-600">Configurar status</p>
            </button>
          </div>
        </div>

        {/* Estatísticas Profissionais */}
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-black text-gray-900 mb-4">Suas Estatísticas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <div className="text-4xl font-black text-green-600 mb-2">
                {professional.taxa_comparecimento || 100}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Comparecimento</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-2xl">
              <div className="text-4xl font-black text-yellow-600 mb-2">
                {professional.media_avaliacoes?.toFixed(1) || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <div className="text-4xl font-black text-blue-600 mb-2">
                {professional.substituicoes_completadas || 0}
              </div>
              <div className="text-sm text-gray-600">Substituições</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, onClick }) {
  const colorClasses = {
    blue: "from-blue-400 to-blue-600",
    yellow: "from-yellow-400 to-orange-500",
    green: "from-green-400 to-emerald-600",
    purple: "from-purple-400 to-pink-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 shadow-xl ${
        onClick ? "cursor-pointer hover:scale-105" : ""
      } transition-all`}
    >
      <Icon className="w-8 h-8 text-white mb-3" />
      <div className="text-4xl font-black text-white mb-1">{value}</div>
      <div className="text-white/90 text-sm font-bold">{title}</div>
    </motion.div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  User,
  Eye,
  FileText,
  Star,
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle2,
  Settings,
  Search,
  ShoppingBag,
  TrendingUp,
  Award,
  ChevronRight,
  Zap
} from "lucide-react";

export default function DashboardProfissional() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Buscar dados do profissional
  const { data: professional } = useQuery({
    queryKey: ["professional", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const result = await base44.entities.Professional.filter({ user_id: user.id });
      return result[0] || null;
    },
    enabled: !!user
  });

  // Buscar matches do profissional
  const { data: matches = [] } = useQuery({
    queryKey: ["jobMatches", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.JobMatch.filter({ professional_id: professional.id });
    },
    enabled: !!professional
  });

  // Buscar vagas dos matches
  const { data: jobs = [] } = useQuery({
    queryKey: ["matchedJobs", matches],
    queryFn: async () => {
      if (matches.length === 0) return [];
      const jobIds = [...new Set(matches.map(m => m.job_id))];
      const jobPromises = jobIds.map(id => 
        base44.entities.Job.filter({ id }).then(res => res[0])
      );
      return (await Promise.all(jobPromises)).filter(Boolean);
    },
    enabled: matches.length > 0
  });

  // Buscar avaliações - DINÂMICO POR TIPO
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.Rating.filter({ 
        avaliado_id: professional.id,
        avaliado_tipo: professional.tipo_profissional
      });
    },
    enabled: !!professional
  });

  // Filtrar matches por tipo
  const superJobs = matches.filter(m => m.match_type === "SUPER_JOB" && m.status_candidatura !== "REJEITADO");
  const vagasSemelhantes = matches.filter(m => m.match_type === "SEMELHANTE" && m.status_candidatura !== "REJEITADO");

  // Calcular métricas
  const totalVisualizacoes = professional?.total_contratacoes || 0;
  const candidaturasEnviadas = matches.filter(m => m.status_candidatura === "CANDIDATOU").length;
  const matchesRecebidos = matches.length;
  const mediaAvaliacoes = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.nota, 0) / ratings.length).toFixed(1)
    : "0.0";

  // Status badge config
  const statusConfig = {
    DISPONIVEL: { label: "Disponível", color: "bg-green-500", emoji: "✅" },
    INDISPONIVEL: { label: "Indisponível", color: "bg-red-500", emoji: "🔴" },
    OCUPADO: { label: "Ocupado", color: "bg-yellow-500", emoji: "⏳" }
  };

  const currentStatus = statusConfig[professional?.status_disponibilidade] || statusConfig.DISPONIVEL;

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Foto do profissional */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {professional.nome_completo?.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Olá, {professional.nome_completo?.split(' ')[0]}! 👋
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 ${currentStatus.color} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
                    {currentStatus.emoji} {currentStatus.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("EditarPerfil"))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
            >
              <Settings className="w-4 h-4" />
              Editar Perfil
            </button>
          </div>
        </motion.div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Eye className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">{totalVisualizacoes}</p>
            <p className="text-sm text-gray-600 font-medium">Visualizações</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">{candidaturasEnviadas}</p>
            <p className="text-sm text-gray-600 font-medium">Candidaturas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">{matchesRecebidos}</p>
            <p className="text-sm text-gray-600 font-medium">Matches</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">{mediaAvaliacoes}</p>
            <p className="text-sm text-gray-600 font-medium">Avaliações</p>
          </motion.div>
        </div>

        {/* SUPER JOBS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Super Jobs</h2>
                <p className="text-sm text-gray-600">Matches perfeitos para você</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
              {superJobs.length} vagas
            </span>
          </div>

          {superJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💼</div>
              <p className="text-gray-500 font-medium">Nenhum Super Job no momento</p>
              <p className="text-gray-400 text-sm mt-2">Continue ativo para receber as melhores oportunidades!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {superJobs.slice(0, 3).map((match) => {
                const job = jobs.find(j => j.id === match.job_id);
                if (!job) return null;

                return (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("DetalheVaga") + "/" + job.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                            ⚡ Match Perfeito
                          </span>
                          {job.tipo_vaga && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">
                              {job.tipo_vaga}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {job.titulo}
                        </h3>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin className="w-4 h-4" />
                            {job.cidade} - {job.uf}
                          </div>
                          {job.valor_proposto && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                              <DollarSign className="w-4 h-4" />
                              R$ {job.valor_proposto.toLocaleString('pt-BR')}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {match.match_cidade && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                              ✓ Cidade
                            </span>
                          )}
                          {match.match_especialidade && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded">
                              ✓ Especialidade
                            </span>
                          )}
                          {match.match_dias && (
                            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded">
                              ✓ Dias
                            </span>
                          )}
                        </div>
                      </div>

                      <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 whitespace-nowrap">
                        Ver Detalhes
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* VAGAS SEMELHANTES */}
        {vagasSemelhantes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Vagas Semelhantes</h2>
                <p className="text-sm text-gray-600">Matches 3/4 - Oportunidades próximas do seu perfil</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                {vagasSemelhantes.length} vagas
              </span>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-4 pb-4">
                {vagasSemelhantes.slice(0, 6).map((match) => {
                  const job = jobs.find(j => j.id === match.job_id);
                  if (!job) return null;

                  return (
                    <div
                      key={match.id}
                      onClick={() => navigate(createPageUrl("DetalheVaga") + "/" + job.id)}
                      className="min-w-[280px] border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded text-xs">
                        Match {match.match_score}/4
                      </span>
                      
                      <h3 className="text-base font-bold text-gray-900 mt-3 mb-2 line-clamp-2">
                        {job.titulo}
                      </h3>
                      
                      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.cidade} - {job.uf}
                      </div>
                      
                      {job.valor_proposto && (
                        <p className="text-sm font-bold text-green-600">
                          R$ {job.valor_proposto.toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <button
            onClick={() => navigate(createPageUrl("NewJobs"))}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <Search className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-1">Buscar Vagas</h3>
            <p className="text-blue-100 text-sm">Encontre sua próxima oportunidade</p>
          </button>

          <button
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <ShoppingBag className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-1">Marketplace</h3>
            <p className="text-purple-100 text-sm">Equipamentos e produtos</p>
          </button>

          <button
            onClick={() => navigate(createPageUrl("MeuPerfil"))}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <Settings className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-1">Meu Perfil</h3>
            <p className="text-green-100 text-sm">Ver e editar seu perfil</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
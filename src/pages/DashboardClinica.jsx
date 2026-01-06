import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Plus,
  Briefcase,
  Users,
  CheckCircle2,
  Star,
  Edit,
  Pause,
  X,
  Eye,
  MapPin,
  Award,
  TrendingUp,
  Search,
  ShoppingBag,
  BadgeCheck,
  Calendar
} from "lucide-react";

export default function DashboardClinica() {
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

  // Buscar todos os dados em paralelo quando user disponível
  const { data: dashboardData = {}, isLoading: loadingDashboard } = useQuery({
    queryKey: ["clinicDashboard", user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      // Batch 1: Owner e Units em paralelo
      const [ownerResult, ] = await Promise.all([
        base44.entities.CompanyOwner.filter({ user_id: user.id }),
      ]);
      
      const owner = ownerResult[0];
      if (!owner) return { owner: null, units: [], jobs: [], matches: [], professionals: [] };
      
      // Batch 2: Units
      const units = await base44.entities.CompanyUnit.filter({ owner_id: owner.id });
      const primaryUnit = units[0];
      if (!primaryUnit) return { owner, units: [], jobs: [], matches: [], professionals: [] };
      
      // Batch 3: Jobs
      const jobs = await base44.entities.Job.filter({ unit_id: primaryUnit.id });
      if (jobs.length === 0) return { owner, units, primaryUnit, jobs: [], matches: [], professionals: [] };
      
      // Batch 4: Matches em paralelo
      const jobIds = jobs.map(j => j.id);
      const matchResults = await Promise.all(
        jobIds.map(id => base44.entities.JobMatch.filter({ job_id: id }))
      );
      const matches = matchResults.flat();
      
      // Batch 5: Profissionais em paralelo
      if (matches.length === 0) return { owner, units, primaryUnit, jobs, matches: [], professionals: [] };
      
      const profIds = [...new Set(matches.map(m => m.professional_id))];
      const professionals = (await Promise.all(
        profIds.map(id => base44.entities.Professional.filter({ id }).then(res => res[0]))
      )).filter(Boolean);
      
      return { owner, units, primaryUnit, jobs, matches, professionals };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const { owner, units = [], primaryUnit, jobs = [], matches: allMatches = [], professionals = [] } = dashboardData;

  // Calcular métricas
  const vagasAtivas = jobs.filter(j => j.status === "ABERTO").length;
  const totalCandidatos = allMatches.length;
  const contratacoesRealizadas = primaryUnit?.total_contratacoes || 0;
  const mediaAvaliacoes = primaryUnit?.media_avaliacoes || 0;

  // Vagas ativas
  const activeJobs = jobs.filter(j => j.status === "ABERTO").slice(0, 3);

  // Candidatos recentes
  const recentCandidates = allMatches
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  if (loadingDashboard || !primaryUnit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
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
          className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Logo da clínica */}
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-pink-600 text-2xl font-bold shadow-lg">
                {primaryUnit.nome_fantasia?.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-2xl font-black">
                  {primaryUnit.nome_fantasia}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {primaryUnit.status_cadastro === "APROVADO" && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4" />
                      Clínica Verificada
                    </span>
                  )}
                  <span className="text-white/80 text-sm">
                    {primaryUnit.cidade} - {primaryUnit.uf}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("CriarVaga"))}
              className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Criar Nova Vaga
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
              <Briefcase className="w-8 h-8 text-pink-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">{vagasAtivas}</p>
            <p className="text-sm text-gray-600 font-medium">Vagas Ativas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">{totalCandidatos}</p>
            <p className="text-sm text-gray-600 font-medium">Candidatos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">{contratacoesRealizadas}</p>
            <p className="text-sm text-gray-600 font-medium">Contratações</p>
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
            <p className="text-3xl font-black text-gray-900">{mediaAvaliacoes.toFixed(1)}</p>
            <p className="text-sm text-gray-600 font-medium">Avaliação Média</p>
          </motion.div>
        </div>

        {/* MINHAS VAGAS ATIVAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Minhas Vagas Ativas</h2>
                <p className="text-sm text-gray-600">Gerencie suas oportunidades</p>
              </div>
            </div>
            <button
              onClick={() => navigate(createPageUrl("MinhasVagas"))}
              className="text-pink-600 hover:text-pink-700 font-bold text-sm flex items-center gap-1"
            >
              Ver Todas
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {activeJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💼</div>
              <p className="text-gray-500 font-medium">Nenhuma vaga ativa no momento</p>
              <button
                onClick={() => navigate(createPageUrl("CriarVaga"))}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Vaga
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const candidatos = allMatches.filter(m => m.job_id === job.id).length;
                
                return (
                  <div
                    key={job.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-pink-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                            ✓ Ativa
                          </span>
                          {job.tipo_vaga && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-xs">
                              {job.tipo_vaga}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {job.titulo}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {candidatos} candidatos
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.created_date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.cidade} - {job.uf}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-2 border-2 border-gray-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-all">
                          <Edit className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all">
                          <Pause className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all">
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* CANDIDATOS RECENTES */}
        {recentCandidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Candidatos Recentes</h2>
                <p className="text-sm text-gray-600">Últimos profissionais interessados</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-sm">
                {recentCandidates.length} novos
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCandidates.map((match) => {
                const professional = professionals.find(p => p.id === match.professional_id);
                const job = jobs.find(j => j.id === match.job_id);
                if (!professional || !job) return null;

                return (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-pink-400 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(createPageUrl("VerProfissional") + "?id=" + professional.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {professional.nome_completo?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{professional.nome_completo}</p>
                        <p className="text-sm text-gray-600 truncate">{professional.especialidade_principal}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Candidatou-se para: <span className="font-medium text-gray-700">{job.titulo}</span>
                    </div>

                    <button className="w-full py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-all text-sm">
                      Ver Perfil
                    </button>
                  </div>
                );
              })}
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
            onClick={() => navigate(createPageUrl("CriarVaga"))}
            className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <Plus className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-1">Criar Vaga</h3>
            <p className="text-pink-100 text-sm">Publique uma nova oportunidade</p>
          </button>

          <button
            onClick={() => navigate(createPageUrl("BuscarProfissionais"))}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <Search className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-1">Buscar Profissionais</h3>
            <p className="text-purple-100 text-sm">Encontre o profissional ideal</p>
          </button>

          <button
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <ShoppingBag className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black mb-1">Marketplace</h3>
            <p className="text-orange-100 text-sm">Equipamentos e produtos</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
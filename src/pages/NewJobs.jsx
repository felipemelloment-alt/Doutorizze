import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUserArea } from "@/components/hooks/useUserArea";
import { notificarSuperJobMatch } from "@/components/api/whatsappNotifications";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Star,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock } from
"lucide-react";

export default function NewJobs() {
  const { userArea } = useUserArea();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [newJobsActive, setNewJobsActive] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [activeTab, setActiveTab] = useState("super-jobs");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Buscar profissional logado
        const profResult = await base44.entities.Professional.filter({ user_id: currentUser.id });
        setProfessional(profResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar vagas abertas
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const results = await base44.entities.Job.filter({
        status: "ABERTO"
      });
      return results.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Buscar unidades das vagas
  const { data: units = [] } = useQuery({
    queryKey: ["units", jobs],
    queryFn: async () => {
      if (jobs.length === 0) return [];
      const unitIds = [...new Set(jobs.map(j => j.unit_id))];
      const unitPromises = unitIds.map(id =>
        base44.entities.CompanyUnit.filter({ id }).then(res => res[0])
      );
      return (await Promise.all(unitPromises)).filter(Boolean);
    },
    enabled: jobs.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Função de cálculo de match
  const calcularMatch = (job, prof) => {
    if (!prof) return 0;
    let score = 0;

    // 1. Cidade
    if (prof.cidades_atendimento?.some(c =>
      c.toLowerCase().includes(job.cidade?.toLowerCase()) ||
      job.cidade?.toLowerCase().includes(c.split(' - ')[0].toLowerCase())
    )) {
      score++;
    }

    // 2. Especialidade
    if (job.especialidades_aceitas?.includes(prof.especialidade_principal)) {
      score++;
    }

    // 3. Dias
    const diasComuns = prof.dias_semana_disponiveis?.filter(d =>
      job.dias_semana?.includes(d)
    );
    if (diasComuns?.length > 0 || job.selecao_dias === "SEMANA_TODA") {
      score++;
    }

    // 4. Experiência
    if (!job.exige_experiencia ||
        (prof.tempo_formado_anos >= (job.tempo_experiencia_minimo || 0))) {
      score++;
    }

    return score;
  };

  // Filtrar vagas por busca e área
  const filteredJobs = jobs.filter(job => {
    // Filtro de área (ODONTOLOGIA só vê DENTISTA, MEDICINA só vê MEDICO)
    const tipoProfissionalEsperado = userArea === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";
    if (job.tipo_profissional !== tipoProfissionalEsperado) {
      return false;
    }

    const matchesSpecialty = !searchSpecialty || 
      job.titulo?.toLowerCase().includes(searchSpecialty.toLowerCase()) ||
      job.especialidades_aceitas?.some(esp => esp.toLowerCase().includes(searchSpecialty.toLowerCase()));
    
    const matchesCity = !searchCity || 
      job.cidade?.toLowerCase().includes(searchCity.toLowerCase());
    
    return matchesSpecialty && matchesCity;
  });

  // Calcular match para cada vaga
  const jobsComMatch = filteredJobs.map(job => ({
    ...job,
    matchScore: calcularMatch(job, professional)
  }));

  // Ordenar por score (maior primeiro)
  jobsComMatch.sort((a, b) => b.matchScore - a.matchScore);

  // Categorizar vagas por score
  const superJobs = jobsComMatch.filter(j => j.matchScore === 4);
  const jobsSemelhante = jobsComMatch.filter(j => j.matchScore === 3);
  const outrasVagas = jobsComMatch.filter(j => j.matchScore >= 0 && j.matchScore <= 2);

  // Notificar Super Jobs via WhatsApp
  useEffect(() => {
    const notificarSuperJobs = async () => {
      if (!professional || superJobs.length === 0) return;

      for (const vaga of superJobs) {
        try {
          await notificarSuperJobMatch(vaga.id, professional.id, vaga.matchScore);
        } catch (e) {
          // Erro silencioso
        }
      }
    };
    notificarSuperJobs();
  }, [superJobs, professional]);

  const handleToggleNewJobs = async () => {
    setNewJobsActive(!newJobsActive);
    // Atualizar no banco de dados
    // await base44.entities.Dentist.update(user.id, { new_jobs_ativo: !newJobsActive });
  };

  const handleWhatsAppContact = () => {
    // Número de suporte/contato (substitua pelo número real)
    const phoneNumber = "5562999999999"; // Exemplo: +55 62 99999-9999
    const message = encodeURIComponent("Olá! Tenho interesse nas vagas Jobs Semelhante ⭐");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando oportunidades...</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-amber-600 mt-4 mx-4 p-8 rounded-3xl from-yellow-400 via-orange-500 to-pink-500 relative overflow-hidden">
        {/* Decoração */}
        <div className="bg-teal-50 text-black rounded-full absolute top-0 right-0 w-32 h-32 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
        <div className="my-2 text-4xl absolute top-4 right-8 animate-pulse">⚡</div>
        <div className="absolute bottom-4 left-8 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>⚡</div>
        
        <div className="relative z-10">
          <div className="bg-slate-50 mx-1 py-3 text-3xl rounded-2xl w-16 h-16 backdrop-blur flex items-center justify-center">
            💼
          </div>
          <h1 className="text-white mb-2 text-3xl font-black md:text-5xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>OPORTUNIDADES

          </h1>
          <p className="text-white/90">Encontre a vaga perfeita para você</p>
          <div className="bg-red-600 text-white mt-4 px-4 py-2 font-semibold rounded-full inline-flex items-center gap-2 backdrop-blur">
            🔥 {jobs.length} vagas disponíveis
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-3xl shadow-xl mx-4 -mt-6 p-6 relative z-10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Campo de busca */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Buscar vagas, especialidades..."
              value={searchSpecialty}
              onChange={(e) => setSearchSpecialty(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none" />

          </div>

          {/* Select Cidade */}
          <div>
            <input
              type="text"
              placeholder="Cidade"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none" />

          </div>

          {/* Botão Buscar */}
          <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
            🔍 Buscar
          </button>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
            Todas
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-yellow-100 hover:text-yellow-700 cursor-pointer transition-all">
            Tempo Integral
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-yellow-100 hover:text-yellow-700 cursor-pointer transition-all">
            Meio Período
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-yellow-100 hover:text-yellow-700 cursor-pointer transition-all">
            Plantão
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-yellow-100 hover:text-yellow-700 cursor-pointer transition-all">
            Freelancer
          </button>
        </div>
      </div>

      {/* Header da Lista */}
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Vagas Encontradas</h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
            ({superJobs.length + jobsSemelhante.length + outrasVagas.length})
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-sm hidden md:inline">Ordenar:</span>
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400">
            <option>Mais recentes</option>
            <option>Maior salário</option>
            <option>Mais perto</option>
          </select>
        </div>
      </div>

      <div className="px-4">

        {/* Lista de Vagas */}
        <div className="space-y-4 pb-8">
          {/* SUPER JOBS */}
          {superJobs.length > 0 &&
          <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-black text-gray-900">SUPER JOBS - Matches Perfeitos! 🌟</h2>
                <span className="ml-auto px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
                  {superJobs.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {superJobs.map((job) => {
                  const unit = units.find(u => u.id === job.unit_id);
                  return <JobCard key={job.id} job={job} unit={unit} isSuperJob matchScore={job.matchScore} />;
                })}
              </div>
            </div>
          }

          {/* Jobs Semelhante */}
          {jobsSemelhante.length > 0 &&
          <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-4 flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-black text-gray-900">Jobs Semelhante ⭐</h2>
                <span className="ml-auto px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-bold">
                  {jobsSemelhante.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobsSemelhante.map((job) => {
                  const unit = units.find(u => u.id === job.unit_id);
                  return <JobCard key={job.id} job={job} unit={unit} matchScore={job.matchScore} />;
                })}
              </div>
            </div>
          }

          {/* Outras Vagas */}
          {outrasVagas.length > 0 &&
          <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black text-gray-900">Outras Oportunidades</h2>
                <span className="ml-auto px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                  {outrasVagas.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {outrasVagas.map((job) => {
                  const unit = units.find(u => u.id === job.unit_id);
                  return <JobCard key={job.id} job={job} unit={unit} matchScore={job.matchScore} />;
                })}
              </div>
            </div>
          }

          {/* Estado Vazio */}
          {superJobs.length === 0 && jobsSemelhante.length === 0 && outrasVagas.length === 0 &&
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-8xl mb-6 opacity-50">🔍</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-400 mb-6">Tente ajustar os filtros de busca</p>
              <button
              onClick={() => {
                setSearchCity("");
                setSearchSpecialty("");
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:scale-105 transition-all">
                Limpar Filtros
              </button>
            </div>
          }
        </div>
      </div>

      {/* Botão Flutuante - Criar Alerta */}
      <div className="fixed bottom-24 right-6 z-50 group">
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">
          Criar alerta de vagas
        </div>
        <button className="w-14 h-14 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition-all">
          🔔
        </button>
      </div>
    </div>);

}

function StatCard({ icon: Icon, title, count, description, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-[#F9B500] hover:shadow-2xl transition-all">

      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-4xl font-black gradient-yellow-pink bg-clip-text text-transparent">
          {count}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 font-semibold">{description}</p>
    </motion.div>);

}

function JobCard({ job, unit, isSuperJob, matchScore }) {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    if (unit?.whatsapp) {
      const message = encodeURIComponent(`Olá! Tenho interesse na vaga: ${job.titulo}`);
      window.open(`https://wa.me/55${unit.whatsapp}?text=${message}`, "_blank");
    }
  };

  const handleVerDetalhes = () => {
    navigate(createPageUrl("DetalheVaga") + `?id=${job.id}`);
  };

  // Configuração de badges por score
  const matchConfig = {
    4: { badge: "⚡ MATCH PERFEITO", color: "bg-yellow-100 text-yellow-700 border-yellow-400", borderColor: "border-yellow-400" },
    3: { badge: "⭐ BOA COMPATIBILIDADE", color: "bg-orange-100 text-orange-700 border-orange-400", borderColor: "border-orange-400" },
    2: { badge: null, color: "", borderColor: "border-gray-200" },
    1: { badge: null, color: "", borderColor: "border-gray-200" },
    0: { badge: null, color: "", borderColor: "border-gray-200" }
  };

  const config = matchConfig[matchScore] || matchConfig[0];

  const tipoVagaLabels = {
    PLANTAO: "Plantão",
    FIXO: "Fixo",
    SUBSTITUICAO: "Substituição",
    TEMPORARIO: "Temporário"
  };

  const tipoRemuneracaoLabels = {
    FIXO: "/mês",
    DIARIA: "/dia",
    PORCENTAGEM: "%",
    A_COMBINAR: ""
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer border-2 ${config.borderColor} hover:border-yellow-400`}>
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
          {unit?.nome_fantasia?.[0]?.toUpperCase() || "🏥"}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Header do card */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                {tipoVagaLabels[job.tipo_vaga] || job.tipo_vaga}
              </span>
              {job.especialidades_aceitas?.[0] && (
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                  {job.especialidades_aceitas[0]}
                </span>
              )}
              {config.badge && (
                <span className={`px-3 py-1 ${config.color} rounded-full text-xs font-bold border-2 ${matchScore === 4 ? 'animate-pulse' : ''}`}>
                  {config.badge}
                </span>
              )}
            </div>
            {job.tipo_remuneracao === "A_COMBINAR" ? (
              <p className="text-lg font-black text-blue-600">A Combinar</p>
            ) : job.valor_proposto && (
              <p className="text-xl font-black text-green-600">
                R$ {job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                {tipoRemuneracaoLabels[job.tipo_remuneracao]}
              </p>
            )}
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-yellow-600 transition-all">
            {job.titulo}
          </h3>
          <p className="text-gray-500 mb-4">{unit?.nome_fantasia || "Clínica"}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{job.cidade} - {job.uf}</span>
            </div>
            {job.dias_semana?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📅</span>
                <span className="text-gray-900 font-medium">
                  {job.dias_semana[0]}
                  {job.dias_semana.length > 1 && `+${job.dias_semana.length - 1}`}
                </span>
              </div>
            )}
            {job.horario_inicio && job.horario_fim && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{job.horario_inicio}-{job.horario_fim}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📆</span>
              <span className="text-gray-900 font-medium">{getTimeAgo(job.published_at || job.created_date)}</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
            {unit?.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all">
                💬 WhatsApp
              </button>
            )}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleVerDetalhes}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-yellow-400 hover:text-yellow-600 transition-all">
                Ver Detalhes →
              </button>
              <button className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-all">
                ❤️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
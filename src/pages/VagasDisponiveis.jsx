import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Filter,
  ChevronRight,
  Zap,
  TrendingUp
} from "lucide-react";
import { listarVagasDisponiveis } from "@/components/api/substituicao";
import { formatarTextoData, formatarValor, calcularTempoRestante } from "@/components/constants/substituicao";

export default function VagasDisponiveis() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("all");
  const [filtroCidade, setFiltroCidade] = useState("all");
  const [filtroTipoData, setFiltroTipoData] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ["vagasDisponiveis"],
    queryFn: async () => {
      const result = await listarVagasDisponiveis();
      return result || [];
    },
    enabled: !!user
  });

  // Filtrar vagas
  const vagasFiltradas = vagas.filter(vaga => {
    const matchSearch = 
      vaga.especialidade_necessaria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.nome_clinica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.cidade?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEspecialidade = 
      filtroEspecialidade === "all" || 
      vaga.especialidade_necessaria === filtroEspecialidade;

    const matchCidade = 
      filtroCidade === "all" || 
      vaga.cidade === filtroCidade;

    const matchTipoData = 
      filtroTipoData === "all" || 
      vaga.tipo_data === filtroTipoData;

    return matchSearch && matchEspecialidade && matchCidade && matchTipoData;
  });

  // Separar vagas urgentes (IMEDIATO) das outras
  const vagasUrgentes = vagasFiltradas.filter(v => v.tipo_data === "IMEDIATO");
  const vagasNormais = vagasFiltradas.filter(v => v.tipo_data !== "IMEDIATO");

  // Extrair opções únicas para filtros
  const especialidades = [...new Set(vagas.map(v => v.especialidade_necessaria))].filter(Boolean);
  const cidades = [...new Set(vagas.map(v => v.cidade))].filter(Boolean);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
              💼
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              VAGAS ABERTAS
            </h1>
            <p className="text-white/90 text-lg">
              {vagasFiltradas.length} oportunidade{vagasFiltradas.length !== 1 ? "s" : ""} disponível{vagasFiltradas.length !== 1 ? "is" : ""}
            </p>
          </div>
        </motion.div>

        {/* Search e Filtros */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por especialidade, clínica ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                showFilters 
                  ? "bg-yellow-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Especialidade</label>
                <select
                  value={filtroEspecialidade}
                  onChange={(e) => setFiltroEspecialidade(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                >
                  <option value="all">Todas</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                <select
                  value={filtroCidade}
                  onChange={(e) => setFiltroCidade(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                >
                  <option value="all">Todas</option>
                  {cidades.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                <select
                  value={filtroTipoData}
                  onChange={(e) => setFiltroTipoData(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="IMEDIATO">🚨 Imediato</option>
                  <option value="DATA_ESPECIFICA">📅 Data Específica</option>
                  <option value="PERIODO">📊 Período</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* Vagas Urgentes */}
        {vagasUrgentes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">🚨 URGENTE - HOJE</h2>
                <p className="text-gray-600">Vagas que precisam de alguém agora</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {vagasUrgentes.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} isUrgente navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Vagas Normais */}
        {vagasNormais.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Outras Oportunidades</h2>
                <p className="text-gray-600">Vagas programadas</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {vagasNormais.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {vagasFiltradas.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6 opacity-50">🔍</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Tente ajustar os filtros ou volte mais tarde
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFiltroEspecialidade("all");
                setFiltroCidade("all");
                setFiltroTipoData("all");
              }}
              className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente VagaCard
function VagaCard({ vaga, isUrgente, navigate }) {
  const tempoRestante = calcularTempoRestante(vaga.expira_em);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(createPageUrl(`DetalheVaga?id=${vaga.id}`))}
      className={`bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] ${
        isUrgente ? "border-4 border-red-500" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isUrgente && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                🚨 URGENTE
              </span>
            )}
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {vaga.tipo_data === "IMEDIATO" && "⚡ IMEDIATO"}
              {vaga.tipo_data === "DATA_ESPECIFICA" && "📅 DATA"}
              {vaga.tipo_data === "PERIODO" && "📊 PERÍODO"}
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1">
            {vaga.especialidade_necessaria}
          </h3>
          <p className="text-sm text-gray-600 font-semibold">
            {vaga.nome_clinica}
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-semibold">
            {formatarTextoData(vaga)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {vaga.cidade}/{vaga.uf}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-bold">
            {vaga.tipo_remuneracao === "DIARIA" 
              ? formatarValor(vaga.valor_diaria)
              : "% por procedimento"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {vaga.total_candidatos || 0} candidato{vaga.total_candidatos !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Tempo Restante */}
      {tempoRestante && !tempoRestante.expirado && (
        <div className="bg-yellow-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-700">
              Expira em {tempoRestante.texto}
            </span>
          </div>
        </div>
      )}

      {/* Botão */}
      <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all">
        Ver Detalhes
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
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
  TrendingUp,
  Plus
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header Compacto */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Vagas de Emprego
                </h1>
                <p className="text-gray-600 text-sm">
                  {vagasFiltradas.length} {vagasFiltradas.length === 1 ? "vaga disponível" : "vagas disponíveis"}
                </p>
              </div>
            </div>
            {professional && (
              <button
                onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Criar Anúncio</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Search e Filtros */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar especialidade, clínica ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                showFilters 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid md:grid-cols-3 gap-3 pt-4 border-t border-gray-200"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Especialidade</label>
                <select
                  value={filtroEspecialidade}
                  onChange={(e) => setFiltroEspecialidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cidade</label>
                <select
                  value={filtroCidade}
                  onChange={(e) => setFiltroCidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {cidades.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo</label>
                <select
                  value={filtroTipoData}
                  onChange={(e) => setFiltroTipoData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">🚨 Urgente</h2>
                <p className="text-xs text-gray-600">Precisam de alguém agora</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vagasUrgentes.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} isUrgente navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Vagas Normais */}
        {vagasNormais.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Todas as Vagas</h2>
                <p className="text-xs text-gray-600">Oportunidades disponíveis</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vagasNormais.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {vagasFiltradas.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-lg font-bold text-gray-500 mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Tente ajustar os filtros ou volte mais tarde
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFiltroEspecialidade("all");
                setFiltroCidade("all");
                setFiltroTipoData("all");
              }}
              className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
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
      className={`bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 ${
        isUrgente ? "border-l-red-500" : "border-l-blue-500"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            {isUrgente && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                URGENTE
              </span>
            )}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-full">
              {vaga.tipo_data === "IMEDIATO" && "⚡ IMEDIATO"}
              {vaga.tipo_data === "DATA_ESPECIFICA" && "📅 DATA ESPECÍFICA"}
              {vaga.tipo_data === "PERIODO" && "📊 PERÍODO"}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-0.5">
            {vaga.especialidade_necessaria}
          </h3>
          <p className="text-sm text-gray-600">
            {vaga.nome_clinica}
          </p>
        </div>

        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700 font-medium">
            {formatarTextoData(vaga)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700">
            {vaga.cidade}/{vaga.uf}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700 font-semibold">
            {vaga.tipo_remuneracao === "DIARIA" 
              ? formatarValor(vaga.valor_diaria)
              : "% por procedimento"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600">
            {vaga.total_candidatos || 0} candidato{vaga.total_candidatos !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Tempo Restante */}
      {tempoRestante && !tempoRestante.expirado && (
        <div className="bg-yellow-50 rounded-lg p-2.5 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-700">
              Expira em {tempoRestante.texto}
            </span>
          </div>
        </div>
      )}

      {/* Botão */}
      <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:shadow-md transition-all text-sm">
        Ver Detalhes
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
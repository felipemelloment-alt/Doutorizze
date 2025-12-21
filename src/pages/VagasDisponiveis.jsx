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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 pb-24 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header Impactante */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden"
        >
          {/* Efeitos de brilho */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-xl"
                >
                  <Briefcase className="w-10 h-10 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-black text-white drop-shadow-lg">
                    Vagas de Emprego
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-3 py-1 bg-white/30 backdrop-blur rounded-full">
                      <p className="text-white font-bold text-sm">
                        {vagasFiltradas.length} {vagasFiltradas.length === 1 ? "oportunidade" : "oportunidades"}
                      </p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-white rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
              {professional && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
                  className="hidden sm:flex items-center gap-3 px-6 py-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
                  style={{ backgroundColor: "white" }}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-gray-900 font-black">Criar Meu Anúncio</span>
                </motion.button>
              )}
            </div>
            
            {/* Ícone mobile de criar anúncio */}
            {professional && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
                className="sm:hidden w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Plus className="w-6 h-6 text-orange-500" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Search e Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl mb-6 border-2 border-white"
        >
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Buscar especialidade, clínica ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-medium bg-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md ${
                showFilters 
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg" 
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </motion.button>
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
        </motion.div>

        {/* Vagas Urgentes */}
        {vagasUrgentes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4 bg-white/60 backdrop-blur rounded-2xl p-4 shadow-lg">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-xl"
              >
                <Zap className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                  🚨 Urgente - Agora
                </h2>
                <p className="text-sm text-gray-600 font-semibold">Vagas que precisam de alguém hoje!</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {vagasUrgentes.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} isUrgente navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Vagas Normais */}
        {vagasNormais.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-4 bg-white/60 backdrop-blur rounded-2xl p-4 shadow-lg">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-xl"
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600">
                  💼 Todas as Oportunidades
                </h2>
                <p className="text-sm text-gray-600 font-semibold">Encontre sua próxima vaga</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {vagasNormais.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {vagasFiltradas.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 opacity-50"></div>
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-8xl mb-6"
              >
                🔍
              </motion.div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                Nenhuma vaga encontrada
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Não encontramos vagas com esses filtros. Tente ajustar ou volte mais tarde!
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSearchTerm("");
                  setFiltroEspecialidade("all");
                  setFiltroCidade("all");
                  setFiltroTipoData("all");
                }}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                ✨ Limpar Filtros
              </motion.button>
            </div>
          </motion.div>
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(createPageUrl(`DetalheVaga?id=${vaga.id}`))}
      className={`bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl cursor-pointer relative overflow-hidden group ${
        isUrgente ? "ring-4 ring-red-400" : ""
      }`}
    >
      {/* Gradiente de fundo animado */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isUrgente 
          ? "bg-gradient-to-br from-red-500/10 via-orange-500/10 to-pink-500/10" 
          : "bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10"
      }`}></div>

      {/* Brilho decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300/30 to-pink-300/30 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {isUrgente && (
                <motion.span 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black rounded-full shadow-lg"
                >
                  🚨 URGENTE
                </motion.span>
              )}
              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-bold rounded-full border border-gray-300">
                {vaga.tipo_data === "IMEDIATO" && "⚡ IMEDIATO"}
                {vaga.tipo_data === "DATA_ESPECIFICA" && "📅 DATA"}
                {vaga.tipo_data === "PERIODO" && "📊 PERÍODO"}
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
              {vaga.especialidade_necessaria}
            </h3>
            <p className="text-sm text-gray-600 font-semibold">
              {vaga.nome_clinica}
            </p>
          </div>

          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <Briefcase className="w-7 h-7 text-white" />
          </motion.div>
        </div>

        {/* Info Grid com ícones coloridos */}
        <div className="space-y-3 mb-4 bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-900 font-semibold">
              {formatarTextoData(vaga)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-gray-900 font-semibold">
              {vaga.cidade}/{vaga.uf}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-900 font-bold">
              {vaga.tipo_remuneracao === "DIARIA" 
                ? formatarValor(vaga.valor_diaria)
                : "% por procedimento"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-gray-700">
              {vaga.total_candidatos || 0} candidato{vaga.total_candidatos !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Tempo Restante */}
        {tempoRestante && !tempoRestante.expirado && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4 border-2 border-yellow-200"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700">
                ⏰ Expira em {tempoRestante.texto}
              </span>
            </div>
          </motion.div>
        )}

        {/* Botão Impactante */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-all group"
        >
          <span>Ver Detalhes</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}
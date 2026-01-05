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
  Zap,
  Plus
} from "lucide-react";
import { formatarTextoData, formatarValor, calcularTempoRestante } from "@/components/constants/substituicao";
import { Star } from "lucide-react";

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
    queryKey: ["vagasDisponiveis", user?.vertical],
    queryFn: async () => {
      if (!user?.vertical) return [];
      
      // Determinar tipo profissional baseado no vertical do usuário
      const tipoProfissional = user.vertical === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";
      
      // Buscar apenas substituições da área do usuário
      const result = await base44.entities.SubstituicaoUrgente.filter({ 
        status: "ABERTA",
        tipo_profissional: tipoProfissional
      });
      
      return result.sort((a, b) => new Date(b.publicada_em) - new Date(a.publicada_em)) || [];
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
      
      {/* HEADER COM ÍCONE GRANDE */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-8 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Ícone Grande */}
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Briefcase className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Título e Info */}
            <h1 className="text-3xl font-black text-white mb-2">Vagas de Emprego</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm">
                {vagasFiltradas.length} {vagasFiltradas.length === 1 ? "Oportunidade" : "Oportunidades"}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm flex items-center gap-1">
                <Star className="w-4 h-4 fill-white" />
                Atualizadas Hoje
              </span>
            </div>

            <p className="text-white/90 text-lg font-semibold mb-4">Encontre sua próxima oportunidade profissional</p>

            {professional && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl hover:bg-white/90 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Criar Meu Anúncio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 space-y-6 relative z-10">

        {/* Search e Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Buscar Vagas</h2>
              <p className="text-sm text-gray-600">Encontre a oportunidade ideal</p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar especialidade, clínica ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                showFilters 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidade</label>
                <select
                  value={filtroEspecialidade}
                  onChange={(e) => setFiltroEspecialidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="all">Todas</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                <select
                  value={filtroCidade}
                  onChange={(e) => setFiltroCidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="all">Todas</option>
                  {cidades.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                <select
                  value={filtroTipoData}
                  onChange={(e) => setFiltroTipoData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="IMEDIATO">🚨 Imediato</option>
                  <option value="DATA_ESPECIFICA">📅 Data Específica</option>
                  <option value="PERIODO">📊 Período</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Vagas Urgentes */}
        {vagasUrgentes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">🚨 Vagas Urgentes</h2>
                <p className="text-sm text-gray-600">Precisam de alguém agora</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vagasUrgentes.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} isUrgente navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Vagas Normais */}
        {vagasNormais.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Todas as Oportunidades</h2>
                <p className="text-sm text-gray-600">Encontre sua próxima vaga</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vagasNormais.map(vaga => (
                <VagaCard key={vaga.id} vaga={vaga} navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {vagasFiltradas.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou volte mais tarde
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFiltroEspecialidade("all");
                setFiltroCidade("all");
                setFiltroTipoData("all");
              }}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
            >
              Limpar Filtros
            </button>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(createPageUrl(`DetalheVaga?id=${vaga.id}`))}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        isUrgente 
          ? "bg-red-50 border-red-200 hover:border-red-400" 
          : "bg-yellow-50 border-yellow-200 hover:border-yellow-400"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isUrgente && (
            <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-2">
              🚨 URGENTE
            </span>
          )}
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {vaga.especialidade_necessaria}
          </h3>
          <p className="text-sm text-gray-600">{vaga.nome_clinica}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4" />
          <span>{formatarTextoData(vaga)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>{vaga.cidade}/{vaga.uf}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign className="w-4 h-4" />
          <span className="font-bold">
            {vaga.tipo_remuneracao === "DIARIA" 
              ? formatarValor(vaga.valor_diaria)
              : "% por procedimento"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span>{vaga.total_candidatos || 0} candidato{vaga.total_candidatos !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {tempoRestante && !tempoRestante.expirado && (
        <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-100 rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-semibold">Expira em {tempoRestante.texto}</span>
        </div>
      )}

      <button className="w-full mt-3 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-md transition-all text-sm">
        Ver Detalhes
      </button>
    </motion.div>
  );
}
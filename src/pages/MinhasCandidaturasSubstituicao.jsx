import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Calendar,
  MapPin,
  Building,
  Clock,
  ChevronRight,
  Search
} from "lucide-react";
import { minhasCandidaturas } from "@/components/api/substituicao";
import { formatarTextoData, STATUS_CANDIDATURA } from "@/components/constants/substituicao";

export default function MinhasCandidaturasSubstituicao() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: candidaturas = [], isLoading } = useQuery({
    queryKey: ["minhasCandidaturasSubstituicao", professional?.id],
    queryFn: async () => {
      const result = await minhasCandidaturas(professional.id);
      return result.sort((a, b) => new Date(b.candidatado_em) - new Date(a.candidatado_em));
    },
    enabled: !!professional
  });

  const candidaturasFiltradas = candidaturas.filter(cand => {
    const matchStatus = filtroStatus === "all" || cand.status === filtroStatus;
    const matchSearch = 
      cand.substituicao?.especialidade_necessaria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.substituicao?.nome_clinica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.substituicao?.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusList = ["AGUARDANDO", "ESCOLHIDO", "REJEITADO", "EXPIRADO"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
            📝
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            MINHAS CANDIDATURAS
          </h1>
          <p className="text-white/90 text-lg">
            {candidaturasFiltradas.length} candidatura{candidaturasFiltradas.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filtros */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por especialidade, clínica ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFiltroStatus("all")}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                filtroStatus === "all"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            {statusList.map(status => {
              const config = STATUS_CANDIDATURA[status] || {};
              return (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    filtroStatus === status
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Candidaturas */}
        {candidaturasFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6 opacity-50">📭</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Nenhuma candidatura encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Procure vagas disponíveis e candidate-se
            </p>
            <button
              onClick={() => navigate(createPageUrl("VagasDisponiveis"))}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-2xl hover:shadow-xl transition-all"
            >
              Ver Vagas Disponíveis
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {candidaturasFiltradas.map(cand => (
              <CandidaturaCard key={cand.id} candidatura={cand} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidaturaCard({ candidatura, navigate }) {
  const substituicao = candidatura.substituicao;
  const statusConfig = STATUS_CANDIDATURA[candidatura.status] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(createPageUrl(`DetalheSubstituicao?id=${substituicao.id}`))}
      className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
            statusConfig.color === "green" ? "bg-green-100 text-green-700" :
            statusConfig.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
            statusConfig.color === "red" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
          <h3 className="text-xl font-black text-gray-900 mb-1">
            {substituicao.especialidade_necessaria}
          </h3>
          <p className="text-sm text-gray-600">
            {substituicao.nome_clinica}
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Building className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-semibold">
            {formatarTextoData(substituicao)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {substituicao.cidade}/{substituicao.uf}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Candidatou-se em {new Date(candidatura.candidatado_em).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Mensagem */}
      {candidatura.mensagem_profissional && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-700 italic line-clamp-2">
            "{candidatura.mensagem_profissional}"
          </p>
        </div>
      )}

      {/* Mensagem de Escolhido */}
      {candidatura.status === "ESCOLHIDO" && (
        <div className="bg-green-50 rounded-xl p-3 mb-4">
          <p className="text-sm font-bold text-green-700">
            🎉 Parabéns! Você foi escolhido para esta vaga!
          </p>
        </div>
      )}

      {/* Botão */}
      <button className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
        Ver Detalhes
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
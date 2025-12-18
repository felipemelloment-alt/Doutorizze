import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Eye,
  Clock,
  X,
  Search,
  FileText
} from "lucide-react";

export default function MinhasCandidaturas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtroAtivo, setFiltroAtivo] = useState("TODAS");
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadProfessional = async () => {
      try {
        const user = await base44.auth.me();
        const profResult = await base44.entities.Professional.filter({ user_id: user.id });
        setProfessional(profResult[0] || null);
      } catch (error) {
        console.error("Erro ao carregar profissional:", error);
      }
    };
    loadProfessional();
  }, []);

  // Buscar candidaturas
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["myCandidaturas", professional?.id],
    queryFn: async () => {
      if (!professional?.id) return [];
      return await base44.entities.JobMatch.filter({ 
        professional_id: professional.id,
        status_candidatura: "CANDIDATOU"
      });
    },
    enabled: !!professional?.id
  });

  // Buscar vagas relacionadas
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobsForMatches", matches],
    queryFn: async () => {
      if (matches.length === 0) return [];
      const jobIds = [...new Set(matches.map(m => m.job_id))];
      const jobsPromises = jobIds.map(id => 
        base44.entities.Job.filter({ id }).then(res => res[0])
      );
      return (await Promise.all(jobsPromises)).filter(Boolean);
    },
    enabled: matches.length > 0
  });

  // Buscar unidades relacionadas
  const { data: units = [] } = useQuery({
    queryKey: ["unitsForJobs", jobs],
    queryFn: async () => {
      if (jobs.length === 0) return [];
      const unitIds = [...new Set(jobs.map(j => j.unit_id))];
      const unitsPromises = unitIds.map(id => 
        base44.entities.CompanyUnit.filter({ id }).then(res => res[0])
      );
      return (await Promise.all(unitsPromises)).filter(Boolean);
    },
    enabled: jobs.length > 0
  });

  // Mutation para cancelar candidatura
  const cancelarMutation = useMutation({
    mutationFn: async (matchId) => {
      return await base44.entities.JobMatch.delete(matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCandidaturas"] });
      toast.success("Candidatura cancelada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar candidatura: " + error.message);
    }
  });

  const handleCancelar = (matchId) => {
    if (confirm("Tem certeza que deseja cancelar esta candidatura?")) {
      cancelarMutation.mutate(matchId);
    }
  };

  // Preparar dados combinados
  const candidaturasCompletas = matches.map(match => {
    const job = jobs.find(j => j.id === match.job_id);
    const unit = job ? units.find(u => u.id === job.unit_id) : null;
    return { match, job, unit };
  }).filter(item => item.job && item.unit);

  // Filtrar candidaturas
  const candidaturasFiltradas = candidaturasCompletas.filter(item => {
    if (filtroAtivo === "TODAS") return true;
    if (filtroAtivo === "PENDENTES") return item.match.status_candidatura === "CANDIDATOU";
    if (filtroAtivo === "VISUALIZADAS") return item.match.status_candidatura === "VISUALIZADO";
    if (filtroAtivo === "ACEITAS") return item.match.status_candidatura === "CONTATADO";
    if (filtroAtivo === "RECUSADAS") return item.match.status_candidatura === "REJEITADO";
    return true;
  });

  const tipoVagaConfig = {
    PLANTAO: { label: "Plantão", color: "bg-blue-100 text-blue-700" },
    FIXO: { label: "Fixo", color: "bg-green-100 text-green-700" },
    SUBSTITUICAO: { label: "Substituição", color: "bg-yellow-100 text-yellow-700" },
    TEMPORARIO: { label: "Temporário", color: "bg-purple-100 text-purple-700" }
  };

  const statusConfig = {
    CANDIDATOU: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
    VISUALIZADO: { label: "Visualizada", color: "bg-blue-100 text-blue-700" },
    CONTATADO: { label: "Aceita", color: "bg-green-100 text-green-700" },
    REJEITADO: { label: "Recusada", color: "bg-red-100 text-red-700" }
  };

  const filtros = [
    { key: "TODAS", label: "Todas", count: candidaturasCompletas.length },
    { key: "PENDENTES", label: "Pendentes", count: candidaturasCompletas.filter(i => i.match.status_candidatura === "CANDIDATOU").length },
    { key: "VISUALIZADAS", label: "Visualizadas", count: candidaturasCompletas.filter(i => i.match.status_candidatura === "VISUALIZADO").length },
    { key: "ACEITAS", label: "Aceitas", count: candidaturasCompletas.filter(i => i.match.status_candidatura === "CONTATADO").length },
    { key: "RECUSADAS", label: "Recusadas", count: candidaturasCompletas.filter(i => i.match.status_candidatura === "REJEITADO").length }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-8 pb-8 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white">Minhas Candidaturas</h1>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
              {candidaturasCompletas.length} {candidaturasCompletas.length === 1 ? "candidatura" : "candidaturas"}
            </span>
          </div>
          <p className="text-white/80">Acompanhe o status das suas candidaturas</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        {/* FILTROS */}
        <div className="bg-white rounded-3xl shadow-xl p-4 mb-6 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {filtros.map((filtro) => (
              <button
                key={filtro.key}
                onClick={() => setFiltroAtivo(filtro.key)}
                className={`px-5 py-2.5 font-bold rounded-full transition-all whitespace-nowrap ${
                  filtroAtivo === filtro.key
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filtro.label} {filtro.count > 0 && `(${filtro.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE CANDIDATURAS */}
        {candidaturasFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
              <FileText className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {filtroAtivo === "TODAS" ? "Nenhuma candidatura ainda" : `Nenhuma candidatura ${filtros.find(f => f.key === filtroAtivo)?.label.toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filtroAtivo === "TODAS" 
                ? "Você ainda não se candidatou a nenhuma vaga. Que tal começar agora?"
                : "Nenhuma candidatura encontrada nesta categoria."
              }
            </p>
            <button
              onClick={() => navigate(createPageUrl("NewJobs"))}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar Vagas
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 pb-8">
            {candidaturasFiltradas.map((item, index) => (
              <motion.div
                key={item.match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex gap-4">
                  {/* Logo Clínica */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {item.unit.nome_fantasia?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{item.job.titulo}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          {item.unit.nome_fantasia}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {item.job.cidade} - {item.job.uf}
                        </p>
                      </div>

                      {/* Badge Status */}
                      <span className={`px-4 py-2 ${statusConfig[item.match.status_candidatura]?.color} font-bold rounded-full text-sm whitespace-nowrap`}>
                        {statusConfig[item.match.status_candidatura]?.label}
                      </span>
                    </div>

                    {/* Badges Info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1.5 ${tipoVagaConfig[item.job.tipo_vaga]?.color} font-semibold rounded-full text-xs`}>
                        {tipoVagaConfig[item.job.tipo_vaga]?.label}
                      </span>
                      {item.job.valor_proposto && item.job.tipo_remuneracao !== "A_COMBINAR" && (
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 font-semibold rounded-full text-xs flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          R$ {item.job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.match.created_date), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>

                      <div className="flex gap-2">
                        {item.match.status_candidatura === "CANDIDATOU" && (
                          <button
                            onClick={() => handleCancelar(item.match.id)}
                            disabled={cancelarMutation.isPending}
                            className="px-4 py-2 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => navigate(createPageUrl("DetalheVaga") + "/" + item.job.id)}
                          className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-yellow-400 hover:text-yellow-600 transition-all flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Vaga
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
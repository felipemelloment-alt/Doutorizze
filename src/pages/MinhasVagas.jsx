import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Edit,
  Pause,
  Play,
  CheckCircle2,
  X,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Star,
  Phone
} from "lucide-react";

export default function MinhasVagas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [modalCandidatos, setModalCandidatos] = useState(null);
  const [unit, setUnit] = useState(null);

  // Carregar unidade da clínica
  useEffect(() => {
    const loadUnit = async () => {
      try {
        const user = await base44.auth.me();
        const owner = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        if (owner[0]) {
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owner[0].id });
          setUnit(units[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar unidade:", error);
      }
    };
    loadUnit();
  }, []);

  // Buscar vagas
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["clinicJobs", unit?.id],
    queryFn: async () => {
      if (!unit) return [];
      return await base44.entities.Job.filter({ unit_id: unit.id });
    },
    enabled: !!unit
  });

  // Buscar matches
  const { data: allMatches = [] } = useQuery({
    queryKey: ["jobMatches", jobs.map(j => j.id)],
    queryFn: async () => {
      if (jobs.length === 0) return [];
      const matchPromises = jobs.map(job => 
        base44.entities.JobMatch.filter({ job_id: job.id })
      );
      const results = await Promise.all(matchPromises);
      return results.flat();
    },
    enabled: jobs.length > 0
  });

  // Mutation para atualizar vaga
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicJobs"] });
      toast.success("Vaga atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar vaga: " + error.message);
    }
  });

  // Mutation para deletar vaga
  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicJobs"] });
      toast.success("Vaga excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir vaga: " + error.message);
    }
  });

  const handlePausarAtivar = (job) => {
    const novoStatus = job.status === "ABERTO" ? "PAUSADO" : "ABERTO";
    updateJobMutation.mutate({ id: job.id, data: { status: novoStatus } });
  };

  const handleEncerrar = (job) => {
    if (window.confirm("Tem certeza que deseja marcar esta vaga como preenchida?")) {
      updateJobMutation.mutate({ id: job.id, data: { status: "PREENCHIDO" } });
    }
  };

  const handleExcluir = (job) => {
    if (window.confirm("Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.")) {
      deleteJobMutation.mutate(job.id);
    }
  };

  // Filtrar vagas
  const vagasFiltradas = jobs.filter(job => {
    if (filtroStatus === "TODAS") return true;
    if (filtroStatus === "ABERTAS") return job.status === "ABERTO";
    if (filtroStatus === "PAUSADAS") return job.status === "PAUSADO";
    if (filtroStatus === "PREENCHIDAS") return job.status === "PREENCHIDO";
    return true;
  });

  // Configuração de status
  const statusConfig = {
    ABERTO: { label: "Aberta", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
    PAUSADO: { label: "Pausada", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" },
    PREENCHIDO: { label: "Preenchida", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500" },
    CANCELADO: { label: "Cancelada", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" },
    RASCUNHO: { label: "Rascunho", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-500" }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Minhas Vagas</h1>
            <p className="text-gray-600 mt-1">Gerencie suas oportunidades</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("CriarVaga"))}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Vaga
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {["TODAS", "ABERTAS", "PAUSADAS", "PREENCHIDAS"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroStatus(filtro)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                filtroStatus === filtro
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-400"
              }`}
            >
              {filtro}
              {filtro !== "TODAS" && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {jobs.filter(j => {
                    if (filtro === "ABERTAS") return j.status === "ABERTO";
                    if (filtro === "PAUSADAS") return j.status === "PAUSADO";
                    if (filtro === "PREENCHIDAS") return j.status === "PREENCHIDO";
                    return false;
                  }).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LISTA DE VAGAS */}
        {vagasFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6">💼</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              {jobs.length === 0 ? "Você ainda não criou nenhuma vaga" : "Nenhuma vaga encontrada"}
            </h3>
            <p className="text-gray-400 mb-6">
              {jobs.length === 0 
                ? "Comece criando sua primeira oportunidade"
                : "Tente ajustar os filtros"
              }
            </p>
            {jobs.length === 0 && (
              <button
                onClick={() => navigate(createPageUrl("CriarVaga"))}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Vaga
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {vagasFiltradas.map((job) => {
              const candidatos = allMatches.filter(m => m.job_id === job.id).length;
              const statusInfo = statusConfig[job.status] || statusConfig.RASCUNHO;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Conteúdo Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`px-3 py-1 ${statusInfo.color} font-bold rounded-full text-xs flex items-center gap-1`}>
                          <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></div>
                          {statusInfo.label}
                        </span>
                        {job.tipo_vaga && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-xs">
                            {job.tipo_vaga}
                          </span>
                        )}
                        {job.tipo_profissional && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">
                            {job.tipo_profissional === "DENTISTA" ? "🦷 Dentista" : "🩺 Médico"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.titulo}</h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{job.descricao}</p>

                      {/* Especialidades */}
                      {job.especialidades_aceitas && job.especialidades_aceitas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.especialidades_aceitas.slice(0, 4).map((esp, idx) => (
                            <span key={idx} className="px-2 py-1 bg-pink-50 text-pink-700 text-xs font-medium rounded">
                              {esp}
                            </span>
                          ))}
                          {job.especialidades_aceitas.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              +{job.especialidades_aceitas.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Info Grid */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{candidatos} candidatos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{job.total_visualizacoes || 0} visualizações</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.cidade} - {job.uf}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.created_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {job.horario_inicio && job.horario_fim && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.horario_inicio} - {job.horario_fim}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setModalCandidatos(job)}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-all"
                      >
                        <Users className="w-4 h-4" />
                        Ver Candidatos
                      </button>

                      {/* Editar vaga - disponível em breve */}

                      {job.status !== "PREENCHIDO" && job.status !== "CANCELADO" && (
                        <button
                          onClick={() => handlePausarAtivar(job)}
                          className="p-2 border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                          title={job.status === "ABERTO" ? "Pausar" : "Ativar"}
                        >
                          {job.status === "ABERTO" ? (
                            <Pause className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Play className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      )}

                      {job.status === "ABERTO" && (
                        <button
                          onClick={() => handleEncerrar(job)}
                          className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                          title="Encerrar"
                        >
                          <CheckCircle2 className="w-5 h-5 text-gray-600" />
                        </button>
                      )}

                      {job.status === "RASCUNHO" && (
                        <button
                          onClick={() => handleExcluir(job)}
                          className="p-2 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* MODAL CANDIDATOS */}
        <AnimatePresence>
          {modalCandidatos && (
            <ModalCandidatos
              job={modalCandidatos}
              matches={allMatches.filter(m => m.job_id === modalCandidatos.id)}
              onClose={() => setModalCandidatos(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ModalCandidatos({ job, matches, onClose }) {
  const [professionals, setProfessionals] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProfessionals = async () => {
      const profIds = matches.map(m => m.professional_id);
      const profPromises = profIds.map(id => 
        base44.entities.Professional.filter({ id }).then(res => res[0])
      );
      const profs = await Promise.all(profPromises);
      setProfessionals(profs.filter(Boolean));
    };
    if (matches.length > 0) {
      loadProfessionals();
    }
  }, [matches]);

  const handleContratar = async (match, professional) => {
    if (!window.confirm(`Confirma a contratação de ${professional.nome_completo}?`)) return;

    try {
      // Gerar tokens únicos
      const tokenDentista = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const tokenClinica = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await base44.entities.JobContract.create({
        job_id: job.id,
        professional_id: professional.id,
        unit_id: job.unit_id,
        token_dentista: tokenDentista,
        token_clinica: tokenClinica,
        token_created_at: new Date().toISOString(),
        token_expires_at: expiresAt.toISOString(),
        status: "ATIVO"
      });

      // Atualizar status da vaga para PREENCHIDO
      await base44.entities.Job.update(job.id, { status: "PREENCHIDO" });

      toast.success("✅ Profissional contratado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["clinicJobs"] });
      onClose();
    } catch (error) {
      toast.error("Erro ao contratar: " + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black mb-1">Candidatos</h2>
              <p className="text-white/80">{job.titulo}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Lista de Candidatos */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 font-medium">Nenhum candidato ainda</p>
              <p className="text-gray-400 text-sm mt-2">Aguarde profissionais se candidatarem</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const professional = professionals.find(p => p.id === match.professional_id);
                if (!professional) return null;

                return (
                  <div
                    key={match.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-pink-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {professional.nome_completo?.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{professional.nome_completo}</h4>
                            {match.match_type === "SUPER_JOB" && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 font-bold rounded text-xs">
                                ⚡ Match Perfeito
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{professional.especialidade_principal}</p>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              Score: {match.match_score}/4
                            </span>
                            <span>•</span>
                            <span>{professional.cidades_atendimento?.[0]}</span>
                            <span>•</span>
                            <span>{new Date(match.created_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`https://wa.me/55${professional.whatsapp}`, "_blank")}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleContratar(match, professional)}
                          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                        >
                          Contratar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
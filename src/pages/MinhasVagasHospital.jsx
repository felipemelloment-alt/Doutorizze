import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Users, Eye, Pause, Play, CheckCircle2, Trash2, Calendar, MapPin, Clock } from "lucide-react";

export default function MinhasVagasHospital() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const loadHospital = async () => {
      try {
        const user = await base44.auth.me();
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        setHospital(hospitals[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadHospital();
  }, []);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["hospitalJobs", hospital?.id],
    queryFn: async () => {
      if (!hospital) return [];
      return await base44.entities.Job.filter({ unit_id: hospital.id });
    },
    enabled: !!hospital
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalJobs"] });
      toast.success("Vaga atualizada!");
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalJobs"] });
      toast.success("Vaga excluída!");
    }
  });

  const handlePausarAtivar = (job) => {
    const novoStatus = job.status === "ABERTO" ? "PAUSADO" : "ABERTO";
    updateJobMutation.mutate({ id: job.id, data: { status: novoStatus } });
  };

  const vagasFiltradas = jobs.filter(job => {
    if (filtroStatus === "TODAS") return true;
    if (filtroStatus === "ABERTAS") return job.status === "ABERTO";
    if (filtroStatus === "PAUSADAS") return job.status === "PAUSADO";
    if (filtroStatus === "PREENCHIDAS") return job.status === "PREENCHIDO";
    return true;
  });

  const statusConfig = {
    ABERTO: { label: "Aberta", color: "bg-green-100 text-green-700" },
    PAUSADO: { label: "Pausada", color: "bg-yellow-100 text-yellow-700" },
    PREENCHIDO: { label: "Preenchida", color: "bg-blue-100 text-blue-700" }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Minhas Vagas - Hospital</h1>
            <p className="text-gray-600 mt-1">Gerencie suas oportunidades</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("CriarVagaHospital"))}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Vaga
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {["TODAS", "ABERTAS", "PAUSADAS", "PREENCHIDAS"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroStatus(filtro)}
              className={`px-4 py-3 rounded-xl font-bold ${
                filtroStatus === filtro
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>

        {vagasFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6">🏥</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Nenhuma vaga encontrada</h3>
            <button
              onClick={() => navigate(createPageUrl("CriarVagaHospital"))}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-2xl"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Criar Primeira Vaga
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vagasFiltradas.map((job) => {
              const statusInfo = statusConfig[job.status] || statusConfig.ABERTO;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 ${statusInfo.color} font-bold rounded-full text-xs`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.titulo}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{job.descricao}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.cidade} - {job.uf}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.created_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {job.status !== "PREENCHIDO" && (
                        <button
                          onClick={() => handlePausarAtivar(job)}
                          className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400"
                        >
                          {job.status === "ABERTO" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
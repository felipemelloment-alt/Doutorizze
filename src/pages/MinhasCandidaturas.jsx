import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  X,
  Search,
  AlertTriangle
} from "lucide-react";

export default function MinhasCandidaturas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [professional, setProfessional] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [outroMotivo, setOutroMotivo] = useState("");

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

  // Buscar candidaturas - SEMPRE DA ÁREA DO PROFISSIONAL
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["myCandidaturas", professional?.id],
    queryFn: async () => {
      if (!professional?.id) return [];
      // JobMatch já conecta com Professional que tem tipo_profissional
      // então automaticamente só mostra vagas da área correta
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
    mutationFn: async ({ matchId, motivo }) => {
      await base44.entities.JobMatch.update(matchId, {
        status_candidatura: "CANCELADO",
        motivo_cancelamento: motivo
      });
      return await base44.entities.JobMatch.delete(matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCandidaturas"] });
      toast.success("✅ Candidatura cancelada com sucesso!");
      setCancelModal(null);
      setMotivoSelecionado("");
      setOutroMotivo("");
    },
    onError: (error) => {
      toast.error("❌ Erro ao cancelar candidatura: " + error.message);
    }
  });

  const handleCancelar = (item) => {
    setCancelModal(item);
    setMotivoSelecionado("");
    setOutroMotivo("");
  };

  const confirmarCancelamento = () => {
    const motivoFinal = motivoSelecionado === "OUTROS" 
      ? outroMotivo || "Outros" 
      : motivosLabels[motivoSelecionado] || "Não especificado";
    
    cancelarMutation.mutate({ 
      matchId: cancelModal.match.id, 
      motivo: motivoFinal 
    });
  };

  const motivosLabels = {
    JA_ARRUMEI: "Já arrumei emprego",
    ACHEI_JOBS: "Achei outro job na plataforma",
    DESISTI: "Desisti do job",
    DADOS_INCORRETOS: "Dados da vaga incorretos",
    SEM_INTERESSE: "Não tenho mais interesse",
    FUI_CONTRATADO: "Fui contratado por essa clínica",
    OUTROS: "Outros"
  };

  // Preparar dados combinados e ordenar por data
  const candidaturasCompletas = matches.map(match => {
    const job = jobs.find(j => j.id === match.job_id);
    const unit = job ? units.find(u => u.id === job.unit_id) : null;
    return { match, job, unit };
  }).filter(item => item.job && item.unit)
    .sort((a, b) => new Date(b.match.created_date) - new Date(a.match.created_date));

  const tipoVagaConfig = {
    PLANTAO: { label: "Plantão", color: "bg-blue-100 text-blue-700" },
    FIXO: { label: "Fixo", color: "bg-green-100 text-green-700" },
    SUBSTITUICAO: { label: "Substituição", color: "bg-yellow-100 text-yellow-700" },
    TEMPORARIO: { label: "Temporário", color: "bg-purple-100 text-purple-700" }
  };

  const statusConfig = {
    CANDIDATOU: { 
      label: "Aguardando Resposta", 
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: "⏳"
    },
    VISUALIZADO: { 
      label: "Visualizada", 
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: "👁️"
    },
    CONTATADO: { 
      label: "Em Contato", 
      color: "bg-green-100 text-green-700 border-green-200",
      icon: "✅"
    },
    REJEITADO: { 
      label: "Não Selecionado", 
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: "❌"
    }
  };

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
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-12 pb-16 px-4 relative overflow-hidden">
        {/* Decoração */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
              💼
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                Minhas Candidaturas
              </h1>
              <p className="text-white/90 text-lg">
                {candidaturasCompletas.length} {candidaturasCompletas.length === 1 ? "candidatura ativa" : "candidaturas ativas"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 pb-24">

        {/* LISTA DE CANDIDATURAS */}
        {candidaturasCompletas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-16 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-5xl">
              📄
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              Nenhuma candidatura ainda
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Você ainda não se candidatou a nenhuma vaga. Explore as oportunidades disponíveis!
            </p>
            <button
              onClick={() => navigate(createPageUrl("NewJobs"))}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
            >
              <Search className="w-6 h-6" />
              Buscar Vagas
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {candidaturasCompletas.map((item, index) => (
              <motion.div
                key={item.match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(createPageUrl("DetalheVaga") + "/" + item.job.id)}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Status Bar no Topo */}
                <div className={`px-6 py-3 border-b-4 ${statusConfig[item.match.status_candidatura]?.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{statusConfig[item.match.status_candidatura]?.icon}</span>
                    <span className="font-bold text-sm">
                      {statusConfig[item.match.status_candidatura]?.label}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(item.match.created_date), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex gap-5">
                    {/* Logo Clínica */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform">
                        {item.unit.nome_fantasia?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {item.job.titulo}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">{item.unit.nome_fantasia}</span>
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{item.job.cidade} - {item.job.uf}</span>
                        </p>
                      </div>

                      {/* Badges Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-4 py-2 ${tipoVagaConfig[item.job.tipo_vaga]?.color} font-bold rounded-full text-xs`}>
                          {tipoVagaConfig[item.job.tipo_vaga]?.label}
                        </span>
                        {item.job.valor_proposto && item.job.tipo_remuneracao !== "A_COMBINAR" && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-xs flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            R$ {item.job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        {item.job.horario_inicio && item.job.horario_fim && (
                          <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-full text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.job.horario_inicio} - {item.job.horario_fim}
                          </span>
                        )}
                      </div>

                      {/* Footer - Ações */}
                      {item.match.status_candidatura === "CANDIDATOU" && (
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelar(item);
                            }}
                            disabled={cancelarMutation.isPending}
                            className="px-5 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 border-2 border-red-200 hover:border-red-400"
                          >
                            <X className="w-4 h-4" />
                            Cancelar Candidatura
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cancelamento */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCancelModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-gray-900">Cancelar Candidatura</h3>
                  <button
                    onClick={() => setCancelModal(null)}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Vaga:</strong> {cancelModal.job.titulo}
                </p>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Por favor, selecione o motivo do cancelamento:
                  </p>
                </div>

                {/* Opções de Motivo */}
                <div className="space-y-2">
                  {[
                    { value: "JA_ARRUMEI", label: "Já arrumei emprego" },
                    { value: "ACHEI_JOBS", label: "Achei outro job na plataforma" },
                    { value: "DESISTI", label: "Desisti do job" },
                    { value: "DADOS_INCORRETOS", label: "Dados da vaga incorretos" },
                    { value: "SEM_INTERESSE", label: "Não tenho mais interesse" },
                    { value: "FUI_CONTRATADO", label: "Fui contratado por essa clínica" },
                    { value: "OUTROS", label: "Outros" }
                  ].map(motivo => (
                    <label 
                      key={motivo.value} 
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all ${
                        motivoSelecionado === motivo.value ? "border-orange-500 bg-orange-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="motivo"
                        value={motivo.value}
                        checked={motivoSelecionado === motivo.value}
                        onChange={(e) => setMotivoSelecionado(e.target.value)}
                        className="w-5 h-5 text-orange-500 focus:ring-2 focus:ring-orange-400"
                      />
                      <span className={`font-medium ${
                        motivoSelecionado === motivo.value ? "text-orange-700" : "text-gray-700"
                      }`}>
                        {motivo.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Campo Outros */}
                {motivoSelecionado === "OUTROS" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Descreva o motivo:
                    </label>
                    <textarea
                      placeholder="Descreva o motivo do cancelamento..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none resize-none"
                      rows={4}
                      value={outroMotivo}
                      onChange={(e) => setOutroMotivo(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setCancelModal(null)} 
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmarCancelamento}
                  disabled={!motivoSelecionado || cancelarMutation.isPending || (motivoSelecionado === "OUTROS" && !outroMotivo.trim())}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {cancelarMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      Confirmar Cancelamento
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  Phone,
  Instagram,
  ExternalLink,
  Building2,
  Award,
  CheckCircle2,
  Send,
  X,
  Flag,
  AlertTriangle,
  Edit,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import ShareButton from "@/components/shared/ShareButton";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";
import ProposalForm from "@/components/freelancer/ProposalForm";

export default function DetalheVaga() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [dadosCorretos, setDadosCorretos] = useState(false);
  const [candidaturasNoMes, setCandidaturasNoMes] = useState(0);
  const [verificandoLimite, setVerificandoLimite] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Detectar tipo
        const freelancerResult = await base44.entities.Freelancer.filter({ user_id: currentUser.id });
        if (freelancerResult.length > 0) {
          setUserType("freelancer");
          setFreelancer(freelancerResult[0]);
          return;
        }

        const profResult = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (profResult.length > 0) {
          setUserType("professional");
          setProfessional(profResult[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Buscar vaga
  const { data: vaga, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.Job.filter({ id });
      return result[0] || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Buscar unidade/clínica
  const { data: unit } = useQuery({
    queryKey: ["unit", vaga?.unit_id],
    queryFn: async () => {
      if (!vaga?.unit_id) return null;
      const result = await base44.entities.CompanyUnit.filter({ id: vaga.unit_id });
      return result[0] || null;
    },
    enabled: !!vaga?.unit_id
  });

  // Verificar se já candidatou
  const { data: jaCandidatou } = useQuery({
    queryKey: ["jobMatch", id, professional?.id, freelancer?.id],
    queryFn: async () => {
      if (!id) return false;
      const applicantId = userType === "freelancer" ? freelancer?.id : professional?.id;
      if (!applicantId) return false;

      const matches = await base44.entities.JobMatch.filter({
        job_id: id,
        applicant_id: applicantId
      });
      return matches.length > 0;
    },
    enabled: (!!professional?.id || !!freelancer?.id) && !!id
  });

  // Verificar limite de candidaturas
  const verificarLimiteCandidaturas = async () => {
    if (!professional?.id || !vaga?.especialidades_aceitas) return 0;

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const candidaturas = await base44.entities.JobMatch.filter({
      professional_id: professional.id,
      status_candidatura: "CANDIDATOU"
    });

    const candidaturasMesEspecialidade = candidaturas.filter(c => {
      const dataCandidatura = new Date(c.created_date);
      return dataCandidatura >= inicioMes;
    });

    return candidaturasMesEspecialidade.length;
  };

  // Mutation para candidatar (professional)
  const candidatarMutation = useMutation({
    mutationFn: async () => {
      if (!professional?.id || !id) throw new Error("Dados incompletos");
      
      return await base44.entities.JobMatch.create({
        job_id: id,
        applicant_type: "professional",
        applicant_id: professional.id,
        professional_id: professional.id,
        match_score: 0,
        match_type: "OUTROS",
        status_candidatura: "CANDIDATOU"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobMatch"] });
      toast.success("✅ Candidatura enviada com sucesso!");
      setConfirmModal(false);
      setDadosCorretos(false);
    },
    onError: (error) => {
      toast.error("❌ Erro ao enviar candidatura: " + error.message);
    }
  });

  // Mutation para proposta (freelancer)
  const enviarPropostaMutation = useMutation({
    mutationFn: async (proposalData) => {
      if (!freelancer?.id || !id) throw new Error("Dados incompletos");

      return await base44.entities.JobMatch.create({
        job_id: id,
        applicant_type: "freelancer",
        applicant_id: freelancer.id,
        match_score: 0,
        match_type: "OUTROS",
        status_candidatura: "CANDIDATOU",
        proposal: proposalData,
        proposal_status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobMatch"] });
      toast.success("✅ Proposta enviada com sucesso!");
      setShowProposalDialog(false);
    },
    onError: (error) => {
      toast.error("❌ Erro ao enviar proposta: " + error.message);
    }
  });

  const handleFreelanceProposal = async (proposalData) => {
    await enviarPropostaMutation.mutateAsync(proposalData);
  };

  const handleCandidatar = async () => {
    setVerificandoLimite(true);
    const total = await verificarLimiteCandidaturas();
    setCandidaturasNoMes(total);
    setVerificandoLimite(false);
    
    if (total >= 3) {
      toast.error("⚠️ Você atingiu o limite de 3 candidaturas este mês para esta especialidade.");
      return;
    }
    
    setConfirmModal(true);
  };

  const confirmarCandidatura = () => {
    candidatarMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  if (isError || !vaga || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">Vaga não encontrada</p>
          <p className="text-gray-600 mb-4">Esta vaga pode ter sido removida ou não existe.</p>
          <button
            onClick={() => navigate(createPageUrl("NewJobs"))}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Ver Vagas Disponíveis
          </button>
        </div>
      </div>
    );
  }

  const tipoVagaConfig = {
    PLANTAO: { label: "Plantão", color: "bg-blue-100 text-blue-700" },
    FIXO: { label: "Fixo", color: "bg-green-100 text-green-700" },
    SUBSTITUICAO: { label: "Substituição", color: "bg-yellow-100 text-yellow-700" },
    TEMPORARIO: { label: "Temporário", color: "bg-purple-100 text-purple-700" }
  };

  const tipoRemuneracaoLabels = {
    FIXO: "mensal",
    DIARIA: "por dia",
    PORCENTAGEM: "porcentagem",
    A_COMBINAR: "a combinar"
  };

  const selecaoDiasLabels = {
    ESPECIFICOS: "Dias específicos",
    SEMANA_TODA: "Semana toda (Seg-Sex)",
    MES_TODO: "Mês todo"
  };

  // Verificar se pode aplicar
  const canApply = userType === "freelancer"
    ? vaga?.accepts_applications_from?.freelancers
    : vaga?.accepts_applications_from?.professionals;

  const isFreelanceJob = vaga?.job_type === "freelance" || vaga?.job_type === "contract" || vaga?.accepts_applications_from?.freelancers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      {/* HEADER */}
      <div className="bg-white border-b-2 border-gray-100 p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="flex gap-2">
              <ShareButton
                title={vaga.titulo}
                text={`${vaga.tipo_vaga} - ${vaga.cidade}/${vaga.uf}`}
                url={window.location.href}
                className="px-3 py-2 text-sm"
              />
              <button
                onClick={() => navigate(createPageUrl("Denunciar") + "?tipo=VAGA&id=" + id)}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-medium transition-colors group"
                title="Denunciar"
              >
                <Flag className="w-5 h-5" />
                <span className="text-sm">Denunciar</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{vaga.titulo}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-4 py-2 ${tipoVagaConfig[vaga.tipo_vaga]?.color} font-bold rounded-full text-sm`}>
                  {tipoVagaConfig[vaga.tipo_vaga]?.label}
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-full text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {vaga.cidade} - {vaga.uf}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* CARD CLÍNICA */}
        {unit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                {unit.nome_fantasia?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-gray-900 truncate">{unit.nome_fantasia}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {unit.cidade} - {unit.uf}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(unit.media_avaliacoes || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    {unit.media_avaliacoes?.toFixed(1) || "0.0"} ({unit.total_avaliacoes || 0})
                  </span>
                </div>
                </div>
                <button
                onClick={() => navigate(createPageUrl("PerfilClinicaPublico") + "/" + unit.id)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-yellow-400 hover:text-yellow-600 transition-all whitespace-nowrap"
                >
                Ver Clínica
                </button>
            </div>
          </motion.div>
        )}

        {/* CARD DESCRIÇÃO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Sobre a Vaga</h2>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{vaga.descricao}</p>

          {vaga.especialidades_aceitas && vaga.especialidades_aceitas.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Especialidades Aceitas:</p>
              <div className="flex flex-wrap gap-2">
                {vaga.especialidades_aceitas.map((esp, index) => (
                  <span key={index} className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
                    {esp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {vaga.exige_experiencia && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <p className="font-semibold text-gray-900">
                  Exige experiência: {vaga.tempo_experiencia_minimo} {vaga.tempo_experiencia_minimo === 1 ? "ano" : "anos"}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* CARD HORÁRIOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Horários e Dias</h2>
          </div>

          <div className="space-y-4">
            {vaga.selecao_dias && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Período:</p>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                  {selecaoDiasLabels[vaga.selecao_dias] || vaga.selecao_dias}
                </span>
              </div>
            )}

            {vaga.dias_semana && vaga.dias_semana.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Dias da Semana:</p>
                <div className="flex flex-wrap gap-2">
                  {vaga.dias_semana.map((dia, index) => (
                    <span key={index} className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
                      {dia}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vaga.horario_inicio && vaga.horario_fim && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-bold text-gray-900">
                    {vaga.horario_inicio} - {vaga.horario_fim}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* CARD SKILLS (se houver) */}
        {(vaga.required_skills?.length > 0 || vaga.preferred_skills?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4">Habilidades</h2>
            
            {vaga.required_skills?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Obrigatórias:</p>
                <div className="flex flex-wrap gap-2">
                  {vaga.required_skills.map((skill, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-700 border-red-300 border-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {vaga.preferred_skills?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Desejáveis:</p>
                <div className="flex flex-wrap gap-2">
                  {vaga.preferred_skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="border-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* CARD DETALHES DO PROJETO (freelance) */}
        {isFreelanceJob && vaga.project_details && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 border-2 border-purple-200"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4">📋 Detalhes do Projeto</h2>
            
            <div className="space-y-3">
              {vaga.project_details.duration_estimate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">
                    <strong>Duração:</strong> {vaga.project_details.duration_estimate}
                  </span>
                </div>
              )}

              {vaga.project_details.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">
                    <strong>Prazo:</strong> {new Date(vaga.project_details.deadline).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {vaga.project_details.budget_range && (
                <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Orçamento Sugerido:</p>
                  <p className="text-2xl font-black text-purple-700">
                    R$ {vaga.project_details.budget_range.min?.toLocaleString('pt-BR')} - R$ {vaga.project_details.budget_range.max?.toLocaleString('pt-BR')}
                  </p>
                  {vaga.project_details.budget_type && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tipo: {vaga.project_details.budget_type === "hourly" ? "Por hora" : vaga.project_details.budget_type === "daily" ? "Por dia" : "Valor fixo"}
                    </p>
                  )}
                </div>
              )}

              {vaga.project_details.milestones?.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Marcos do Projeto:</p>
                  <div className="space-y-2">
                    {vaga.project_details.milestones.map((milestone, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-900">{milestone.title}</p>
                          <Badge variant="outline">{milestone.payment_percentage}%</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CARD REMUNERAÇÃO - DESTAQUE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-black text-white">Remuneração</h2>
          </div>

          {vaga.tipo_remuneracao === "A_COMBINAR" ? (
            <p className="text-4xl font-black text-white mb-2">A Combinar</p>
          ) : (
            <>
              <p className="text-5xl font-black text-white mb-2">
                R$ {vaga.valor_proposto?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xl text-white/80 font-semibold">
                {tipoRemuneracaoLabels[vaga.tipo_remuneracao]}
              </p>
            </>
          )}

          {vaga.beneficios && (
            <div className="mt-4 p-4 bg-white/20 backdrop-blur rounded-2xl">
              <p className="text-sm text-white/90 font-semibold mb-1">Benefícios:</p>
              <p className="text-white">{vaga.beneficios}</p>
            </div>
          )}
        </motion.div>

        {/* CARD CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Contato</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Falar com:</p>
              <p className="font-bold text-gray-900 text-lg">{vaga.falar_com}</p>
            </div>

            {unit?.whatsapp && (
              <WhatsAppSafeButton
                phone={unit.whatsapp}
                message={`Olá! Vi a vaga "${vaga.titulo}" e gostaria de mais informações.`}
                className="w-full py-4 px-6 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Phone className="w-5 h-5" />
                Entrar em Contato via WhatsApp
              </WhatsAppSafeButton>
            )}

            {vaga.instagram_clinica && (
              <a
                href={`https://instagram.com/${vaga.instagram_clinica}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instagram da Clínica</p>
                    <p className="font-bold text-gray-900">@{vaga.instagram_clinica}</p>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
            )}
          </div>
        </motion.div>

        {/* CARD LOCALIZAÇÃO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Localização</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-bold text-gray-900 text-lg">{vaga.cidade} - {vaga.uf}</p>
                <p className="text-sm text-gray-600">Local da vaga</p>
              </div>
            </div>
            
            {unit?.google_maps_link && (
              <button
                onClick={() => window.open(unit.google_maps_link, "_blank")}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                Ver no Mapa
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* FOOTER FIXO - BOTÃO CANDIDATAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto">
          {!canApply ? (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Esta vaga não aceita candidaturas de <strong>{userType === "freelancer" ? "freelancers" : "profissionais CLT/PJ"}</strong>
              </AlertDescription>
            </Alert>
          ) : jaCandidatou ? (
            <button
              disabled
              className="w-full py-5 bg-gray-300 text-gray-500 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6" />
              Você já se candidatou a esta vaga
            </button>
          ) : userType === "freelancer" ? (
            <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
              <DialogTrigger asChild>
                <button className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 text-lg">
                  <Send className="w-6 h-6" />
                  ENVIAR PROPOSTA
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <ProposalForm
                  job={vaga}
                  freelancer={freelancer}
                  onSubmit={handleFreelanceProposal}
                  onCancel={() => setShowProposalDialog(false)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <button
              onClick={handleCandidatar}
              disabled={verificandoLimite}
              className="w-full py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {verificandoLimite ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Verificando limite...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  CANDIDATAR-SE A ESTA VAGA
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmModal(false)}
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
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900">Confirmar Candidatura</h3>
                <button
                  onClick={() => setConfirmModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-4">
                {/* Aviso de Limite */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-semibold">
                      Você tem <span className="font-black">{3 - candidaturasNoMes}</span> candidatura{3 - candidaturasNoMes !== 1 ? 's' : ''} restante{3 - candidaturasNoMes !== 1 ? 's' : ''} este mês.
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Limite: 3 candidaturas por mês
                    </p>
                  </div>
                </div>

                {/* Verificação de Dados */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-900">Verifique seus dados:</p>
                    <button
                      onClick={() => navigate(createPageUrl("EditarPerfil"))}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-semibold text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <strong className="text-gray-900 min-w-[120px]">Nome:</strong>
                      <span className="text-gray-700">{professional?.nome_completo}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <strong className="text-gray-900 min-w-[120px]">Especialidade:</strong>
                      <span className="text-gray-700">{professional?.especialidade_principal}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <strong className="text-gray-900 min-w-[120px]">
                        {professional?.tipo_profissional === "DENTISTA" ? "CRO:" : "CRM:"}
                      </strong>
                      <span className="text-gray-700">{professional?.registro_conselho} - {professional?.uf_conselho}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <strong className="text-gray-900 min-w-[120px]">Cidades:</strong>
                      <span className="text-gray-700">{professional?.cidades_atendimento?.join(", ")}</span>
                    </li>
                  </ul>
                </div>

                {/* Dados da Vaga */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-gray-900 mb-2">Vaga:</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{vaga?.titulo}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vaga?.cidade} - {vaga?.uf}
                  </p>
                  {vaga?.valor_proposto && vaga?.tipo_remuneracao !== "A_COMBINAR" && (
                    <p className="text-sm text-green-600 font-bold mt-2 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      R$ {vaga?.valor_proposto?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                {/* Confirmação */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dadosCorretos}
                    onChange={(e) => setDadosCorretos(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Confirmo que meus dados estão corretos e estou ciente das informações da vaga
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setConfirmModal(false);
                    setDadosCorretos(false);
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCandidatura}
                  disabled={!dadosCorretos || candidatarMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {candidatarMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Confirmar Candidatura
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
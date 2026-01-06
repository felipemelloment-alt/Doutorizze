import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  Send,
  Zap,
  Flag
} from "lucide-react";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

export default function VerProfissional() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const matchId = urlParams.get("matchId");
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [companyUnit, setCompanyUnit] = useState(null);
  const [showConvidarModal, setShowConvidarModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const ownerResult = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (ownerResult[0]) {
          const unitResult = await base44.entities.CompanyUnit.filter({ owner_id: ownerResult[0].id });
          setCompanyUnit(unitResult[0] || null);
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadData();
  }, []);

  // Buscar profissional
  const { data: professional, isLoading, isError } = useQuery({
    queryKey: ["professional", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.Professional.filter({ id });
      return result[0] || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", id],
    queryFn: async () => {
      if (!id || !professional) return [];
      return await base44.entities.Rating.filter({ 
        avaliado_id: id,
        avaliado_tipo: professional.tipo_profissional
      });
    },
    enabled: !!id && !!professional
  });

  // Buscar match se houver matchId
  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const result = await base44.entities.JobMatch.filter({ id: matchId });
      return result[0] || null;
    },
    enabled: !!matchId
  });

  // Buscar vaga se houver match
  const { data: job } = useQuery({
    queryKey: ["job", match?.job_id],
    queryFn: async () => {
      if (!match?.job_id) return null;
      const result = await base44.entities.Job.filter({ id: match.job_id });
      return result[0] || null;
    },
    enabled: !!match?.job_id
  });

  // Buscar vagas abertas da clínica
  const { data: vagasAbertas = [] } = useQuery({
    queryKey: ["vagasAbertas", companyUnit?.id],
    queryFn: async () => {
      if (!companyUnit?.id) return [];
      return await base44.entities.Job.filter({ 
        unit_id: companyUnit.id,
        status: "ABERTO"
      });
    },
    enabled: !!companyUnit?.id
  });

  // Mutation para recusar
  const recusarMutation = useMutation({
    mutationFn: async () => {
      if (!matchId) throw new Error("Match ID não encontrado");
      return await base44.entities.JobMatch.update(matchId, {
        status_candidatura: "REJEITADO"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match"] });
      toast.success("Candidato recusado");
      navigate(-1);
    },
    onError: (error) => {
      toast.error("Erro ao recusar: " + error.message);
    }
  });

  // Mutation para convidar para vaga
  const convidarMutation = useMutation({
    mutationFn: async (jobId) => {
      if (!id) throw new Error("Profissional não encontrado");
      
      // Verificar se já existe match
      const existingMatches = await base44.entities.JobMatch.filter({
        job_id: jobId,
        professional_id: id
      });
      
      if (existingMatches.length > 0) {
        throw new Error("Este profissional já foi convidado para esta vaga");
      }
      
      return await base44.entities.JobMatch.create({
        job_id: jobId,
        professional_id: id,
        match_score: 0,
        match_type: "OUTROS",
        status_candidatura: "MATCH_AUTOMATICO"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobMatches"] });
      toast.success("Convite enviado com sucesso!");
      setShowConvidarModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (isError || !professional || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">Profissional não encontrado</p>
          <p className="text-gray-600 mb-4">Este perfil pode ter sido removido ou não existe.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const mediaAvaliacoes = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.nota, 0) / ratings.length)
    : 0;

  const distribuicao = [5, 4, 3, 2, 1].map(estrela => ({
    estrelas: estrela,
    count: ratings.filter(r => r.nota === estrela).length
  }));

  const disponibilidadeLabels = {
    IMEDIATO: "Imediato",
    "15_DIAS": "15 dias",
    "30_DIAS": "30 dias",
    "60_DIAS": "60 dias",
    A_COMBINAR: "A combinar"
  };

  // Calcular compatibilidade
  let matchScore = 0;
  if (match) {
    matchScore = (match.match_score || 0) * 25; // Converte 0-4 para 0-100
  }

  // Verificar se cidade da clínica está na lista do profissional
  const cidadeClinica = companyUnit ? `${companyUnit.cidade} - ${companyUnit.uf}` : null;
  const temCidadeMatch = cidadeClinica && professional.cidades_atendimento?.includes(cidadeClinica);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-8 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={() => navigate(createPageUrl("Denunciar") + "?tipo=PROFISSIONAL&id=" + id)}
              className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors"
              title="Denunciar"
            >
              <Flag className="w-5 h-5" />
              <span className="text-sm">Denunciar</span>
            </button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            {/* Foto */}
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                {professional.nome_completo?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Nome e Info */}
            <h1 className="text-3xl font-black text-white mb-2">{professional.nome_completo}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm">
                {professional.tipo_profissional === "DENTISTA" ? "🦷 Dentista" : "🩺 Médico"}
              </span>
              {match && matchScore > 0 && (
                <span className="px-4 py-2 bg-green-400 text-white font-bold rounded-full text-sm flex items-center gap-1 shadow-lg">
                  <Zap className="w-4 h-4" />
                  {matchScore}% compatível
                </span>
              )}
            </div>

            <p className="text-white/90 text-lg font-semibold">{professional.especialidade_principal}</p>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12 space-y-6 relative z-10">
        {/* AVALIAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Star className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Avaliações</h2>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900 mb-1">{mediaAvaliacoes.toFixed(1)}</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(mediaAvaliacoes) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{ratings.length} avaliações</p>
            </div>

            <div className="flex-1 space-y-2">
              {distribuicao.map(({ estrelas, count }) => (
                <div key={estrelas} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{estrelas} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* INFORMAÇÕES PROFISSIONAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Informações Profissionais</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <Briefcase className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Registro</p>
                <p className="font-bold text-gray-900">
                  {professional.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"} {professional.registro_conselho} - {professional.uf_conselho}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Tempo de Formado</p>
                <p className="font-bold text-gray-900">{professional.tempo_formado_anos} anos</p>
              </div>
            </div>

            {professional.tempo_especialidade_anos > 0 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <Star className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tempo na Especialidade</p>
                  <p className="font-bold text-gray-900">{professional.tempo_especialidade_anos} anos</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Aceita Freelance</p>
                <p className="font-bold text-gray-900">{professional.aceita_freelance ? "Sim ✓" : "Não"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DISPONIBILIDADE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Disponibilidade</h2>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Dias Disponíveis</p>
            <div className="flex flex-wrap gap-2">
              {professional.dias_semana_disponiveis?.map((dia) => (
                <span key={dia} className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
                  {dia === "INTEGRAL" ? "Integral (Todos os dias)" : dia}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Disponibilidade para Início</p>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              {disponibilidadeLabels[professional.disponibilidade_inicio]}
            </span>
          </div>

          {professional.forma_remuneracao && professional.forma_remuneracao.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Formas de Remuneração Aceitas</p>
              <div className="flex flex-wrap gap-2">
                {professional.forma_remuneracao.map((forma) => (
                  <span key={forma} className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
                    {forma === "DIARIA" ? "Diária" : forma === "PORCENTAGEM" ? "Porcentagem" : forma === "FIXO" ? "Fixo" : "A Combinar"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* CIDADES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Cidades de Atendimento</h2>
              {temCidadeMatch && (
                <p className="text-sm text-green-600 font-semibold">✓ Atende na sua cidade!</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {professional.cidades_atendimento?.map((cidade, index) => (
              <span
                key={index}
                className={`px-5 py-3 font-bold rounded-full text-sm flex items-center gap-2 ${
                  cidade === cidadeClinica
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg border-2 border-yellow-500"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <MapPin className="w-4 h-4" />
                {cidade}
                {cidade === cidadeClinica && <CheckCircle2 className="w-4 h-4" />}
              </span>
            ))}
          </div>
        </motion.div>

        {/* EXPERIÊNCIAS PROFISSIONAIS */}
        {(professional.experiencias_profissionais?.length > 0 || professional.cursos_aperfeicoamento?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Experiências Profissionais</h2>
            </div>

            {professional.experiencias_profissionais?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Experiências de Trabalho</h3>
                <div className="space-y-4">
                  {professional.experiencias_profissionais.map((exp, index) => (
                    <div key={index} className="border-l-4 border-yellow-400 pl-5 py-3 bg-yellow-50 rounded-r-xl">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{exp.empresa_clinica}</h4>
                      {exp.cargo && (
                        <p className="text-sm text-gray-600 mb-2">{exp.cargo}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.periodo_inicio} - {exp.periodo_fim || "Atual"}
                        </span>
                        {exp.anos_trabalhados > 0 && (
                          <span className="px-3 py-1 bg-yellow-200 text-yellow-800 font-bold rounded-full text-xs">
                            {exp.anos_trabalhados} {exp.anos_trabalhados === 1 ? "ano" : "anos"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {professional.cursos_aperfeicoamento?.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">Cursos de Aperfeiçoamento</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {professional.cursos_aperfeicoamento.map((curso, index) => (
                    <div key={index} className="border-2 border-blue-200 bg-blue-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{curso.nome_curso}</h4>
                          <p className="text-sm text-gray-600 mb-1">{curso.instituicao}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>📅 {curso.ano_conclusao}</span>
                            {curso.carga_horaria > 0 && (
                              <>
                                <span>•</span>
                                <span>⏱️ {curso.carga_horaria}h</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Contato</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-bold text-gray-900">
                    ({professional.whatsapp?.slice(0, 2)}) {professional.whatsapp?.slice(2, 7)}-{professional.whatsapp?.slice(7)}
                  </p>
                </div>
              </div>
              <WhatsAppSafeButton
                phone={professional.whatsapp}
                message={`Olá! Vi seu perfil na Doutorizze e gostaria de conversar.`}
                buttonText="Abrir"
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-md"
              />
            </div>

            {professional.exibir_email && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-bold text-gray-900">{professional.email}</p>
                </div>
              </div>
            )}

            {professional.instagram && (
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instagram</p>
                    <p className="font-bold text-gray-900">@{professional.instagram}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://instagram.com/${professional.instagram}`, "_blank")}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                >
                  Abrir
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto">
          {matchId ? (
            // Se veio de uma vaga específica
            <div className="flex gap-3">
              <button
                onClick={() => recusarMutation.mutate()}
                disabled={recusarMutation.isPending}
                className="flex-1 py-4 bg-red-100 text-red-700 font-bold rounded-2xl hover:bg-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Recusar
              </button>
              <button
                onClick={() => navigate(createPageUrl("Contratar") + "?id=" + matchId)}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                CONTRATAR PROFISSIONAL
              </button>
            </div>
          ) : (
            // Se veio da busca geral
            <div className="flex gap-3">
              <WhatsAppSafeButton
                phone={professional.whatsapp}
                message={`Olá! Vi seu perfil na Doutorizze e gostaria de conversar sobre uma oportunidade.`}
                className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Entrar em Contato
              </WhatsAppSafeButton>
              <button
                onClick={() => setShowConvidarModal(true)}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Convidar para Vaga
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CONVIDAR */}
      {showConvidarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowConvidarModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Convidar para Vaga</h3>
                <button onClick={() => setShowConvidarModal(false)} className="text-white hover:bg-white/20 rounded-full p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/80 mt-2">Selecione uma vaga para convidar {professional.nome_completo}</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {vagasAbertas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Você não tem vagas abertas no momento</p>
                  <button
                    onClick={() => navigate(createPageUrl("CriarVaga"))}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                  >
                    Criar Nova Vaga
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vagasAbertas.map((vaga) => (
                    <button
                      key={vaga.id}
                      onClick={() => convidarMutation.mutate(vaga.id)}
                      disabled={convidarMutation.isPending}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-2xl hover:border-yellow-400 hover:bg-yellow-50 transition-all disabled:opacity-50"
                    >
                      <h4 className="font-bold text-gray-900 mb-1">{vaga.titulo}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {vaga.cidade} - {vaga.uf}
                        {vaga.valor_proposto && vaga.tipo_remuneracao !== "A_COMBINAR" && (
                          <>
                            <span>•</span>
                            <span>R$ {vaga.valor_proposto.toLocaleString("pt-BR")}</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
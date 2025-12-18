import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
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
  X
} from "lucide-react";

export default function DetalheVaga() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const profResult = await base44.entities.Professional.filter({ user_id: currentUser.id });
        setProfessional(profResult[0] || null);
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
    queryKey: ["jobMatch", id, professional?.id],
    queryFn: async () => {
      if (!professional?.id || !id) return false;
      const matches = await base44.entities.JobMatch.filter({
        job_id: id,
        professional_id: professional.id
      });
      return matches.length > 0;
    },
    enabled: !!professional?.id && !!id
  });

  // Mutation para candidatar
  const candidatarMutation = useMutation({
    mutationFn: async () => {
      if (!professional?.id || !id) throw new Error("Dados incompletos");
      
      return await base44.entities.JobMatch.create({
        job_id: id,
        professional_id: professional.id,
        match_score: 0,
        match_type: "OUTROS",
        status_candidatura: "CANDIDATOU"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobMatch"] });
      toast.success("✅ Candidatura enviada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar candidatura: " + error.message);
    }
  });

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

  const handleCandidatar = () => {
    candidatarMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      {/* HEADER */}
      <div className="bg-white border-b-2 border-gray-100 p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

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
                onClick={() => navigate(createPageUrl("PerfilClinicaPublico") + "?id=" + unit.id)}
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
              <button
                onClick={() => window.open(`https://wa.me/55${unit.whatsapp}?text=Olá! Vi a vaga "${vaga.titulo}" e gostaria de mais informações.`, "_blank")}
                className="w-full py-4 px-6 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Phone className="w-5 h-5" />
                Entrar em Contato via WhatsApp
              </button>
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
          {jaCandidatou ? (
            <button
              disabled
              className="w-full py-5 bg-gray-300 text-gray-500 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6" />
              Você já se candidatou a esta vaga
            </button>
          ) : (
            <button
              onClick={handleCandidatar}
              disabled={candidatarMutation.isPending}
              className="w-full py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {candidatarMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Enviando candidatura...
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
    </div>
  );
}
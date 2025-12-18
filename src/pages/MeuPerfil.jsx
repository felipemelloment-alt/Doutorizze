import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Edit,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Share2,
  CheckCircle2,
  Calendar,
  DollarSign,
  Eye,
  FileText,
  Users,
  Clock,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";

export default function MeuPerfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Buscar dados do profissional
  const { data: professional, isLoading } = useQuery({
    queryKey: ["professional", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const result = await base44.entities.Professional.filter({ user_id: user.id });
      return result[0] || null;
    },
    enabled: !!user
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.Rating.filter({ 
        avaliado_id: professional.id,
        avaliado_tipo: professional.tipo_profissional === "DENTISTA" ? "DENTISTA" : "MEDICO"
      });
    },
    enabled: !!professional
  });

  // Buscar matches para estatísticas
  const { data: matches = [] } = useQuery({
    queryKey: ["jobMatches", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.JobMatch.filter({ professional_id: professional.id });
    },
    enabled: !!professional
  });

  if (isLoading || !professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Calcular avaliações
  const mediaAvaliacoes = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.nota, 0) / ratings.length)
    : 0;

  // Distribuição de estrelas
  const distribuicao = [5, 4, 3, 2, 1].map(estrela => ({
    estrelas: estrela,
    count: ratings.filter(r => r.nota === estrela).length
  }));

  // Status config
  const statusConfig = {
    DISPONIVEL: { label: "Disponível", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-100" },
    INDISPONIVEL: { label: "Indisponível", color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-100" },
    OCUPADO: { label: "Ocupado", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-100" }
  };

  const currentStatus = statusConfig[professional.status_disponibilidade] || statusConfig.DISPONIVEL;

  // Disponibilidade labels
  const disponibilidadeLabels = {
    IMEDIATO: "Imediato",
    "15_DIAS": "15 dias",
    "30_DIAS": "30 dias",
    "60_DIAS": "60 dias",
    A_COMBINAR: "A combinar"
  };

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${professional.nome_completo}`,
        text: `${professional.especialidade_principal} - ${professional.cidades_atendimento?.[0]}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const candidaturasEnviadas = matches.filter(m => m.status_candidatura === "CANDIDATOU").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* HEADER COM FOTO */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-8 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Foto */}
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {professional.nome_completo?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Nome e Info */}
            <h1 className="text-3xl font-black text-white mb-2">{professional.nome_completo}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className={`px-4 py-2 ${currentStatus.color} text-white font-bold rounded-full text-sm shadow-lg`}>
                {currentStatus.label}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm">
                {professional.tipo_profissional === "DENTISTA" ? "🦷 Dentista" : "🩺 Médico"}
              </span>
            </div>

            <p className="text-white/90 text-lg font-semibold mb-4">{professional.especialidade_principal}</p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(createPageUrl("EditarPerfil"))}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
              <button
                onClick={handleCompartilhar}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur text-white font-bold rounded-xl hover:bg-white/30 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12 space-y-6">
        {/* SEÇÃO AVALIAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Avaliações</h2>
              <p className="text-sm text-gray-600">Sua reputação na plataforma</p>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900 mb-1">{mediaAvaliacoes.toFixed(1)}</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(mediaAvaliacoes) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{ratings.length} avaliações</p>
            </div>

            {/* Distribuição */}
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
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Informações Profissionais</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Registro Profissional</p>
                <p className="font-bold text-gray-900">
                  {professional.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"} {professional.registro_conselho} - {professional.uf_conselho}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Tempo de Formado</p>
                <p className="font-bold text-gray-900">{professional.tempo_formado_anos} anos</p>
              </div>
            </div>

            {professional.tempo_especialidade_anos > 0 && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tempo na Especialidade</p>
                  <p className="font-bold text-gray-900">{professional.tempo_especialidade_anos} anos</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5" />
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
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Disponibilidade</h2>
            </div>
          </div>

          {/* Dias Disponíveis */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Dias Disponíveis</p>
            <div className="flex flex-wrap gap-2">
              {professional.dias_semana_disponiveis?.map((dia) => (
                <span
                  key={dia}
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-full text-sm"
                >
                  {dia === "INTEGRAL" ? "Integral (Todos os dias)" : dia}
                </span>
              ))}
            </div>
          </div>

          {/* Início */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Disponibilidade para Início</p>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              {disponibilidadeLabels[professional.disponibilidade_inicio]}
            </span>
          </div>

          {/* Forma de Remuneração */}
          {professional.forma_remuneracao && professional.forma_remuneracao.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Formas de Remuneração Aceitas</p>
              <div className="flex flex-wrap gap-2">
                {professional.forma_remuneracao.map((forma) => (
                  <span
                    key={forma}
                    className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-full text-sm"
                  >
                    {forma === "DIARIA" ? "Diária" : forma === "PORCENTAGEM" ? "Porcentagem" : forma === "FIXO" ? "Fixo" : "A Combinar"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* CIDADES DE ATENDIMENTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Cidades de Atendimento</h2>
              <p className="text-sm text-gray-600">Onde você pode atuar</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {professional.cidades_atendimento?.map((cidade, index) => (
              <span
                key={index}
                className="px-5 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-bold rounded-2xl text-sm flex items-center gap-2 shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                {cidade}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CONTATO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Contato</h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* WhatsApp */}
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
              <button
                onClick={() => window.open(`https://wa.me/55${professional.whatsapp}`, "_blank")}
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
              >
                Abrir
              </button>
            </div>

            {/* Email */}
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

            {/* Instagram */}
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
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Abrir
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* OBSERVAÇÕES */}
        {professional.observacoes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Sobre Mim</h2>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{professional.observacoes}</p>
          </motion.div>
        )}

        {/* ESTATÍSTICAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600">Contratações</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{professional.total_contratacoes || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600">Visualizações</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{professional.total_contratacoes || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600">Candidaturas</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{candidaturasEnviadas}</p>
          </div>
        </motion.div>
      </div>

      {/* BOTÃO FLUTUANTE EDITAR */}
      <button
        onClick={() => navigate(createPageUrl("EditarPerfil"))}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50"
      >
        <Edit className="w-6 h-6" />
      </button>
    </div>
  );
}
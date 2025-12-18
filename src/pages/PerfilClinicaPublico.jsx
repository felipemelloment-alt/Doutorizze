import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Star,
  Building2,
  MapPin,
  Phone,
  Mail,
  Share2,
  CheckCircle2,
  Briefcase,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Flag
} from "lucide-react";
import { toast } from "sonner";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

export default function PerfilClinicaPublico() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Buscar unidade da clínica
  const { data: unit, isLoading } = useQuery({
    queryKey: ["companyUnitPublic", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.CompanyUnit.filter({ id });
      return result[0] || null;
    },
    enabled: !!id
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["unitRatings", id],
    queryFn: async () => {
      if (!id) return [];
      return await base44.entities.Rating.filter({ 
        avaliado_id: id,
        avaliado_tipo: "CLINICA"
      });
    },
    enabled: !!id
  });

  // Buscar vagas abertas
  const { data: jobs = [] } = useQuery({
    queryKey: ["unitJobs", id],
    queryFn: async () => {
      if (!id) return [];
      return await base44.entities.Job.filter({ 
        unit_id: id,
        status: "ABERTO"
      });
    },
    enabled: !!id
  });

  if (isLoading || !unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
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

  // Formatar CEP
  const formatarCEP = (cep) => {
    if (!cep) return "";
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  // Fotos da clínica
  const fotos = [
    unit.foto_fachada_url,
    unit.foto_recepcao_url,
    unit.foto_consultorio_url
  ].filter(Boolean);

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${unit.nome_fantasia}`,
        text: `${unit.tipo_empresa} - ${unit.cidade}/${unit.uf}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const tipoLabels = {
    CLINICA: "Clínica",
    CONSULTORIO: "Consultório",
    HOSPITAL: "Hospital",
    LABORATORIO: "Laboratório",
    FORNECEDOR: "Fornecedor"
  };

  const mundoLabels = {
    ODONTOLOGIA: "🦷 Odontologia",
    MEDICINA: "🩺 Medicina",
    AMBOS: "🦷🩺 Odontologia e Medicina"
  };

  const tipoVagaConfig = {
    PLANTAO: { label: "Plantão", color: "bg-blue-100 text-blue-700" },
    FIXO: { label: "Fixo", color: "bg-green-100 text-green-700" },
    SUBSTITUICAO: { label: "Substituição", color: "bg-yellow-100 text-yellow-700" },
    TEMPORARIO: { label: "Temporário", color: "bg-purple-100 text-purple-700" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
      
      {/* BOTÃO VOLTAR */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <button
            onClick={() => navigate(createPageUrl("Denunciar") + "?tipo=CLINICA&id=" + id)}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-medium transition-colors"
            title="Denunciar"
          >
            <Flag className="w-5 h-5" />
            <span className="text-sm">Denunciar</span>
          </button>
        </div>
      </div>

      {/* HEADER COM FOTO */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pt-8 pb-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Foto/Logo */}
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-4xl font-bold">
                {unit.nome_fantasia?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Nome e Info */}
            <h1 className="text-3xl font-black text-white mb-2">{unit.nome_fantasia}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {unit.status_cadastro === "APROVADO" && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verificada
                </span>
              )}
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full text-sm">
                {tipoLabels[unit.tipo_empresa]}
              </span>
            </div>

            <p className="text-white/90 text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {unit.cidade} - {unit.uf}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCompartilhar}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur text-white font-bold rounded-2xl hover:bg-white/30 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12 space-y-6 relative z-10">
        {/* SEÇÃO AVALIAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Avaliações</h2>
              <p className="text-sm text-gray-600">Reputação na plataforma</p>
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
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* INFORMAÇÕES DA CLÍNICA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Sobre</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <Building2 className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Tipo de Empresa</p>
                <p className="font-bold text-gray-900">{tipoLabels[unit.tipo_empresa]}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <Star className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Área de Atuação</p>
                <p className="font-bold text-gray-900">{mundoLabels[unit.tipo_mundo]}</p>
              </div>
            </div>
          </div>

          {/* Responsável Técnico */}
          {unit.nome_responsavel && (
            <div className="mt-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-pink-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Responsável Técnico</p>
                  <p className="font-bold text-gray-900">{unit.nome_responsavel}</p>
                  {unit.cro_responsavel && (
                    <p className="text-sm text-gray-600 mt-1">CRO: {unit.cro_responsavel}</p>
                  )}
                  {unit.crm_responsavel && (
                    <p className="text-sm text-gray-600 mt-1">CRM: {unit.crm_responsavel}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ENDEREÇO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Endereço</h2>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700">
              <strong>{unit.endereco}</strong>
              {unit.numero && `, ${unit.numero}`}
              {unit.complemento && ` - ${unit.complemento}`}
            </p>
            <p className="text-gray-700">
              {unit.bairro} - {unit.cidade}/{unit.uf}
            </p>
            <p className="text-gray-700">
              CEP: {formatarCEP(unit.cep)}
            </p>
            
            {unit.ponto_referencia && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-sm text-gray-600 mb-1">Ponto de Referência</p>
                <p className="text-gray-900">{unit.ponto_referencia}</p>
              </div>
            )}

            {unit.google_maps_link && (
              <button
                onClick={() => window.open(unit.google_maps_link, "_blank")}
                className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Ver no Google Maps
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* FOTOS */}
        {fotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Fotos da Clínica</h2>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {fotos.map((foto, index) => (
                <div key={index} className="flex-shrink-0 snap-start">
                  <img
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="w-64 h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => window.open(foto, "_blank")}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VAGAS ABERTAS */}
        {jobs.length > 0 && (
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
              <div>
                <h2 className="text-xl font-black text-gray-900">Vagas Abertas</h2>
                <p className="text-sm text-gray-600">{jobs.length} oportunidades disponíveis</p>
              </div>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border-2 border-gray-200 rounded-2xl p-5 hover:border-yellow-400 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(createPageUrl("DetalheVaga") + "/" + job.id)}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 ${tipoVagaConfig[job.tipo_vaga]?.color} font-bold rounded-full text-xs`}>
                          {tipoVagaConfig[job.tipo_vaga]?.label}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">
                          {job.tipo_profissional === "DENTISTA" ? "🦷 Dentista" : "🩺 Médico"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{job.titulo}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.descricao}</p>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {job.horario_inicio && job.horario_fim && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.horario_inicio} - {job.horario_fim}</span>
                          </div>
                        )}
                        {job.valor_proposto && job.tipo_remuneracao !== "A_COMBINAR" && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold text-green-600">
                              R$ {job.valor_proposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
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
                    ({unit.whatsapp?.slice(0, 2)}) {unit.whatsapp?.slice(2, 7)}-{unit.whatsapp?.slice(7)}
                  </p>
                </div>
              </div>
              <WhatsAppSafeButton
                phone={unit.whatsapp}
                message={`Olá! Vi o perfil de ${unit.nome_fantasia} na Doutorizze e gostaria de conversar.`}
                buttonText="Abrir"
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-md"
              />
            </div>

            {/* Telefone Fixo */}
            {unit.telefone_fixo && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone Fixo</p>
                  <p className="font-bold text-gray-900">
                    ({unit.telefone_fixo?.slice(0, 2)}) {unit.telefone_fixo?.slice(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-bold text-gray-900">{unit.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ESTATÍSTICAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600">Vagas Abertas</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{jobs.length}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600">Contratações</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{unit.total_contratacoes || 0}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{mediaAvaliacoes.toFixed(1)}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
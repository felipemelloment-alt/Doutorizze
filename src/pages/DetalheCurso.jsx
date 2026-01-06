import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  GraduationCap,
  Clock,
  Calendar,
  MapPin,
  Award,
  Share2,
  ExternalLink,
  Building2,
  Laptop,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

const tipoLabels = {
  POS_GRADUACAO: "Pós-Graduação",
  ESPECIALIZACAO: "Especialização",
  EXTENSAO: "Extensão",
  ATUALIZACAO: "Atualização",
  WORKSHOP: "Workshop",
  CONGRESSO: "Congresso"
};

const modalidadeLabels = {
  PRESENCIAL: "Presencial",
  EAD: "100% Online (EAD)",
  HIBRIDO: "Híbrido (Presencial + EAD)"
};

export default function DetalheCurso() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const queryClient = useQueryClient();
  const [imagemAtiva, setImagemAtiva] = useState(0);

  const { data: curso, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const cursos = await base44.entities.Course.filter({ id });
      if (!cursos || cursos.length === 0) throw new Error("Curso não encontrado");
      return cursos[0];
    }
  });

  const { data: instituicao } = useQuery({
    queryKey: ["institution", curso?.institution_id],
    queryFn: async () => {
      if (!curso?.institution_id) return null;
      const insts = await base44.entities.EducationInstitution.filter({ id: curso.institution_id });
      return insts[0] || null;
    },
    enabled: !!curso?.institution_id
  });

  const incrementarVisualizacaoMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Course.update(id, {
        visualizacoes: (curso.visualizacoes || 0) + 1
      });
    }
  });

  useEffect(() => {
    if (curso) {
      incrementarVisualizacaoMutation.mutate();
    }
  }, [curso?.id]);

  const handleCompartilhar = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: curso.titulo,
          text: `Confira este curso: ${curso.titulo}`,
          url
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("✅ Link copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Curso não encontrado</h2>
          <p className="text-gray-600 mb-6">O curso que você procura não existe ou foi removido.</p>
          <button
            onClick={() => navigate(createPageUrl("Cursos"))}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Ver Todos os Cursos
          </button>
        </div>
      </div>
    );
  }

  const valorFinal = curso.tem_desconto && curso.valor_com_desconto
    ? parseFloat(curso.valor_com_desconto)
    : parseFloat(curso.valor_total);

  const percentualVagasRestantes = curso.vagas_totais > 0
    ? (curso.vagas_restantes / curso.vagas_totais) * 100
    : 0;

  const todasImagens = [
    curso.imagem_principal_url,
    ...(curso.imagens_extras || [])
  ].filter(Boolean);

  const mensagemWhatsApp = `Olá! Gostaria de mais informações sobre o curso "${curso.titulo}".`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header com Imagem Hero */}
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>

        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 relative">
          {curso.imagem_principal_url ? (
            <img
              src={curso.imagem_principal_url}
              alt={curso.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-9xl">
              📚
            </div>
          )}

          {/* Badge Tipo */}
          <div className="absolute top-6 right-6">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg">
              {tipoLabels[curso.tipo]}
            </span>
          </div>

          {/* Badge Desconto */}
          {curso.tem_desconto && curso.percentual_desconto && (
            <div className="absolute bottom-6 right-6">
              <span className="px-6 py-3 bg-red-500 text-white rounded-2xl text-xl font-black shadow-lg">
                {parseFloat(curso.percentual_desconto).toFixed(0)}% OFF
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-10">
        {/* Card Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-6"
        >
          {/* Instituição */}
          {instituicao && (
            <div className="flex items-center gap-3 mb-4">
              {instituicao.logo_url ? (
                <img
                  src={instituicao.logo_url}
                  alt={instituicao.nome_fantasia}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Oferecido por</p>
                <p className="text-lg font-black text-orange-600">{instituicao.nome_fantasia}</p>
              </div>
            </div>
          )}

          {/* Título */}
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            {curso.titulo}
          </h1>

          {/* Badges Info */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold">
              <GraduationCap className="w-5 h-5" />
              {curso.area}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold">
              <Laptop className="w-5 h-5" />
              {curso.modalidade}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold">
              <Clock className="w-5 h-5" />
              {curso.carga_horaria}h
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Informações */}
          <div className="md:col-span-2 space-y-6">
            {/* Descrição */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-4">Sobre o Curso</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {curso.descricao}
              </p>
            </motion.div>

            {/* Informações Principais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-4">Informações</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Especialidade</p>
                    <p className="font-bold text-gray-900">{curso.especialidade}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duração</p>
                    <p className="font-bold text-gray-900">{curso.duracao_meses} meses</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modalidade</p>
                    <p className="font-bold text-gray-900">{modalidadeLabels[curso.modalidade]}</p>
                  </div>
                </div>

                {curso.certificacao && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Certificação</p>
                      <p className="font-bold text-gray-900">{curso.certificacao}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Datas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-4">Datas Importantes</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-500">Inscrições até</p>
                      <p className="font-bold text-gray-900">
                        {format(new Date(curso.inscricoes_ate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Início do curso</p>
                      <p className="font-bold text-gray-900">
                        {format(new Date(curso.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                {curso.data_fim && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Término previsto</p>
                        <p className="font-bold text-gray-900">
                          {format(new Date(curso.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBr })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Local - se presencial */}
            {(curso.modalidade === "PRESENCIAL" || curso.modalidade === "HIBRIDO") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-4">Localização</h2>
                
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900 mb-1">{curso.cidade} - {curso.uf}</p>
                    {curso.endereco && (
                      <p className="text-gray-600 text-sm">{curso.endereco}</p>
                    )}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${curso.endereco || ""} ${curso.cidade} ${curso.uf}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-orange-400 hover:text-orange-600 transition-all"
                >
                  <MapPin className="w-5 h-5" />
                  Ver no Google Maps
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            )}

            {/* Galeria */}
            {todasImagens.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-4">Galeria</h2>
                
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-2xl mb-4">
                    <img
                      src={todasImagens[imagemAtiva]}
                      alt={`Imagem ${imagemAtiva + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {todasImagens.length > 1 && (
                    <>
                      <button
                        onClick={() => setImagemAtiva(Math.max(0, imagemAtiva - 1))}
                        disabled={imagemAtiva === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
                      </button>

                      <button
                        onClick={() => setImagemAtiva(Math.min(todasImagens.length - 1, imagemAtiva + 1))}
                        disabled={imagemAtiva === todasImagens.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all disabled:opacity-50"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {todasImagens.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImagemAtiva(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        imagemAtiva === index ? "border-orange-500 scale-105" : "border-gray-200"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Sobre a Instituição */}
            {instituicao && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-4">Sobre a Instituição</h2>
                
                <div className="flex items-start gap-4 mb-4">
                  {instituicao.logo_url ? (
                    <img
                      src={instituicao.logo_url}
                      alt={instituicao.nome_fantasia}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{instituicao.nome_fantasia}</h3>
                    <p className="text-gray-600 mb-2">{instituicao.tipo_instituicao}</p>
                    <p className="text-sm text-gray-500">{instituicao.cidade} - {instituicao.uf}</p>
                  </div>
                </div>

                {instituicao.site && (
                  <a
                    href={instituicao.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all"
                  >
                    Visitar Site
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            )}
          </div>

          {/* Coluna Direita - Valores e CTAs */}
          <div className="md:col-span-1 space-y-6">
            {/* Card de Valores */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6 sticky top-6"
            >
              <h3 className="text-lg font-black text-gray-900 mb-4">Investimento</h3>

              {curso.tem_desconto && curso.percentual_desconto ? (
                <>
                  <p className="text-sm text-gray-500 line-through mb-2">
                    De R$ {parseFloat(curso.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-4xl font-black text-orange-600">
                      R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-sm text-green-600 font-bold mb-4">
                    Economize R$ {(parseFloat(curso.valor_total) - valorFinal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </>
              ) : (
                <p className="text-4xl font-black text-orange-600 mb-4">
                  R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              )}

              {curso.numero_parcelas && curso.valor_parcela && (
                <div className="p-3 bg-blue-50 rounded-xl mb-4">
                  <p className="text-sm text-blue-900">
                    ou <span className="font-bold">{curso.numero_parcelas}x de R$ {parseFloat(curso.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              )}

              {/* Vagas */}
              <div className="mb-4 p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">Vagas Restantes</span>
                  <span className="text-sm font-bold text-orange-600">
                    {curso.vagas_restantes}/{curso.vagas_totais}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${percentualVagasRestantes}%` }}
                  />
                </div>
              </div>

              {/* Botão Inscrever */}
              <WhatsAppSafeButton
                phone={instituicao?.whatsapp}
                message={mensagemWhatsApp}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
              >
                <MessageCircle className="w-5 h-5" />
                Quero me Inscrever
              </WhatsAppSafeButton>

              {/* Botão Compartilhar */}
              <button
                onClick={handleCompartilhar}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-orange-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
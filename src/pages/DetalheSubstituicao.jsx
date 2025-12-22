import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Zap,
  Star,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { 
  buscarSubstituicao, 
  candidatarSe,
  listarCandidatos 
} from "@/components/api/substituicao";
import { 
  formatarTextoData, 
  formatarValor, 
  calcularTempoRestante,
  podeSeCandidata 
} from "@/components/constants/substituicao";

export default function DetalheSubstituicao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const vagaId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const professionals = await base44.entities.Professional.filter({ 
          user_id: currentUser.id 
        });
        if (professionals.length > 0) {
          setProfessional(professionals[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: vaga, isLoading } = useQuery({
    queryKey: ["substituicao", vagaId, user?.vertical],
    queryFn: async () => {
      const result = await buscarSubstituicao(vagaId);
      
      // VALIDAR SE A SUBSTITUIÇÃO É DA ÁREA DO USUÁRIO
      if (result && user?.vertical) {
        const tipoProfissionalEsperado = user.vertical === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";
        if (result.tipo_profissional !== tipoProfissionalEsperado) {
          toast.error("⛔ Esta vaga não é da sua área de atuação");
          navigate(-1);
          return null;
        }
      }
      
      return result;
    },
    enabled: !!vagaId && !!user
  });

  const { data: candidatos = [] } = useQuery({
    queryKey: ["candidatos", vagaId],
    queryFn: async () => {
      const result = await listarCandidatos(vagaId);
      return result || [];
    },
    enabled: !!vagaId
  });

  const candidaturaMutation = useMutation({
    mutationFn: async () => {
      return await candidatarSe(vagaId, professional.id, mensagem);
    },
    onSuccess: () => {
      toast.success("Candidatura enviada com sucesso!");
      queryClient.invalidateQueries(["substituicao", vagaId]);
      queryClient.invalidateQueries(["candidatos", vagaId]);
      setShowConfirmModal(false);
      setMensagem("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar candidatura");
    }
  });

  const handleCandidatar = () => {
    if (!professional) {
      toast.error("Você precisa completar seu cadastro de profissional");
      return;
    }

    const verificacao = podeSeCandidata(professional, vaga);
    if (!verificacao.pode) {
      toast.error(verificacao.motivo);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmarCandidatura = () => {
    candidaturaMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50">😕</div>
          <h3 className="text-2xl font-bold text-gray-400 mb-4">Vaga não encontrada</h3>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const tempoRestante = calcularTempoRestante(vaga.expira_em);
  const jaCandidatou = candidatos.some(c => c.professional_id === professional?.id);
  const isUrgente = vaga.tipo_data === "IMEDIATO";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 py-6 mb-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white font-bold mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              💼
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                {vaga.especialidade_necessaria}
              </h1>
              <p className="text-white/90">{vaga.nome_clinica}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges e Status */}
            <div className="flex flex-wrap gap-3">
              {isUrgente && (
                <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl animate-pulse">
                  🚨 URGENTE - HOJE
                </span>
              )}
              <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl">
                {vaga.tipo_data === "IMEDIATO" && "⚡ IMEDIATO"}
                {vaga.tipo_data === "DATA_ESPECIFICA" && "📅 DATA ESPECÍFICA"}
                {vaga.tipo_data === "PERIODO" && "📊 PERÍODO"}
              </span>
              {vaga.status === "ABERTA" && (
                <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl">
                  ✅ Vaga Aberta
                </span>
              )}
            </div>

            {/* Tempo Restante */}
            {tempoRestante && !tempoRestante.expirado && (
              <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-bold text-yellow-900">Tempo para candidatura</p>
                    <p className="text-2xl font-black text-yellow-600">{tempoRestante.texto}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Data e Horário */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-yellow-500" />
                Data e Horário
              </h3>
              <div className="text-lg text-gray-700">
                {formatarTextoData(vaga)}
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-yellow-500" />
                Localização
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-900">{vaga.nome_clinica}</p>
                <p className="text-gray-700">{vaga.endereco_completo}</p>
                <p className="text-gray-700">{vaga.cidade}/{vaga.uf}</p>
                {vaga.referencia && (
                  <p className="text-sm text-gray-600">📍 Referência: {vaga.referencia}</p>
                )}
                {vaga.link_maps && (
                  <a 
                    href={vaga.link_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                  >
                    Ver no Google Maps →
                  </a>
                )}
              </div>
            </div>

            {/* Remuneração */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-yellow-500" />
                Remuneração
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Remuneração</p>
                  <p className="text-lg font-bold text-gray-900">
                    {vaga.tipo_remuneracao === "DIARIA" ? "💵 Diária" : "📊 Porcentagem"}
                  </p>
                </div>
                {vaga.tipo_remuneracao === "DIARIA" && vaga.valor_diaria && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valor da Diária</p>
                    <p className="text-2xl font-black text-green-600">
                      {formatarValor(vaga.valor_diaria)}
                    </p>
                  </div>
                )}
                {vaga.tipo_remuneracao === "PORCENTAGEM" && vaga.procedimentos_porcentagem && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Porcentagens por Procedimento</p>
                    <div className="space-y-2">
                      {vaga.procedimentos_porcentagem.map((proc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-700">{proc.procedimento}</span>
                          <span className="font-bold text-green-600">{proc.porcentagem}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Forma de Pagamento</p>
                  <p className="text-gray-700 font-semibold">{vaga.forma_pagamento?.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quem paga</p>
                  <p className="text-gray-700 font-semibold">{vaga.quem_paga}</p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {vaga.observacoes && (
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-black text-gray-900 mb-4">Observações</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{vaga.observacoes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de Contato */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-black text-gray-900 mb-4">Contato</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Responsável</p>
                  <p className="font-bold text-gray-900">{vaga.responsavel_nome}</p>
                  <p className="text-sm text-gray-600">{vaga.responsavel_cargo}</p>
                </div>
                {vaga.responsavel_whatsapp && (
                  <a
                    href={`https://wa.me/55${vaga.responsavel_whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Candidatos</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">{candidatos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Visualizações</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">{vaga.visualizacoes || 0}</span>
                </div>
              </div>
            </div>

            {/* Requisitos */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-black text-gray-900 mb-4">Requisitos</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900">Especialidade</p>
                    <p className="text-gray-600">{vaga.especialidade_necessaria}</p>
                  </div>
                </div>
                {vaga.tempo_minimo_formado_anos > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-bold text-gray-900">Tempo de Formado</p>
                      <p className="text-gray-600">Mínimo {vaga.tempo_minimo_formado_anos} ano{vaga.tempo_minimo_formado_anos !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      {professional && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-100 p-4 shadow-2xl z-50">
          <div className="container mx-auto flex gap-4">
            {jaCandidatou ? (
              <div className="flex-1 py-4 bg-green-100 text-green-700 font-bold rounded-xl text-center">
                ✅ Você já se candidatou a esta vaga
              </div>
            ) : (
              <button
                onClick={handleCandidatar}
                disabled={vaga.status !== "ABERTA" || candidaturaMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-lg rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {candidaturaMutation.isPending ? "Enviando..." : "🚀 CANDIDATAR-SE AGORA"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-4xl mx-auto mb-4">
                  🎯
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Confirmar Candidatura
                </h3>
                <p className="text-gray-600">
                  Deseja se candidatar a esta vaga de substituição?
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conte um pouco sobre você e sua experiência..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCandidatura}
                  disabled={candidaturaMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {candidaturaMutation.isPending ? "Enviando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
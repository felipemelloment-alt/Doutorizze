/**
 * ADMIN DENÚNCIAS - Página de gestão de denúncias
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

const categoriaColors = {
  EMPREGO: "bg-blue-100 text-blue-700",
  CLINICA: "bg-green-100 text-green-700",
  CADASTRO: "bg-red-100 text-red-700",
  MARKETPLACE: "bg-purple-100 text-purple-700",
  FREELANCE: "bg-yellow-100 text-yellow-700",
  DOUTORIZZE: "bg-pink-100 text-pink-700",
  FORNECEDOR: "bg-indigo-100 text-indigo-700",
  GRUPO_LINK: "bg-orange-100 text-orange-700",
  CREDITO: "bg-teal-100 text-teal-700"
};

const categoriaLabels = {
  EMPREGO: "Vaga de emprego",
  CLINICA: "Clínica/Consultório",
  CADASTRO: "Cadastro falso",
  MARKETPLACE: "Produto do marketplace",
  FREELANCE: "Trabalho freelance",
  DOUTORIZZE: "Problema na plataforma",
  FORNECEDOR: "Fornecedor",
  GRUPO_LINK: "Link/grupo suspeito",
  CREDITO: "Solicitação de crédito"
};

const statusColors = {
  PENDENTE: "bg-yellow-100 text-yellow-700 border-yellow-300",
  ANALISANDO: "bg-blue-100 text-blue-700 border-blue-300",
  PROCEDENTE: "bg-red-100 text-red-700 border-red-300",
  IMPROCEDENTE: "bg-gray-100 text-gray-700 border-gray-300",
  RESOLVIDO: "bg-green-100 text-green-700 border-green-300"
};

const tipoAlvoLabels = {
  PROFISSIONAL: "Profissional",
  CLINICA: "Clínica",
  VAGA: "Vaga",
  MARKETPLACE: "Produto",
  USUARIO: "Usuário"
};

function AdminDenunciasContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("PENDENTE");
  const [modalDenuncia, setModalDenuncia] = useState(null);
  const [respostaAdmin, setRespostaAdmin] = useState("");

  // Buscar todas as denúncias
  const { data: denuncias = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      return await base44.entities.Report.list("-created_date");
    }
  });

  // Filtrar por status
  const denunciasFiltradas = denuncias.filter(d => {
    if (activeTab === "PENDENTE") return d.status === "PENDENTE";
    if (activeTab === "ANALISANDO") return d.status === "ANALISANDO";
    if (activeTab === "RESOLVIDAS") return d.status === "RESOLVIDO";
    return false;
  });

  // Contadores
  const pendentes = denuncias.filter(d => d.status === "PENDENTE").length;
  const analisando = denuncias.filter(d => d.status === "ANALISANDO").length;
  const resolvidasHoje = denuncias.filter(d => {
    if (d.status !== "RESOLVIDO" || !d.resolved_date) return false;
    const hoje = new Date();
    const resolvido = new Date(d.resolved_date);
    return hoje.toDateString() === resolvido.toDateString();
  }).length;

  // Mutation para atualizar status
  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status, resposta }) => {
      const updateData = { status };
      if (resposta) updateData.resposta_admin = resposta;
      if (status === "RESOLVIDO") updateData.resolved_date = new Date().toISOString();
      
      return await base44.entities.Report.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setModalDenuncia(null);
      setRespostaAdmin("");
      toast.success("✅ Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  const handleIniciarAnalise = (denuncia) => {
    atualizarStatusMutation.mutate({ id: denuncia.id, status: "ANALISANDO" });
  };

  const handleMarcarProcedente = (denuncia) => {
    setModalDenuncia({ ...denuncia, novoStatus: "PROCEDENTE", showBanOption: true });
  };

  const handleMarcarImprocedente = (denuncia) => {
    setModalDenuncia({ ...denuncia, novoStatus: "IMPROCEDENTE" });
  };

  const handleResolver = (denuncia) => {
    setModalDenuncia({ ...denuncia, novoStatus: "RESOLVIDO" });
  };

  const confirmarAcao = async () => {
    if (!modalDenuncia) return;
    
    try {
      // Banir usuário se opção selecionada
      if (modalDenuncia.banirUsuario && modalDenuncia.tipo_alvo === "PROFISSIONAL") {
        const diasSuspensao = parseInt(modalDenuncia.diasBan) || 30;
        const suspensaoAte = new Date();
        suspensaoAte.setDate(suspensaoAte.getDate() + diasSuspensao);
        
        await base44.entities.Professional.update(modalDenuncia.alvo_id, {
          esta_suspenso: true,
          suspenso_ate: suspensaoAte.toISOString(),
          motivo_suspensao: respostaAdmin || "Denúncia procedente"
        });
        toast.success(`🚫 Profissional banido por ${diasSuspensao} dias`);
      }
      
      // Atualizar status da denúncia
      atualizarStatusMutation.mutate({
        id: modalDenuncia.id,
        status: modalDenuncia.novoStatus,
        resposta: respostaAdmin || undefined
      });
    } catch (error) {
      toast.error("Erro ao processar ação: " + error.message);
    }
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando denúncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Gerenciar Denúncias</h1>
              <p className="text-gray-600">Análise e moderação de conteúdo</p>
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 rounded-2xl p-6 border-2 border-yellow-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-700">Pendentes</p>
                  <p className="text-4xl font-black text-yellow-900">{pendentes}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-100 rounded-2xl p-6 border-2 border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Analisando</p>
                  <p className="text-4xl font-black text-blue-900">{analisando}</p>
                </div>
                <Eye className="w-10 h-10 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-100 rounded-2xl p-6 border-2 border-green-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700">Resolvidas Hoje</p>
                  <p className="text-4xl font-black text-green-900">{resolvidasHoje}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setActiveTab("PENDENTE")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "PENDENTE"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Pendentes ({pendentes})
          </button>
          <button
            onClick={() => setActiveTab("ANALISANDO")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "ANALISANDO"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Analisando ({analisando})
          </button>
          <button
            onClick={() => setActiveTab("RESOLVIDAS")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "RESOLVIDAS"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Resolvidas
          </button>
        </div>

        {/* Lista de Denúncias */}
        <div className="space-y-4">
          {denunciasFiltradas.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <p className="text-gray-400 text-lg">Nenhuma denúncia nesta categoria</p>
            </div>
          ) : (
            denunciasFiltradas.map((denuncia, index) => (
              <motion.div
                key={denuncia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                {/* Header do Card */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${categoriaColors[denuncia.categoria]}`}>
                      {categoriaLabels[denuncia.categoria]}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[denuncia.status]}`}>
                      {denuncia.status}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                      {tipoAlvoLabels[denuncia.tipo_alvo]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{getTimeAgo(denuncia.created_date)}</span>
                </div>

                {/* Conteúdo */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Motivo da Denúncia:</p>
                    <p className="text-gray-900 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
                      {denuncia.motivo}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">ID do Item Denunciado:</p>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-900 flex-1">
                          {denuncia.alvo_id}
                        </code>
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Denunciante:</p>
                      <code className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-900 block">
                        {denuncia.denunciante_id}
                      </code>
                    </div>

                    {denuncia.evidencia_url && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-2">Evidência:</p>
                        <a
                          href={denuncia.evidencia_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all w-fit"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Ver Imagem
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resposta Admin */}
                {denuncia.resposta_admin && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Resposta do Admin:
                    </p>
                    <p className="text-blue-800">{denuncia.resposta_admin}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-3">
                  {denuncia.status === "PENDENTE" && (
                    <button
                      onClick={() => handleIniciarAnalise(denuncia)}
                      disabled={atualizarStatusMutation.isPending}
                      className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                      🔍 Iniciar Análise
                    </button>
                  )}

                  {(denuncia.status === "ANALISANDO" || denuncia.status === "PENDENTE") && (
                    <>
                      <button
                        onClick={() => handleMarcarProcedente(denuncia)}
                        disabled={atualizarStatusMutation.isPending}
                        className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        ✅ Procedente
                      </button>
                      <button
                        onClick={() => handleMarcarImprocedente(denuncia)}
                        disabled={atualizarStatusMutation.isPending}
                        className="px-6 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50"
                      >
                        ❌ Improcedente
                      </button>
                    </>
                  )}

                  {(denuncia.status === "PROCEDENTE" || denuncia.status === "IMPROCEDENTE") && (
                    <button
                      onClick={() => handleResolver(denuncia)}
                      disabled={atualizarStatusMutation.isPending}
                      className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      ✓ Marcar como Resolvido
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {modalDenuncia && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Confirmar Ação
            </h3>
            <p className="text-gray-600 mb-4">
              Você está prestes a marcar esta denúncia como <strong>{modalDenuncia.novoStatus}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Resposta/Observação (opcional):
              </label>
              <textarea
                value={respostaAdmin}
                onChange={(e) => setRespostaAdmin(e.target.value)}
                placeholder="Adicione uma resposta ou observação..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none resize-none"
              />
            </div>

            {/* Opção de Banir Usuário */}
            {modalDenuncia.showBanOption && modalDenuncia.tipo_alvo === "PROFISSIONAL" && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={modalDenuncia.banirUsuario || false}
                    onChange={(e) => setModalDenuncia({ ...modalDenuncia, banirUsuario: e.target.checked })}
                    className="w-5 h-5 accent-red-500"
                  />
                  <span className="font-bold text-red-900">🚫 Banir/Suspender Profissional</span>
                </label>
                
                {modalDenuncia.banirUsuario && (
                  <div>
                    <label className="block text-sm font-bold text-red-900 mb-2">
                      Período de suspensão (dias):
                    </label>
                    <select
                      value={modalDenuncia.diasBan || "30"}
                      onChange={(e) => setModalDenuncia({ ...modalDenuncia, diasBan: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:border-red-500 outline-none"
                    >
                      <option value="7">7 dias</option>
                      <option value="15">15 dias</option>
                      <option value="30">30 dias (padrão)</option>
                      <option value="60">60 dias</option>
                      <option value="90">90 dias</option>
                      <option value="180">180 dias</option>
                      <option value="365">1 ano</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalDenuncia(null);
                  setRespostaAdmin("");
                }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                disabled={atualizarStatusMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {atualizarStatusMutation.isPending ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Export com ProtectedRoute wrapper
export default function AdminDenuncias() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDenunciasContent />
    </ProtectedRoute>
  );
}
/**
 * ADMIN APROVAÇÕES - Página de aprovação de cadastros
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

const statusColors = {
  EM_ANALISE: "bg-yellow-100 text-yellow-700 border-yellow-300",
  APROVADO: "bg-green-100 text-green-700 border-green-300",
  REPROVADO: "bg-red-100 text-red-700 border-red-300"
};

function AdminAprovacoesContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profissionais");
  const [expandedId, setExpandedId] = useState(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  const [modalReprovacao, setModalReprovacao] = useState(null);

  // Buscar profissionais pendentes
  const { data: profissionais = [], isLoading: loadingProfs } = useQuery({
    queryKey: ["admin-profissionais"],
    queryFn: async () => {
      return await base44.entities.Professional.filter({ status_cadastro: "EM_ANALISE" });
    }
  });

  // Buscar clínicas pendentes
  const { data: clinicas = [], isLoading: loadingClinicas } = useQuery({
    queryKey: ["admin-clinicas"],
    queryFn: async () => {
      return await base44.entities.CompanyUnit.filter({ status_cadastro: "EM_ANALISE" });
    }
  });

  // Mutation para aprovar
  const aprovarMutation = useMutation({
    mutationFn: async ({ tipo, id }) => {
      const entity = tipo === "profissional" 
        ? base44.entities.Professional 
        : base44.entities.CompanyUnit;
      
      return await entity.update(id, {
        status_cadastro: "APROVADO",
        approved_at: new Date().toISOString()
      });
    },
    onSuccess: (_, { tipo }) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${tipo === "profissional" ? "profissionais" : "clinicas"}`] });
      toast.success("✅ Cadastro aprovado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para reprovar
  const reprovarMutation = useMutation({
    mutationFn: async ({ tipo, id, motivo }) => {
      const entity = tipo === "profissional" 
        ? base44.entities.Professional 
        : base44.entities.CompanyUnit;
      
      return await entity.update(id, {
        status_cadastro: "REPROVADO",
        motivo_reprovacao: motivo
      });
    },
    onSuccess: (_, { tipo }) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${tipo === "profissional" ? "profissionais" : "clinicas"}`] });
      setModalReprovacao(null);
      setMotivoReprovacao("");
      toast.success("❌ Cadastro reprovado");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  const handleAprovar = (tipo, id) => {
    aprovarMutation.mutate({ tipo, id });
  };

  const handleReprovar = () => {
    if (!modalReprovacao || !motivoReprovacao.trim()) {
      toast.error("Informe o motivo da reprovação");
      return;
    }
    reprovarMutation.mutate({
      tipo: modalReprovacao.tipo,
      id: modalReprovacao.id,
      motivo: motivoReprovacao
    });
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  const isLoading = loadingProfs || loadingClinicas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Aprovação de Cadastros</h1>
              <p className="text-gray-600">Análise de novos usuários</p>
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-100 rounded-2xl p-6 border-2 border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Profissionais</p>
                  <p className="text-4xl font-black text-blue-900">{profissionais.length}</p>
                </div>
                <User className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-purple-100 rounded-2xl p-6 border-2 border-purple-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700">Clínicas</p>
                  <p className="text-4xl font-black text-purple-900">{clinicas.length}</p>
                </div>
                <Building2 className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setActiveTab("profissionais")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "profissionais"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Profissionais ({profissionais.length})
          </button>
          <button
            onClick={() => setActiveTab("clinicas")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "clinicas"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Clínicas ({clinicas.length})
          </button>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "profissionais" && profissionais.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Nenhum profissional pendente</p>
              </div>
            )}

            {activeTab === "profissionais" && profissionais.map((prof, index) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {prof.nome_completo?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{prof.nome_completo}</h3>
                      <p className="text-gray-600">{prof.tipo_profissional} - {prof.especialidade_principal}</p>
                      <p className="text-sm text-gray-500">{prof.registro_conselho}/{prof.uf_conselho}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{getTimeAgo(prof.created_date)}</span>
                </div>

                {prof.selfie_documento_url && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Documento:</p>
                    <a
                      href={prof.selfie_documento_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Documento
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAprovar("profissional", prof.id)}
                    disabled={aprovarMutation.isPending}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => setModalReprovacao({ tipo: "profissional", id: prof.id, nome: prof.nome_completo })}
                    disabled={reprovarMutation.isPending}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    ❌ Reprovar
                  </button>
                </div>
              </motion.div>
            ))}

            {activeTab === "clinicas" && clinicas.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Nenhuma clínica pendente</p>
              </div>
            )}

            {activeTab === "clinicas" && clinicas.map((clinica, index) => (
              <motion.div
                key={clinica.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{clinica.nome_fantasia}</h3>
                      <p className="text-gray-600">{clinica.razao_social}</p>
                      <p className="text-sm text-gray-500">CNPJ: {clinica.cnpj}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{clinica.cidade} - {clinica.uf}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{getTimeAgo(clinica.created_date)}</span>
                </div>

                {clinica.documento_responsavel_url && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Documento do Responsável:</p>
                    <a
                      href={clinica.documento_responsavel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Documento
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAprovar("clinica", clinica.id)}
                    disabled={aprovarMutation.isPending}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => setModalReprovacao({ tipo: "clinica", id: clinica.id, nome: clinica.nome_fantasia })}
                    disabled={reprovarMutation.isPending}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    ❌ Reprovar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Reprovação */}
      {modalReprovacao && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Reprovar Cadastro
            </h3>
            <p className="text-gray-600 mb-4">
              Informe o motivo da reprovação de <strong>{modalReprovacao.nome}</strong>:
            </p>

            <textarea
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              placeholder="Motivo da reprovação..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all outline-none resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalReprovacao(null);
                  setMotivoReprovacao("");
                }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleReprovar}
                disabled={reprovarMutation.isPending || !motivoReprovacao.trim()}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {reprovarMutation.isPending ? "Salvando..." : "Confirmar Reprovação"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Export com ProtectedRoute wrapper
export default function AdminAprovacoes() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminAprovacoesContent />
    </ProtectedRoute>
  );
}
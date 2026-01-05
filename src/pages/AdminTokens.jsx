import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Shield,
  Search,
  Filter,
  Crown,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

function AdminTokensContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterNivel, setFilterNivel] = useState("TODOS");
  const [filterTipo, setFilterTipo] = useState("TODOS");

  // Fetch tokens
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["adminTokens"],
    queryFn: async () => {
      return await base44.asServiceRole.entities.TokenUsuario.list("-created_date", 200);
    }
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.asServiceRole.entities.TokenUsuario.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTokens"] });
      toast.success("✅ Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("❌ Erro ao atualizar: " + error.message);
    }
  });

  // Filtrar tokens
  const tokensFiltrados = tokens.filter(token => {
    const matchSearch = token.token_id?.toLowerCase().includes(search.toLowerCase()) ||
                       token.user_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "TODOS" || token.status === filterStatus;
    const matchNivel = filterNivel === "TODOS" || token.nivel === parseInt(filterNivel);
    const matchTipo = filterTipo === "TODOS" || token.tipo_conta === filterTipo;
    
    return matchSearch && matchStatus && matchNivel && matchTipo;
  });

  const getNivelLabel = (nivel) => {
    const niveis = {
      1: "Iniciante",
      2: "Bronze",
      3: "Prata",
      4: "Ouro",
      5: "Diamante"
    };
    return niveis[nivel] || "N/A";
  };

  const getNivelColor = (nivel) => {
    const cores = {
      1: "bg-gray-100 text-gray-700",
      2: "bg-orange-100 text-orange-700",
      3: "bg-gray-200 text-gray-700",
      4: "bg-yellow-100 text-yellow-700",
      5: "bg-blue-100 text-blue-700"
    };
    return cores[nivel] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    const cores = {
      ATIVO: "bg-green-100 text-green-700",
      SUSPENSO: "bg-red-100 text-red-700",
      CANCELADO: "bg-gray-100 text-gray-500"
    };
    return cores[status] || "bg-gray-100 text-gray-700";
  };

  const handleToggleStatus = (token) => {
    const novoStatus = token.status === "ATIVO" ? "SUSPENSO" : "ATIVO";
    updateStatusMutation.mutate({ id: token.id, status: novoStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Gerenciar Tokens</h1>
              <p className="text-gray-500">Administração de TokenUsuario</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Total de Tokens</p>
            <p className="text-2xl font-black text-gray-900">{tokens.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Ativos</p>
            <p className="text-2xl font-black text-green-600">
              {tokens.filter(t => t.status === "ATIVO").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Suspensos</p>
            <p className="text-2xl font-black text-red-600">
              {tokens.filter(t => t.status === "SUSPENSO").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Verificados</p>
            <p className="text-2xl font-black text-blue-600">
              {tokens.filter(t => t.verificado).length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Token ID ou User ID"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="SUSPENSO">Suspenso</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nível</label>
              <select
                value={filterNivel}
                onChange={(e) => setFilterNivel(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
              >
                <option value="TODOS">Todos</option>
                <option value="1">Nível 1 - Iniciante</option>
                <option value="2">Nível 2 - Bronze</option>
                <option value="3">Nível 3 - Prata</option>
                <option value="4">Nível 4 - Ouro</option>
                <option value="5">Nível 5 - Diamante</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Conta</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
              >
                <option value="TODOS">Todos</option>
                <option value="PROFISSIONAL">Profissional</option>
                <option value="CLINICA">Clínica</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="FORNECEDOR">Fornecedor</option>
                <option value="INSTITUICAO">Instituição</option>
                <option value="LABORATORIO">Laboratório</option>
              </select>
            </div>
          </div>

          {(search || filterStatus !== "TODOS" || filterNivel !== "TODOS" || filterTipo !== "TODOS") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("TODOS");
                setFilterNivel("TODOS");
                setFilterTipo("TODOS");
              }}
              className="mt-4 px-4 py-2 text-sm text-pink-600 hover:text-pink-700 font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              {tokensFiltrados.length} token{tokensFiltrados.length !== 1 ? "s" : ""} encontrado{tokensFiltrados.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Token ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nível</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pontos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Verificado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tokensFiltrados.map((token) => (
                  <motion.tr
                    key={token.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {token.token_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{token.tipo_conta}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getNivelColor(token.nivel)}`}>
                        {getNivelLabel(token.nivel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{token.pontos || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(token.status)}`}>
                        {token.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {token.verificado ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(token)}
                        disabled={updateStatusMutation.isPending}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                          token.status === "ATIVO"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        } disabled:opacity-50`}
                      >
                        {token.status === "ATIVO" ? "Suspender" : "Ativar"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {tokensFiltrados.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Nenhum token encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTokens() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminTokensContent />
    </ProtectedRoute>
  );
}
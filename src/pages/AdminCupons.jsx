import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Percent,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function AdminCuponsContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterParceiro, setFilterParceiro] = useState("TODOS");

  // Fetch cupons
  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ["adminCupons"],
    queryFn: async () => {
      return await base44.asServiceRole.entities.TokenDesconto.list("-created_date", 200);
    }
  });

  // Mutation para cancelar cupom
  const cancelarMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.asServiceRole.entities.TokenDesconto.update(id, { status: "CANCELADO" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCupons"] });
      toast.success("✅ Cupom cancelado com sucesso!");
    },
    onError: (error) => {
      toast.error("❌ Erro ao cancelar: " + error.message);
    }
  });

  // Extrair parceiros únicos
  const parceiros = [...new Set(cupons.map(c => c.parceiro_nome).filter(Boolean))];

  // Filtrar cupons
  const cuponsFiltrados = cupons.filter(cupom => {
    const matchSearch = cupom.codigo?.toLowerCase().includes(search.toLowerCase()) ||
                       cupom.parceiro_nome?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "TODOS" || cupom.status === filterStatus;
    const matchParceiro = filterParceiro === "TODOS" || cupom.parceiro_nome === filterParceiro;
    
    return matchSearch && matchStatus && matchParceiro;
  });

  const getStatusColor = (status) => {
    const cores = {
      ATIVO: "bg-green-100 text-green-700",
      USADO: "bg-blue-100 text-blue-700",
      EXPIRADO: "bg-gray-100 text-gray-500",
      CANCELADO: "bg-red-100 text-red-700"
    };
    return cores[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const icones = {
      ATIVO: Clock,
      USADO: CheckCircle2,
      EXPIRADO: XCircle,
      CANCELADO: XCircle
    };
    return icones[status] || AlertCircle;
  };

  const formatarValor = (valor) => {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCancelar = (cupom) => {
    if (cupom.status !== "ATIVO") {
      toast.error("Só é possível cancelar cupons ativos");
      return;
    }
    if (confirm(`Confirma cancelamento do cupom ${cupom.codigo}?`)) {
      cancelarMutation.mutate(cupom.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando cupons...</p>
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
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Gerenciar Cupons</h1>
              <p className="text-gray-500">Administração de TokenDesconto</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Total de Cupons</p>
            <p className="text-2xl font-black text-gray-900">{cupons.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Ativos</p>
            <p className="text-2xl font-black text-green-600">
              {cupons.filter(c => c.status === "ATIVO").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">Usados</p>
            <p className="text-2xl font-black text-blue-600">
              {cupons.filter(c => c.status === "USADO").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm font-medium">WhatsApp Enviados</p>
            <p className="text-2xl font-black text-green-600">
              {cupons.filter(c => c.enviado_whatsapp).length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Código ou parceiro"
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
                <option value="USADO">Usado</option>
                <option value="EXPIRADO">Expirado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parceiro</label>
              <select
                value={filterParceiro}
                onChange={(e) => setFilterParceiro(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
              >
                <option value="TODOS">Todos</option>
                {parceiros.map((parceiro) => (
                  <option key={parceiro} value={parceiro}>{parceiro}</option>
                ))}
              </select>
            </div>
          </div>

          {(search || filterStatus !== "TODOS" || filterParceiro !== "TODOS") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("TODOS");
                setFilterParceiro("TODOS");
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
              {cuponsFiltrados.length} cupom{cuponsFiltrados.length !== 1 ? "s" : ""} encontrado{cuponsFiltrados.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Parceiro</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Desconto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Validade</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">WhatsApp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cuponsFiltrados.map((cupom) => {
                  const StatusIcon = getStatusIcon(cupom.status);
                  
                  return (
                    <motion.tr
                      key={cupom.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-orange-500" />
                          <span className="font-mono text-sm font-bold text-gray-900">
                            {cupom.codigo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">{cupom.parceiro_nome}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {cupom.desconto_tipo === "PERCENTUAL" ? (
                            <Percent className="w-4 h-4 text-blue-600" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm text-gray-700">
                            {cupom.desconto_tipo === "PERCENTUAL" ? "%" : "R$"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {cupom.desconto_tipo === "PERCENTUAL" 
                            ? `${cupom.desconto_valor}%`
                            : `R$ ${formatarValor(cupom.desconto_valor)}`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {cupom.data_validade 
                            ? format(new Date(cupom.data_validade), "dd/MM/yyyy", { locale: ptBR })
                            : "-"
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(cupom.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          {cupom.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cupom.enviado_whatsapp ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCancelar(cupom)}
                          disabled={cupom.status !== "ATIVO" || cancelarMutation.isPending}
                          className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {cuponsFiltrados.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Nenhum cupom encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCupons() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminCuponsContent />
    </ProtectedRoute>
  );
}
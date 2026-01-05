import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Search,
  Filter,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Edit2,
  Eye,
  Ban,
  CheckCheck,
} from "lucide-react";

function AdminTokensPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoContaFilter, setTipoContaFilter] = useState("all");
  const [selectedToken, setSelectedToken] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  // Buscar tokens
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["adminTokens"],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.TokenUsuario.list();
      return result;
    },
  });

  // Mutation para atualizar token
  const updateTokenMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.asServiceRole.entities.TokenUsuario.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTokens"] });
      toast.success("Token atualizado com sucesso");
      setEditModalOpen(false);
      setSelectedToken(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar token: " + error.message);
    },
  });

  // Filtrar tokens
  const filteredTokens = tokens.filter((token) => {
    const matchSearch =
      token.token_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.especialidade?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || token.status === statusFilter;
    const matchTipo =
      tipoContaFilter === "all" || token.tipo_conta === tipoContaFilter;

    return matchSearch && matchStatus && matchTipo;
  });

  // Estatísticas
  const stats = {
    total: tokens.length,
    ativos: tokens.filter((t) => t.status === "ATIVO").length,
    verificados: tokens.filter((t) => t.verificado).length,
    totalDescontos: tokens.reduce((sum, t) => sum + (t.total_descontos_usados || 0), 0),
    totalEconomizado: tokens.reduce((sum, t) => sum + (t.valor_economizado || 0), 0),
  };

  const handleEdit = (token) => {
    setSelectedToken(token);
    setEditData({
      nivel: token.nivel,
      pontos: token.pontos,
      status: token.status,
      verificado: token.verificado,
      whatsapp_verificado: token.whatsapp_verificado,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedToken) return;
    updateTokenMutation.mutate({ id: selectedToken.id, data: editData });
  };

  const nivelLabels = {
    1: "Iniciante",
    2: "Bronze",
    3: "Prata",
    4: "Ouro",
    5: "Diamante",
  };

  const nivelColors = {
    1: "bg-gray-100 text-gray-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-gray-200 text-gray-800",
    4: "bg-yellow-100 text-yellow-700",
    5: "bg-cyan-100 text-cyan-700",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 mb-4 font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl mb-4">
              🎫
            </div>
            <h1 className="text-4xl font-black text-white mb-2">
              Gerenciar Tokens
            </h1>
            <p className="text-white/90 text-lg">
              Sistema de gamificação e benefícios Doutorizze
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Tokens Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.ativos}</p>
                <p className="text-sm text-gray-600">Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <CheckCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.verificados}</p>
                <p className="text-sm text-gray-600">Verificados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.totalDescontos}</p>
                <p className="text-sm text-gray-600">Descontos Usados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">
                  R$ {stats.totalEconomizado.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-gray-600">Economizado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por token ID, user ID ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 rounded-xl border-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoContaFilter} onValueChange={setTipoContaFilter}>
              <SelectTrigger className="h-12 rounded-xl border-2">
                <SelectValue placeholder="Tipo de Conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="PROFISSIONAL">Profissional</SelectItem>
                <SelectItem value="CLINICA">Clínica</SelectItem>
                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
                <SelectItem value="INSTITUICAO">Instituição</SelectItem>
                <SelectItem value="LABORATORIO">Laboratório</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-100">
            <p className="text-sm text-gray-600">
              <strong>{filteredTokens.length}</strong> tokens encontrados
            </p>
            {(searchTerm || statusFilter !== "all" || tipoContaFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTipoContaFilter("all");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Lista de Tokens */}
        <div className="space-y-4">
          {filteredTokens.map((token) => (
            <div
              key={token.id}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg">
                      {token.nivel}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {token.token_id}
                      </h3>
                      <p className="text-sm text-gray-600">User ID: {token.user_id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={nivelColors[token.nivel]}>
                      Nível {token.nivel} - {nivelLabels[token.nivel]}
                    </Badge>
                    <Badge
                      className={
                        token.status === "ATIVO"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {token.status}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {token.tipo_conta}
                    </Badge>
                    {token.verificado && (
                      <Badge className="bg-purple-100 text-purple-700">
                        ✓ Verificado
                      </Badge>
                    )}
                    {token.whatsapp_verificado && (
                      <Badge className="bg-green-100 text-green-700">
                        ✓ WhatsApp
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Especialidade</p>
                      <p className="font-semibold text-gray-900">
                        {token.especialidade || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pontos</p>
                      <p className="font-semibold text-gray-900">{token.pontos || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Descontos Usados</p>
                      <p className="font-semibold text-gray-900">
                        {token.total_descontos_usados || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Economizado</p>
                      <p className="font-semibold text-green-600">
                        R$ {(token.valor_economizado || 0).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(token)}
                    className="rounded-xl"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredTokens.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Nenhum token encontrado
              </h3>
              <p className="text-gray-400">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Token</DialogTitle>
            <DialogDescription>
              Token ID: {selectedToken?.token_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Nível
              </label>
              <Select
                value={editData.nivel?.toString()}
                onValueChange={(v) => setEditData({ ...editData, nivel: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Iniciante</SelectItem>
                  <SelectItem value="2">2 - Bronze</SelectItem>
                  <SelectItem value="3">3 - Prata</SelectItem>
                  <SelectItem value="4">4 - Ouro</SelectItem>
                  <SelectItem value="5">5 - Diamante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Pontos
              </label>
              <Input
                type="number"
                value={editData.pontos || 0}
                onChange={(e) =>
                  setEditData({ ...editData, pontos: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Status
              </label>
              <Select
                value={editData.status}
                onValueChange={(v) => setEditData({ ...editData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.verificado || false}
                  onChange={(e) =>
                    setEditData({ ...editData, verificado: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Verificado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.whatsapp_verificado || false}
                  onChange={(e) =>
                    setEditData({ ...editData, whatsapp_verificado: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">WhatsApp OK</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateTokenMutation.isPending}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
            >
              {updateTokenMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminTokens() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminTokensPage />
    </ProtectedRoute>
  );
}
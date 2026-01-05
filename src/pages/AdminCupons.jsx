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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Ticket,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";

function AdminCuponsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");

  // Buscar cupons
  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ["adminCupons"],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.TokenDesconto.list();
      return result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  // Filtrar cupons
  const filteredCupons = cupons.filter((cupom) => {
    const matchSearch =
      cupom.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cupom.parceiro_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cupom.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || cupom.status === statusFilter;
    const matchTipo =
      tipoFilter === "all" || cupom.desconto_tipo === tipoFilter;

    return matchSearch && matchStatus && matchTipo;
  });

  // Estatísticas
  const stats = {
    total: cupons.length,
    ativos: cupons.filter((c) => c.status === "ATIVO").length,
    usados: cupons.filter((c) => c.status === "USADO").length,
    expirados: cupons.filter((c) => c.status === "EXPIRADO").length,
    totalDesconto: cupons
      .filter((c) => c.status === "USADO")
      .reduce((sum, c) => sum + (c.valor_desconto_aplicado || 0), 0),
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

        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl mb-4">
              🎟️
            </div>
            <h1 className="text-4xl font-black text-white mb-2">
              Gerenciar Cupons
            </h1>
            <p className="text-white/90 text-lg">
              Sistema de descontos Doutorizze
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
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Cupons Total</p>
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
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.usados}</p>
                <p className="text-sm text-gray-600">Usados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.expirados}</p>
                <p className="text-sm text-gray-600">Expirados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">
                  R$ {stats.totalDesconto.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-gray-600">Descontos</p>
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
                placeholder="Buscar por código, parceiro ou user ID..."
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
                <SelectItem value="USADO">Usado</SelectItem>
                <SelectItem value="EXPIRADO">Expirado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="h-12 rounded-xl border-2">
                <SelectValue placeholder="Tipo de Desconto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="PERCENTUAL">Percentual</SelectItem>
                <SelectItem value="VALOR_FIXO">Valor Fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-100">
            <p className="text-sm text-gray-600">
              <strong>{filteredCupons.length}</strong> cupons encontrados
            </p>
            {(searchTerm || statusFilter !== "all" || tipoFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTipoFilter("all");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Lista de Cupons */}
        <div className="space-y-4">
          {filteredCupons.map((cupom) => (
            <div
              key={cupom.id}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-black text-lg">
                      {cupom.desconto_tipo === "PERCENTUAL" 
                        ? `${cupom.desconto_valor}%`
                        : "R$"
                      }
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">
                        {cupom.codigo}
                      </h3>
                      <p className="text-sm text-gray-600">{cupom.parceiro_nome}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      className={
                        cupom.status === "ATIVO"
                          ? "bg-green-100 text-green-700"
                          : cupom.status === "USADO"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {cupom.status}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {cupom.desconto_tipo === "PERCENTUAL" 
                        ? `${cupom.desconto_valor}% OFF`
                        : `R$ ${cupom.desconto_valor}`
                      }
                    </Badge>
                    {cupom.enviado_whatsapp && (
                      <Badge className="bg-green-100 text-green-700">
                        ✓ Enviado WhatsApp
                      </Badge>
                    )}
                    {cupom.produto_categoria && (
                      <Badge className="bg-orange-100 text-orange-700">
                        {cupom.produto_categoria}
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Gerado</p>
                      <p className="font-semibold text-gray-900">
                        {formatDistanceToNow(new Date(cupom.data_geracao), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Validade</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(cupom.data_validade).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {cupom.status === "USADO" && cupom.data_uso && (
                      <div>
                        <p className="text-gray-500">Usado em</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(cupom.data_uso).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                    {cupom.valor_desconto_aplicado && (
                      <div>
                        <p className="text-gray-500">Desconto Aplicado</p>
                        <p className="font-semibold text-green-600">
                          R$ {cupom.valor_desconto_aplicado.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>

                  {cupom.observacoes && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-600">
                        <strong>Observações:</strong> {cupom.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredCupons.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Nenhum cupom encontrado
              </h3>
              <p className="text-gray-400">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCupons() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminCuponsPage />
    </ProtectedRoute>
  );
}
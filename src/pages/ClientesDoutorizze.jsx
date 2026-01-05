import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Ticket,
  Filter,
  Download
} from "lucide-react";

export default function ClientesDoutorizze() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [parceiro, setParceiro] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        if (suppliers.length > 0) {
          setParceiro({ ...suppliers[0], tipo: 'FORNECEDOR' });
          return;
        }

        const institutions = await base44.entities.EducationInstitution.filter({ user_id: currentUser.id });
        if (institutions.length > 0) {
          setParceiro({ ...institutions[0], tipo: 'INSTITUICAO' });
          return;
        }

        const labs = await base44.entities.Laboratorio.filter({ user_id: currentUser.id });
        if (labs.length > 0) {
          setParceiro({ ...labs[0], tipo: 'LABORATORIO' });
        }
      } catch (error) {
        console.error("Erro:", error);
        toast.error("Erro ao carregar dados");
      }
    };
    loadData();
  }, []);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['tokens-clientes', parceiro?.id],
    queryFn: async () => {
      if (!parceiro) return [];
      return await base44.entities.TokenDesconto.filter({ parceiro_id: parceiro.id });
    },
    enabled: !!parceiro
  });

  const tokensFiltrados = tokens.filter(t => {
    if (filtroStatus === "TODOS") return true;
    return t.status === filtroStatus;
  });

  const estatisticas = {
    total: tokens.length,
    ativos: tokens.filter(t => t.status === 'ATIVO').length,
    usados: tokens.filter(t => t.status === 'USADO').length,
    expirados: tokens.filter(t => t.status === 'EXPIRADO').length,
    fechados: tokens.filter(t => t.negocio_fechado).length,
    taxaConversao: tokens.length > 0 
      ? ((tokens.filter(t => t.negocio_fechado).length / tokens.length) * 100).toFixed(1)
      : 0
  };

  const statusConfig = {
    ATIVO: { label: 'Ativo', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
    USADO: { label: 'Usado', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    EXPIRADO: { label: 'Expirado', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
    CANCELADO: { label: 'Cancelado', color: 'text-gray-600', bg: 'bg-gray-100', icon: XCircle }
  };

  if (isLoading || !parceiro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Clientes Doutorizze</h1>
              <p className="text-sm text-gray-600">Histórico de tokens gerados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Total de Tokens</p>
            </div>
            <p className="text-4xl font-black text-blue-600">{estatisticas.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Negócios Fechados</p>
            </div>
            <p className="text-4xl font-black text-green-600">{estatisticas.fechados}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
            </div>
            <p className="text-4xl font-black text-purple-600">{estatisticas.taxaConversao}%</p>
          </motion.div>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">Filtrar por Status</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {['TODOS', 'ATIVO', 'USADO', 'EXPIRADO'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  filtroStatus === status
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'TODOS' ? 'Todos' : statusConfig[status]?.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Lista de Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Histórico de Clientes ({tokensFiltrados.length})
            </h3>
          </div>

          {tokensFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum token encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tokensFiltrados.map((token, index) => {
                const config = statusConfig[token.status];
                const Icon = config?.icon || Clock;

                return (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-lg font-bold text-gray-900">
                            {token.codigo}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color} flex items-center gap-1`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                          {token.negocio_fechado && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              ✅ Fechado
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Desconto</p>
                            <p className="font-bold text-gray-900">
                              {token.desconto_tipo === 'PERCENTUAL' 
                                ? `${token.desconto_valor}%` 
                                : `R$ ${token.desconto_valor}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Gerado em</p>
                            <p className="font-bold text-gray-900">
                              {new Date(token.data_geracao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {token.data_uso && (
                          <div className="mt-2 text-sm">
                            <p className="text-gray-500">Usado em</p>
                            <p className="font-bold text-gray-900">
                              {new Date(token.data_uso).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Plus,
  Edit,
  Play,
  Pause,
  XCircle,
  Eye,
  Phone,
  Calendar,
  Tag,
  Package
} from "lucide-react";

export default function MinhasPromocoes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [activeTab, setActiveTab] = useState("ATIVO");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const supplierResult = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        setSupplier(supplierResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: promocoes = [], isLoading } = useQuery({
    queryKey: ["promocoes", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      return await base44.entities.Promotion.filter({ supplier_id: supplier.id });
    },
    enabled: !!supplier?.id
  });

  // Mutation atualizar status
  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Promotion.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocoes"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const handlePausar = (id) => {
    atualizarStatusMutation.mutate({ id, status: "PAUSADO" });
  };

  const handleAtivar = (id) => {
    atualizarStatusMutation.mutate({ id, status: "ATIVO" });
  };

  const handleEncerrar = (id) => {
    if (window.confirm("Tem certeza que deseja encerrar esta promoção?")) {
      atualizarStatusMutation.mutate({ id, status: "ENCERRADO" });
    }
  };

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "ATIVO", label: "Ativas", count: promocoes.filter(p => p.status === "ATIVO").length },
    { id: "RASCUNHO", label: "Rascunhos", count: promocoes.filter(p => p.status === "RASCUNHO").length },
    { id: "PAUSADO", label: "Pausadas", count: promocoes.filter(p => p.status === "PAUSADO").length },
    { id: "ENCERRADO", label: "Encerradas", count: promocoes.filter(p => p.status === "ENCERRADO").length }
  ];

  const promocoesFiltradas = activeTab === "ALL"
    ? promocoes
    : promocoes.filter(p => p.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(createPageUrl("DashboardFornecedor"))}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Minhas Promoções</h1>
              <p className="text-gray-600">
                {promocoes.length} {promocoes.length === 1 ? "promoção cadastrada" : "promoções cadastradas"}
              </p>
            </div>
            <button
              onClick={() => navigate(createPageUrl("CriarPromocao"))}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Nova
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-xl p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-white/30" : "bg-gray-200"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Promoções */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Carregando promoções...</p>
          </div>
        ) : promocoesFiltradas.length === 0 ? (
          <EstadoVazio activeTab={activeTab} navigate={navigate} />
        ) : (
          <div className="space-y-4">
            {promocoesFiltradas.map((promocao, index) => (
              <PromocaoCard
                key={promocao.id}
                promocao={promocao}
                index={index}
                onPausar={handlePausar}
                onAtivar={handleAtivar}
                onEncerrar={handleEncerrar}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PromocaoCard({ promocao, index, onPausar, onAtivar, onEncerrar, navigate }) {
  const statusConfig = {
    ATIVO: { label: "Ativo", color: "bg-green-100 text-green-700" },
    PAUSADO: { label: "Pausado", color: "bg-yellow-100 text-yellow-700" },
    RASCUNHO: { label: "Rascunho", color: "bg-gray-100 text-gray-700" },
    ENCERRADO: { label: "Encerrado", color: "bg-red-100 text-red-700" }
  };

  const status = statusConfig[promocao.status] || statusConfig.RASCUNHO;

  const formatarData = (data) => {
    if (!data) return null;
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR");
  };

  const isExpirado = promocao.data_validade && new Date(promocao.data_validade) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imagem */}
        <div className="w-full md:w-24 h-48 md:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {promocao.imagem_principal ? (
            <img 
              src={promocao.imagem_principal} 
              alt={promocao.titulo} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
              {status.label}
            </span>
            {promocao.desconto_percentual > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                {promocao.desconto_percentual}% OFF
              </span>
            )}
            {promocao.frete_gratis && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                Frete Grátis
              </span>
            )}
            {isExpirado && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                Expirado
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{promocao.titulo}</h3>

          {/* Preços */}
          <div className="flex items-center gap-3 mb-3">
            {promocao.preco_original && (
              <span className="text-gray-400 line-through">
                R$ {promocao.preco_original.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-black text-green-600">
              R$ {promocao.preco_promocional.toFixed(2)}
            </span>
          </div>

          {/* Métricas */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{promocao.visualizacoes || 0} visualizações</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{promocao.cliques || 0} cliques WhatsApp</span>
            </div>
            {promocao.data_validade && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Válido até {formatarData(promocao.data_validade)}</span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(createPageUrl("EditarPromocao") + "/" + promocao.id)}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-yellow-400 hover:text-yellow-600 transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>

            {promocao.status === "ATIVO" && (
              <button
                onClick={() => onPausar(promocao.id)}
                className="px-4 py-2 border-2 border-yellow-300 text-yellow-700 font-semibold rounded-xl hover:bg-yellow-50 transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
            )}

            {(promocao.status === "PAUSADO" || promocao.status === "RASCUNHO") && (
              <button
                onClick={() => onAtivar(promocao.id)}
                className="px-4 py-2 border-2 border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Ativar
              </button>
            )}

            {promocao.status !== "ENCERRADO" && (
              <button
                onClick={() => onEncerrar(promocao.id)}
                className="px-4 py-2 border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Encerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EstadoVazio({ activeTab, navigate }) {
  const mensagens = {
    ATIVO: {
      titulo: "Nenhuma promoção ativa",
      descricao: "Você não tem promoções ativas no momento"
    },
    RASCUNHO: {
      titulo: "Nenhum rascunho",
      descricao: "Você não tem rascunhos salvos"
    },
    PAUSADO: {
      titulo: "Nenhuma promoção pausada",
      descricao: "Você não tem promoções pausadas"
    },
    ENCERRADO: {
      titulo: "Nenhuma promoção encerrada",
      descricao: "Você não tem promoções encerradas"
    }
  };

  const msg = mensagens[activeTab] || {
    titulo: "Nenhuma promoção ainda",
    descricao: "Crie sua primeira promoção e alcance milhares de profissionais!"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-12 text-center"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
        <Tag className="w-12 h-12 text-orange-500" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-2">{msg.titulo}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{msg.descricao}</p>
      <button
        onClick={() => navigate(createPageUrl("CriarPromocao"))}
        className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Criar Promoção
      </button>
    </motion.div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  Plus,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  ATIVO: { label: "Ativo", color: "bg-green-100 text-green-700", icon: CheckCircle },
  PAUSADO: { label: "Pausado", color: "bg-gray-100 text-gray-700", icon: Pause },
  VENDIDO: { label: "Vendido", color: "bg-blue-100 text-blue-700", icon: ShoppingBag },
  ENCERRADO: { label: "Encerrado", color: "bg-purple-100 text-purple-700", icon: Package }
};

const tabs = [
  { id: "ATIVO", label: "Ativos", icon: CheckCircle },
  { id: "PAUSADO", label: "Pausados", icon: Pause },
  { id: "VENDIDO", label: "Vendidos", icon: ShoppingBag },
  { id: "ENCERRADO", label: "Encerrados", icon: Package }
];

export default function MeusAnunciosMarketplace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("ATIVO");
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [anuncioSelecionado, setAnuncioSelecionado] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Buscar anúncios do usuário
  const { data: meusAnuncios = [], isLoading } = useQuery({
    queryKey: ["meusAnuncios", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.MarketplaceItem.filter({ anunciante_id: user.id });
    },
    enabled: !!user
  });

  // Filtrar por tab
  const anunciosFiltrados = meusAnuncios.filter(a => a.status === activeTab);

  // Contadores por status
  const contadores = {
    ATIVO: meusAnuncios.filter(a => a.status === "ATIVO").length,
    PAUSADO: meusAnuncios.filter(a => a.status === "PAUSADO").length,
    VENDIDO: meusAnuncios.filter(a => a.status === "VENDIDO").length,
    ENCERRADO: meusAnuncios.filter(a => a.status === "ENCERRADO").length
  };

  // Mutation para pausar/reativar
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, novoStatus }) => {
      return await base44.entities.MarketplaceItem.update(id, { status: novoStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meusAnuncios"]);
      toast.success("✅ Status atualizado!");
    }
  });

  // Mutation para excluir
  const excluirMutation = useMutation({
    mutationFn: async ({ id, motivo }) => {
      const status = motivo === "🎉 Vendi pela Doutorizze" ? "VENDIDO" : "ENCERRADO";
      return await base44.entities.MarketplaceItem.update(id, { 
        status,
        motivo_encerramento: motivo,
        encerrado_em: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["meusAnuncios"]);
      if (variables.motivo === "🎉 Vendi pela Doutorizze") {
        toast.success("🎉 Parabéns pela venda!");
      } else {
        toast.success("✅ Anúncio encerrado!");
      }
      setExcluirModalOpen(false);
      setAnuncioSelecionado(null);
    }
  });

  const handlePausar = (anuncio) => {
    const novoStatus = anuncio.status === "PAUSADO" ? "ATIVO" : "PAUSADO";
    toggleStatusMutation.mutate({ id: anuncio.id, novoStatus });
  };

  const handleExcluir = (anuncio) => {
    setAnuncioSelecionado(anuncio);
    setExcluirModalOpen(true);
  };

  const confirmarExclusao = (motivo) => {
    if (anuncioSelecionado) {
      excluirMutation.mutate({ id: anuncioSelecionado.id, motivo });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando anúncios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full opacity-10 -ml-20 -mb-20"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Meus Anúncios</h1>
              <p className="text-white/90">Gerencie seus produtos anunciados</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="text-2xl font-black text-white">{meusAnuncios.length}</div>
              <div className="text-sm text-white/90">Total</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="text-2xl font-black text-white">{contadores.ATIVO}</div>
              <div className="text-sm text-white/90">Ativos</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="text-2xl font-black text-white">
                {meusAnuncios.reduce((sum, a) => sum + (a.visualizacoes || 0), 0)}
              </div>
              <div className="text-sm text-white/90">Visualizações</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="text-2xl font-black text-white">{contadores.VENDIDO}</div>
              <div className="text-sm text-white/90">Vendidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? "bg-white/20" : "bg-gray-200"
                  }`}>
                    {contadores[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {anunciosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
              <Package className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Nenhum anúncio {activeTab.toLowerCase()}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "ATIVO" 
                ? "Comece criando seu primeiro anúncio!"
                : `Você não tem anúncios ${activeTab.toLowerCase()} no momento.`
              }
            </p>
            {activeTab === "ATIVO" && (
              <button
                onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
                className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Criar Primeiro Anúncio
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {anunciosFiltrados.map((anuncio, index) => {
                const StatusIcon = statusConfig[anuncio.status]?.icon || Package;
                return (
                  <motion.div
                    key={anuncio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    {/* Imagem */}
                    <div 
                      className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden cursor-pointer"
                      onClick={() => navigate(createPageUrl("MarketplaceDetail") + "/" + anuncio.id)}
                    >
                      {anuncio.fotos && anuncio.fotos.length > 0 ? (
                        <img
                          src={anuncio.fotos[0]}
                          alt={anuncio.titulo_item}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {/* Badge Status */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1.5 ${statusConfig[anuncio.status]?.color} rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[anuncio.status]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {anuncio.titulo_item}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-black text-orange-500">
                          R$ {anuncio.preco?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {anuncio.visualizacoes || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(anuncio.created_date), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(createPageUrl("MarketplaceDetail") + "/" + anuncio.id)}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        
                        {anuncio.status === "ATIVO" && (
                          <button
                            onClick={() => handlePausar(anuncio)}
                            disabled={toggleStatusMutation.isPending}
                            className="px-3 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}

                        {anuncio.status === "PAUSADO" && (
                          <button
                            onClick={() => handlePausar(anuncio)}
                            disabled={toggleStatusMutation.isPending}
                            className="px-3 py-2 border-2 border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-50 disabled:opacity-50"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {(anuncio.status === "ATIVO" || anuncio.status === "PAUSADO") && (
                          <button
                            onClick={() => handleExcluir(anuncio)}
                            className="px-3 py-2 border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB - Criar Anúncio */}
      <button
        onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* MODAL DE EXCLUSÃO */}
      <AnimatePresence>
        {excluirModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExcluirModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Encerrar Anúncio</h3>
                    <p className="text-sm text-gray-600">Escolha o motivo do encerramento</p>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => confirmarExclusao("🎉 Vendi pela Doutorizze")}
                  disabled={excluirMutation.isPending}
                  className="w-full p-4 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">🎉 Vendi pela Doutorizze</p>
                      <p className="text-sm text-gray-600">Parabéns! Sua venda será contabilizada.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmarExclusao("❌ Desisti de vender")}
                  disabled={excluirMutation.isPending}
                  className="w-full p-4 border-2 border-gray-200 hover:bg-gray-50 rounded-xl text-left transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-500 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">❌ Desisti de vender</p>
                      <p className="text-sm text-gray-600">O anúncio será encerrado.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmarExclusao("📤 Vendi por fora")}
                  disabled={excluirMutation.isPending}
                  className="w-full p-4 border-2 border-gray-200 hover:bg-gray-50 rounded-xl text-left transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">📤 Vendi por fora</p>
                      <p className="text-sm text-gray-600">Vendi fora da plataforma.</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setExcluirModalOpen(false)}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
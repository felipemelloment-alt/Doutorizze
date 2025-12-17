import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import MarketplaceItemCard from "../components/marketplace/MarketplaceItemCard";
import RadarActivationModal from "../components/marketplace/RadarActivationModal";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Search,
  MapPin,
  Filter,
  Stethoscope,
  Activity,
  Zap,
  Radar,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Tag,
  ArrowRight } from
"lucide-react";

export default function Marketplace() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("ODONTOLOGIA");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [radarModalOpen, setRadarModalOpen] = useState(false);
  const itemsPerPage = 12;

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
  const { data: items = [], isLoading, isError } = useQuery({
  queryKey: ["marketplaceItems", { activeTab }],
  queryFn: async () => {
    try {
      const where = { status: "ATIVO" };

      if (activeTab && activeTab !== "TODOS") {
        where.tipo_mundo = activeTab;
      }

      const result = await base44.entities.MarketplaceItem.filter(where);
      return result || [];
    } catch (err) {
      console.error("Error fetching marketplace items:", err);
      return [];
    }
  },
  enabled: !!activeTab,
  retry: 1,
  staleTime: 1000 * 60 * 5,
});


  // Filtrar items
  const filteredItems = items.filter((item) => {
    const matchSearch = item.titulo_item?.
    toLowerCase().
    includes(searchTerm.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.marca?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCity =
    selectedCity === "all" || item.localizacao?.includes(selectedCity);
    const matchCondition =
    condition === "all" || item.condicao === condition;

    let matchPrice = true;
    if (priceRange !== "all") {
      const price = item.preco || 0;
      switch (priceRange) {
        case "0-5000":
          matchPrice = price <= 5000;
          break;
        case "5000-15000":
          matchPrice = price > 5000 && price <= 15000;
          break;
        case "15000-30000":
          matchPrice = price > 15000 && price <= 30000;
          break;
        case "30000+":
          matchPrice = price > 30000;
          break;
      }
    }

    return matchSearch && matchCity && matchPrice && matchCondition;
  });

  // Ordenar items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.created_date) - new Date(a.created_date);
      case "oldest":
        return new Date(a.created_date) - new Date(b.created_date);
      case "price-asc":
        return (a.preco || 0) - (b.preco || 0);
      case "price-desc":
        return (b.preco || 0) - (a.preco || 0);
      case "relevant":
        // Relevância por views e recência
        const scoreA = (a.visualizacoes || 0) + (Date.now() - new Date(a.created_date)) / 1000000;
        const scoreB = (b.visualizacoes || 0) + (Date.now() - new Date(b.created_date)) / 1000000;
        return scoreB - scoreA;
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  // Reset página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, priceRange, condition, activeTab, sortBy]);

  const cities = [...new Set(items.map((item) => item.localizacao))].filter(
    Boolean
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">Não foi possível carregar o marketplace. Tente novamente.</p>
          <Button
            onClick={() => window.location.reload()}
            className="gradient-yellow-pink text-white font-bold px-8 py-4 rounded-2xl border-0">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 mb-6 relative overflow-hidden">
          {/* Decoração */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute top-4 right-8 text-4xl animate-pulse">⚡</div>
          <div className="absolute bottom-4 left-8 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>⚡</div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
              🛒
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              MARKETPLACE
            </h1>
            <p className="text-white/90 text-lg">Equipamentos odontológicos e médicos</p>
          </div>
        </div>

        {/* Tabs de Categoria */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("ODONTOLOGIA")}
            className={`flex-1 py-4 ${
              activeTab === "ODONTOLOGIA"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-200/50"
                : "bg-white border-2 border-gray-200 text-gray-600 hover:border-yellow-400"
            } font-bold rounded-2xl flex items-center justify-center gap-2 transition-all`}>
            🦷 Odontologia
          </button>
          <button
            onClick={() => setActiveTab("MEDICINA")}
            className={`flex-1 py-4 ${
              activeTab === "MEDICINA"
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-200/50"
                : "bg-white border-2 border-gray-200 text-gray-600 hover:border-yellow-400"
            } font-bold rounded-2xl flex items-center justify-center gap-2 transition-all`}>
            ⚕️ Medicina
          </button>
        </div>

        {/* Busca + Botão Anunciar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Buscar equipamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-lg outline-none"
            />
          </div>
          <button
            onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
            className="py-4 px-8 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <Plus className="w-5 h-5" />
            Anunciar
          </button>
        </div>

        {/* Seção Radar */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-6 mb-8 relative overflow-hidden">
          {/* Círculos animados radar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-bounce">📡</div>
            <h2 className="text-2xl font-black text-white mb-2">Radar de Equipamentos</h2>
            <p className="text-white/80 mb-6">Seja notificado quando surgir o equipamento que você procura!</p>
            
            <button
              onClick={() => setRadarModalOpen(true)}
              className="w-full md:w-auto px-8 py-4 bg-white text-purple-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-50 transition-all shadow-lg">
              📡 Ativar Meu Radar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">

            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 rounded-xl border-2 text-base">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Relevantes</SelectItem>
                  <SelectItem value="recent">Recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full h-12 px-4 border-2 border-gray-200 hover:border-yellow-400 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros {!showFilters && `(${[selectedCity !== "all", priceRange !== "all", condition !== "all"].filter(Boolean).length})`}
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Localização</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map((city) =>
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Faixa de Preço</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
                    <SelectValue placeholder="Todos os preços" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os preços</SelectItem>
                    <SelectItem value="0-5000">Até R$ 5.000</SelectItem>
                    <SelectItem value="5000-15000">R$ 5.000 - R$ 15.000</SelectItem>
                    <SelectItem value="15000-30000">R$ 15.000 - R$ 30.000</SelectItem>
                    <SelectItem value="30000+">Acima de R$ 30.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Condição</label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
                    <SelectValue placeholder="Todas as condições" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as condições</SelectItem>
                    <SelectItem value="NOVO">Novo</SelectItem>
                    <SelectItem value="SEMINOVO">Seminovo</SelectItem>
                    <SelectItem value="USADO">Usado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t-2 border-gray-100">
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 text-base bg-yellow-100 text-yellow-700 rounded-full font-bold">
                {sortedItems.length} {sortedItems.length === 1 ? "resultado" : "resultados"}
              </span>
              {(selectedCity !== "all" || priceRange !== "all" || condition !== "all" || searchTerm) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("all");
                    setPriceRange("all");
                    setCondition("all");
                  }}
                  className="text-gray-600 hover:text-red-500 font-semibold text-sm">
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Header da Seção */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-gray-900">
            Equipamentos Disponíveis
            <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
              {sortedItems.length}
            </span>
          </h2>
        </div>

        {/* Lista de Equipamentos */}
        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6 opacity-50">📦</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Nenhum equipamento encontrado
            </h3>
            <p className="text-gray-400 mb-6">Seja o primeiro a anunciar!</p>
            <button
              onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
              Anunciar Equipamento
            </button>
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(createPageUrl(`MarketplaceDetail?id=${item.id}`))}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                  {/* Imagem */}
                  <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {item.fotos && item.fotos.length > 0 ? (
                      <img
                        src={item.fotos[0]}
                        alt={item.titulo_item}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📷
                      </div>
                    )}
                    
                    {/* Badge estado */}
                    {item.condicao && (
                      <div className={`absolute top-3 right-3 px-3 py-1 text-white text-xs font-bold rounded-full ${
                        item.condicao === "NOVO" ? "bg-green-500" : "bg-yellow-500"
                      }`}>
                        {item.condicao === "NOVO" ? "Novo" : item.condicao === "SEMINOVO" ? "Seminovo" : "Usado"}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                        {item.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odonto" : "⚕️ Medicina"}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-yellow-600 transition-all">
                      {item.titulo_item}
                    </h3>

                    {/* Preço */}
                    <p className="text-2xl font-black text-green-600 mb-3">
                      R$ {item.preco?.toLocaleString('pt-BR') || '0'}
                    </p>

                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        {item.localizacao}
                      </div>
                      {item.marca && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Tag className="w-4 h-4" />
                          {item.marca}
                        </div>
                      )}
                    </div>

                    {/* Botão */}
                    <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      Ver Detalhes
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="h-12 px-6 rounded-xl border-2 font-bold disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-12 w-12 rounded-xl border-2 font-black ${
                          currentPage === pageNum 
                            ? "gradient-yellow-pink text-white border-0" 
                            : "hover:border-[#F9B500]"
                        }`}>
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="h-12 px-6 rounded-xl border-2 font-bold disabled:opacity-50">
                  Próxima
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Radar CTA After Results */}
            <div className="mt-12 bg-gradient-to-r from-green-50 to-teal-50 border-4 border-green-300 rounded-3xl p-8 text-center">
              <Radar className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Não encontrou exatamente o que precisa?
              </h3>
              <p className="text-gray-700 font-semibold mb-6">
                Ative o <strong>Radar de Produtos</strong> e seja notificado quando aparecer o
                equipamento que você procura!
              </p>
              <Button
              onClick={() => setRadarModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">

                <Radar className="w-6 h-6 mr-2" />
                Ativar Radar Agora 🎯
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Radar Modal */}
      <RadarActivationModal
        open={radarModalOpen}
        onOpenChange={setRadarModalOpen}
        initialCategory={activeTab}
        initialSearch={searchTerm}
      />
    </div>
  );

}
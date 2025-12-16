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
  ChevronRight } from
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
    <div className="min-h-screen bg-white">
      {/* Botão Anunciar Equipamento - Topo */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
            variant="ghost"
            className="flex items-center gap-2 text-pink-500 hover:text-pink-600 font-bold text-base">
            <Plus className="w-5 h-5" />
            Anunciar Equipamento
          </Button>
        </div>
      </div>

      {/* Hero Image - Largura Total */}
      <div className="w-full overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d492cc9abf019259139b/ada8b00cc_Marketplace.png"
          alt="Marketplace"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Tabs Funcionais - Após a Imagem */}
      <div className="bg-gradient-to-br from-yellow-50 via-white to-pink-50 py-8">
        <div className="container mx-auto px-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8">

            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 h-auto p-3 bg-white rounded-3xl shadow-2xl gap-3 border-4 border-gray-100">
              <TabsTrigger
                value="ODONTOLOGIA"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-blue-500 data-[state=active]:text-white font-black text-base md:text-xl py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105">

                🦷 Odontologia
              </TabsTrigger>
              <TabsTrigger
                value="MEDICINA"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-black text-base md:text-xl py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105">

                ⚕️ Medicina
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filters */}
          <div className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-4 border-[#F9B500]">
          {/* Search Bar */}
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar equipamento, marca ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#F9B500]" />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-14 rounded-2xl border-2 text-lg">
                <ArrowUpDown className="w-5 h-5 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevant">Mais relevantes</SelectItem>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-14 rounded-2xl border-2 font-bold text-base hover:border-[#F9B500] transition-all">
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filtros {!showFilters && `(${[selectedCity !== "all", priceRange !== "all", condition !== "all"].filter(Boolean).length})`}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
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

          {/* Results Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t-2 border-gray-100">
            <div className="flex flex-wrap gap-2">
              <Badge className="px-4 py-2 text-base bg-gradient-to-r from-[#F9B500] to-[#E94560] text-white font-bold">
                {sortedItems.length} {sortedItems.length === 1 ? "resultado" : "resultados"}
              </Badge>
              {(selectedCity !== "all" || priceRange !== "all" || condition !== "all" || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("all");
                    setPriceRange("all");
                    setCondition("all");
                  }}
                  className="text-gray-600 hover:text-[#E94560] font-bold">
                  Limpar filtros
                </Button>
              )}
            </div>

            {totalPages > 1 && (
              <div className="text-sm text-gray-600 font-semibold">
                Página {currentPage} de {totalPages}
              </div>
            )}
          </div>
        </div>

          {/* Items Grid */}
          {sortedItems.length === 0 ?
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl border-4 border-gray-100">
              <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Nenhum item encontrado
              </h3>
              <p className="text-gray-600 font-semibold mb-6">
                Não encontrou o que procura? Ative o Radar de Produtos!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
                className="gradient-yellow-pink text-white font-bold px-8 py-4 rounded-2xl border-0">

                  <Plus className="w-5 h-5 mr-2" />
                  Criar Anúncio
                </Button>
                <Button
                onClick={() => setRadarModalOpen(true)}
                className="bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">

                  <Radar className="w-5 h-5 mr-2" />
                  Ativar Radar de Produtos 🎯
                </Button>
              </div>
            </div>
          </div> :

        <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedItems.map((item) =>
            <MarketplaceItemCard
              key={item.id}
              item={item}
              onClick={() =>
              navigate(createPageUrl(`MarketplaceDetail?id=${item.id}`))
              } />

            )}
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
          }
        </div>
      </div>

      {/* Radar Modal */}
      <RadarActivationModal
        open={radarModalOpen}
        onOpenChange={setRadarModalOpen}
        initialCategory={activeTab}
        initialSearch={searchTerm} />

    </div>);

}
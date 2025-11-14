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
  SelectValue,
} from "@/components/ui/select";
import MarketplaceItemCard from "../components/marketplace/MarketplaceItemCard";
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
} from "lucide-react";

export default function Marketplace() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("ODONTOLOGIA");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [condition, setCondition] = useState("all");

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

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["marketplaceItems", activeTab],
    queryFn: async () => {
      return await base44.entities.MarketplaceItem.filter(
        { tipo_mundo: activeTab, status: "ATIVO" },
        "-created_date"
      );
    },
  });

  const filteredItems = items.filter((item) => {
    const matchSearch = item.titulo_item
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-16 gradient-yellow-pink">
        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-10 left-10 opacity-20"
        >
          <Stethoscope className="w-32 h-32 text-white" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -10, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          className="absolute bottom-10 right-10 opacity-20"
        >
          <Activity className="w-40 h-40 text-white" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  <ShoppingBag className="w-10 h-10 text-pink-600" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-7xl font-black text-yellow-400 text-shadow-lg">
                    MARKETPLACE
                  </h1>
                  <p className="text-white text-xl font-semibold mt-2">
                    Equipamentos médicos e odontológicos ⚡
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
                  className="bg-white text-pink-600 font-bold px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Anunciar Equipamento
                </Button>
              </div>
            </motion.div>

            {/* Mockup Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="w-64 h-96 bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 p-4 relative overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-full"></div>
                <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2rem] mt-6 p-4">
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <div className="w-full h-32 bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
                      <Activity className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="font-bold text-sm gradient-yellow-pink bg-clip-text text-transparent">
                      Cadeira Odontológica
                    </h3>
                    <p className="text-2xl font-black text-pink-600 mt-1">
                      R$14.000
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                      <MapPin className="w-3 h-3" />
                      Goiânia - GO
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-2 bg-white rounded-2xl shadow-lg">
            <TabsTrigger
              value="ODONTOLOGIA"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-bold text-lg py-4 rounded-xl"
            >
              🦷 Odontologia
            </TabsTrigger>
            <TabsTrigger
              value="MEDICINA"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-bold text-lg py-4 rounded-xl"
            >
              ⚕️ Medicina
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-4 border-yellow-400">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar equipamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-2xl focus:border-yellow-400"
              />
            </div>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-14 rounded-2xl border-2 text-lg">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-14 rounded-2xl border-2 text-lg">
                <SelectValue placeholder="Faixa de preço" />
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

          <div className="flex gap-4 mt-4">
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="h-12 rounded-xl border-2 max-w-xs">
                <SelectValue placeholder="Condição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as condições</SelectItem>
                <SelectItem value="NOVO">Novo</SelectItem>
                <SelectItem value="SEMINOVO">Seminovo</SelectItem>
                <SelectItem value="USADO">Usado</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="px-4 py-2 text-base">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "itens"}{" "}
              encontrado{filteredItems.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border-4 border-gray-100">
            <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Nenhum item encontrado
            </h3>
            <p className="text-gray-600 font-semibold mb-6">
              Tente ajustar os filtros ou seja o primeiro a anunciar!
            </p>
            <Button
              onClick={() => navigate(createPageUrl("MarketplaceCreate"))}
              className="gradient-yellow-pink text-white font-bold px-8 py-4 rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeiro Anúncio
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MarketplaceItemCard
                key={item.id}
                item={item}
                onClick={() =>
                  navigate(createPageUrl(`MarketplaceDetail?id=${item.id}`))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
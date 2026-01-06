import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Package,
  ChevronLeft,
  MapPin,
  Star,
  CheckCircle,
  Search,
  Filter,
  Phone,
  Globe,
  Instagram
} from "lucide-react";

const tiposLabels = {
  EQUIPAMENTOS: "Equipamentos",
  MATERIAIS: "Materiais",
  SOFTWARE: "Software",
  MOVEIS: "Móveis",
  OUTROS: "Outros"
};

export default function Fornecedores() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [areaFiltro, setAreaFiltro] = useState("TODOS");

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const results = await base44.entities.Supplier.filter({
        status_cadastro: "APROVADO",
        ativo: true
      });
      return results.sort((a, b) => (b.media_avaliacoes || 0) - (a.media_avaliacoes || 0));
    }
  });

  const fornecedoresFiltrados = fornecedores.filter(forn => {
    const matchBusca = !busca || 
      forn.nome_fantasia?.toLowerCase().includes(busca.toLowerCase()) ||
      forn.cidade?.toLowerCase().includes(busca.toLowerCase());
    
    const matchTipo = tipoFiltro === "TODOS" || forn.tipo_produtos?.includes(tipoFiltro);
    const matchArea = areaFiltro === "TODOS" || forn.area_atuacao === areaFiltro;

    return matchBusca && matchTipo && matchArea;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Fornecedores</h1>
            <p className="text-white/80 text-sm">Parceiros verificados</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fornecedor ou cidade..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-white/50 outline-none"
          />
        </div>
      </div>

      <div className="px-4 -mt-4 max-w-4xl mx-auto">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900">Filtros</span>
          </div>

          <div className="space-y-3">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none"
            >
              <option value="TODOS">Todos os produtos</option>
              {Object.entries(tiposLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none"
            >
              <option value="TODOS">Todas as áreas</option>
              <option value="ODONTOLOGIA">🦷 Odontologia</option>
              <option value="MEDICINA">⚕️ Medicina</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Lista */}
        {!isLoading && fornecedoresFiltrados.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros</p>
          </div>
        )}

        <div className="space-y-4">
          {fornecedoresFiltrados.map((forn) => (
            <motion.div
              key={forn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(createPageUrl("DetalheFornecedor") + "?id=" + forn.id)}
              className="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {forn.logo_url ? (
                    <img src={forn.logo_url} alt={forn.nome_fantasia} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-orange-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{forn.nome_fantasia}</h3>
                    {forn.status_cadastro === "APROVADO" && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{forn.cidade} - {forn.uf}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {forn.tipo_produtos?.slice(0, 2).map((tipo, i) => (
                      <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                        {tiposLabels[tipo]}
                      </span>
                    ))}
                    {forn.tipo_produtos?.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                        +{forn.tipo_produtos.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Avaliação */}
                  {forn.media_avaliacoes > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= forn.media_avaliacoes ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{forn.media_avaliacoes.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({forn.total_avaliacoes})</span>
                    </div>
                  )}

                  {/* Contatos */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {forn.site && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Site</span>
                      </div>
                    )}
                    {forn.instagram && (
                      <div className="flex items-center gap-1">
                        <Instagram className="w-3 h-3" />
                        <span>@{forn.instagram}</span>
                      </div>
                    )}
                    {forn.whatsapp && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
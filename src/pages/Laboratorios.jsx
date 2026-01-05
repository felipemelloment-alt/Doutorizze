import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Search,
  MapPin,
  Star,
  Phone,
  ChevronLeft,
  Filter,
  CheckCircle
} from "lucide-react";

const tiposLabels = {
  PROTESE_DENTARIA: "Prótese Dentária",
  ANALISES_CLINICAS: "Análises Clínicas",
  IMAGEM: "Diagnóstico por Imagem",
  PATOLOGIA: "Patologia",
  OUTRO: "Outro"
};

const categoriaLabels = {
  ODONTOLOGIA: "Odontologia",
  MEDICINA: "Medicina",
  AMBOS: "Ambos"
};

export default function Laboratorios() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroUF, setFiltroUF] = useState("");

  const { data: laboratorios = [], isLoading } = useQuery({
    queryKey: ["laboratorios"],
    queryFn: () => base44.entities.Laboratorio.filter({ status_cadastro: "APROVADO", ativo: true })
  });

  const laboratoriosFiltrados = laboratorios.filter(lab => {
    const matchBusca = !busca || 
      lab.nome_fantasia?.toLowerCase().includes(busca.toLowerCase()) ||
      lab.cidade?.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = !filtroTipo || lab.tipo_laboratorio === filtroTipo;
    const matchCategoria = !filtroCategoria || lab.categoria === filtroCategoria || lab.categoria === "AMBOS";
    const matchUF = !filtroUF || lab.uf === filtroUF;
    return matchBusca && matchTipo && matchCategoria && matchUF;
  });

  const ufsDisponiveis = [...new Set(laboratorios.map(l => l.uf).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Laboratórios</h1>
              <p className="text-white/80 text-sm">{laboratoriosFiltrados.length} laboratórios encontrados</p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou cidade..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-teal-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-4 max-w-4xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 rounded-full border-2 border-gray-200 bg-white text-sm font-medium whitespace-nowrap"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(tiposLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 rounded-full border-2 border-gray-200 bg-white text-sm font-medium whitespace-nowrap"
          >
            <option value="">Todas categorias</option>
            {Object.entries(categoriaLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <select
            value={filtroUF}
            onChange={(e) => setFiltroUF(e.target.value)}
            className="px-4 py-2 rounded-full border-2 border-gray-200 bg-white text-sm font-medium whitespace-nowrap"
          >
            <option value="">Todos estados</option>
            {ufsDisponiveis.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : laboratoriosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum laboratório encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          laboratoriosFiltrados.map((lab, index) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(createPageUrl("DetalheLaboratorio") + `?id=${lab.id}`)}
              className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-teal-400 transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                {/* Logo */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {lab.logo_url ? (
                    <img src={lab.logo_url} alt={lab.nome_fantasia} className="w-full h-full object-cover" />
                  ) : (
                    <FlaskConical className="w-8 h-8 text-teal-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{lab.nome_fantasia}</h3>
                    {lab.status_cadastro === "APROVADO" && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                      {tiposLabels[lab.tipo_laboratorio] || lab.tipo_laboratorio}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {categoriaLabels[lab.categoria] || lab.categoria}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{lab.cidade} - {lab.uf}</span>
                    </div>
                    {lab.media_avaliacoes > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{lab.media_avaliacoes.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {lab.servicos_oferecidos?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {lab.servicos_oferecidos.slice(0, 3).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
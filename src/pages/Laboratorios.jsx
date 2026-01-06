import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  FlaskConical,
  ChevronLeft,
  MapPin,
  Star,
  CheckCircle,
  Search,
  Filter,
  Clock,
  Package
} from "lucide-react";

const tiposLabels = {
  PROTESE_DENTARIA: "Prótese Dentária",
  ANALISES_CLINICAS: "Análises Clínicas",
  IMAGEM: "Diagnóstico por Imagem",
  PATOLOGIA: "Patologia",
  OUTRO: "Outro"
};

export default function Laboratorios() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [categoriaFiltro, setCategoriaFiltro] = useState("TODOS");

  const { data: laboratorios = [], isLoading } = useQuery({
    queryKey: ["laboratorios"],
    queryFn: async () => {
      const results = await base44.entities.Laboratorio.filter({
        status_cadastro: "APROVADO",
        ativo: true
      });
      return results.sort((a, b) => (b.media_avaliacoes || 0) - (a.media_avaliacoes || 0));
    }
  });

  const laboratoriosFiltrados = laboratorios.filter(lab => {
    const matchBusca = !busca || 
      lab.nome_fantasia?.toLowerCase().includes(busca.toLowerCase()) ||
      lab.cidade?.toLowerCase().includes(busca.toLowerCase());
    
    const matchTipo = tipoFiltro === "TODOS" || lab.tipo_laboratorio === tipoFiltro;
    const matchCategoria = categoriaFiltro === "TODOS" || lab.categoria === categoriaFiltro;

    return matchBusca && matchTipo && matchCategoria;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Laboratórios</h1>
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
            placeholder="Buscar laboratório ou cidade..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-white/50 outline-none"
          />
        </div>
      </div>

      <div className="px-4 -mt-4 max-w-4xl mx-auto">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-teal-500" />
            <span className="font-bold text-gray-900">Filtros</span>
          </div>

          <div className="space-y-3">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none"
            >
              <option value="TODOS">Todos os tipos</option>
              {Object.entries(tiposLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none"
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
            <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Lista */}
        {!isLoading && laboratoriosFiltrados.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
            <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Nenhum laboratório encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros</p>
          </div>
        )}

        <div className="space-y-4">
          {laboratoriosFiltrados.map((lab) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(createPageUrl("DetalheLaboratorio") + "?id=" + lab.id)}
              className="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {lab.logo_url ? (
                    <img src={lab.logo_url} alt={lab.nome_fantasia} className="w-full h-full object-cover" />
                  ) : (
                    <FlaskConical className="w-10 h-10 text-teal-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{lab.nome_fantasia}</h3>
                    {lab.status_cadastro === "APROVADO" && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{lab.cidade} - {lab.uf}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold">
                      {tiposLabels[lab.tipo_laboratorio]}
                    </span>
                    {lab.categoria === "AMBOS" && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                        Odonto + Medicina
                      </span>
                    )}
                  </div>

                  {/* Avaliação */}
                  {lab.media_avaliacoes > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= lab.media_avaliacoes ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{lab.media_avaliacoes.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({lab.total_avaliacoes})</span>
                    </div>
                  )}

                  {/* Info extra */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {lab.prazo_entrega?.minimo_dias && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{lab.prazo_entrega.minimo_dias}-{lab.prazo_entrega.maximo_dias} dias</span>
                      </div>
                    )}
                    {lab.servicos_oferecidos?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{lab.servicos_oferecidos.length} serviços</span>
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
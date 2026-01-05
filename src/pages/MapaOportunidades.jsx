import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  MapPin,
  ChevronLeft,
  Briefcase,
  Filter,
  List,
  Map as MapIcon,
  Zap,
  DollarSign
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Coordenadas aproximadas de capitais brasileiras
const coordenadasCidades = {
  "SAO PAULO": [-23.5505, -46.6333],
  "RIO DE JANEIRO": [-22.9068, -43.1729],
  "BELO HORIZONTE": [-19.9167, -43.9345],
  "BRASILIA": [-15.7942, -47.8822],
  "SALVADOR": [-12.9714, -38.5014],
  "FORTALEZA": [-3.7172, -38.5433],
  "CURITIBA": [-25.4284, -49.2733],
  "RECIFE": [-8.0476, -34.877],
  "PORTO ALEGRE": [-30.0346, -51.2177],
  "GOIANIA": [-16.6869, -49.2648],
  "MANAUS": [-3.119, -60.0217],
  "BELEM": [-1.4558, -48.4902],
  "CAMPINAS": [-22.9099, -47.0626],
  "GUARULHOS": [-23.4538, -46.5333],
  "SANTOS": [-23.9618, -46.3322]
};

const getCoordenadas = (cidade) => {
  const cidadeUpper = cidade?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return coordenadasCidades[cidadeUpper] || [-15.7942, -47.8822]; // Default: Brasília
};

export default function MapaOportunidades() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("map"); // map | list
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos | vagas | substituicoes

  const { data: vagas = [] } = useQuery({
    queryKey: ["vagas-mapa"],
    queryFn: () => base44.entities.Job.filter({ status: "ABERTO" })
  });

  const { data: substituicoes = [] } = useQuery({
    queryKey: ["substituicoes-mapa"],
    queryFn: () => base44.entities.SubstituicaoUrgente.filter({ status: "ABERTA" })
  });

  // Combinar e formatar oportunidades
  const oportunidades = [
    ...(filtroTipo === "substituicoes" ? [] : vagas.map(v => ({
      id: v.id,
      tipo: "vaga",
      titulo: v.titulo,
      cidade: v.cidade,
      uf: v.uf,
      valor: v.valor_proposto,
      tipoVaga: v.tipo_vaga,
      especialidade: v.especialidades_aceitas?.[0],
      coords: getCoordenadas(v.cidade)
    }))),
    ...(filtroTipo === "vagas" ? [] : substituicoes.map(s => ({
      id: s.id,
      tipo: "substituicao",
      titulo: s.titulo || `Substituição - ${s.especialidade_necessaria}`,
      cidade: s.cidade,
      uf: s.uf,
      valor: s.valor_diaria,
      tipoVaga: "SUBSTITUICAO",
      especialidade: s.especialidade_necessaria,
      coords: getCoordenadas(s.cidade),
      urgente: s.tipo_data === "IMEDIATO"
    })))
  ];

  // Centro do mapa (média das coordenadas ou Brasil)
  const centerLat = oportunidades.length > 0
    ? oportunidades.reduce((acc, o) => acc + o.coords[0], 0) / oportunidades.length
    : -15.7942;
  const centerLng = oportunidades.length > 0
    ? oportunidades.reduce((acc, o) => acc + o.coords[1], 0) / oportunidades.length
    : -47.8822;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg px-4 py-4 sticky top-0 z-[1000]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-orange-500" />
              Mapa de Oportunidades
            </h1>
            <div className="w-20" />
          </div>

          {/* Filtros e toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroTipo("todos")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtroTipo === "todos"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos ({oportunidades.length})
              </button>
              <button
                onClick={() => setFiltroTipo("vagas")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtroTipo === "vagas"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Vagas ({vagas.length})
              </button>
              <button
                onClick={() => setFiltroTipo("substituicoes")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtroTipo === "substituicoes"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Substituições ({substituicoes.length})
              </button>
            </div>

            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-full transition-all ${viewMode === "map" ? "bg-white shadow" : ""}`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all ${viewMode === "list" ? "bg-white shadow" : ""}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === "map" ? (
        <div className="h-[calc(100vh-140px)]">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {oportunidades.map((op) => (
              <Marker key={`${op.tipo}-${op.id}`} position={op.coords}>
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      {op.tipo === "substituicao" && op.urgente && (
                        <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        op.tipo === "substituicao" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {op.tipo === "substituicao" ? "Substituição" : "Vaga"}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{op.titulo}</h3>
                    <p className="text-sm text-gray-500 mb-2">{op.cidade} - {op.uf}</p>
                    {op.especialidade && (
                      <p className="text-xs text-purple-600 font-medium mb-2">{op.especialidade}</p>
                    )}
                    {op.valor && (
                      <p className="text-green-600 font-bold">
                        R$ {op.valor.toLocaleString("pt-BR")}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(createPageUrl(op.tipo === "substituicao" ? "DetalheSubstituicao" : "DetalheVaga") + `?id=${op.id}`)}
                      className="w-full mt-3 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {oportunidades.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Nenhuma oportunidade encontrada</h3>
            </div>
          ) : (
            oportunidades.map((op) => (
              <div
                key={`${op.tipo}-${op.id}`}
                onClick={() => navigate(createPageUrl(op.tipo === "substituicao" ? "DetalheSubstituicao" : "DetalheVaga") + `?id=${op.id}`)}
                className="bg-white rounded-2xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {op.tipo === "substituicao" && op.urgente && (
                        <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        op.tipo === "substituicao" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {op.tipo === "substituicao" ? "Substituição" : "Vaga"}
                      </span>
                      {op.especialidade && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {op.especialidade}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900">{op.titulo}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{op.cidade} - {op.uf}</span>
                    </div>
                  </div>
                  {op.valor && (
                    <div className="text-right">
                      <p className="text-green-600 font-bold">
                        R$ {op.valor.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
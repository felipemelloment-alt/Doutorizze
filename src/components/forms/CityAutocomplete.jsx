import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

export default function CityAutocomplete({ 
  value, 
  onChange, 
  cidades = [], 
  loading = false,
  disabled = false,
  placeholder = "Selecione a cidade",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar cidades pela busca
  const cidadesFiltradas = cidades.filter(cidade =>
    cidade.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  const handleSelect = (cidade) => {
    onChange(cidade);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-4 border-2 rounded-xl cursor-pointer transition-all outline-none ${
          disabled 
            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
            : isOpen
            ? "border-pink-400 ring-4 ring-pink-100"
            : "border-gray-200 hover:border-pink-300"
        } ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          {loading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Campo de busca */}
          <div className="p-3 border-b-2 border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cidade..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm"
              autoFocus
            />
          </div>

          {/* Lista de cidades */}
          <div className="max-h-60 overflow-y-auto">
            {cidadesFiltradas.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {search ? "Nenhuma cidade encontrada" : "Digite para buscar"}
              </div>
            ) : (
              cidadesFiltradas.map((cidade) => (
                <div
                  key={cidade}
                  onClick={() => handleSelect(cidade)}
                  className={`px-4 py-3 cursor-pointer transition-all ${
                    cidade === value
                      ? "bg-pink-50 text-pink-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  {cidade}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
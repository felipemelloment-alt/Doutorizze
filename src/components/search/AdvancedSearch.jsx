import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Clock, Star, MapPin, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/components/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { especialidadesOdontologia, especialidadesMedicina } from "@/components/constants/especialidades";

const RECENT_SEARCHES_KEY = 'doutorizze_recent_searches';

export default function AdvancedSearch({
  tipo = 'profissionais', // 'profissionais', 'vagas', 'clinicas'
  onSearch,
  onFilterChange,
  placeholder = "Buscar...",
  className = ""
}) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    especialidade: '',
    cidade: '',
    uf: '',
    avaliacao_min: 0,
    disponibilidade: '',
    tipo_vaga: ''
  });
  
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Carregar buscas recentes
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Executar busca quando query ou filtros mudarem
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters]);

  // Salvar busca recente
  const saveRecentSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    saveRecentSearch(query);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      especialidade: '',
      cidade: '',
      uf: '',
      avaliacao_min: 0,
      disponibilidade: '',
      tipo_vaga: ''
    };
    setFilters(emptyFilters);
    if (onFilterChange) onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 0);

  const especialidades = [...new Set([...especialidadesOdontologia, ...especialidadesMedicina])].sort();

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Input Principal */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-24 py-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          
          {/* Botões à direita */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Filter className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sugestões e Recentes */}
      <AnimatePresence>
        {showSuggestions && !showFilters && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Buscas recentes</p>
            </div>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(search);
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              >
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">{search}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel de Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Filtros Avançados</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-500 hover:text-red-600"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Especialidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Especialidade
                </label>
                <select
                  value={filters.especialidade}
                  onChange={(e) => handleFilterChange('especialidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todas</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              {/* UF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Estado
                </label>
                <select
                  value={filters.uf}
                  onChange={(e) => handleFilterChange('uf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={filters.cidade}
                  onChange={(e) => handleFilterChange('cidade', e.target.value)}
                  placeholder="Digite a cidade"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Avaliação Mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Avaliação mínima
                </label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('avaliacao_min', rating)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.avaliacao_min === rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {rating === 0 ? 'Todas' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Vaga (apenas para tipo 'vagas') */}
              {tipo === 'vagas' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Vaga
                  </label>
                  <select
                    value={filters.tipo_vaga}
                    onChange={(e) => handleFilterChange('tipo_vaga', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todas</option>
                    <option value="PLANTAO">Plantão</option>
                    <option value="SUBSTITUICAO">Substituição</option>
                    <option value="FIXO">Fixo</option>
                    <option value="TEMPORARIO">Temporário</option>
                  </select>
                </div>
              )}

              {/* Disponibilidade (apenas para tipo 'profissionais') */}
              {tipo === 'profissionais' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Disponibilidade
                  </label>
                  <select
                    value={filters.disponibilidade}
                    onChange={(e) => handleFilterChange('disponibilidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Qualquer</option>
                    <option value="IMEDIATO">Imediata</option>
                    <option value="15_DIAS">15 dias</option>
                    <option value="30_DIAS">30 dias</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para fechar sugestões */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
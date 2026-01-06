import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useUserArea } from "@/components/hooks/useUserArea";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Filter,
  MapPin,
  Calendar,
  Users,
  Clock,
  Laptop,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoLabels = {
  POS_GRADUACAO: "Pós-Graduação",
  ESPECIALIZACAO: "Especialização",
  EXTENSAO: "Extensão",
  ATUALIZACAO: "Atualização",
  WORKSHOP: "Workshop",
  CONGRESSO: "Congresso"
};

const tiposCurso = [
  { value: "TODOS", label: "Todos os Tipos" },
  { value: "POS_GRADUACAO", label: "Pós-Graduação" },
  { value: "ESPECIALIZACAO", label: "Especialização" },
  { value: "EXTENSAO", label: "Extensão" },
  { value: "ATUALIZACAO", label: "Atualização" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CONGRESSO", label: "Congresso" }
];

const modalidadeOpcoes = [
  { value: "TODOS", label: "Todas" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "EAD", label: "EAD" },
  { value: "HIBRIDO", label: "Híbrido" }
];

const ordenacaoOpcoes = [
  { value: "RELEVANTE", label: "Mais Relevantes" },
  { value: "MENOR_PRECO", label: "Menor Preço" },
  { value: "MAIOR_DESCONTO", label: "Maior Desconto" },
  { value: "INICIO_PROXIMO", label: "Início Próximo" }
];

export default function Cursos() {
  const navigate = useNavigate();
  const { userArea } = useUserArea();
  const [user, setUser] = useState(null);

  const [filtros, setFiltros] = useState({
    tipo: "TODOS",
    modalidade: "TODOS",
    cidade: "",
    uf: "",
    precoMin: "",
    precoMax: ""
  });

  const [ordenacao, setOrdenacao] = useState("RELEVANTE");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["courses-public"],
    queryFn: async () => {
      return await base44.entities.Course.filter({ status: "ATIVO" });
    }
  });

  const { data: instituicoes = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      return await base44.entities.EducationInstitution.filter({ status_cadastro: "APROVADO" });
    }
  });

  // Criar mapa de instituições
  const instituicoesMap = instituicoes.reduce((acc, inst) => {
    acc[inst.id] = inst;
    return acc;
  }, {});

  // Aplicar filtros
  const cursosFiltrados = cursos.filter((curso) => {
    // IMPORTANTE: Filtro por área do usuário
    if (userArea && curso.area !== userArea) return false;

    const tipoMatch = filtros.tipo === "TODOS" || curso.tipo === filtros.tipo;
    const modalidadeMatch = filtros.modalidade === "TODOS" || curso.modalidade === filtros.modalidade;
    
    const cidadeMatch = !filtros.cidade || curso.cidade?.toLowerCase().includes(filtros.cidade.toLowerCase());
    const ufMatch = !filtros.uf || curso.uf?.toUpperCase() === filtros.uf.toUpperCase();

    const valorFinal = curso.tem_desconto && curso.valor_com_desconto 
      ? parseFloat(curso.valor_com_desconto) 
      : parseFloat(curso.valor_total);

    const precoMinMatch = !filtros.precoMin || valorFinal >= parseFloat(filtros.precoMin);
    const precoMaxMatch = !filtros.precoMax || valorFinal <= parseFloat(filtros.precoMax);

    return tipoMatch && modalidadeMatch && cidadeMatch && ufMatch && precoMinMatch && precoMaxMatch;
  });

  // Ordenar cursos
  const cursosOrdenados = [...cursosFiltrados].sort((a, b) => {
    if (ordenacao === "MENOR_PRECO") {
      const precoA = a.tem_desconto && a.valor_com_desconto ? parseFloat(a.valor_com_desconto) : parseFloat(a.valor_total);
      const precoB = b.tem_desconto && b.valor_com_desconto ? parseFloat(b.valor_com_desconto) : parseFloat(b.valor_total);
      return precoA - precoB;
    }

    if (ordenacao === "MAIOR_DESCONTO") {
      const descontoA = a.tem_desconto ? parseFloat(a.percentual_desconto || 0) : 0;
      const descontoB = b.tem_desconto ? parseFloat(b.percentual_desconto || 0) : 0;
      return descontoB - descontoA;
    }

    if (ordenacao === "INICIO_PROXIMO") {
      return new Date(a.data_inicio) - new Date(b.data_inicio);
    }

    // RELEVANTE: por destaque, depois visualizações
    if (a.destaque && !b.destaque) return -1;
    if (!a.destaque && b.destaque) return 1;
    return (b.visualizacoes || 0) - (a.visualizacoes || 0);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Cursos Disponíveis</h1>
              <p className="text-gray-600">
                {userArea === "ODONTOLOGIA" && "🦷 Cursos de Odontologia"}
                {userArea === "MEDICINA" && "⚕️ Cursos de Medicina"}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-black text-gray-900">Filtros</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                {tiposCurso.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Modalidade</label>
              <select
                value={filtros.modalidade}
                onChange={(e) => setFiltros({ ...filtros, modalidade: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                {modalidadeOpcoes.map((mod) => (
                  <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ordenar por</label>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                {ordenacaoOpcoes.map((ord) => (
                  <option key={ord.value} value={ord.value}>{ord.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                value={filtros.cidade}
                onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                placeholder="Ex: São Paulo"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">UF</label>
              <input
                type="text"
                value={filtros.uf}
                onChange={(e) => setFiltros({ ...filtros, uf: e.target.value })}
                placeholder="SP"
                maxLength={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preço Mín (R$)</label>
              <input
                type="number"
                value={filtros.precoMin}
                onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preço Máx (R$)</label>
              <input
                type="number"
                value={filtros.precoMax}
                onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
                placeholder="10000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600 font-semibold">
            {cursosOrdenados.length} {cursosOrdenados.length === 1 ? "curso encontrado" : "cursos encontrados"}
          </p>
        </div>

        {/* Grid de Cursos */}
        {cursosOrdenados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros para ver mais resultados.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosOrdenados.map((curso, index) => (
              <CursoCard
                key={curso.id}
                curso={curso}
                instituicao={instituicoesMap[curso.institution_id]}
                index={index}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CursoCard({ curso, instituicao, index, navigate }) {
  const valorFinal = curso.tem_desconto && curso.valor_com_desconto
    ? parseFloat(curso.valor_com_desconto)
    : parseFloat(curso.valor_total);

  const isOnline = curso.modalidade === "EAD";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(createPageUrl("DetalheCurso") + "?id=" + curso.id)}
      className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
    >
      {/* Imagem */}
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 relative">
        {curso.imagem_principal_url ? (
          <img
            src={curso.imagem_principal_url}
            alt={curso.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📚
          </div>
        )}

        {/* Badge Tipo */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg">
            {tipoLabels[curso.tipo]}
          </span>
        </div>

        {/* Badge Desconto */}
        {curso.tem_desconto && curso.percentual_desconto && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
              {parseFloat(curso.percentual_desconto).toFixed(0)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Instituição */}
        <p className="text-sm text-orange-600 font-bold mb-2">
          {instituicao?.nome_fantasia || "Instituição"}
        </p>

        {/* Título */}
        <h3 className="text-lg font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {curso.titulo}
        </h3>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">{curso.modalidade}</span>
            <span>•</span>
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{curso.carga_horaria}h</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>
              {isOnline ? "100% Online" : `${curso.cidade} - ${curso.uf}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Início: {curso.data_inicio ? format(new Date(curso.data_inicio), "dd/MM/yyyy", { locale: ptBR }) : "A definir"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{curso.vagas_restantes} vagas restantes</span>
          </div>
        </div>

        {/* Preço */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl mb-4">
          {curso.tem_desconto && curso.percentual_desconto ? (
            <div>
              <p className="text-sm text-gray-500 line-through mb-1">
                De R$ {parseFloat(curso.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-2xl font-black text-orange-600">
                R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ) : (
            <p className="text-2xl font-black text-orange-600">
              R$ {valorFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
          {curso.numero_parcelas && curso.valor_parcela && (
            <p className="text-xs text-gray-600 mt-1">
              ou {curso.numero_parcelas}x de R$ {parseFloat(curso.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Botão */}
        <button className="w-full py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105">
          Ver Detalhes
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
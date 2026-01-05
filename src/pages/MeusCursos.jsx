import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  GraduationCap,
  ChevronLeft,
  Plus,
  Edit,
  Pause,
  Play,
  StopCircle,
  Eye,
  Users,
  Calendar,
  MapPin,
  Filter,
  BookOpen
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

const statusColors = {
  RASCUNHO: "bg-gray-100 text-gray-700",
  ATIVO: "bg-green-100 text-green-700",
  INSCRICOES_ENCERRADAS: "bg-yellow-100 text-yellow-700",
  REALIZADO: "bg-blue-100 text-blue-700",
  CANCELADO: "bg-red-100 text-red-700"
};

export default function MeusCursos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [instituicao, setInstituicao] = useState(null);

  const [abaAtiva, setAbaAtiva] = useState("ATIVOS");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroArea, setFiltroArea] = useState("TODOS");
  const [filtroModalidade, setFiltroModalidade] = useState("TODOS");

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const instResults = await base44.entities.EducationInstitution.filter({ user_id: currentUser.id });
        setInstituicao(instResults[0] || null);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["courses", instituicao?.id],
    queryFn: async () => {
      if (!instituicao?.id) return [];
      return await base44.entities.Course.filter({ institution_id: instituicao.id });
    },
    enabled: !!instituicao?.id
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Course.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("✅ Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  // Filtrar cursos por aba
  const cursosPorAba = cursos.filter((curso) => {
    if (abaAtiva === "ATIVOS") return curso.status === "ATIVO";
    if (abaAtiva === "RASCUNHOS") return curso.status === "RASCUNHO";
    if (abaAtiva === "ENCERRADOS") return ["INSCRICOES_ENCERRADAS", "REALIZADO", "CANCELADO"].includes(curso.status);
    return true;
  });

  // Aplicar filtros adicionais
  const cursosFiltrados = cursosPorAba.filter((curso) => {
    const tipoMatch = filtroTipo === "TODOS" || curso.tipo === filtroTipo;
    const areaMatch = filtroArea === "TODOS" || curso.area === filtroArea;
    const modalidadeMatch = filtroModalidade === "TODOS" || curso.modalidade === filtroModalidade;
    return tipoMatch && areaMatch && modalidadeMatch;
  });

  const handlePausar = (curso) => {
    atualizarStatusMutation.mutate({ id: curso.id, status: "INSCRICOES_ENCERRADAS" });
  };

  const handleReativar = (curso) => {
    atualizarStatusMutation.mutate({ id: curso.id, status: "ATIVO" });
  };

  const handleEncerrar = (curso) => {
    if (confirm("Tem certeza que deseja encerrar este curso?")) {
      atualizarStatusMutation.mutate({ id: curso.id, status: "REALIZADO" });
    }
  };

  const contadores = {
    ativos: cursos.filter(c => c.status === "ATIVO").length,
    rascunhos: cursos.filter(c => c.status === "RASCUNHO").length,
    encerrados: cursos.filter(c => ["INSCRICOES_ENCERRADAS", "REALIZADO", "CANCELADO"].includes(c.status)).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Meus Cursos</h1>
                <p className="text-gray-600">{cursos.length} cursos cadastrados</p>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("CriarCurso"))}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Publicar Novo Curso
            </button>
          </div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-2 mb-6"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setAbaAtiva("ATIVOS")}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${
                abaAtiva === "ATIVOS"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Ativos
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                abaAtiva === "ATIVOS" ? "bg-white/20" : "bg-gray-200"
              }`}>
                {contadores.ativos}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva("RASCUNHOS")}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${
                abaAtiva === "RASCUNHOS"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Rascunhos
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                abaAtiva === "RASCUNHOS" ? "bg-white/20" : "bg-gray-200"
              }`}>
                {contadores.rascunhos}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva("ENCERRADOS")}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${
                abaAtiva === "ENCERRADOS"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Encerrados
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                abaAtiva === "ENCERRADOS" ? "bg-white/20" : "bg-gray-200"
              }`}>
                {contadores.encerrados}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-black text-gray-900">Filtros</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                <option value="TODOS">Todos os Tipos</option>
                {Object.entries(tipoLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Área</label>
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                <option value="TODOS">Todas as Áreas</option>
                <option value="ODONTOLOGIA">Odontologia</option>
                <option value="MEDICINA">Medicina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Modalidade</label>
              <select
                value={filtroModalidade}
                onChange={(e) => setFiltroModalidade(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                <option value="TODOS">Todas as Modalidades</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="EAD">EAD</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lista de Cursos */}
        {cursosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-600 mb-6">
              {abaAtiva === "ATIVOS" && "Você não tem cursos ativos no momento."}
              {abaAtiva === "RASCUNHOS" && "Você não tem rascunhos salvos."}
              {abaAtiva === "ENCERRADOS" && "Você não tem cursos encerrados."}
            </p>
            <button
              onClick={() => navigate(createPageUrl("CriarCurso"))}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            >
              Publicar Primeiro Curso
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cursosFiltrados.map((curso, index) => (
              <CursoCard
                key={curso.id}
                curso={curso}
                index={index}
                navigate={navigate}
                onPausar={handlePausar}
                onReativar={handleReativar}
                onEncerrar={handleEncerrar}
                isPending={atualizarStatusMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CursoCard({ curso, index, navigate, onPausar, onReativar, onEncerrar, isPending }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
    >
      {/* Imagem */}
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
        {curso.imagem_principal_url ? (
          <img
            src={curso.imagem_principal_url}
            alt={curso.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📚
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Título */}
        <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2">
          {curso.titulo}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            {tipoLabels[curso.tipo]}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
            {curso.area}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            {curso.modalidade}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[curso.status]}`}>
            {curso.status}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Início: {curso.data_inicio ? format(new Date(curso.data_inicio), "dd/MM/yyyy", { locale: ptBR }) : "Não definido"}
            </span>
          </div>
          {(curso.cidade || curso.uf) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{curso.cidade} - {curso.uf}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>Vagas: {curso.vagas_restantes}/{curso.vagas_totais} restantes</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-700">{curso.visualizacoes || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-700">{curso.cliques_inscricao || 0} inscrições</span>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(createPageUrl("EditarCurso") + "/" + curso.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-yellow-400 hover:text-yellow-600 transition-all"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>

          {curso.status === "ATIVO" && (
            <button
              onClick={() => onPausar(curso)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-yellow-300 text-yellow-700 font-semibold rounded-xl hover:bg-yellow-50 transition-all disabled:opacity-50"
            >
              <Pause className="w-4 h-4" />
              Pausar
            </button>
          )}

          {curso.status === "INSCRICOES_ENCERRADAS" && (
            <button
              onClick={() => onReativar(curso)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Reativar
            </button>
          )}

          {(curso.status === "ATIVO" || curso.status === "INSCRICOES_ENCERRADAS") && (
            <button
              onClick={() => onEncerrar(curso)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4" />
              Encerrar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
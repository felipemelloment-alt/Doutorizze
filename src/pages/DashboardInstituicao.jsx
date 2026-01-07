import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  BookOpen,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function DashboardInstituicao() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  // Buscar instituição
  const { data: instituicao, isLoading: loadingInst } = useQuery({
    queryKey: ["educationInstitution", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const results = await base44.entities.EducationInstitution.filter({ user_id: user.id });
      return results[0] || null;
    },
    enabled: !!user?.id
  });

  // Buscar cursos da instituição
  const { data: cursos = [], isLoading: loadingCursos } = useQuery({
    queryKey: ["courses", instituicao?.id],
    queryFn: async () => {
      if (!instituicao?.id) return [];
      return await base44.entities.Course.filter({ institution_id: instituicao.id });
    },
    enabled: !!instituicao?.id
  });

  if (loadingInst || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!instituicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cadastro não encontrado</h2>
          <p className="text-gray-600 mb-6">Complete seu cadastro para acessar o dashboard.</p>
          <button
            onClick={() => navigate(createPageUrl("CadastroInstituicao"))}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Completar Cadastro
          </button>
        </div>
      </div>
    );
  }

  // Calcular métricas
  const cursosAtivos = cursos.filter(c => c.status === "ATIVO").length;
  const inscricoesEsteMes = cursos.reduce((sum, c) => sum + (c.cliques_inscricao || 0), 0);
  const visualizacoesTotal = instituicao.total_visualizacoes || 0;
  const vagasDisponiveis = cursos
    .filter(c => c.status === "ATIVO")
    .reduce((sum, c) => sum + (c.vagas_restantes || 0), 0);

  // Cursos recentes (últimos 3)
  const cursosRecentes = [...cursos]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 3);

  // Cursos mais visualizados
  const cursosMaisVistos = [...cursos]
    .sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
    .slice(0, 3);

  // Taxa de conversão média
  const totalVisualizacoes = cursos.reduce((sum, c) => sum + (c.visualizacoes || 0), 0);
  const totalCliques = cursos.reduce((sum, c) => sum + (c.cliques_inscricao || 0), 0);
  const taxaConversao = totalVisualizacoes > 0 
    ? ((totalCliques / totalVisualizacoes) * 100).toFixed(1)
    : 0;

  const tipoLabels = {
    UNIVERSIDADE: "Universidade",
    FACULDADE: "Faculdade",
    CENTRO_CURSOS: "Centro de Cursos",
    EAD: "Plataforma EAD",
    OUTRO: "Outro"
  };

  const statusColors = {
    PENDENTE: "bg-yellow-100 text-yellow-700 border-yellow-300",
    APROVADO: "bg-green-100 text-green-700 border-green-300",
    REJEITADO: "bg-red-100 text-red-700 border-red-300"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-wrap items-start gap-4">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
              {instituicao.logo_url ? (
                <img src={instituicao.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                instituicao.nome_fantasia?.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                {instituicao.nome_fantasia}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {tipoLabels[instituicao.tipo_instituicao]}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[instituicao.status_cadastro]}`}>
                  {instituicao.status_cadastro}
                </span>
                {!instituicao.ativo && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                    Inativo
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">{instituicao.cidade} - {instituicao.uf}</p>
            </div>

            {/* Botão Editar */}
            <button
              onClick={() => navigate(createPageUrl("EditarInstituicao"))}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-yellow-400 hover:text-yellow-600 transition-all whitespace-nowrap"
            >
              Editar Perfil
            </button>
          </div>
        </motion.div>

        {/* Status Pendente - Aviso */}
        {instituicao.status_cadastro === "PENDENTE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Cadastro em Análise</h3>
                <p className="text-gray-600">
                  Seu cadastro está sendo analisado pela nossa equipe. Você será notificado em até 48 horas.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={BookOpen}
            label="Cursos Ativos"
            value={cursosAtivos}
            color="from-blue-400 to-blue-600"
            delay={0}
          />
          <MetricCard
            icon={Users}
            label="Inscrições (Mês)"
            value={inscricoesEsteMes}
            color="from-green-400 to-green-600"
            delay={0.1}
          />
          <MetricCard
            icon={Eye}
            label="Visualizações"
            value={visualizacoesTotal}
            color="from-purple-400 to-purple-600"
            delay={0.2}
          />
          <MetricCard
            icon={Calendar}
            label="Vagas Disponíveis"
            value={vagasDisponiveis}
            color="from-orange-400 to-orange-600"
            delay={0.3}
          />
        </div>

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-orange-500" />
            Ações Rápidas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(createPageUrl("CriarCurso"))}
              className="flex items-center justify-between p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Publicar Novo Curso</p>
                  <p className="text-sm text-white/80">Crie e publique um curso</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate(createPageUrl("MeusCursos"))}
              className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-2xl hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Ver Meus Cursos</p>
                  <p className="text-sm text-white/80">Gerencie seus cursos</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate(createPageUrl("ValidarClienteDoutorizze"))}
              className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Validar Cliente</p>
                  <p className="text-sm text-white/80">Gerar token de desconto</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate(createPageUrl("ClientesDoutorizze"))}
              className="flex items-center justify-between p-6 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Meus Clientes</p>
                  <p className="text-sm text-white/80">Tokens e conversões</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* CURSOS RECENTES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" />
              Cursos Recentes
            </h2>

            {cursosRecentes.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum curso cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cursosRecentes.map((curso) => (
                  <CursoCard key={curso.id} curso={curso} navigate={navigate} />
                ))}
              </div>
            )}
          </motion.div>

          {/* ESTATÍSTICAS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              Estatísticas
            </h2>

            {/* Taxa de Conversão */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
              <p className="text-3xl font-black text-gray-900">{taxaConversao}%</p>
              <p className="text-xs text-gray-500 mt-1">Visualizações → Inscrições</p>
            </div>

            {/* Cursos Mais Visualizados */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Cursos Mais Visualizados</p>
              {cursosMaisVistos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados ainda</p>
              ) : (
                <div className="space-y-2">
                  {cursosMaisVistos.map((curso, index) => (
                    <div key={curso.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{curso.titulo}</p>
                        <p className="text-xs text-gray-500">{curso.visualizacoes || 0} visualizações</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </motion.div>
  );
}

function CursoCard({ curso, navigate }) {
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

  return (
    <div
      onClick={() => navigate(createPageUrl("DetalheCurso") + "/" + curso.id)}
      className="flex gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-yellow-400 hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Imagem */}
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden flex-shrink-0">
        {curso.imagem_principal_url ? (
          <img src={curso.imagem_principal_url} alt={curso.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            📚
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 truncate mb-1">{curso.titulo}</h3>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
            {tipoLabels[curso.tipo]}
          </span>
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[curso.status]}`}>
            {curso.status}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {curso.vagas_restantes || 0} vagas restantes
        </p>
      </div>
    </div>
  );
}
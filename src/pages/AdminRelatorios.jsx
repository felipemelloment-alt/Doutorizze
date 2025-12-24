import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Users,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Shield,
  Building2,
  Package,
  Hospital,
  FileText,
  Bell,
  Eye,
  Target
} from "lucide-react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

function AdminRelatoriosContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("MES"); // HOJE | SEMANA | MES | ANO | PERSONALIZADO

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta área. Esta página é exclusiva para administradores.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Buscar dados
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: () => base44.entities.Professional.list(),
  });

  const { data: owners = [] } = useQuery({
    queryKey: ["companyOwners"],
    queryFn: () => base44.entities.CompanyOwner.list(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => base44.entities.Supplier.list(),
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => base44.entities.Hospital.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => base44.entities.Job.list(),
  });

  const { data: jobMatches = [] } = useQuery({
    queryKey: ["jobMatches"],
    queryFn: () => base44.entities.JobMatch.list(),
  });

  const { data: marketplaceItems = [] } = useQuery({
    queryKey: ["marketplaceItems"],
    queryFn: () => base44.entities.MarketplaceItem.list(),
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => base44.entities.Promotion.list(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list(),
  });

  // Calcular data de referência baseado no período
  const getDataReferencia = () => {
    const hoje = new Date();
    switch (periodo) {
      case "HOJE":
        return subDays(hoje, 1);
      case "SEMANA":
        return subWeeks(hoje, 1);
      case "MES":
        return subMonths(hoje, 1);
      case "ANO":
        return subMonths(hoje, 12);
      default:
        return subMonths(hoje, 1);
    }
  };

  const dataReferencia = getDataReferencia();

  // MÉTRICAS - USUÁRIOS
  const totalProfissionais = professionals.length;
  const totalClinicas = owners.length;
  const totalFornecedores = suppliers.length;
  const totalHospitais = hospitals.length;
  const cadastrosPendentes = [
    ...professionals.filter(p => p.status_cadastro === "EM_ANALISE"),
    ...owners.filter(o => o.status_cadastro === "EM_ANALISE"),
    ...suppliers.filter(s => s.status_cadastro === "PENDENTE"),
    ...hospitals.filter(h => h.status_cadastro === "PENDENTE")
  ].length;

  const novosEstaSemana = [
    ...professionals.filter(p => new Date(p.created_date) >= subWeeks(new Date(), 1)),
    ...owners.filter(o => new Date(o.created_date) >= subWeeks(new Date(), 1)),
    ...suppliers.filter(s => new Date(s.created_date) >= subWeeks(new Date(), 1)),
    ...hospitals.filter(h => new Date(h.created_date) >= subWeeks(new Date(), 1))
  ].length;

  // MÉTRICAS - VAGAS
  const vagasAbertas = jobs.filter(j => j.status === "ABERTO").length;
  const vagasPreenchidas = jobs.filter(
    j => j.status === "PREENCHIDO" && new Date(j.updated_date) >= dataReferencia
  ).length;
  const totalCandidaturas = jobMatches.length;
  const mediaCandidatosPorVaga = jobs.length > 0 ? (totalCandidaturas / jobs.length).toFixed(1) : 0;

  // MÉTRICAS - MARKETPLACE
  const produtosAtivos = marketplaceItems.filter(i => i.status === "ATIVO").length;
  const promocoesAtivas = promotions.filter(p => p.status === "ATIVO").length;

  // MÉTRICAS - ENGAJAMENTO
  const usuariosAtivos7Dias = [
    ...professionals.filter(p => new Date(p.updated_date) >= subDays(new Date(), 7)),
    ...owners.filter(o => new Date(o.updated_date) >= subDays(new Date(), 7))
  ].length;
  const notificacoesEnviadas = notifications.filter(
    n => new Date(n.created_date) >= dataReferencia
  ).length;
  const taxaAbertura = notifications.length > 0
    ? ((notifications.filter(n => n.lida).length / notifications.length) * 100).toFixed(1)
    : 0;

  // GRÁFICO 1: Cadastros por Semana (últimas 8 semanas)
  const cadastrosPorSemana = React.useMemo(() => {
    const semanas = [];
    for (let i = 7; i >= 0; i--) {
      const inicioSemana = startOfWeek(subWeeks(new Date(), i), { locale: ptBR });
      const fimSemana = endOfWeek(subWeeks(new Date(), i), { locale: ptBR });

      const profissionaisNaSemana = professionals.filter(p => {
        const data = new Date(p.created_date);
        return data >= inicioSemana && data <= fimSemana;
      }).length;

      const clinicasNaSemana = owners.filter(o => {
        const data = new Date(o.created_date);
        return data >= inicioSemana && data <= fimSemana;
      }).length;

      semanas.push({
        semana: format(inicioSemana, "dd/MM", { locale: ptBR }),
        Profissionais: profissionaisNaSemana,
        Clínicas: clinicasNaSemana
      });
    }
    return semanas;
  }, [professionals, owners]);

  // GRÁFICO 2: Vagas por Mês (últimos 6 meses)
  const vagasPorMes = React.useMemo(() => {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const mesReferencia = subMonths(new Date(), i);
      const mesInicio = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);
      const mesFim = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 0);

      const criadas = jobs.filter(j => {
        const data = new Date(j.created_date);
        return data >= mesInicio && data <= mesFim;
      }).length;

      const preenchidas = jobs.filter(j => {
        const data = new Date(j.updated_date);
        return j.status === "PREENCHIDO" && data >= mesInicio && data <= mesFim;
      }).length;

      meses.push({
        mes: format(mesReferencia, "MMM", { locale: ptBR }),
        Criadas: criadas,
        Preenchidas: preenchidas
      });
    }
    return meses;
  }, [jobs]);

  // GRÁFICO 3: Top 5 Cidades
  const topCidades = React.useMemo(() => {
    const cidadesCount = {};

    professionals.forEach(p => {
      if (p.cidades_atendimento && p.cidades_atendimento.length > 0) {
        p.cidades_atendimento.forEach(cidade => {
          cidadesCount[cidade] = (cidadesCount[cidade] || 0) + 1;
        });
      }
    });

    owners.forEach(o => {
      if (o.cidade) {
        const cidadeCompleta = `${o.cidade} - ${o.uf}`;
        cidadesCount[cidadeCompleta] = (cidadesCount[cidadeCompleta] || 0) + 1;
      }
    });

    return Object.entries(cidadesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cidade, count]) => ({ cidade, usuarios: count }));
  }, [professionals, owners]);

  // GRÁFICO 4: Top Especialidades
  const topEspecialidades = React.useMemo(() => {
    const especialidadesCount = {};

    professionals.forEach(p => {
      if (p.especialidade_principal) {
        especialidadesCount[p.especialidade_principal] = (especialidadesCount[p.especialidade_principal] || 0) + 1;
      }
    });

    return Object.entries(especialidadesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([especialidade, count]) => ({ especialidade, count }));
  }, [professionals]);

  const COLORS = ["#F9B500", "#E94560", "#4A90E2", "#9B59B6", "#2ECC71"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600">Métricas e relatórios da plataforma</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-700">Período:</span>
            </div>
            {["HOJE", "SEMANA", "MES", "ANO"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 font-bold rounded-xl transition-all ${
                  periodo === p
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p === "MES" ? "Mês" : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
            <button className="ml-auto px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-yellow-400 transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>
        </motion.div>

        {/* MÉTRICAS - USUÁRIOS */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-500" />
            Usuários
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              label="Profissionais"
              value={totalProfissionais}
              icon={Users}
              color="from-blue-400 to-blue-600"
            />
            <MetricCard
              label="Clínicas"
              value={totalClinicas}
              icon={Building2}
              color="from-green-400 to-green-600"
            />
            <MetricCard
              label="Fornecedores"
              value={totalFornecedores}
              icon={Package}
              color="from-purple-400 to-purple-600"
            />
            <MetricCard
              label="Hospitais"
              value={totalHospitais}
              icon={Hospital}
              color="from-pink-400 to-pink-600"
            />
            <MetricCard
              label="Pendentes"
              value={cadastrosPendentes}
              icon={FileText}
              color="from-yellow-400 to-orange-500"
            />
            <MetricCard
              label="Novos (7d)"
              value={novosEstaSemana}
              icon={TrendingUp}
              color="from-green-400 to-teal-500"
            />
          </div>
        </div>

        {/* MÉTRICAS - VAGAS */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-yellow-500" />
            Vagas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Abertas"
              value={vagasAbertas}
              icon={Briefcase}
              color="from-yellow-400 to-orange-500"
            />
            <MetricCard
              label="Preenchidas"
              value={vagasPreenchidas}
              icon={Target}
              color="from-green-400 to-green-600"
            />
            <MetricCard
              label="Candidaturas"
              value={totalCandidaturas}
              icon={FileText}
              color="from-blue-400 to-blue-600"
            />
            <MetricCard
              label="Média/Vaga"
              value={mediaCandidatosPorVaga}
              icon={TrendingUp}
              color="from-purple-400 to-purple-600"
            />
          </div>
        </div>

        {/* MÉTRICAS - MARKETPLACE */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yellow-500" />
            Marketplace
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <MetricCard
              label="Produtos Ativos"
              value={produtosAtivos}
              icon={ShoppingBag}
              color="from-purple-400 to-purple-600"
            />
            <MetricCard
              label="Promoções Ativas"
              value={promocoesAtivas}
              icon={Package}
              color="from-pink-400 to-red-500"
            />
          </div>
        </div>

        {/* MÉTRICAS - ENGAJAMENTO */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-500" />
            Engajamento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              label="Ativos (7d)"
              value={usuariosAtivos7Dias}
              icon={Eye}
              color="from-green-400 to-teal-500"
            />
            <MetricCard
              label="Notificações"
              value={notificacoesEnviadas}
              icon={Bell}
              color="from-yellow-400 to-orange-500"
            />
            <MetricCard
              label="Taxa Abertura"
              value={`${taxaAbertura}%`}
              icon={Target}
              color="from-blue-400 to-blue-600"
            />
          </div>
        </div>

        {/* GRÁFICOS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cadastros por Semana */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h3 className="text-lg font-black text-gray-900 mb-4">Cadastros por Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cadastrosPorSemana}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Profissionais" fill="#4A90E2" />
                <Bar dataKey="Clínicas" fill="#2ECC71" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Vagas por Mês */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h3 className="text-lg font-black text-gray-900 mb-4">Vagas por Mês</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vagasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Criadas" stroke="#F9B500" strokeWidth={2} />
                <Line type="monotone" dataKey="Preenchidas" stroke="#2ECC71" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Cidades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h3 className="text-lg font-black text-gray-900 mb-4">Top 5 Cidades</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCidades} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="cidade" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="usuarios" fill="#F9B500" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Especialidades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <h3 className="text-lg font-black text-gray-900 mb-4">Top Especialidades</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topEspecialidades}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ especialidade, percent }) => `${especialidade.slice(0, 15)} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {topEspecialidades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Componente MetricCard
function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-4xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
}

// Export com ProtectedRoute wrapper
export default function AdminRelatorios() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminRelatoriosContent />
    </ProtectedRoute>
  );
}
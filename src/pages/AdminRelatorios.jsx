/**
 * ADMIN RELATÓRIOS - Página de relatórios e métricas
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  Calendar,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function AdminRelatoriosContent() {
  const [periodo, setPeriodo] = useState("7dias");

  // Calcular datas baseado no período
  const getDateRange = () => {
    const hoje = new Date();
    switch (periodo) {
      case "hoje":
        return { inicio: startOfDay(hoje), fim: endOfDay(hoje) };
      case "7dias":
        return { inicio: startOfDay(subDays(hoje, 7)), fim: endOfDay(hoje) };
      case "30dias":
        return { inicio: startOfDay(subDays(hoje, 30)), fim: endOfDay(hoje) };
      case "mes":
        return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
      default:
        return { inicio: startOfDay(subDays(hoje, 7)), fim: endOfDay(hoje) };
    }
  };

  const { inicio, fim } = getDateRange();

  // Buscar profissionais
  const { data: profissionais = [], isLoading: loadingProfs } = useQuery({
    queryKey: ["relatorio-profissionais"],
    queryFn: async () => {
      return await base44.entities.Professional.list();
    }
  });

  // Buscar clínicas
  const { data: clinicas = [], isLoading: loadingClinicas } = useQuery({
    queryKey: ["relatorio-clinicas"],
    queryFn: async () => {
      return await base44.entities.CompanyUnit.list();
    }
  });

  // Buscar vagas
  const { data: vagas = [], isLoading: loadingVagas } = useQuery({
    queryKey: ["relatorio-vagas"],
    queryFn: async () => {
      return await base44.entities.Job.list();
    }
  });

  // Buscar marketplace
  const { data: marketplace = [], isLoading: loadingMarket } = useQuery({
    queryKey: ["relatorio-marketplace"],
    queryFn: async () => {
      return await base44.entities.MarketplaceItem.list();
    }
  });

  // Buscar denúncias
  const { data: denuncias = [], isLoading: loadingDenuncias } = useQuery({
    queryKey: ["relatorio-denuncias"],
    queryFn: async () => {
      return await base44.entities.Report.list();
    }
  });

  const isLoading = loadingProfs || loadingClinicas || loadingVagas || loadingMarket || loadingDenuncias;

  // Calcular métricas
  const filtrarPorData = (items) => {
    return items.filter(item => {
      const data = new Date(item.created_date);
      return data >= inicio && data <= fim;
    });
  };

  const profissionaisNoPeriodo = filtrarPorData(profissionais);
  const clinicasNoPeriodo = filtrarPorData(clinicas);
  const vagasNoPeriodo = filtrarPorData(vagas);
  const marketplaceNoPeriodo = filtrarPorData(marketplace);
  const denunciasNoPeriodo = filtrarPorData(denuncias);

  // Estatísticas de status
  const profsPendentes = profissionais.filter(p => p.status_cadastro === "EM_ANALISE").length;
  const profsAprovados = profissionais.filter(p => p.status_cadastro === "APROVADO").length;
  const profsReprovados = profissionais.filter(p => p.status_cadastro === "REPROVADO").length;

  const clinicasPendentes = clinicas.filter(c => c.status_cadastro === "EM_ANALISE").length;
  const clinicasAprovadas = clinicas.filter(c => c.status_cadastro === "APROVADO").length;
  const clinicasReprovadas = clinicas.filter(c => c.status_cadastro === "REPROVADO").length;

  const vagasAbertas = vagas.filter(v => v.status === "ABERTO").length;
  const vagasPreenchidas = vagas.filter(v => v.status === "PREENCHIDO").length;
  const vagasCanceladas = vagas.filter(v => v.status === "CANCELADO").length;

  const denunciasPendentes = denuncias.filter(d => d.status === "PENDENTE").length;
  const denunciasResolvidas = denuncias.filter(d => d.status === "RESOLVIDO").length;

  // Dados para gráficos de crescimento (últimos 7 dias)
  const graficoDados = Array.from({ length: 7 }, (_, i) => {
    const dia = subDays(new Date(), 6 - i);
    const inicioDia = startOfDay(dia);
    const fimDia = endOfDay(dia);
    
    return {
      data: format(dia, "dd/MM", { locale: ptBR }),
      profissionais: profissionais.filter(p => {
        const data = new Date(p.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length,
      clinicas: clinicas.filter(c => {
        const data = new Date(c.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length,
      vagas: vagas.filter(v => {
        const data = new Date(v.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length,
      marketplace: marketplace.filter(m => {
        const data = new Date(m.created_date);
        return data >= inicioDia && data <= fimDia;
      }).length
    };
  });

  // Função de exportação CSV
  const exportarCSV = () => {
    const csvContent = [
      // Header
      ["Tipo", "Total", "No Período", "Status", "Quantidade"].join(","),
      
      // Profissionais
      ["Profissionais", profissionais.length, profissionaisNoPeriodo.length, "Aprovados", profsAprovados].join(","),
      ["", "", "", "Pendentes", profsPendentes].join(","),
      ["", "", "", "Reprovados", profsReprovados].join(","),
      
      // Clínicas
      ["Clínicas", clinicas.length, clinicasNoPeriodo.length, "Aprovadas", clinicasAprovadas].join(","),
      ["", "", "", "Pendentes", clinicasPendentes].join(","),
      ["", "", "", "Reprovadas", clinicasReprovadas].join(","),
      
      // Vagas
      ["Vagas", vagas.length, vagasNoPeriodo.length, "Abertas", vagasAbertas].join(","),
      ["", "", "", "Preenchidas", vagasPreenchidas].join(","),
      ["", "", "", "Canceladas", vagasCanceladas].join(","),
      
      // Marketplace
      ["Marketplace", marketplace.length, marketplaceNoPeriodo.length, "Ativos", marketplace.filter(m => m.status === "ATIVO").length].join(","),
      ["", "", "", "Vendidos", marketplace.filter(m => m.status === "VENDIDO").length].join(","),
      
      // Denúncias
      ["Denúncias", denuncias.length, denunciasNoPeriodo.length, "Pendentes", denunciasPendentes].join(","),
      ["", "", "", "Resolvidas", denunciasResolvidas].join(",")
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cards de estatísticas
  const statsCards = [
    {
      titulo: "Profissionais",
      total: profissionais.length,
      periodo: profissionaisNoPeriodo.length,
      icone: Users,
      cor: "from-blue-400 to-blue-600",
      detalhes: [
        { label: "Aprovados", valor: profsAprovados, cor: "text-green-600" },
        { label: "Pendentes", valor: profsPendentes, cor: "text-yellow-600" },
        { label: "Reprovados", valor: profsReprovados, cor: "text-red-600" }
      ]
    },
    {
      titulo: "Clínicas",
      total: clinicas.length,
      periodo: clinicasNoPeriodo.length,
      icone: Building2,
      cor: "from-purple-400 to-purple-600",
      detalhes: [
        { label: "Aprovadas", valor: clinicasAprovadas, cor: "text-green-600" },
        { label: "Pendentes", valor: clinicasPendentes, cor: "text-yellow-600" },
        { label: "Reprovadas", valor: clinicasReprovadas, cor: "text-red-600" }
      ]
    },
    {
      titulo: "Vagas",
      total: vagas.length,
      periodo: vagasNoPeriodo.length,
      icone: Briefcase,
      cor: "from-orange-400 to-orange-600",
      detalhes: [
        { label: "Abertas", valor: vagasAbertas, cor: "text-green-600" },
        { label: "Preenchidas", valor: vagasPreenchidas, cor: "text-blue-600" },
        { label: "Canceladas", valor: vagasCanceladas, cor: "text-red-600" }
      ]
    },
    {
      titulo: "Marketplace",
      total: marketplace.length,
      periodo: marketplaceNoPeriodo.length,
      icone: ShoppingBag,
      cor: "from-pink-400 to-pink-600",
      detalhes: [
        { label: "Ativos", valor: marketplace.filter(m => m.status === "ATIVO").length, cor: "text-green-600" },
        { label: "Vendidos", valor: marketplace.filter(m => m.status === "VENDIDO").length, cor: "text-blue-600" },
        { label: "Suspensos", valor: marketplace.filter(m => m.status === "SUSPENSO").length, cor: "text-red-600" }
      ]
    }
  ];

  const periodoLabel = {
    hoje: "Hoje",
    "7dias": "Últimos 7 dias",
    "30dias": "Últimos 30 dias",
    mes: format(new Date(), "MMMM yyyy", { locale: ptBR })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Relatórios</h1>
                <p className="text-gray-600">Métricas e estatísticas da plataforma</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Seletor de Período */}
              <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg">
                {["hoje", "7dias", "30dias", "mes"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      periodo === p
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {periodoLabel[p]}
                  </button>
                ))}
              </div>

              {/* Botão Exportar */}
              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Data do período */}
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <Calendar className="w-5 h-5" />
            <span>
              {format(inicio, "dd/MM/yyyy", { locale: ptBR })} - {format(fim, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((card, index) => {
                const Icon = card.icone;
                return (
                  <motion.div
                    key={card.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.cor} flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-gray-900">{card.total}</p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-green-600">+{card.periodo}</span>
                      <span className="text-xs text-gray-500">no período</span>
                    </div>

                    <div className="space-y-2">
                      {card.detalhes.map((detalhe) => (
                        <div key={detalhe.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{detalhe.label}</span>
                          <span className={`font-bold ${detalhe.cor}`}>{detalhe.valor}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Seção de Denúncias */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Denúncias</h2>
                  <p className="text-gray-600">Moderação de conteúdo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-700">Pendentes</span>
                  </div>
                  <p className="text-3xl font-black text-yellow-900">{denunciasPendentes}</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Em Análise</span>
                  </div>
                  <p className="text-3xl font-black text-blue-900">
                    {denuncias.filter(d => d.status === "ANALISANDO").length}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Resolvidas</span>
                  </div>
                  <p className="text-3xl font-black text-green-900">{denunciasResolvidas}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{denuncias.length}</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>{denunciasNoPeriodo.length}</strong> denúncias no período selecionado
                </p>
              </div>
            </motion.div>

            {/* Gráficos de Crescimento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl shadow-lg p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Crescimento (Últimos 7 dias)</h2>
                  <p className="text-gray-600">Evolução diária de cadastros e atividades</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={graficoDados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="profissionais" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Profissionais" />
                  <Area type="monotone" dataKey="clinicas" stackId="1" stroke="#a855f7" fill="#a855f7" name="Clínicas" />
                  <Area type="monotone" dataKey="vagas" stackId="1" stroke="#f97316" fill="#f97316" name="Vagas" />
                  <Area type="monotone" dataKey="marketplace" stackId="1" stroke="#ec4899" fill="#ec4899" name="Marketplace" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Resumo Geral */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-lg p-8 text-white"
            >
              <h2 className="text-2xl font-black mb-6">Resumo do Período</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black">{profissionaisNoPeriodo.length + clinicasNoPeriodo.length}</p>
                  <p className="text-white/80">Novos Cadastros</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black">{vagasNoPeriodo.length}</p>
                  <p className="text-white/80">Novas Vagas</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black">{marketplaceNoPeriodo.length}</p>
                  <p className="text-white/80">Novos Anúncios</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black">{denunciasNoPeriodo.length}</p>
                  <p className="text-white/80">Denúncias</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
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
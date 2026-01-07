import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  FlaskConical,
  ChevronLeft,
  Eye,
  Star,
  TrendingUp,
  Coins,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";

export default function DashboardLaboratorio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: laboratorio, isLoading } = useQuery({
    queryKey: ["meu-laboratorio", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const results = await base44.entities.Laboratorio.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!laboratorio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl max-w-md">
          <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cadastro não encontrado</h2>
          <p className="text-gray-600 mb-6">Você ainda não possui um laboratório cadastrado</p>
          <button
            onClick={() => navigate(createPageUrl("CadastroLaboratorio"))}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg"
          >
            Cadastrar Laboratório
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    EM_ANALISE: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    APROVADO: { label: "Aprovado", color: "bg-green-100 text-green-700", icon: CheckCircle },
    REPROVADO: { label: "Reprovado", color: "bg-red-100 text-red-700", icon: AlertCircle }
  };

  const status = statusConfig[laboratorio.status_cadastro];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 pt-6 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Dashboard</h1>
              <p className="text-white/80 text-sm">{laboratorio.nome_fantasia}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(createPageUrl("EditarPerfil"))}
            className="p-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-8 max-w-4xl mx-auto space-y-6">
        {/* Status */}
        <div className={`rounded-3xl p-6 shadow-xl ${status.color}`}>
          <div className="flex items-center gap-3">
            <status.icon className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">Status: {status.label}</h3>
              {laboratorio.status_cadastro === "REPROVADO" && laboratorio.motivo_reprovacao && (
                <p className="text-sm mt-1">Motivo: {laboratorio.motivo_reprovacao}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-semibold">Visualizações</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{laboratorio.visualizacoes || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-semibold">Avaliação</span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {laboratorio.media_avaliacoes > 0 ? laboratorio.media_avaliacoes.toFixed(1) : "-"}
            </p>
            <p className="text-xs text-gray-500">{laboratorio.total_avaliacoes || 0} avaliações</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-teal-500 mb-2">
              <Coins className="w-5 h-5" />
              <span className="text-sm font-semibold">Tokens</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{laboratorio.tokens_disponiveis || 0}</p>
            <p className="text-xs text-gray-500">Disponíveis</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold">Ativos</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{laboratorio.ativo ? "Sim" : "Não"}</p>
          </div>
        </div>

        {/* Informações */}
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-gray-900 mb-4">Informações do Laboratório</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Razão Social:</span>
              <span className="font-semibold text-gray-900">{laboratorio.razao_social}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CNPJ:</span>
              <span className="font-semibold text-gray-900">{laboratorio.cnpj}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cidade:</span>
              <span className="font-semibold text-gray-900">{laboratorio.cidade} - {laboratorio.uf}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-900">{laboratorio.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">WhatsApp:</span>
              <span className="font-semibold text-gray-900">{laboratorio.whatsapp}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => navigate(createPageUrl("DetalheLaboratorio") + "?id=" + laboratorio.id)}
            className="py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
          >
            Ver Perfil Público
          </button>

          <button
            onClick={() => navigate(createPageUrl("ValidarClienteDoutorizze"))}
            className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            🎫 Validar Cliente Doutorizze
          </button>

          <button
            onClick={() => navigate(createPageUrl("ClientesDoutorizze"))}
            className="py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            👥 Meus Clientes Doutorizze
          </button>

          <button
            onClick={() => navigate(createPageUrl("EditarPerfil"))}
            className="py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Editar Informações
          </button>
        </div>
      </div>
    </div>
  );
}
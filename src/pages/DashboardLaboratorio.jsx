import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  FlaskConical,
  Eye,
  Star,
  MessageCircle,
  Settings,
  Edit,
  Package,
  TrendingUp,
  Users,
  Bell,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
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
      const results = await base44.entities.Laboratorio.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user?.id
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
          <p className="text-gray-500 mb-6">Complete seu cadastro de laboratório para acessar o dashboard.</p>
          <button
            onClick={() => navigate(createPageUrl("CadastroLaboratorio"))}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl"
          >
            Completar Cadastro
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    EM_ANALISE: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100", label: "Em Análise" },
    APROVADO: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Aprovado" },
    REPROVADO: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-100", label: "Reprovado" }
  };

  const status = statusConfig[laboratorio.status_cadastro] || statusConfig.EM_ANALISE;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-white">Meu Laboratório</h1>
            <button
              onClick={() => navigate(createPageUrl("Configuracoes"))}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Card do lab */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center overflow-hidden">
                {laboratorio.logo_url ? (
                  <img src={laboratorio.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FlaskConical className="w-8 h-8 text-teal-500" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900">{laboratorio.nome_fantasia}</h2>
                <p className="text-gray-500 text-sm">{laboratorio.cidade} - {laboratorio.uf}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 ${status.bg} rounded-full mt-1`}>
                  <StatusIcon className={`w-3 h-3 ${status.color}`} />
                  <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(createPageUrl("EditarPerfil"))}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">{laboratorio.visualizacoes || 0}</p>
            <p className="text-xs text-gray-500">Visualizações</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">{laboratorio.media_avaliacoes?.toFixed(1) || "0.0"}</p>
            <p className="text-xs text-gray-500">Avaliação</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">{laboratorio.total_avaliacoes || 0}</p>
            <p className="text-xs text-gray-500">Avaliações</p>
          </div>
        </div>

        {/* Status pendente */}
        {laboratorio.status_cadastro === "EM_ANALISE" && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-800">Cadastro em Análise</h3>
                <p className="text-yellow-700 text-sm">
                  Seu cadastro está sendo analisado pela equipe Doutorizze. Você será notificado quando for aprovado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status reprovado */}
        {laboratorio.status_cadastro === "REPROVADO" && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-800">Cadastro Reprovado</h3>
                <p className="text-red-700 text-sm">
                  {laboratorio.motivo_reprovacao || "Entre em contato com o suporte para mais informações."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Serviços */}
        {laboratorio.servicos_oferecidos?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-500" /> Meus Serviços
            </h3>
            <div className="flex flex-wrap gap-2">
              {laboratorio.servicos_oferecidos.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Menu de ações */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <MenuItem
            icon={MessageCircle}
            label="Minhas Conversas"
            description="Veja mensagens de clientes"
            onClick={() => navigate(createPageUrl("Chats"))}
          />
          <MenuItem
            icon={Star}
            label="Minhas Avaliações"
            description="Veja o que dizem sobre você"
            onClick={() => navigate(createPageUrl("MinhasAvaliacoes"))}
          />
          <MenuItem
            icon={Bell}
            label="Notificações"
            description="Configure suas notificações"
            onClick={() => navigate(createPageUrl("NotificationSettings"))}
          />
          <MenuItem
            icon={Settings}
            label="Configurações"
            description="Gerencie sua conta"
            onClick={() => navigate(createPageUrl("Configuracoes"))}
            isLast
          />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, description, onClick, isLast }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${!isLast && "border-b border-gray-100"}`}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Clock,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX
} from "lucide-react";

export default function StatusDisponibilidade() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: professional, isLoading } = useQuery({
    queryKey: ["meu-profissional-status", user?.id],
    queryFn: async () => {
      const results = await base44.entities.Professional.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user?.id
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (novoStatus) => {
      await base44.entities.Professional.update(professional.id, {
        status_disponibilidade_substituicao: novoStatus,
        ultima_atualizacao_status: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meu-profissional-status"]);
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status")
  });

  const toggleSomMutation = useMutation({
    mutationFn: async (ativo) => {
      await base44.entities.Professional.update(professional.id, {
        notificacao_som_ativa: ativo
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meu-profissional-status"]);
      toast.success("Configuração atualizada!");
    }
  });

  const toggleDisponibilidadeMutation = useMutation({
    mutationFn: async (disponivel) => {
      await base44.entities.Professional.update(professional.id, {
        disponivel_substituicao: disponivel,
        status_disponibilidade_substituicao: disponivel ? "ONLINE" : "OFFLINE",
        ultima_atualizacao_status: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meu-profissional-status"]);
      toast.success(professional?.disponivel_substituicao ? "Agora você está offline" : "Agora você está online!");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Perfil não encontrado</h2>
          <button
            onClick={() => navigate(createPageUrl("CadastroProfissional"))}
            className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl"
          >
            Completar Cadastro
          </button>
        </div>
      </div>
    );
  }

  const isOnline = professional.status_disponibilidade_substituicao === "ONLINE";
  const disponivel = professional.disponivel_substituicao;
  const somAtivo = professional.notificacao_som_ativa !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className={`px-4 py-6 transition-colors ${isOnline ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-gray-500 to-gray-600"}`}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isOnline ? "bg-white/20" : "bg-white/10"}`}>
              {isOnline ? <Wifi className="w-8 h-8 text-white" /> : <WifiOff className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Status de Disponibilidade</h1>
              <p className="text-white/80">
                {isOnline ? "Você está online para substituições" : "Você está offline"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Toggle principal */}
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Disponível para Substituições</h2>
              <p className="text-gray-500 text-sm">Ative para receber notificações de plantões urgentes</p>
            </div>
            <button
              onClick={() => toggleDisponibilidadeMutation.mutate(!disponivel)}
              disabled={toggleDisponibilidadeMutation.isPending}
              className={`relative w-16 h-8 rounded-full transition-colors ${disponivel ? "bg-green-500" : "bg-gray-300"}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${disponivel ? "left-9" : "left-1"}`} />
            </button>
          </div>

          {disponivel && (
            <>
              {/* Status Online/Offline */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Seu Status Atual</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleStatusMutation.mutate("ONLINE")}
                    disabled={toggleStatusMutation.isPending}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isOnline
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <Wifi className={`w-8 h-8 mx-auto mb-2 ${isOnline ? "text-green-500" : "text-gray-400"}`} />
                    <p className={`font-bold ${isOnline ? "text-green-700" : "text-gray-600"}`}>Online</p>
                    <p className="text-xs text-gray-500">Recebendo alertas</p>
                  </button>

                  <button
                    onClick={() => toggleStatusMutation.mutate("OFFLINE")}
                    disabled={toggleStatusMutation.isPending}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      !isOnline
                        ? "border-gray-500 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <WifiOff className={`w-8 h-8 mx-auto mb-2 ${!isOnline ? "text-gray-600" : "text-gray-400"}`} />
                    <p className={`font-bold ${!isOnline ? "text-gray-700" : "text-gray-600"}`}>Offline</p>
                    <p className="text-xs text-gray-500">Pausado</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Configurações de notificação */}
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Configurações de Alerta</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                {somAtivo ? <Volume2 className="w-6 h-6 text-orange-500" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
                <div>
                  <p className="font-bold text-gray-900">Som de Notificação</p>
                  <p className="text-sm text-gray-500">Alerta sonoro para novas substituições</p>
                </div>
              </div>
              <button
                onClick={() => toggleSomMutation.mutate(!somAtivo)}
                disabled={toggleSomMutation.isPending}
                className={`w-12 h-6 rounded-full transition-colors ${somAtivo ? "bg-orange-500" : "bg-gray-300"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${somAtivo ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Suas Estatísticas</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-2xl text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900">{professional.substituicoes_completadas || 0}</p>
              <p className="text-sm text-gray-500">Substituições</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900">{professional.taxa_comparecimento?.toFixed(0) || 100}%</p>
              <p className="text-sm text-gray-500">Comparecimento</p>
            </div>
          </div>

          {professional.esta_suspenso && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">Você está suspenso</span>
              </div>
              <p className="text-red-600 text-sm mt-1">
                {professional.motivo_suspensao || "Entre em contato com o suporte."}
              </p>
            </div>
          )}
        </div>

        {/* Cidades de atendimento */}
        {professional.cidades_atendimento?.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Cidades de Atendimento
            </h2>
            <div className="flex flex-wrap gap-2">
              {professional.cidades_atendimento.map((cidade, i) => (
                <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                  {cidade}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate(createPageUrl("DisponibilidadeSubstituicao"))}
              className="w-full mt-4 py-3 border-2 border-orange-300 text-orange-600 font-bold rounded-xl hover:bg-orange-50"
            >
              Editar Disponibilidade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  DollarSign,
  Star,
  TrendingUp,
  Eye,
  MessageSquare,
  Settings,
  Plus,
  Calendar,
  Award
} from "lucide-react";

export default function DashboardFreelancer() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: freelancer, isLoading } = useQuery({
    queryKey: ["freelancer", user?.id],
    queryFn: async () => {
      const result = await base44.entities.Freelancer.filter({ user_id: user?.id });
      return result[0];
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
          <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Complete seu cadastro
          </h2>
          <p className="text-gray-600 mb-6">
            Você ainda não tem um perfil freelancer cadastrado
          </p>
          <Button
            onClick={() => navigate(createPageUrl("CadastroFreelancer"))}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Criar Perfil Freelancer
          </Button>
        </div>
      </div>
    );
  }

  const stats = freelancer.stats || {
    jobs_completed: 0,
    jobs_active: 0,
    total_earned: 0,
    response_time: 0,
    on_time_delivery: 0
  };

  const rating = freelancer.rating || {
    average: 0,
    count: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {freelancer.profile_photo ? (
                <img
                  src={freelancer.profile_photo}
                  alt={freelancer.name}
                  className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black text-white">{freelancer.name}</h1>
                <p className="text-white/80 text-lg">{freelancer.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-semibold">
                      {rating.average > 0 ? rating.average.toFixed(1) : "Novo"}
                    </span>
                    {rating.count > 0 && (
                      <span className="text-white/70 text-sm">({rating.count})</span>
                    )}
                  </div>
                  {freelancer.is_available && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Disponível
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("EditarPerfilFreelancer"))}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {stats.jobs_active}
            </div>
            <div className="text-sm text-gray-600">Projetos Ativos</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {stats.jobs_completed}
            </div>
            <div className="text-sm text-gray-600">Concluídos</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0
              }).format(stats.total_earned)}
            </div>
            <div className="text-sm text-gray-600">Total Ganho</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {stats.on_time_delivery > 0 ? `${stats.on_time_delivery}%` : "100%"}
            </div>
            <div className="text-sm text-gray-600">No Prazo</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-black mb-4">Ações Rápidas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate(createPageUrl("NewJobs"))}
              className="bg-white text-purple-600 hover:bg-white/90 justify-start h-auto p-4"
            >
              <Briefcase className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-bold">Buscar Vagas</div>
                <div className="text-xs opacity-80">Encontre novos projetos</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("Portfolio"))}
              className="bg-white text-purple-600 hover:bg-white/90 justify-start h-auto p-4"
            >
              <Eye className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-bold">Gerenciar Portfólio</div>
                <div className="text-xs opacity-80">Adicione seus trabalhos</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("MinhasCandidaturas"))}
              className="bg-white text-purple-600 hover:bg-white/90 justify-start h-auto p-4"
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-bold">Minhas Propostas</div>
                <div className="text-xs opacity-80">Ver candidaturas</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-4">
            Complete seu Perfil
          </h3>
          <div className="space-y-4">
            <ProfileCompletionItem
              completed={!!freelancer.profile_photo}
              label="Adicionar foto de perfil"
              action={() => navigate(createPageUrl("EditarPerfilFreelancer"))}
            />
            <ProfileCompletionItem
              completed={!!freelancer.bio && freelancer.bio.length > 50}
              label="Escrever biografia completa (50+ caracteres)"
              action={() => navigate(createPageUrl("EditarPerfilFreelancer"))}
            />
            <ProfileCompletionItem
              completed={freelancer.skills?.length >= 5}
              label="Adicionar pelo menos 5 habilidades"
              action={() => navigate(createPageUrl("EditarPerfilFreelancer"))}
            />
            <ProfileCompletionItem
              completed={freelancer.portfolio_items?.length > 0}
              label="Adicionar itens ao portfólio"
              action={() => navigate(createPageUrl("Portfolio"))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileCompletionItem({ completed, label, action }) {
  return (
    <div
      onClick={!completed ? action : undefined}
      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
        completed
          ? "border-green-200 bg-green-50"
          : "border-gray-200 hover:border-purple-300 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            completed ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          {completed && <span className="text-white text-sm">✓</span>}
        </div>
        <span className={completed ? "text-gray-600 line-through" : "text-gray-900 font-semibold"}>
          {label}
        </span>
      </div>
      {!completed && (
        <Button variant="outline" size="sm">
          Completar
        </Button>
      )}
    </div>
  );
}
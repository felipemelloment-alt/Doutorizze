import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Star,
  Briefcase,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Share2
} from "lucide-react";
import { toast } from "sonner";

export default function PerfilFreelancer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const freelancerId = searchParams.get("id");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("Usuário não autenticado");
      }
    };
    loadUser();
  }, []);

  const { data: freelancer, isLoading } = useQuery({
    queryKey: ["freelancer", freelancerId],
    queryFn: async () => {
      const result = await base44.entities.Freelancer.filter({ id: freelancerId });
      return result[0];
    },
    enabled: !!freelancerId
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: freelancer.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

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
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Perfil não encontrado
          </h2>
          <Button onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const rating = freelancer.rating || { average: 0, count: 0 };
  const stats = freelancer.stats || { jobs_completed: 0, on_time_delivery: 0 };
  const portfolioItems = freelancer.portfolio_items || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {freelancer.profile_photo ? (
                <img
                  src={freelancer.profile_photo}
                  alt={freelancer.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Briefcase className="w-16 h-16 text-white" />
                </div>
              )}
              
              <div>
                <h1 className="text-4xl font-black text-white mb-2">{freelancer.name}</h1>
                <p className="text-xl text-white/90 mb-3">{freelancer.title}</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-4 py-2">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    <span className="text-white font-bold text-lg">
                      {rating.average > 0 ? rating.average.toFixed(1) : "Novo"}
                    </span>
                    {rating.count > 0 && (
                      <span className="text-white/70">({rating.count})</span>
                    )}
                  </div>
                  
                  {freelancer.is_available && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                      ✓ Disponível
                    </div>
                  )}
                  
                  {freelancer.is_verified && (
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Verificado
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleShare}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-black text-purple-600 mb-2">
              {stats.jobs_completed}
            </div>
            <div className="text-gray-600 font-semibold">Projetos Concluídos</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-black text-green-600 mb-2">
              {stats.on_time_delivery || 100}%
            </div>
            <div className="text-gray-600 font-semibold">Entrega no Prazo</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl font-black text-blue-600 mb-2">
              {freelancer.years_experience || 0}
            </div>
            <div className="text-gray-600 font-semibold">Anos de Experiência</div>
          </div>
        </div>

        {/* Sobre */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Sobre</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {freelancer.bio || "Nenhuma biografia adicionada."}
          </p>
        </div>

        {/* Habilidades */}
        {freelancer.skills && freelancer.skills.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfólio */}
        {portfolioItems.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Portfólio</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {portfolioItems.map((item, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-400 transition-all">
                  {item.images && item.images[0] && (
                    <div className="h-48 bg-gray-100">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold text-sm"
                      >
                        Ver projeto
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valores */}
        {(freelancer.pricing?.hourly_rate > 0 || freelancer.pricing?.daily_rate > 0 || freelancer.pricing?.project_min > 0) && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Valores</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {freelancer.pricing.hourly_rate > 0 && (
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl">
                  <div className="text-sm text-gray-600 mb-2">Por Hora</div>
                  <div className="text-3xl font-black text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freelancer.pricing.hourly_rate)}
                  </div>
                </div>
              )}
              {freelancer.pricing.daily_rate > 0 && (
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                  <div className="text-sm text-gray-600 mb-2">Por Dia</div>
                  <div className="text-3xl font-black text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freelancer.pricing.daily_rate)}
                  </div>
                </div>
              )}
              {freelancer.pricing.project_min > 0 && (
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl">
                  <div className="text-sm text-gray-600 mb-2">Projeto Mínimo</div>
                  <div className="text-3xl font-black text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freelancer.pricing.project_min)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-black mb-4">Interessado em contratar?</h2>
          <p className="text-white/90 mb-6">Entre em contato para discutir seu projeto</p>
          <Button
            onClick={() => {
              if (!user) {
                toast.error("Faça login para entrar em contato");
                return;
              }
              window.open(`https://wa.me/55${freelancer.phone}`, "_blank");
            }}
            className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6 h-auto"
          >
            <MessageSquare className="w-6 h-6 mr-2" />
            Entrar em Contato
          </Button>
        </div>
      </div>
    </div>
  );
}
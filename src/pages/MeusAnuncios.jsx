import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pause, Play, Trash2, Eye, MapPin, Calendar, Briefcase } from "lucide-react";

export default function MeusAnuncios() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const profs = await base44.entities.Professional.filter({ user_id: user.id });
      setProfessional(profs[0]);
    };
    load();
  }, []);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["myProfessionalAds", professional?.id],
    queryFn: async () => {
      if (!professional) return [];
      return await base44.entities.ProfessionalAd.filter({ professional_id: professional.id });
    },
    enabled: !!professional
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProfessionalAd.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfessionalAds"] });
      toast.success("Anúncio atualizado!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProfessionalAd.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfessionalAds"] });
      toast.success("Anúncio excluído!");
    }
  });

  const handleToggleStatus = (ad) => {
    const novoStatus = ad.status === "ATIVO" ? "PAUSADO" : "ATIVO";
    updateMutation.mutate({ id: ad.id, data: { status: novoStatus } });
  };

  const handleDelete = (ad) => {
    if (window.confirm("Excluir este anúncio?")) {
      deleteMutation.mutate(ad.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Meus Anúncios</h1>
            <p className="text-sm text-gray-600">Gerencie seus anúncios de procura de emprego</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Criar Anúncio
          </button>
        </div>

        {/* Lista */}
        {ads.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-lg font-bold text-gray-500 mb-2">Nenhum anúncio criado</h3>
            <p className="text-sm text-gray-400 mb-5">Crie seu primeiro anúncio e deixe as clínicas te encontrarem!</p>
            <button
              onClick={() => navigate(createPageUrl("CriarAnuncioProfissional"))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Anúncio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ad.status === "ATIVO" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {ad.status === "ATIVO" ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{ad.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.descricao}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {ad.visualizacoes || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ad.cidades_interesse?.length || 0} cidades
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ad.created_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(ad)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title={ad.status === "ATIVO" ? "Pausar" : "Ativar"}
                    >
                      {ad.status === "ATIVO" ? <Pause className="w-4 h-4 text-gray-600" /> : <Play className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      onClick={() => handleDelete(ad)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
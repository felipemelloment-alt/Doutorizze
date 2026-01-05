import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Heart,
  Trash2,
  Briefcase,
  User,
  Building2,
  Package,
  GraduationCap,
  Filter,
  ExternalLink
} from "lucide-react";

export default function MeusFavoritos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

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

  const { data: favoritos = [], isLoading } = useQuery({
    queryKey: ["favoritos", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Favorito.filter({ user_id: user.id });
    },
    enabled: !!user?.id
  });

  const removerMutation = useMutation({
    mutationFn: async (favoritoId) => {
      await base44.entities.Favorito.delete(favoritoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      toast.success("Removido dos favoritos");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    }
  });

  const tiposConfig = {
    VAGA: { label: "Vagas", icon: Briefcase, color: "bg-blue-100 text-blue-700", link: "DetalheVaga" },
    PROFISSIONAL: { label: "Profissionais", icon: User, color: "bg-green-100 text-green-700", link: "VerProfissional" },
    CLINICA: { label: "Clínicas", icon: Building2, color: "bg-purple-100 text-purple-700", link: "PerfilClinicaPublico" },
    PRODUTO: { label: "Produtos", icon: Package, color: "bg-orange-100 text-orange-700", link: "MarketplaceDetail" },
    CURSO: { label: "Cursos", icon: GraduationCap, color: "bg-pink-100 text-pink-700", link: "DetalheCurso" }
  };

  const favoritosFiltrados = filtroTipo === "TODOS"
    ? favoritos
    : favoritos.filter(f => f.tipo === filtroTipo);

  const contadores = {
    TODOS: favoritos.length,
    VAGA: favoritos.filter(f => f.tipo === "VAGA").length,
    PROFISSIONAL: favoritos.filter(f => f.tipo === "PROFISSIONAL").length,
    CLINICA: favoritos.filter(f => f.tipo === "CLINICA").length,
    PRODUTO: favoritos.filter(f => f.tipo === "PRODUTO").length,
    CURSO: favoritos.filter(f => f.tipo === "CURSO").length
  };

  const handleVerItem = (favorito) => {
    const config = tiposConfig[favorito.tipo];
    if (config?.link) {
      navigate(createPageUrl(config.link) + "?id=" + favorito.item_id);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white shadow-lg">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Meus Favoritos</h1>
              <p className="text-sm text-gray-600">{contadores.TODOS} item{contadores.TODOS !== 1 ? 's' : ''} salvos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-bold text-gray-900">Filtrar por tipo:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroTipo("TODOS")}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filtroTipo === "TODOS"
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({contadores.TODOS})
            </button>
            {Object.entries(tiposConfig).map(([tipo, config]) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  filtroTipo === tipo
                    ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <config.icon className="w-4 h-4" />
                {config.label} ({contadores[tipo]})
              </button>
            ))}
          </div>
        </div>

        {favoritosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-600 mb-6">
              {filtroTipo === "TODOS"
                ? "Comece a salvar seus itens favoritos!"
                : `Você não tem favoritos em ${tiposConfig[filtroTipo]?.label}`}
            </p>
            <button
              onClick={() => navigate(createPageUrl("Feed"))}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Explorar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoritosFiltrados.map((fav) => {
              const config = tiposConfig[fav.tipo];
              const Icon = config?.icon || Heart;

              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config?.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${config?.color} mb-2`}>
                        {config?.label}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                        {fav.item_titulo}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Adicionado em {new Date(fav.created_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleVerItem(fav)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        Ver
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removerMutation.mutate(fav.id)}
                        disabled={removerMutation.isPending}
                        className="px-4 py-2 border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
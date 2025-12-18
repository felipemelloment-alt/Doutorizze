import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  Heart,
  Share2,
  ExternalLink,
  Newspaper,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoColors = {
  NOVIDADE: "bg-blue-100 text-blue-700",
  NOTICIA_SAUDE: "bg-green-100 text-green-700",
  NOTICIA_IA: "bg-purple-100 text-purple-700",
  PARCEIRO: "bg-yellow-100 text-yellow-700",
  PROMOCAO: "bg-red-100 text-red-700",
  CURSO: "bg-indigo-100 text-indigo-700",
  DESTAQUE_MARKETPLACE: "bg-pink-100 text-pink-700"
};

const tipoLabels = {
  NOVIDADE: "Novidade",
  NOTICIA_SAUDE: "Saúde",
  NOTICIA_IA: "IA & Tecnologia",
  PARCEIRO: "Parceiro",
  PROMOCAO: "Promoção",
  CURSO: "Curso",
  DESTAQUE_MARKETPLACE: "Destaque"
};

const filtros = [
  { id: "TODOS", label: "Todos" },
  { id: "NOVIDADE", label: "Novidades" },
  { id: "CURSO", label: "Cursos" },
  { id: "PROMOCAO", label: "Promoções" }
];

export default function Feed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtroAtivo, setFiltroAtivo] = useState("TODOS");

  // Buscar posts ativos
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["feedPosts"],
    queryFn: async () => {
      const results = await base44.entities.FeedPost.filter({ ativo: true });
      
      // Ordenar: destaque primeiro, depois por data
      return results.sort((a, b) => {
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
    }
  });

  // Filtrar posts
  const postsFiltrados = filtroAtivo === "TODOS" 
    ? posts 
    : posts.filter(post => post.tipo_post === filtroAtivo);

  // Mutation para curtir
  const curtirMutation = useMutation({
    mutationFn: async (postId) => {
      const post = posts.find(p => p.id === postId);
      return await base44.entities.FeedPost.update(postId, {
        curtidas: (post.curtidas || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      toast.success("❤️ Curtido!");
    }
  });

  // Mutation para incrementar visualizações
  const incrementarVisualizacoesMutation = useMutation({
    mutationFn: async (postId) => {
      const post = posts.find(p => p.id === postId);
      return await base44.entities.FeedPost.update(postId, {
        visualizacoes: (post.visualizacoes || 0) + 1
      });
    }
  });

  const handleCompartilhar = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.descricao,
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      toast.success("Link copiado!");
    }
  };

  const handleAbrirLink = (post) => {
    incrementarVisualizacoesMutation.mutate(post.id);
    
    if (post.link_interno) {
      navigate(createPageUrl(post.link_interno));
    } else if (post.link_externo) {
      window.open(post.link_externo, "_blank");
    }
  };

  const getAutorNome = (post) => {
    if (post.autor_tipo === "ADMIN") return "Doutorizze";
    if (post.autor_tipo === "SISTEMA") return "Sistema";
    return "Parceiro";
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              Feed
            </h1>
            <p className="text-white/90">Novidades e oportunidades</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("NotificationCenter"))}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <Bell className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {filtros.map((filtro) => (
            <button
              key={filtro.id}
              onClick={() => setFiltroAtivo(filtro.id)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                filtroAtivo === filtro.id
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="px-4 pb-24 space-y-4">
        {postsFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-12 text-center mt-8"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma novidade ainda</h3>
            <p className="text-gray-600">Em breve teremos conteúdos incríveis para você!</p>
          </motion.div>
        ) : (
          postsFiltrados.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Imagem */}
              {post.imagem_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.imagem_url}
                    alt={post.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-6">
                {/* Badge do Tipo */}
                <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold mb-3 ${tipoColors[post.tipo_post]}`}>
                  {tipoLabels[post.tipo_post]}
                </span>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.titulo}
                </h3>

                {/* Descrição */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.descricao}
                </p>

                {/* Autor e Tempo */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-semibold">{getAutorNome(post)}</span>
                    <span>•</span>
                    <span>{getTimeAgo(post.created_date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.curtidas || 0}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => curtirMutation.mutate(post.id)}
                    disabled={curtirMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all disabled:opacity-50"
                  >
                    <Heart className="w-5 h-5" />
                    Curtir
                  </button>

                  <button
                    onClick={() => handleCompartilhar(post)}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-500 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Compartilhar
                  </button>

                  {(post.link_externo || post.link_interno) && (
                    <button
                      onClick={() => handleAbrirLink(post)}
                      className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      Saiba Mais
                      {post.link_externo ? (
                        <ExternalLink className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pull to Refresh Hint */}
      {postsFiltrados.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => refetch()}
            className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all"
          >
            <span className="text-2xl">🔄</span>
          </button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  Users,
  Heart,
  MessageCircle,
  Eye,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Newspaper,
  AlertCircle
} from "lucide-react";

export default function FeedBackup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const feedPosts = await base44.entities.FeedPost.filter({
          ativo: true,
          aprovado: true
        });

        const postsOrdenados = feedPosts.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        );

        setPosts(postsOrdenados.slice(0, 20));
      } catch (error) {
        console.error("Erro ao carregar feed:", error);
        toast.error("Erro ao carregar posts");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      await base44.entities.FeedPost.update(postId, {
        curtidas: (post.curtidas || 0) + 1
      });

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, curtidas: (p.curtidas || 0) + 1 } : p
      ));
      toast.success("Post curtido!");
    } catch (error) {
      toast.error("Erro ao curtir post");
    }
  };

  const tipoPostConfig = {
    NOTICIA_IA: { icon: Sparkles, color: "text-yellow-500", bg: "bg-yellow-100" },
    VIDEO: { icon: Video, color: "text-red-500", bg: "bg-red-100" },
    DICA: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-100" },
    PARCEIRO: { icon: Users, color: "text-purple-500", bg: "bg-purple-100" },
    NOTICIA_SAUDE: { icon: Newspaper, color: "text-green-500", bg: "bg-green-100" },
    NOVIDADE: { icon: Sparkles, color: "text-pink-500", bg: "bg-pink-100" }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Feed Backup</h1>
                <p className="text-xs text-gray-500">Versão simplificada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta Backup */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-bold mb-1">Versão de Backup</p>
            <p>Esta é uma versão simplificada do feed. Algumas funcionalidades podem estar limitadas.</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum post disponível no momento</p>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => {
              const config = tipoPostConfig[post.tipo_post] || tipoPostConfig.NOTICIA_IA;
              const Icon = config.icon;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Header do Post */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{post.titulo}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Imagem */}
                  {post.imagem_url && (
                    <img
                      src={post.imagem_url}
                      alt={post.titulo}
                      className="w-full h-64 object-cover"
                    />
                  )}

                  {/* Descrição */}
                  <div className="p-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{post.descricao}</p>
                  </div>

                  {/* Footer com Métricas */}
                  <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 hover:text-pink-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.curtidas || 0}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.visualizacoes || 0}</span>
                      </div>
                    </div>

                    {(post.link_externo || post.fonte_url) && (
                      <button
                        onClick={() => window.open(post.link_externo || post.fonte_url, "_blank")}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Ver mais
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
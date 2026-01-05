/**
 * ADMIN FEED - Página de gestão do feed de notícias
 * Protegida por ProtectedRoute requireAdmin
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Heart,
  Image as ImageIcon,
  Video
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

const tipoPostLabels = {
  NOVIDADE: "Novidade",
  NOTICIA_SAUDE: "Saúde",
  NOTICIA_IA: "IA & Tech",
  PARCEIRO: "Parceiro",
  PROMOCAO: "Promoção",
  CURSO: "Curso",
  DESTAQUE_MARKETPLACE: "Marketplace"
};

const tipoPostColors = {
  NOVIDADE: "bg-purple-100 text-purple-700",
  NOTICIA_SAUDE: "bg-red-100 text-red-700",
  NOTICIA_IA: "bg-blue-100 text-blue-700",
  PARCEIRO: "bg-green-100 text-green-700",
  PROMOCAO: "bg-orange-100 text-orange-700",
  CURSO: "bg-indigo-100 text-indigo-700",
  DESTAQUE_MARKETPLACE: "bg-yellow-100 text-yellow-700"
};

const areaLabels = {
  ODONTOLOGIA: "Odontologia",
  MEDICINA: "Medicina",
  AMBOS: "Ambos"
};

function AdminFeedContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    tipo_post: "NOVIDADE",
    tipo_midia: "IMAGEM",
    titulo: "",
    descricao: "",
    imagem_url: "",
    video_url: "",
    fonte_nome: "",
    fonte_url: "",
    area: "AMBOS",
    destaque: false,
    ativo: true
  });

  // Buscar posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-feed-posts"],
    queryFn: async () => {
      return await base44.entities.FeedPost.list("-created_date");
    }
  });

  // Mutation para criar/editar
  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      if (editingPost) {
        return await base44.entities.FeedPost.update(editingPost.id, data);
      }
      return await base44.entities.FeedPost.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      resetForm();
      toast.success(editingPost ? "✅ Post atualizado!" : "✅ Post criado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para deletar
  const deletarMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.FeedPost.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("🗑️ Post excluído");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation para toggle ativo
  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }) => {
      return await base44.entities.FeedPost.update(id, { ativo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("Status atualizado");
    }
  });

  // Mutation para toggle destaque
  const toggleDestaqueMutation = useMutation({
    mutationFn: async ({ id, destaque }) => {
      return await base44.entities.FeedPost.update(id, { destaque });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("Destaque atualizado");
    }
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({
      tipo_post: "NOVIDADE",
      tipo_midia: "IMAGEM",
      titulo: "",
      descricao: "",
      imagem_url: "",
      video_url: "",
      fonte_nome: "",
      fonte_url: "",
      area: "AMBOS",
      destaque: false,
      ativo: true
    });
  };

  const handleEditar = (post) => {
    setEditingPost(post);
    setFormData({
      tipo_post: post.tipo_post || "NOVIDADE",
      tipo_midia: post.tipo_midia || "IMAGEM",
      titulo: post.titulo || "",
      descricao: post.descricao || "",
      imagem_url: post.imagem_url || "",
      video_url: post.video_url || "",
      fonte_nome: post.fonte_nome || "",
      fonte_url: post.fonte_url || "",
      area: post.area || "AMBOS",
      destaque: post.destaque || false,
      ativo: post.ativo !== false
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      toast.error("Título e descrição são obrigatórios");
      return;
    }
    salvarMutation.mutate(formData);
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  // Contadores
  const ativos = posts.filter(p => p.ativo).length;
  const inativos = posts.filter(p => !p.ativo).length;
  const destaques = posts.filter(p => p.destaque).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Gerenciar Feed</h1>
                <p className="text-gray-600">Conteúdos e notícias</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Post
            </button>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-100 rounded-2xl p-4 border-2 border-green-300">
              <p className="text-sm font-semibold text-green-700">Ativos</p>
              <p className="text-3xl font-black text-green-900">{ativos}</p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-4 border-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-700">Inativos</p>
              <p className="text-3xl font-black text-gray-900">{inativos}</p>
            </div>
            <div className="bg-yellow-100 rounded-2xl p-4 border-2 border-yellow-300">
              <p className="text-sm font-semibold text-yellow-700">Destaques</p>
              <p className="text-3xl font-black text-yellow-900">{destaques}</p>
            </div>
          </div>
        </div>

        {/* Lista de Posts */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhum post criado ainda</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl"
            >
              Criar Primeiro Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                  !post.ativo ? "border-gray-200 opacity-60" : post.destaque ? "border-yellow-400" : "border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {post.imagem_url ? (
                    <img
                      src={post.imagem_url}
                      alt={post.titulo}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {post.video_url ? (
                        <Video className="w-8 h-8 text-gray-400" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tipoPostColors[post.tipo_post]}`}>
                        {tipoPostLabels[post.tipo_post]}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                        {areaLabels[post.area]}
                      </span>
                      {post.destaque && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {!post.ativo && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          INATIVO
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1 truncate">{post.titulo}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.descricao}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.visualizacoes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.curtidas || 0}
                      </span>
                      <span>{getTimeAgo(post.created_date)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleAtivoMutation.mutate({ id: post.id, ativo: !post.ativo })}
                      className={`p-2 rounded-lg transition-all ${
                        post.ativo ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={post.ativo ? "Desativar" : "Ativar"}
                    >
                      {post.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleDestaqueMutation.mutate({ id: post.id, destaque: !post.destaque })}
                      className={`p-2 rounded-lg transition-all ${
                        post.destaque ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={post.destaque ? "Remover destaque" : "Destacar"}
                    >
                      <Star className={`w-4 h-4 ${post.destaque ? "fill-yellow-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleEditar(post)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Excluir este post?")) {
                          deletarMutation.mutate(post.id);
                        }
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full my-8"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6">
              {editingPost ? "Editar Post" : "Novo Post"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Post</label>
                  <select
                    value={formData.tipo_post}
                    onChange={(e) => setFormData({ ...formData, tipo_post: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  >
                    {Object.entries(tipoPostLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Área</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  >
                    {Object.entries(areaLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  placeholder="Título do post"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição *</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none resize-none"
                  placeholder="Conteúdo do post"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">URL do Vídeo (opcional)</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Fonte</label>
                  <input
                    type="text"
                    value={formData.fonte_nome}
                    onChange={(e) => setFormData({ ...formData, fonte_nome: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                    placeholder="Nome da fonte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">URL da Fonte</label>
                  <input
                    type="url"
                    value={formData.fonte_url}
                    onChange={(e) => setFormData({ ...formData, fonte_url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.destaque}
                    onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                  />
                  <span className="font-semibold text-gray-700">Destacar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-400"
                  />
                  <span className="font-semibold text-gray-700">Ativo</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvarMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {salvarMutation.isPending ? "Salvando..." : editingPost ? "Atualizar" : "Criar Post"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Export com ProtectedRoute wrapper
export default function AdminFeed() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminFeedContent />
    </ProtectedRoute>
  );
}
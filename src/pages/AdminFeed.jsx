import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  Power,
  Upload,
  X,
  Calendar,
  Shield
} from "lucide-react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

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

const paginasDisponiveis = [
  "HomePage",
  "NewJobs",
  "Feed",
  "Marketplace",
  "NotificationCenter",
  "MeuPerfil",
  "BuscarProfissionais"
];

function AdminFeedContent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    tipo_post: "NOVIDADE",
    titulo: "",
    descricao: "",
    imagem_url: "",
    link_externo: "",
    link_interno: "",
    destaque: false,
    expires_at: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta área. Esta página é exclusiva para administradores.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Buscar posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["adminFeedPosts"],
    queryFn: async () => {
      const results = await base44.entities.FeedPost.list("-created_date");
      return results;
    }
  });

  // Mutation criar
  const criarPostMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.FeedPost.create({
        autor_tipo: "ADMIN",
        autor_id: "admin",
        ...data,
        ativo: true,
        visualizacoes: 0,
        curtidas: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFeedPosts"] });
      resetForm();
      toast.success("✅ Post criado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation editar
  const editarPostMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.FeedPost.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFeedPosts"] });
      resetForm();
      toast.success("✅ Post atualizado!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation excluir
  const excluirPostMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.FeedPost.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFeedPosts"] });
      toast.success("🗑️ Post excluído!");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  // Mutation toggle ativo
  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }) => {
      return await base44.entities.FeedPost.update(id, { ativo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFeedPosts"] });
      toast.success("✅ Status atualizado!");
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem_url: file_url });
      toast.success("✅ Imagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descricao) {
      toast.error("Preencha título e descrição");
      return;
    }

    const dataToSend = {
      tipo_post: formData.tipo_post,
      titulo: formData.titulo,
      descricao: formData.descricao,
      imagem_url: formData.imagem_url || undefined,
      link_externo: formData.link_externo || undefined,
      link_interno: formData.link_interno || undefined,
      destaque: formData.destaque,
      expires_at: formData.expires_at || undefined
    };

    if (editingPost) {
      editarPostMutation.mutate({ id: editingPost.id, data: dataToSend });
    } else {
      criarPostMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      tipo_post: post.tipo_post,
      titulo: post.titulo,
      descricao: post.descricao,
      imagem_url: post.imagem_url || "",
      link_externo: post.link_externo || "",
      link_interno: post.link_interno || "",
      destaque: post.destaque,
      expires_at: post.expires_at ? post.expires_at.split("T")[0] : ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingPost(null);
    setFormData({
      tipo_post: "NOVIDADE",
      titulo: "",
      descricao: "",
      imagem_url: "",
      link_externo: "",
      link_interno: "",
      destaque: false,
      expires_at: ""
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      excluirPostMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Gerenciar Feed</h1>
              <p className="text-gray-600">Criar e moderar posts</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Novo Post
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-sm text-gray-500 mb-1">Total de Posts</p>
            <p className="text-3xl font-black text-gray-900">{posts.length}</p>
          </div>
          <div className="bg-green-100 rounded-2xl p-6 border-2 border-green-300">
            <p className="text-sm text-green-700 mb-1">Posts Ativos</p>
            <p className="text-3xl font-black text-green-900">{posts.filter(p => p.ativo).length}</p>
          </div>
          <div className="bg-blue-100 rounded-2xl p-6 border-2 border-blue-300">
            <p className="text-sm text-blue-700 mb-1">Visualizações</p>
            <p className="text-3xl font-black text-blue-900">
              {posts.reduce((sum, p) => sum + (p.visualizacoes || 0), 0)}
            </p>
          </div>
          <div className="bg-pink-100 rounded-2xl p-6 border-2 border-pink-300">
            <p className="text-sm text-pink-700 mb-1">Curtidas</p>
            <p className="text-3xl font-black text-pink-900">
              {posts.reduce((sum, p) => sum + (p.curtidas || 0), 0)}
            </p>
          </div>
        </div>

        {/* Lista de Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Imagem */}
              {post.imagem_url && (
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={post.imagem_url}
                    alt={post.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${tipoColors[post.tipo_post]}`}>
                    {tipoLabels[post.tipo_post]}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    post.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {post.ativo ? "Ativo" : "Inativo"}
                  </span>
                  {post.destaque && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      ⭐ Destaque
                    </span>
                  )}
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.titulo}
                </h3>

                {/* Descrição */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {post.descricao}
                </p>

                {/* Estatísticas */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.visualizacoes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.curtidas || 0}
                  </span>
                  {post.expires_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Expira em {new Date(post.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleAtivoMutation.mutate({ id: post.id, ativo: !post.ativo })}
                    disabled={toggleAtivoMutation.isPending}
                    className={`px-4 py-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      post.ativo
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={excluirPostMutation.isPending}
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum post criado ainda</p>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                {editingPost ? "Editar Post" : "Criar Novo Post"}
              </h2>
              <button
                onClick={resetForm}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo do Post */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Tipo do Post *
                </label>
                <select
                  value={formData.tipo_post}
                  onChange={(e) => setFormData({ ...formData, tipo_post: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                >
                  {Object.entries(tipoLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Digite o título do post"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o conteúdo do post..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none resize-none"
                />
              </div>

              {/* Upload Imagem */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Imagem (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                    uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                      <span>Enviando...</span>
                    </>
                  ) : formData.imagem_url ? (
                    <>
                      <img src={formData.imagem_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                      <span className="text-green-600 font-medium">Imagem anexada ✓</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span>Clique para enviar imagem</span>
                    </>
                  )}
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Link Externo */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Link Externo (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.link_externo}
                    onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
                    placeholder="https://exemplo.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                {/* Link Interno */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Link Interno (Opcional)
                  </label>
                  <select
                    value={formData.link_interno}
                    onChange={(e) => setFormData({ ...formData, link_interno: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  >
                    <option value="">Nenhum</option>
                    {paginasDisponiveis.map((pagina) => (
                      <option key={pagina} value={pagina}>{pagina}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Destaque */}
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <input
                    type="checkbox"
                    checked={formData.destaque}
                    onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400"
                  />
                  <label className="text-sm font-semibold text-gray-900">
                    Marcar como Destaque ⭐
                  </label>
                </div>

                {/* Data de Expiração */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Expira em (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Botões */}
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
                  disabled={criarPostMutation.isPending || editarPostMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {criarPostMutation.isPending || editarPostMutation.isPending
                    ? "Salvando..."
                    : editingPost
                    ? "Salvar Alterações"
                    : "Criar Post"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
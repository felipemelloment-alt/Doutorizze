import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Plus, Upload, ExternalLink, Calendar, Edit, Trash2, Eye } from "lucide-react";

export default function Portfolio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: freelancer } = useQuery({
    queryKey: ["freelancer", user?.id],
    queryFn: async () => {
      const result = await base44.entities.Freelancer.filter({ user_id: user?.id });
      return result[0];
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    link: "",
    date: "",
    client_name: ""
  });

  const portfolioItems = freelancer?.portfolio_items || [];

  const updatePortfolioMutation = useMutation({
    mutationFn: async (newItems) => {
      return await base44.entities.Freelancer.update(freelancer.id, {
        portfolio_items: newItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["freelancer"]);
      toast.success(editingItem ? "Item atualizado!" : "Item adicionado!");
      setModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      images: [],
      link: "",
      date: "",
      client_name: ""
    });
    setEditingItem(null);
  };

  const handleEdit = (item, index) => {
    setEditingItem(index);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      images: item.images || [],
      link: item.link || "",
      date: item.date || "",
      client_name: item.client_name || ""
    });
    setModalOpen(true);
  };

  const handleDelete = (index) => {
    if (!confirm("Excluir este item?")) return;
    const newItems = portfolioItems.filter((_, i) => i !== index);
    updatePortfolioMutation.mutate(newItems);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (formData.images.length >= 5) {
      toast.error("Máximo de 5 imagens por item");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file_url]
      }));
      toast.success("Imagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Preencha título e descrição");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Adicione pelo menos uma imagem");
      return;
    }

    let newItems;
    if (editingItem !== null) {
      newItems = [...portfolioItems];
      newItems[editingItem] = formData;
    } else {
      newItems = [...portfolioItems, formData];
    }

    updatePortfolioMutation.mutate(newItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(createPageUrl("DashboardFreelancer"))}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Meu Portfólio</h1>
              <p className="text-white/80">Mostre seus melhores trabalhos</p>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {portfolioItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Eye className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Nenhum item no portfólio
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione seus melhores trabalhos para atrair clientes
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden group">
                <div className="relative h-48 bg-gray-100">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(item, index)}
                      className="bg-white text-gray-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(index)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {item.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {item.client_name && (
                      <div>Cliente: {item.client_name}</div>
                    )}
                  </div>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-semibold"
                    >
                      Ver projeto
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem !== null ? "Editar Item" : "Adicionar Item ao Portfólio"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Logo para Clínica Odontológica"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Descrição *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projeto, objetivos, desafios e resultados..."
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label>Imagens * (máx. 5)</Label>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-2 mb-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                id="portfolio_image"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="portfolio_image"
                className="cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-xl transition-all"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Clique para adicionar imagem</span>
              </label>
            </div>

            <div>
              <Label>Link do Projeto</Label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Nome do Cliente</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Ex: Clínica XYZ"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updatePortfolioMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                {updatePortfolioMutation.isPending
                  ? "Salvando..."
                  : editingItem !== null
                  ? "Atualizar"
                  : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
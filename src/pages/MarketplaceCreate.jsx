import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Check } from "lucide-react";

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    tipo_mundo: "",
    titulo_item: "",
    descricao: "",
    preco: "",
    localizacao: "",
    telefone_contato: "",
    condicao: "",
    ano_fabricacao: "",
    marca: "",
    fotos: [],
  });

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

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MarketplaceItem.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["marketplaceItems"]);
      toast.success("Anúncio criado com sucesso!");
      navigate(createPageUrl("Marketplace"));
    },
    onError: (error) => {
      toast.error("Erro ao criar anúncio. Tente novamente.");
      console.error(error);
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.fotos.length + files.length > 3) {
      toast.error("Máximo de 3 fotos permitido!");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        fotos: [...formData.fotos, ...uploadedUrls],
      });
      toast.success("Fotos enviadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar fotos. Tente novamente.");
      console.error(error);
    }
    setUploading(false);
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      fotos: formData.fotos.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tipo_mundo || !formData.titulo_item || !formData.preco || !formData.localizacao || !formData.telefone_contato) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    createMutation.mutate({
      ...formData,
      preco: parseFloat(formData.preco),
      ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao) : null,
      anunciante_id: user?.id,
      anunciante_tipo: "DENTISTA", // Ajustar baseado no tipo de usuário
      anunciante_nome: user?.full_name || "Anônimo",
      status: "ATIVO",
      visualizacoes: 0,
      favoritos: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="gradient-yellow-pink py-6 shadow-xl">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-black text-white text-shadow-lg">
            Criar Anúncio
          </h1>
          <p className="text-white font-semibold mt-2">
            Anuncie seu equipamento no marketplace 🚀
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Card className="shadow-xl border-4 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-2xl">Informações do Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo */}
              <div>
                <Label className="text-base font-bold">Categoria *</Label>
                <Select
                  value={formData.tipo_mundo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_mundo: value })
                  }
                >
                  <SelectTrigger className="h-14 rounded-xl border-2 text-lg mt-2">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ODONTOLOGIA">🦷 Odontologia</SelectItem>
                    <SelectItem value="MEDICINA">⚕️ Medicina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Título */}
              <div>
                <Label className="text-base font-bold">Título do Anúncio *</Label>
                <Input
                  placeholder="Ex: Cadeira Odontológica Gnatus"
                  value={formData.titulo_item}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo_item: e.target.value })
                  }
                  className="h-14 text-lg rounded-xl border-2 mt-2"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label className="text-base font-bold">Descrição</Label>
                <Textarea
                  placeholder="Descreva o equipamento, estado de conservação, etc."
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="min-h-32 text-lg rounded-xl border-2 mt-2"
                />
              </div>

              {/* Grid: Preço, Condição */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-bold">Preço (R$) *</Label>
                  <Input
                    type="number"
                    placeholder="14000"
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData({ ...formData, preco: e.target.value })
                    }
                    className="h-14 text-lg rounded-xl border-2 mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-bold">Condição</Label>
                  <Select
                    value={formData.condicao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, condicao: value })
                    }
                  >
                    <SelectTrigger className="h-14 rounded-xl border-2 text-lg mt-2">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOVO">Novo</SelectItem>
                      <SelectItem value="SEMINOVO">Seminovo</SelectItem>
                      <SelectItem value="USADO">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid: Marca, Ano */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-bold">Marca</Label>
                  <Input
                    placeholder="Ex: Gnatus"
                    value={formData.marca}
                    onChange={(e) =>
                      setFormData({ ...formData, marca: e.target.value })
                    }
                    className="h-14 text-lg rounded-xl border-2 mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-bold">Ano de Fabricação</Label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={formData.ano_fabricacao}
                    onChange={(e) =>
                      setFormData({ ...formData, ano_fabricacao: e.target.value })
                    }
                    className="h-14 text-lg rounded-xl border-2 mt-2"
                  />
                </div>
              </div>

              {/* Localização */}
              <div>
                <Label className="text-base font-bold">Localização *</Label>
                <Input
                  placeholder="Cidade - UF (Ex: Goiânia - GO)"
                  value={formData.localizacao}
                  onChange={(e) =>
                    setFormData({ ...formData, localizacao: e.target.value })
                  }
                  className="h-14 text-lg rounded-xl border-2 mt-2"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <Label className="text-base font-bold">WhatsApp *</Label>
                <Input
                  placeholder="62999998888 (apenas números)"
                  value={formData.telefone_contato}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone_contato: e.target.value })
                  }
                  maxLength={11}
                  className="h-14 text-lg rounded-xl border-2 mt-2"
                />
              </div>

              {/* Fotos */}
              <div>
                <Label className="text-base font-bold">Fotos (máximo 3)</Label>
                <div className="mt-2 space-y-4">
                  {/* Preview das fotos */}
                  {formData.fotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {formData.fotos.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-xl overflow-hidden border-4 border-gray-200 group"
                        >
                          <img
                            src={url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  {formData.fotos.length < 3 && (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-yellow-400 transition-colors">
                        {uploading ? (
                          <div className="space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto"></div>
                            <p className="text-gray-600 font-semibold">
                              Enviando fotos...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="text-gray-600 font-semibold">
                              Clique para adicionar fotos
                            </p>
                            <p className="text-sm text-gray-500">
                              {formData.fotos.length}/3 fotos
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="flex-1 h-16 rounded-2xl border-2 font-bold text-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending}
              className="flex-1 h-16 gradient-yellow-pink text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6 mr-2" />
                  Publicar Anúncio
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
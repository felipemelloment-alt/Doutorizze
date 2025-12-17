import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import RadarInterestsModal from "../components/marketplace/RadarInterestsModal";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Check, Users, Radar, Zap } from "lucide-react";

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [radarInterestsModalOpen, setRadarInterestsModalOpen] = useState(false);
  const [matchingInterests, setMatchingInterests] = useState([]);

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
    fotos: []
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

  // Buscar radares ativos
  const { data: allRadars = [] } = useQuery({
    queryKey: ["productRadars"],
    queryFn: async () => {
      return await base44.entities.ProductRadar.filter({ ativo: true });
    }
  });

  // Verificar matches quando o título ou categoria mudar
  useEffect(() => {
    if (formData.titulo_item && formData.tipo_mundo) {
      const matches = allRadars.filter((radar) => {
        const matchCategory = radar.tipo_mundo === formData.tipo_mundo;
        const matchProduct =
        radar.nome_produto?.toLowerCase().includes(formData.titulo_item.toLowerCase()) ||
        formData.titulo_item.toLowerCase().includes(radar.nome_produto?.toLowerCase());
        return matchCategory && matchProduct;
      });
      setMatchingInterests(matches);
    } else {
      setMatchingInterests([]);
    }
  }, [formData.titulo_item, formData.tipo_mundo, allRadars]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MarketplaceItem.create(data);
    },
    onSuccess: async () => {
      // Notificar interessados do radar
      if (matchingInterests.length > 0) {
        try {
          for (const interest of matchingInterests) {
            await base44.entities.Notification.create({
              destinatario_id: interest.interessado_id,
              destinatario_tipo: interest.interessado_tipo,
              tipo: "NOVO_ITEM_MARKETPLACE",
              titulo: `🎯 Produto do seu Radar disponível!`,
              mensagem: `O produto "${formData.titulo_item}" que você estava procurando foi anunciado! Preço: R$ ${formData.preco}`,
              dados_contexto: {
                radar_id: interest.id
              },
              canais_enviados: ["PUSH", "EMAIL"],
              enviada_com_sucesso: true
            });

            // Incrementar contador de notificações
            await base44.entities.ProductRadar.update(interest.id, {
              notificacoes_recebidas: (interest.notificacoes_recebidas || 0) + 1
            });
          }
          toast.success(`✅ ${matchingInterests.length} interessados foram notificados!`);
        } catch (error) {
          console.error("Erro ao notificar interessados:", error);
        }
      }

      queryClient.invalidateQueries(["marketplaceItems"]);
      toast.success("Anúncio criado com sucesso!");
      navigate(createPageUrl("Marketplace"));
    },
    onError: (error) => {
      toast.error("Erro ao criar anúncio. Tente novamente.");
      console.error(error);
    }
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
        fotos: [...formData.fotos, ...uploadedUrls]
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
      fotos: formData.fotos.filter((_, i) => i !== index)
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
      anunciante_tipo: "DENTISTA",
      anunciante_nome: user?.full_name || "Anônimo",
      status: "ATIVO",
      visualizacoes: 0,
      favoritos: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="gradient-yellow-pink py-8 md:py-12 shadow-xl">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="text-white hover:bg-white/20 mb-6 font-bold">

            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Marketplace
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <Upload className="w-10 h-10 text-pink-600" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-[#F9B500] text-shadow-lg whitespace-nowrap">
                CRIAR ANÚNCIO
              </h1>
              <p className="text-white text-base md:text-lg mt-2 font-bold">
                Anuncie seu equipamento no marketplace 🚀
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-4xl">
        {/* Radar Alert */}
        {matchingInterests.length > 0 &&
        <Card className="mb-8 border-4 border-green-400 bg-gradient-to-r from-green-50 to-teal-50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="p-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl shadow-xl flex-shrink-0">
                  <Radar className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="flex-1 w-full min-w-0">
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 break-words">
                    🎯 {matchingInterests.length}{" "}
                    {matchingInterests.length === 1 ? "pessoa está" : "pessoas estão"} procurando
                    este produto!
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 font-bold mb-6">
                    Existem interessados no <span className="text-green-600">Radar de Produtos</span> que serão
                    automaticamente notificados quando você publicar este anúncio.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                    onClick={() => setRadarInterestsModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 px-6 py-4">

                      <Users className="w-5 h-5 mr-2" />
                      Ver Interessados
                    </Button>
                    <Badge className="px-6 py-3 bg-green-500 text-white text-base font-bold rounded-xl shadow-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Notificação automática ao publicar
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        }

        <form onSubmit={handleSubmit}>
          <Card className="shadow-2xl border-4 border-[#F9B500] rounded-3xl overflow-hidden">
            <CardHeader className="p-6 md:p-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-4 border-[#F9B500]">
              <CardTitle className="text-2xl md:text-3xl font-black text-gray-900">📦 Informações do Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 md:p-8">
              {/* Tipo */}
              <div>
                <Label className="text-base font-bold">Categoria *</Label>
                <Select
                  value={formData.tipo_mundo}
                  onValueChange={(value) =>
                  setFormData({ ...formData, tipo_mundo: value })
                  }>

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
                  className="h-14 text-lg rounded-xl border-2 mt-2" />

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
                  className="min-h-32 text-lg rounded-xl border-2 mt-2" />

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
                    className="h-14 text-lg rounded-xl border-2 mt-2" />

                </div>

                <div>
                  <Label className="text-base font-bold">Condição</Label>
                  <Select
                    value={formData.condicao}
                    onValueChange={(value) =>
                    setFormData({ ...formData, condicao: value })
                    }>

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
                    className="h-14 text-lg rounded-xl border-2 mt-2" />

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
                    className="h-14 text-lg rounded-xl border-2 mt-2" />

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
                  className="h-14 text-lg rounded-xl border-2 mt-2" />

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
                  className="h-14 text-lg rounded-xl border-2 mt-2" />

              </div>

              {/* Fotos */}
              <div>
                <Label className="text-base font-bold">Fotos (máximo 3)</Label>
                <div className="mt-2 space-y-4">
                  {/* Preview das fotos */}
                  {formData.fotos.length > 0 &&
                  <div className="grid grid-cols-3 gap-4">
                      {formData.fotos.map((url, index) =>
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border-4 border-gray-200 group">

                          <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover" />

                          <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">

                            <X className="w-4 h-4" />
                          </button>
                        </div>
                    )}
                    </div>
                  }

                  {/* Upload button */}
                  {formData.fotos.length < 3 &&
                  <label className="block">
                      <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading} />

                      <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-yellow-400 transition-colors">
                        {uploading ?
                      <div className="space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto"></div>
                            <p className="text-gray-600 font-semibold">
                              Enviando fotos...
                            </p>
                          </div> :

                      <div className="space-y-3">
                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="text-gray-600 font-semibold">
                              Clique para adicionar fotos
                            </p>
                            <p className="text-sm text-gray-500">
                              {formData.fotos.length}/3 fotos
                            </p>
                          </div>
                      }
                      </div>
                    </label>
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="w-full sm:flex-1 h-14 md:h-16 rounded-2xl border-4 border-gray-200 hover:border-[#F9B500] font-black text-base md:text-lg transition-all">

              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending}
              className="w-full sm:flex-1 h-14 md:h-16 gradient-yellow-pink text-white font-black text-base md:text-lg rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(249,181,0,0.4)] transition-all hover:scale-105 border-0">

              {createMutation.isPending ?
              <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-white mr-2"></div>
                  <span className="font-black">Criando...</span>
                </> :

              <>
                  <Check className="w-6 h-6 mr-2" />
                  Publicar Anúncio
                  {matchingInterests.length > 0 &&
                <Badge className="ml-2 bg-white text-green-600 font-black px-3 py-1 rounded-full">
                      +{matchingInterests.length} 🎯
                    </Badge>
                }
                </>
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Radar Interests Modal */}
      <RadarInterestsModal
        open={radarInterestsModalOpen}
        onOpenChange={setRadarInterestsModalOpen}
        interests={matchingInterests}
        productName={formData.titulo_item} />

    </div>);

}
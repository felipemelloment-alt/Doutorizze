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
import { ArrowLeft, Upload, X, Check, Users, Radar, Zap, Camera, ShoppingBag, MapPin, Phone } from "lucide-react";

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [radarInterestsModalOpen, setRadarInterestsModalOpen] = useState(false);
  const [matchingInterests, setMatchingInterests] = useState([]);
  const [userArea, setUserArea] = useState(null);

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
    const loadUserArea = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Verificar se é profissional
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          const tipo = professionals[0].tipo_profissional;
          setUserArea(tipo === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA");
          setFormData(prev => ({ ...prev, tipo_mundo: tipo === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA" }));
          return;
        }
        
        // Verificar se é clínica
        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (owners.length > 0) {
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          if (units.length > 0) {
            const tipo = units[0].tipo_mundo;
            setUserArea(tipo);
            setFormData(prev => ({ ...prev, tipo_mundo: tipo }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar área do usuário:", error);
      }
    };
    loadUserArea();
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 py-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl("Marketplace"))}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-medium mb-6 px-4">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Card Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 mx-4 mb-6 relative overflow-hidden">
          {/* Decoração */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute top-4 right-8 text-4xl animate-pulse">⚡</div>
          <div className="absolute bottom-4 left-8 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>⚡</div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
              📢
            </div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              Anunciar Equipamento
            </h1>
            <p className="text-white/80">Preencha os dados para publicar seu anúncio</p>
          </div>
        </div>
        {/* Radar Alert */}
        {matchingInterests.length > 0 && (
          <div className="mx-4 mb-6 bg-gradient-to-r from-green-50 to-teal-50 border-4 border-green-300 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl shadow-xl flex-shrink-0">
                <Radar className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  🎯 {matchingInterests.length} {matchingInterests.length === 1 ? "pessoa está" : "pessoas estão"} procurando este produto!
                </h3>
                <p className="text-gray-700 font-semibold mb-4">
                  Existem interessados no Radar de Produtos que serão notificados quando você publicar.
                </p>
                <button
                  type="button"
                  onClick={() => setRadarInterestsModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Ver Interessados
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Seção Fotos */}
          <div className="bg-white rounded-3xl shadow-xl mx-4 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-white text-xl">
                📸
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Fotos do Equipamento</h2>
            </div>
            <div className="p-6">
              {/* Preview das fotos */}
              {formData.fotos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {formData.fotos.map((url, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden relative group border-2 border-gray-200">
                      <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload */}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-yellow-400 hover:bg-yellow-50/50 transition-all cursor-pointer">
                    {uploading ? (
                      <div className="space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto"></div>
                        <p className="text-gray-600 font-semibold">Enviando fotos...</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-6xl text-gray-300 mb-4">📷</div>
                        <p className="text-gray-500 font-medium">Clique ou arraste para adicionar fotos</p>
                        <p className="text-gray-400 text-sm mt-2">Até 3 fotos • JPG ou PNG</p>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Seção Informações */}
          <div className="bg-white rounded-3xl shadow-xl mx-4 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-50 to-red-50 px-6 py-4 border-b border-pink-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center text-white text-xl">
                📋
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Informações do Equipamento</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Título do anúncio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Anúncio *</label>
                <input
                  type="text"
                  placeholder="Ex: Cadeira Odontológica Gnatus G2"
                  value={formData.titulo_item}
                  onChange={(e) => setFormData({ ...formData, titulo_item: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-lg outline-none"
                />
              </div>

              {/* Grid 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
                  {userArea ? (
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 font-bold rounded-xl border-2 border-orange-200">
                        {userArea === "ODONTOLOGIA" ? "🦷 Odontologia" : "⚕️ Medicina"}
                      </span>
                      <span className="text-sm text-gray-500">Sua área de atuação</span>
                    </div>
                  ) : (
                    <Select value={formData.tipo_mundo} onValueChange={(value) => setFormData({ ...formData, tipo_mundo: value })}>
                      <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ODONTOLOGIA">🦷 Odontologia</SelectItem>
                        <SelectItem value="MEDICINA">⚕️ Medicina</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                  <Select value={formData.condicao} onValueChange={(value) => setFormData({ ...formData, condicao: value })}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOVO">Novo</SelectItem>
                      <SelectItem value="SEMINOVO">Seminovo</SelectItem>
                      <SelectItem value="USADO">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Gnatus"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                {/* Ano */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ano de Fabricação</label>
                  <input
                    type="number"
                    placeholder="2020"
                    value={formData.ano_fabricacao}
                    onChange={(e) => setFormData({ ...formData, ano_fabricacao: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  placeholder="Descreva o equipamento, estado de conservação, acessórios inclusos, etc."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 min-h-[150px] resize-none mt-4 outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Seção Preço */}
          <div className="bg-white rounded-3xl shadow-xl mx-4 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-xl">
                💰
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Preço e Condições</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Preço */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preço *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                  <input
                    type="number"
                    placeholder="14000"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-lg outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Localização */}
          <div className="bg-white rounded-3xl shadow-xl mx-4 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white text-xl">
                📍
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Localização</h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade - UF *</label>
                <input
                  type="text"
                  placeholder="Ex: Goiânia - GO"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção Contato */}
          <div className="bg-white rounded-3xl shadow-xl mx-4 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-green-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl">
                📱
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Contato</h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label>
                <input
                  type="text"
                  placeholder="62999998888 (apenas números)"
                  value={formData.telefone_contato}
                  onChange={(e) => setFormData({ ...formData, telefone_contato: e.target.value })}
                  maxLength={11}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse md:flex-row gap-4 px-4 py-6">
            <button
              type="button"
              onClick={() => navigate(createPageUrl("Marketplace"))}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-white"></div>
                  Publicando...
                </>
              ) : (
                <>
                  📢 Publicar Anúncio
                  {matchingInterests.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-white text-green-600 font-black rounded-full text-sm">
                      +{matchingInterests.length} 🎯
                    </span>
                  )}
                </>
              )}
            </button>
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
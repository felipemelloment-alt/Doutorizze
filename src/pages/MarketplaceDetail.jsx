import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  AlertCircle,
} from "lucide-react";

export default function MarketplaceDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

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

  const { data: item, isLoading } = useQuery({
    queryKey: ["marketplaceItem", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const items = await base44.entities.MarketplaceItem.filter({ id: itemId });
      if (items.length > 0) {
        // Incrementar visualizações
        await base44.entities.MarketplaceItem.update(items[0].id, {
          visualizacoes: (items[0].visualizacoes || 0) + 1,
        });
        return items[0];
      }
      return null;
    },
    enabled: !!itemId,
  });

  const handleWhatsAppContact = () => {
    if (!item?.telefone_contato) return;
    const message = encodeURIComponent(
      `Olá! Tenho interesse no item: ${item.titulo_item} - R$ ${formatPrice(
        item.preco
      )}`
    );
    window.open(`https://wa.me/55${item.telefone_contato}?text=${message}`, "_blank");
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: item.titulo_item,
        text: `Confira este item no Marketplace: ${item.titulo_item}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando item...</p>
        </div>
      </div>
    );
  }

  const images = item.fotos && item.fotos.length > 0 ? item.fotos : [];

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
            Voltar ao Marketplace
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="border-4 border-yellow-400 overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="relative w-full h-96 bg-gray-100">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIndex]}
                      alt={item.titulo_item}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-9xl">
                        {item.tipo_mundo === "ODONTOLOGIA" ? "🦷" : "⚕️"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-1 h-24 rounded-xl overflow-hidden border-4 ${
                      selectedImageIndex === idx
                        ? "border-yellow-400"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex gap-3 mb-4">
                <Badge className="bg-purple-100 text-purple-700 border-2 border-purple-300 font-bold text-base px-4 py-2">
                  {item.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odontologia" : "⚕️ Medicina"}
                </Badge>
                {item.condicao && (
                  <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-bold text-base px-4 py-2">
                    {item.condicao === "NOVO" && "Novo"}
                    {item.condicao === "SEMINOVO" && "Seminovo"}
                    {item.condicao === "USADO" && "Usado"}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-black text-gray-900 mb-4">
                {item.titulo_item}
              </h1>

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl p-6 border-4 border-yellow-400 shadow-xl">
                <p className="text-sm text-gray-600 font-semibold mb-2">Preço</p>
                <p className="text-5xl font-black gradient-yellow-pink bg-clip-text text-transparent">
                  {formatPrice(item.preco)}
                </p>
              </div>
            </div>

            {/* Description */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Descrição</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.descricao || "Sem descrição disponível."}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Detalhes</h3>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Localização</p>
                    <p className="text-lg font-bold text-gray-900">{item.localizacao}</p>
                  </div>
                </div>

                {item.marca && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Marca</p>
                      <p className="text-lg font-bold text-gray-900">{item.marca}</p>
                    </div>
                  </div>
                )}

                {item.ano_fabricacao && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Ano</p>
                      <p className="text-lg font-bold text-gray-900">
                        {item.ano_fabricacao}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Visualizações</p>
                    <p className="text-lg font-bold text-gray-900">
                      {item.visualizacoes || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anunciante */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Anunciante</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full gradient-yellow-pink flex items-center justify-center text-white text-2xl font-bold">
                    {item.anunciante_nome?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {item.anunciante_nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.anunciante_tipo === "DENTISTA" && "Dentista"}
                      {item.anunciante_tipo === "MEDICO" && "Médico"}
                      {item.anunciante_tipo === "CLINICA" && "Clínica"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleWhatsAppContact}
                className="w-full h-16 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                TENHO INTERESSE
                <span className="ml-2 text-xl">💬</span>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="h-14 rounded-2xl border-2 font-bold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-2xl border-2 font-bold"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Favoritar
                </Button>
              </div>
            </div>

            {/* Safety Warning */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">
                    Dicas de segurança
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Combine encontros em locais públicos</li>
                    <li>• Verifique o equipamento antes de comprar</li>
                    <li>• Prefira pagamentos seguros</li>
                    <li>• Peça nota fiscal ou documento do produto</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
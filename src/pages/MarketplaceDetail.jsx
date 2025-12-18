import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Flag
} from "lucide-react";
import WhatsAppSafeButton from "@/components/ui/WhatsAppSafeButton";

export default function MarketplaceDetail() {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["marketplaceItem", itemId],
    queryFn: async () => {
      if (!itemId) throw new Error("ID não fornecido");
      
      const items = await base44.entities.MarketplaceItem.filter({ id: itemId });
      
      if (items.length === 0) throw new Error("Item não encontrado");
      
      return items[0];
    },
    enabled: !!itemId,
    retry: 1,
  });

  // Incrementar visualizações
  useEffect(() => {
    if (item?.id) {
      base44.entities.MarketplaceItem.update(item.id, {
        visualizacoes: (item.visualizacoes || 0) + 1,
      }).catch(() => {});
    }
  }, [item?.id]);

  const formatPrice = (price) => {
    if (!price) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };



  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: item?.titulo_item || "Equipamento",
        text: `Confira este item no Marketplace`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado!");
    }
  };

  const nextImage = () => {
    const images = item?.fotos || [];
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = item?.fotos || [];
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-3xl"></div>
            <div className="h-32 bg-gray-200 rounded-3xl"></div>
            <div className="h-64 bg-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!itemId || error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">😕</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Equipamento não encontrado</h2>
          <p className="text-gray-600 mb-6">Este anúncio pode ter sido removido ou não existe.</p>
          <button
            onClick={() => navigate(createPageUrl("Marketplace"))}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:scale-105 transition-all">
            Voltar ao Marketplace
          </button>
        </div>
      </div>
    );
  }

  const images = item?.fotos || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(createPageUrl("Marketplace"))}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Marketplace
        </button>
        <button
          onClick={() => navigate(createPageUrl("Denunciar") + "?tipo=MARKETPLACE&id=" + itemId)}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-medium transition-colors"
          title="Denunciar"
        >
          <Flag className="w-5 h-5" />
          <span className="text-sm">Denunciar</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Galeria de Imagens */}
        <div className="mx-4 mb-6">
          <div className="relative rounded-3xl overflow-hidden bg-gray-100 h-72 md:h-96">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex]}
                  alt={item.titulo_item}
                  className="w-full h-full object-cover"
                />
                
                {/* Setas de navegação */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                  </>
                )}

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full ${
                        selectedImageIndex === idx ? "bg-yellow-400" : "bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                {item.tipo_mundo === "ODONTOLOGIA" ? "🦷" : "⚕️"}
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 ${
                    selectedImageIndex === idx ? "border-yellow-400" : "border-transparent hover:border-yellow-400"
                  } transition-all flex-shrink-0`}>
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações Principais */}
        <div className="px-4 mb-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-4 py-1.5 bg-pink-100 text-pink-700 rounded-full font-semibold text-sm">
              {item.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odontologia" : "⚕️ Medicina"}
            </span>
            {item.condicao && (
              <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                {item.condicao === "NOVO" ? "✨ Novo" : item.condicao === "SEMINOVO" ? "⭐ Seminovo" : "🔧 Usado"}
              </span>
            )}
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
              ✅ Disponível
            </span>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-black text-gray-900 mb-4">{item.titulo_item}</h1>

          {/* Card de Preço */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100 mb-4">
            <p className="text-4xl font-black text-green-600 mb-4">{formatPrice(item.preco)}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                {item.localizacao}
              </div>
              {item.marca && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Tag className="w-4 h-4" />
                  {item.marca} {item.ano_fabricacao && `• ${item.ano_fabricacao}`}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <Eye className="w-4 h-4" />
                {item.visualizacoes || 0} visualizações
              </div>
            </div>
          </div>
        </div>

        {/* Seção Descrição */}
        <div className="bg-white rounded-3xl shadow-xl mx-4 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-white text-xl">
              📋
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Descrição</h2>
          </div>
          <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
            {item.descricao || "Sem descrição disponível."}
          </div>
        </div>

        {/* Seção Anunciante */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 mx-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl text-white font-bold">
              {item.anunciante_nome?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">{item.anunciante_nome || "Anunciante"}</p>
              <p className="text-gray-600 text-sm mb-1">
                {item.anunciante_tipo === "DENTISTA" && "Dentista"}
                {item.anunciante_tipo === "MEDICO" && "Médico"}
                {item.anunciante_tipo === "CLINICA" && "Clínica"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação Fixos */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
        <div className="max-w-6xl mx-auto">
          {/* WhatsApp principal */}
          <WhatsAppSafeButton
            phone={item.telefone_contato}
            message={`Olá! Tenho interesse no item: ${item.titulo_item || 'equipamento'} - ${formatPrice(item.preco)}`}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg mb-3 transition-all"
          >
            💬 Chamar no WhatsApp
          </WhatsAppSafeButton>

          {/* Grid 2 botões */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert("Funcionalidade em breve!")}
              className="py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-red-300 hover:text-red-500 transition-all">
              <Heart className="w-5 h-5" />
              Favoritar
            </button>
            <button
              onClick={handleShare}
              className="py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-500 transition-all">
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
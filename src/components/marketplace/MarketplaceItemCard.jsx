import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function MarketplaceItemCard({ item, onClick }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const conditionColors = {
    NOVO: "bg-green-100 text-green-700 border-green-300",
    SEMINOVO: "bg-blue-100 text-blue-700 border-blue-300",
    USADO: "bg-orange-100 text-orange-700 border-orange-300",
  };

  const conditionLabels = {
    NOVO: "Novo",
    SEMINOVO: "Seminovo",
    USADO: "Usado",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        className="profile-card-vibrant cursor-pointer overflow-hidden h-full"
        onClick={() => onClick?.(item)}
      >
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200">
            {item.fotos && item.fotos.length > 0 ? (
              <img
                src={item.fotos[0]}
                alt={item.titulo_item}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-300 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">
                      {item.tipo_mundo === "ODONTOLOGIA" ? "🦷" : "⚕️"}
                    </span>
                  </div>
                  <p className="text-gray-400 font-semibold">Sem imagem</p>
                </div>
              </div>
            )}

            {/* Badges no topo da imagem */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {item.condicao && (
                <Badge
                  className={`${
                    conditionColors[item.condicao]
                  } border-2 font-bold`}
                >
                  {conditionLabels[item.condicao]}
                </Badge>
              )}
              {item.tipo_mundo && (
                <Badge className="bg-purple-100 text-purple-700 border-2 border-purple-300 font-bold">
                  {item.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odonto" : "⚕️ Medicina"}
                </Badge>
              )}
            </div>

            {/* Stats no canto superior direito */}
            <div className="absolute top-3 right-3 flex gap-2">
              {item.visualizacoes > 0 && (
                <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-semibold">
                    {item.visualizacoes}
                  </span>
                </div>
              )}
              {item.favoritos > 0 && (
                <div className="bg-pink-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3 text-white fill-white" />
                  <span className="text-xs text-white font-semibold">
                    {item.favoritos}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
              {item.titulo_item}
            </h3>

            {/* Price */}
            <div className="mb-3">
              <p className="text-3xl font-black gradient-yellow-pink bg-clip-text text-transparent">
                {formatPrice(item.preco)}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {item.localizacao}
              </span>
            </div>

            {/* Description Preview */}
            {item.descricao && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {item.descricao}
              </p>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
              {item.marca && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Marca:</span>
                  <span className="text-xs font-bold text-gray-700">
                    {item.marca}
                  </span>
                </div>
              )}
              {item.ano_fabricacao && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">
                    {item.ano_fabricacao}
                  </span>
                </div>
              )}
            </div>

            {/* Anunciante */}
            {item.anunciante_nome && (
              <div className="mt-3 pt-3 border-t-2 border-gray-100">
                <p className="text-xs text-gray-500">Anunciante:</p>
                <p className="text-sm font-bold text-gray-800">
                  {item.anunciante_nome}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
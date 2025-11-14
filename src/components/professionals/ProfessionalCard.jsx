import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Briefcase, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfessionalCard({ professional, type = "DENTISTA", onClick }) {
  const registroLabel = type === "DENTISTA" ? "CRO" : "CRM";
  const registro = type === "DENTISTA" ? professional.numero_cro : professional.numero_crm;
  const ufRegistro = type === "DENTISTA" ? professional.uf_cro : professional.uf_crm;

  const renderStars = (rating = 5) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        } star-rating`}
      />
    ));
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        className="profile-card-vibrant cursor-pointer overflow-hidden"
        onClick={() => onClick?.(professional)}
      >
        <CardContent className="p-6">
          {/* Foto de Perfil */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
                {professional.foto_perfil ? (
                  <img
                    src={professional.foto_perfil}
                    alt={professional.nome_completo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {professional.nome_completo?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Badge de Verificado */}
              {professional.status_cadastro === "APROVADO" && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Nome */}
          <h3 className="text-center font-bold text-lg text-gray-900 mb-1">
            {type === "DENTISTA" ? "Dr." : "Dr."} {professional.nome_completo}
          </h3>

          {/* Registro */}
          <p className="text-center text-sm font-semibold text-gray-600 mb-3">
            {registroLabel}: {ufRegistro} | {registro}
          </p>

          {/* Avaliação */}
          <div className="flex justify-center gap-1 mb-4">
            {renderStars(professional.media_avaliacoes || 5)}
          </div>

          {/* Divisor com gradiente */}
          <div className="h-1 gradient-yellow-pink rounded-full mb-4"></div>

          {/* Cidade de Atendimento */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Cidade de atendimento:
              </p>
              <div className="flex flex-wrap gap-1">
                {professional.cidades_atendimento?.slice(0, 2).map((cidade, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 text-xs"
                  >
                    {cidade}
                  </Badge>
                ))}
                {professional.cidades_atendimento?.length > 2 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                    +{professional.cidades_atendimento.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Especialidade */}
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 mb-1">Especialidade:</p>
              <p className="text-sm font-bold gradient-yellow-pink bg-clip-text text-transparent">
                {professional.especialidade_principal_atual}
              </p>
            </div>
          </div>

          {/* Botão WhatsApp */}
          {professional.telefone_whatsapp && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://wa.me/55${professional.telefone_whatsapp}`,
                    "_blank"
                  );
                }}
                className="whatsapp-button"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
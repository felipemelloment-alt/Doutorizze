import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  Package,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Star,
  CheckCircle,
  Clock,
  MessageCircle,
  ExternalLink
} from "lucide-react";

const tiposLabels = {
  EQUIPAMENTOS: "Equipamentos",
  MATERIAIS: "Materiais",
  SOFTWARE: "Software",
  MOVEIS: "Móveis",
  OUTROS: "Outros"
};

export default function DetalheFornecedor() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const fornId = urlParams.get("id");

  const { data: fornecedor, isLoading } = useQuery({
    queryKey: ["fornecedor", fornId],
    queryFn: async () => {
      const results = await base44.entities.Supplier.filter({ id: fornId });
      return results[0];
    },
    enabled: !!fornId
  });

  const handleWhatsApp = () => {
    if (!fornecedor?.whatsapp) return;
    const numero = fornecedor.whatsapp.replace(/\D/g, "");
    const msg = `Olá! Vi o perfil de ${fornecedor.nome_fantasia} no Doutorizze e gostaria de mais informações.`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!fornecedor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Fornecedor não encontrado</h2>
          <button onClick={() => navigate(createPageUrl("Fornecedores"))} className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl">
            Ver fornecedores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 pt-6 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
      </div>

      {/* Card principal */}
      <div className="px-4 -mt-16 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {/* Logo e nome */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center overflow-hidden">
              {fornecedor.logo_url ? (
                <img src={fornecedor.logo_url} alt={fornecedor.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-10 h-10 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900">{fornecedor.nome_fantasia}</h1>
                {fornecedor.status_cadastro === "APROVADO" && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-gray-500 text-sm">{fornecedor.razao_social}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {fornecedor.tipo_produtos?.slice(0, 3).map((tipo, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    {tiposLabels[tipo]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Avaliação */}
          {fornecedor.media_avaliacoes > 0 && (
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= fornecedor.media_avaliacoes ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="font-bold text-gray-900">{fornecedor.media_avaliacoes.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({fornecedor.total_avaliacoes} avaliações)</span>
            </div>
          )}

          {/* Fotos do Local */}
          {fornecedor.fotos_local?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Fotos do Estabelecimento</h3>
              <div className="grid grid-cols-2 gap-3">
                {fornecedor.fotos_local.slice(0, 4).map((foto, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-gray-900">Informações</h3>
            
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-orange-500" />
              <span>{fornecedor.endereco}, {fornecedor.numero} - {fornecedor.bairro}, {fornecedor.cidade} - {fornecedor.uf}</span>
            </div>

            {fornecedor.google_maps_link && (
              <a
                href={fornecedor.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
              >
                <MapPin className="w-5 h-5" />
                <span className="underline">Ver no Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {fornecedor.horarios_atendimento && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h4 className="font-bold text-gray-900">Horários de Atendimento</h4>
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(fornecedor.horarios_atendimento).map(([dia, horario]) => (
                    horario && (
                      <div key={dia} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{dia}:</span>
                        <span className="font-semibold text-gray-900">{horario}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {fornecedor.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-orange-500" />
                <a href={`mailto:${fornecedor.email}`} className="hover:text-orange-600">{fornecedor.email}</a>
              </div>
            )}

            {fornecedor.site && (
              <div className="flex items-center gap-3 text-gray-600">
                <Globe className="w-5 h-5 text-orange-500" />
                <a href={fornecedor.site.startsWith("http") ? fornecedor.site : `https://${fornecedor.site}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 flex items-center gap-1">
                  {fornecedor.site}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {fornecedor.instagram && (
              <div className="flex items-center gap-3 text-gray-600">
                <Instagram className="w-5 h-5 text-orange-500" />
                <a href={`https://instagram.com/${fornecedor.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">
                  @{fornecedor.instagram}
                </a>
              </div>
            )}

            {fornecedor.catalogo_produtos_url && (
              <a
                href={fornecedor.catalogo_produtos_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-orange-700 hover:bg-orange-100 transition-all"
              >
                <Package className="w-5 h-5" />
                <span className="font-bold">Ver Catálogo de Produtos</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {fornecedor.telefone_fixo && (
            <a
              href={`tel:${fornecedor.telefone_fixo}`}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <Phone className="w-5 h-5" /> Ligar
            </a>
          )}
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
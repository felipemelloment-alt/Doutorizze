import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  FlaskConical,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  CheckCircle,
  Package,
  User,
  MessageCircle
} from "lucide-react";

const tiposLabels = {
  PROTESE_DENTARIA: "Prótese Dentária",
  ANALISES_CLINICAS: "Análises Clínicas",
  IMAGEM: "Diagnóstico por Imagem",
  PATOLOGIA: "Patologia",
  OUTRO: "Outro"
};

export default function DetalheLaboratorio() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const labId = urlParams.get("id");

  const { data: laboratorio, isLoading } = useQuery({
    queryKey: ["laboratorio", labId],
    queryFn: async () => {
      const results = await base44.entities.Laboratorio.filter({ id: labId });
      return results[0];
    },
    enabled: !!labId
  });

  const handleWhatsApp = () => {
    if (!laboratorio?.whatsapp) return;
    const numero = laboratorio.whatsapp.replace(/\D/g, "");
    const msg = `Olá! Vi o perfil do ${laboratorio.nome_fantasia} no Doutorizze e gostaria de mais informações.`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!laboratorio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Laboratório não encontrado</h2>
          <button onClick={() => navigate(createPageUrl("Laboratorios"))} className="mt-4 px-6 py-3 bg-teal-500 text-white font-bold rounded-xl">
            Ver laboratórios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 pt-6 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
      </div>

      {/* Card principal */}
      <div className="px-4 -mt-16 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {/* Logo e nome */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center overflow-hidden">
              {laboratorio.logo_url ? (
                <img src={laboratorio.logo_url} alt={laboratorio.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                <FlaskConical className="w-10 h-10 text-teal-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900">{laboratorio.nome_fantasia}</h1>
                {laboratorio.status_cadastro === "APROVADO" && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-gray-500 text-sm">{laboratorio.razao_social}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                  {tiposLabels[laboratorio.tipo_laboratorio]}
                </span>
              </div>
            </div>
          </div>

          {/* Avaliação */}
          {laboratorio.media_avaliacoes > 0 && (
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= laboratorio.media_avaliacoes ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="font-bold text-gray-900">{laboratorio.media_avaliacoes.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({laboratorio.total_avaliacoes} avaliações)</span>
            </div>
          )}

          {/* Descrição */}
          {laboratorio.descricao && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">Sobre</h3>
              <p className="text-gray-600">{laboratorio.descricao}</p>
            </div>
          )}

          {/* Serviços */}
          {laboratorio.servicos_oferecidos?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-500" /> Serviços
              </h3>
              <div className="flex flex-wrap gap-2">
                {laboratorio.servicos_oferecidos.map((servico, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {servico}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-gray-900">Informações</h3>
            
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-teal-500" />
              <span>{laboratorio.endereco}, {laboratorio.numero} - {laboratorio.bairro}, {laboratorio.cidade} - {laboratorio.uf}</span>
            </div>

            {laboratorio.horario_funcionamento && (
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5 text-teal-500" />
                <span>{laboratorio.horario_funcionamento}</span>
              </div>
            )}

            {laboratorio.prazo_entrega_medio && (
              <div className="flex items-center gap-3 text-gray-600">
                <Package className="w-5 h-5 text-teal-500" />
                <span>Prazo médio: {laboratorio.prazo_entrega_medio}</span>
              </div>
            )}

            {laboratorio.nome_responsavel && (
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-5 h-5 text-teal-500" />
                <span>Resp. Técnico: {laboratorio.nome_responsavel} {laboratorio.registro_responsavel && `(${laboratorio.registro_responsavel})`}</span>
              </div>
            )}

            {laboratorio.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-teal-500" />
                <a href={`mailto:${laboratorio.email}`} className="hover:text-teal-600">{laboratorio.email}</a>
              </div>
            )}

            {laboratorio.site && (
              <div className="flex items-center gap-3 text-gray-600">
                <Globe className="w-5 h-5 text-teal-500" />
                <a href={laboratorio.site.startsWith("http") ? laboratorio.site : `https://${laboratorio.site}`} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">
                  {laboratorio.site}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {laboratorio.telefone && (
            <a
              href={`tel:${laboratorio.telefone}`}
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
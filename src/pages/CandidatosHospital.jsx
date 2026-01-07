import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Briefcase, Phone } from "lucide-react";
import { toast } from "sonner";

export default function CandidatosHospital() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const vagaId = urlParams.get("id");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  const { data: vaga, isLoading: loadingVaga } = useQuery({
    queryKey: ["job", vagaId],
    queryFn: async () => {
      const result = await base44.entities.Job.filter({ id: vagaId });
      return result[0] || null;
    },
    enabled: !!vagaId
  });

  const { data: candidatos = [], isLoading: loadingCandidatos } = useQuery({
    queryKey: ["candidatos", vagaId],
    queryFn: async () => {
      const matches = await base44.entities.JobMatch.filter({ job_id: vagaId });
      
      // Buscar dados completos dos profissionais
      const profIds = matches.map(m => m.professional_id);
      const profPromises = profIds.map(id => 
        base44.entities.Professional.filter({ id }).then(res => res[0])
      );
      const professionals = await Promise.all(profPromises);
      
      // Combinar match com professional
      return matches.map((match, index) => ({
        ...match,
        professional: professionals[index]
      })).filter(c => c.professional);
    },
    enabled: !!vagaId
  });

  if (loadingVaga || !vaga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 py-6 mb-6">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white font-bold mb-4">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-white">Candidatos - {vaga.titulo}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="text-2xl font-black text-gray-900 mb-6">
            {candidatos.length} Candidato{candidatos.length !== 1 ? 's' : ''}
          </h3>

          {candidatos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 font-medium">Nenhum candidato ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidatos.map((candidato) => {
                const prof = candidato.professional;
                
                return (
                  <div key={candidato.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {prof.nome_completo?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg text-gray-900">{prof.nome_completo}</h4>
                          {candidato.match_type === "SUPER_JOB" && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 font-bold rounded text-xs">
                              ⚡ Match Perfeito
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {prof.especialidade_principal} • {prof.tempo_formado_anos} anos de formado
                        </p>

                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-gray-900">{prof.media_avaliacoes?.toFixed(1) || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">Score: {candidato.match_score}/4</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600">{prof.total_contratacoes || 0} contratações</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/55${prof.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                          >
                            <Phone className="w-4 h-4" />
                            WhatsApp
                          </a>
                          <button 
                            onClick={() => navigate(createPageUrl("VerProfissional") + "?id=" + prof.id)}
                            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
                          >
                            Ver Perfil Completo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
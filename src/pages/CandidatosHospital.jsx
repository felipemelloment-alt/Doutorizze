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
      return matches;
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
              {candidatos.map((match) => (
                <div key={match.id} className="border-2 border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">Candidato #{match.professional_id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">Score: {match.match_score}/4</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
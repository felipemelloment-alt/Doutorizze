import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw, Zap, Star, TrendingUp } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";

export default function TestJobMatch() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { userWorld, isAdmin } = useUserRole();

  // Buscar todos os matches
  const { data: matches = [], isLoading, refetch } = useQuery({
    queryKey: ["jobMatches"],
    queryFn: async () => {
      try {
        return await base44.entities.JobMatch.list("-created_date");
      } catch (error) {
        console.error("Erro ao buscar matches:", error);
        toast.error("Erro ao carregar matches");
        return [];
      }
    }
  });

  const simularMatch = async () => {
    setLoading(true);
    try {
      // Filter jobs by world
      const tipoProfissional = userWorld === "ODONTOLOGIA" ? "DENTISTA" :
                               userWorld === "MEDICINA" ? "MEDICO" : null;

      let vagasFilter = { status: "ABERTO" };
      if (tipoProfissional) {
        vagasFilter.tipo_profissional = tipoProfissional;
      }

      const vagas = await base44.entities.Job.filter(vagasFilter);

      // Filter professionals by world
      let profFilter = {
        status_cadastro: "APROVADO",
        new_jobs_ativo: true
      };
      if (tipoProfissional) {
        profFilter.tipo_profissional = tipoProfissional;
      }

      const profissionais = await base44.entities.Professional.filter(profFilter);

      if (vagas.length === 0) {
        toast.error("❌ Nenhuma vaga ABERTA encontrada. Crie uma vaga primeiro!");
        setLoading(false);
        return;
      }

      if (profissionais.length === 0) {
        toast.error("❌ Nenhum profissional encontrado. Crie um profissional primeiro!");
        setLoading(false);
        return;
      }

      const vaga = vagas[0];
      const profissional = profissionais[0];

      // Calcular score de matching
      let score = 0;
      let match_cidade = false;
      let match_especialidade = false;
      let match_dias = false;
      let match_tempo_formado = false;

      // Verificar cidade
      if (profissional.cidades_atendimento?.some(c => c.includes(vaga.cidade))) {
        score++;
        match_cidade = true;
      }

      // Verificar especialidade
      if (vaga.especialidades_aceitas?.includes(profissional.especialidade_principal)) {
        score++;
        match_especialidade = true;
      }

      // Verificar dias
      if (vaga.dias_semana?.some(d => profissional.dias_semana_disponiveis?.includes(d))) {
        score++;
        match_dias = true;
      }

      // Verificar tempo formado
      if (profissional.tempo_formado_anos >= (vaga.tempo_minimo_formado || 0)) {
        score++;
        match_tempo_formado = true;
      }

      // Determinar tipo de match
      let matchType;
      if (score === 4) {
        matchType = "SUPER_JOB";
      } else if (score === 3) {
        matchType = "SEMELHANTE";
      } else {
        matchType = "OUTROS";
      }

      // Check if match already exists
      const existingMatch = await base44.entities.JobMatch.filter({
        job_id: vaga.id,
        professional_id: profissional.id
      });

      if (existingMatch.length > 0) {
        toast.warning("⚠️ A match already exists between this job and professional!");
        setLoading(false);
        return;
      }

      // Criar match
      await base44.entities.JobMatch.create({
        job_id: vaga.id,
        professional_id: profissional.id,
        match_score: score,
        match_type: matchType,
        match_cidade,
        match_especialidade,
        match_dias,
        match_tempo_formado,
        status_candidatura: "MATCH_AUTOMATICO",
        notificacao_app_enviada: matchType === "SUPER_JOB",
        notificacao_whatsapp_enviada: false
      });

      toast.success(`✅ Match criado! Score: ${score}/4 - ${matchType}`);
      queryClient.invalidateQueries(["jobMatches"]);
    } catch (error) {
      console.error("Erro ao simular match:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  const getMatchIcon = (type) => {
    switch (type) {
      case "SUPER_JOB":
        return <Zap className="w-5 h-5" />;
      case "SEMELHANTE":
        return <Star className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SEÇÃO 1 - Simular Match */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Simular Matching
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">
              Isso vai pegar a primeira vaga ABERTA e o primeiro profissional APROVADO 
              e calcular o score de matching baseado em: cidade, especialidade, dias e tempo de formado.
            </p>
            <Button
              onClick={simularMatch}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Simulando..." : "Simular Match"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Matches */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Matches ({matches.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum match ainda. Simule um!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "24px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* HEADER */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <div style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...(match.match_type === "SUPER_JOB" && { background: "#FEF3C7", color: "#B7791F" }),
                          ...(match.match_type === "SEMELHANTE" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(match.match_type === "OUTROS" && { background: "#F3F4F6", color: "#6B7280" })
                        }}>
                          {getMatchIcon(match.match_type)}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#2D3748",
                            margin: "0 0 4px 0"
                          }}>
                            {match.match_type}
                          </h3>
                          <p style={{
                            fontSize: "14px",
                            color: "#718096",
                            margin: 0
                          }}>
                            Score: {match.match_score}/4
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {/* Status */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(match.status_candidatura === "MATCH_AUTOMATICO" && { background: "#F3F4F6", color: "#4B5563" }),
                          ...(match.status_candidatura === "CANDIDATOU" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(match.status_candidatura === "VISUALIZADO" && { background: "#FEF3C7", color: "#B7791F" }),
                          ...(match.status_candidatura === "CONTATADO" && { background: "#E0E7FF", color: "#3730A3" }),
                          ...(match.status_candidatura === "CONTRATADO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(match.status_candidatura === "REJEITADO" && { background: "#FEE2E2", color: "#991B1B" })
                        }}>
                          {match.status_candidatura}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* CRITÉRIOS QUE BATERAM */}
                    <div>
                      <p style={{
                        fontSize: "11px",
                        color: "#718096",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        margin: "0 0 8px 0"
                      }}>
                        🎯 CRITÉRIOS
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          ...(match.match_cidade ? 
                            { background: "#D1FAE5", color: "#065F46" } : 
                            { background: "#F3F4F6", color: "#9CA3AF" })
                        }}>
                          {match.match_cidade ? "✓" : "✗"} Cidade
                        </span>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          ...(match.match_especialidade ? 
                            { background: "#D1FAE5", color: "#065F46" } : 
                            { background: "#F3F4F6", color: "#9CA3AF" })
                        }}>
                          {match.match_especialidade ? "✓" : "✗"} Especialidade
                        </span>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          ...(match.match_dias ? 
                            { background: "#D1FAE5", color: "#065F46" } : 
                            { background: "#F3F4F6", color: "#9CA3AF" })
                        }}>
                          {match.match_dias ? "✓" : "✗"} Dias
                        </span>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          ...(match.match_tempo_formado ? 
                            { background: "#D1FAE5", color: "#065F46" } : 
                            { background: "#F3F4F6", color: "#9CA3AF" })
                        }}>
                          {match.match_tempo_formado ? "✓" : "✗"} Tempo Formado
                        </span>
                      </div>
                    </div>

                    {/* NOTIFICAÇÕES */}
                    <div style={{ marginTop: "16px" }}>
                      <p style={{
                        fontSize: "11px",
                        color: "#718096",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        margin: "0 0 8px 0"
                      }}>
                        📬 NOTIFICAÇÕES
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          ...(match.notificacao_app_enviada ? 
                            { background: "#D1FAE5", color: "#065F46" } : 
                            { background: "#F3F4F6", color: "#9CA3AF" })
                        }}>
                          App
                        </span>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          ...(match.notificacao_whatsapp_enviada ? 
                            { background: "#D1FAE5", color: "#065F46" } : 
                            { background: "#F3F4F6", color: "#9CA3AF" })
                        }}>
                          WhatsApp
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
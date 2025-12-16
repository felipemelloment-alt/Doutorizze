import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw, MapPin, DollarSign, Clock, User, Instagram, ExternalLink, Star } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";
import { getEspecialidades, getProfissionalLabel } from "@/components/constants/especialidades";

// Função para formatar WhatsApp
const formatWhatsApp = (whatsapp) => {
  if (!whatsapp) return "";
  return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// Cores das especialidades
const especialidadeCores = {
  "Endodontia": { bg: "#FCE7F3", color: "#9F1239" },
  "Implantodontia": { bg: "#D1FAE5", color: "#065F46" },
  "Ortodontia": { bg: "#DBEAFE", color: "#1E40AF" },
  "Periodontia": { bg: "#FEF3C7", color: "#B7791F" },
  "Clínico Geral": { bg: "#E0F2FE", color: "#075985" },
  "Cirurgia": { bg: "#F3E8FF", color: "#6B21A8" },
  "Protese": { bg: "#FED7AA", color: "#9A3412" },
  "Estética": { bg: "#FCE7F3", color: "#BE185D" }
};

export default function TestJob() {
  const [loading, setLoading] = useState(false);
  const [unitsMap, setUnitsMap] = useState({});
  const queryClient = useQueryClient();
  const { userWorld, isAdmin, loading: loadingRole } = useUserRole();

  // Buscar todas as vagas e suas units relacionadas
  const { data: vagas = [], isLoading, refetch } = useQuery({
    queryKey: ["jobs", userWorld],
    queryFn: async () => {
      try {
        let jobs = await base44.entities.Job.list("-created_date");

        // Filter by world unless admin
        if (userWorld && userWorld !== "AMBOS") {
          const tipoProfissional = userWorld === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";
          jobs = jobs.filter(j => j.tipo_profissional === tipoProfissional);
        }

        // Buscar todas as units relacionadas
        const unitIds = [...new Set(jobs.map(j => j.unit_id).filter(Boolean))];
        const unitsData = {};

        for (const unitId of unitIds) {
          try {
            const units = await base44.entities.CompanyUnit.filter({ id: unitId });
            if (units.length > 0) {
              unitsData[unitId] = units[0];
            }
          } catch (e) {
            console.error("Erro ao buscar unit:", unitId);
          }
        }

        setUnitsMap(unitsData);
        return jobs;
      } catch (error) {
        console.error("Erro ao buscar vagas:", error);
        toast.error("Erro ao carregar vagas");
        return [];
      }
    }
  });

  const criarVagaTeste = async () => {
    setLoading(true);
    try {
      // Buscar ou criar uma unit
      const units = await base44.entities.CompanyUnit.list();
      let unitId;

      if (units.length === 0) {
        // Criar owner primeiro
        const owners = await base44.entities.CompanyOwner.list();
        let ownerId;

        if (owners.length === 0) {
          const user = await base44.auth.me();
          const cpfAleatorio = Math.random().toString().slice(2, 13);
          
          const novoOwner = await base44.entities.CompanyOwner.create({
            user_id: user.id,
            nome_completo: "João Silva (AUTO)",
            cpf: cpfAleatorio,
            whatsapp: "62999887766",
            email: "owner@teste.com",
            status_cadastro: "APROVADO"
          });
          ownerId = novoOwner.id;
        } else {
          ownerId = owners[0].id;
        }

        // Criar unit
        const cnpjAleatorio = Math.random().toString().slice(2, 16);
        
        const novaUnit = await base44.entities.CompanyUnit.create({
          owner_id: ownerId,
          razao_social: "Clínica Teste LTDA",
          nome_fantasia: "Clínica Teste",
          cnpj: cnpjAleatorio,
          tipo_empresa: "CLINICA",
          tipo_mundo: "ODONTOLOGIA",
          whatsapp: "62999998888",
          email: "clinica@teste.com",
          cidade: "Goiânia",
          uf: "GO",
          status_cadastro: "APROVADO",
          ativo: true
        });
        unitId = novaUnit.id;
      } else {
        unitId = units[0].id;
      }

      // Criar vaga
      const expiraEm30Dias = new Date();
      expiraEm30Dias.setDate(expiraEm30Dias.getDate() + 30);

      await base44.entities.Job.create({
        unit_id: unitId,
        titulo: "Implantodontista P/ Goiânia",
        descricao: "Buscamos implantodontista experiente para clínica moderna.",
        tipo_vaga: "FIXO",
        tipo_profissional: "DENTISTA",
        especialidades_aceitas: ["Implantodontia", "Endodontia"],
        tempo_minimo_formado: 2,
        exige_experiencia: true,
        tempo_experiencia_minimo: 2,
        dias_semana: ["SEG", "TER", "QUA"],
        selecao_dias: "ESPECIFICOS",
        cidade: "Goiânia",
        uf: "GO",
        valor_proposto: 800,
        tipo_remuneracao: "DIARIA",
        horario_inicio: "08:00",
        horario_fim: "18:00",
        falar_com: "João Carlos",
        instagram_clinica: "@clinicasorriso",
        status: "ABERTO",
        total_candidatos: 0,
        total_visualizacoes: 0,
        expires_at: expiraEm30Dias.toISOString()
      });

      toast.success("✅ Vaga criada com sucesso!");
      queryClient.invalidateQueries(["jobs"]);
    } catch (error) {
      console.error("Erro ao criar vaga:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SEÇÃO 1 - Criar Vaga */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Criar Vaga de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={criarVagaTeste}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Criando..." : "Criar Vaga de Teste"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Vagas */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Vagas {userWorld === "ODONTOLOGIA" ? "Odontológicas" : userWorld === "MEDICINA" ? "Médicas" : ""} ({vagas.length})
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
                <p className="text-gray-600 mt-4">Carregando vagas...</p>
              </div>
            ) : vagas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma vaga cadastrada ainda</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {vagas.map((vaga) => {
                  const unit = unitsMap[vaga.unit_id];
                  return (
                  <div
                    key={vaga.id}
                    style={{
                      background: "#FFFFFF",
                      border: "2px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "20px",
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
                    {/* NOVO HEADER */}
                    <div style={{ marginBottom: "16px" }}>
                      {/* Badge CONTRATA-SE + Especialidades */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#D1FAE5",
                          color: "#065F46",
                          textTransform: "uppercase"
                        }}>
                          CONTRATA-SE
                        </span>
                        {vaga.especialidades_aceitas && vaga.especialidades_aceitas.map((esp, idx) => {
                          const cores = especialidadeCores[esp] || { bg: "#F3F4F6", color: "#4B5563" };
                          return (
                            <span key={idx} style={{
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: cores.bg,
                              color: cores.color,
                              textTransform: "uppercase"
                            }}>
                              {esp}
                            </span>
                          );
                        })}
                      </div>

                      {/* Título */}
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 6px 0"
                      }}>
                        {vaga.titulo}
                      </h3>

                      {/* Nome da Clínica */}
                      <p style={{
                        fontSize: "14px",
                        color: "#718096",
                        margin: "0 0 8px 0"
                      }}>
                        {unit?.nome_fantasia || "Clínica"}
                      </p>

                      {/* Avaliações */}
                      {unit?.total_avaliacoes > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Star className="w-4 h-4" style={{ color: "#F9B500", fill: "#F9B500" }} />
                          <span style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#2D3748"
                          }}>
                            {(unit.media_avaliacoes || 0).toFixed(1)}
                          </span>
                          <span style={{
                            fontSize: "12px",
                            color: "#718096"
                          }}>
                            ({unit.total_avaliacoes} {unit.total_avaliacoes === 1 ? "avaliação" : "avaliações"})
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "12px 0" }} />

                    {/* CORPO DO CARD */}
                    <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
                      {/* 1. Endereço */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📍 ENDEREÇO:</strong>{" "}
                        <span style={{ color: "#2D3748", fontWeight: 500 }}>
                          {unit?.endereco ? (
                            `${unit.endereco}, ${unit.numero || "S/N"} - ${unit.bairro || ""}, ${unit.cidade} - ${unit.uf}`
                          ) : (
                            `${vaga.cidade} - ${vaga.uf}`
                          )}
                        </span>
                      </div>

                      {/* 2. Google Maps */}
                      {unit?.google_maps_link && (
                        <div style={{ marginBottom: "8px" }}>
                          <a
                            href={unit.google_maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "#0B95DA",
                              textDecoration: "none",
                              fontWeight: 600
                            }}
                          >
                            🗺️ Ver no Google Maps
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* 3. WhatsApp */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📱 WHATSAPP:</strong>{" "}
                        <a
                          href={`https://wa.me/55${unit?.whatsapp || ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#25D366",
                            textDecoration: "none",
                            fontWeight: 600
                          }}
                        >
                          {formatWhatsApp(unit?.whatsapp || "")}
                        </a>
                      </div>

                      {/* 4. Falar com */}
                      {vaga.falar_com && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong style={{ color: "#718096" }}>👤 FALAR COM:</strong>{" "}
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            {vaga.falar_com}
                          </span>
                        </div>
                      )}

                      {/* 5. Valor */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>💰 VALOR:</strong>{" "}
                        {vaga.tipo_remuneracao === "A_COMBINAR" ? (
                          <span style={{ color: "#2D3748", fontWeight: 600 }}>
                            A Combinar
                          </span>
                        ) : vaga.valor_proposto ? (
                          <span style={{ color: "#065F46", fontWeight: 700 }}>
                            R$ {vaga.valor_proposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            {vaga.tipo_remuneracao === "DIARIA" && "/dia"}
                            {vaga.tipo_remuneracao === "FIXO" && "/mês"}
                            {vaga.tipo_remuneracao === "PORCENTAGEM" && "% produção"}
                          </span>
                        ) : (
                          <span style={{ color: "#A0AEC0" }}>Não informado</span>
                        )}
                      </div>

                      {/* 6. Dias */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📅 DIAS:</strong>{" "}
                        {vaga.selecao_dias === "SEMANA_TODA" ? (
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            Semana Toda
                          </span>
                        ) : vaga.selecao_dias === "MES_TODO" ? (
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            Mês Todo
                          </span>
                        ) : vaga.dias_semana && vaga.dias_semana.length > 0 ? (
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            {vaga.dias_semana.map((dia, idx) => (
                              <span key={idx}>
                                {dia === "SEG" && "Segunda"}
                                {dia === "TER" && "Terça"}
                                {dia === "QUA" && "Quarta"}
                                {dia === "QUI" && "Quinta"}
                                {dia === "SEX" && "Sexta"}
                                {dia === "SAB" && "Sábado"}
                                {dia === "DOM" && "Domingo"}
                                {idx < vaga.dias_semana.length - 1 && " | "}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span style={{ color: "#A0AEC0" }}>Não informado</span>
                        )}
                      </div>

                      {/* 7. Horário */}
                      {(vaga.horario_inicio || vaga.horario_fim) && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong style={{ color: "#718096" }}>⏰ HORÁRIO:</strong>{" "}
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            {vaga.horario_inicio || "00:00"} às {vaga.horario_fim || "00:00"}
                          </span>
                        </div>
                      )}

                      {/* 8. Experiência */}
                      {vaga.exige_experiencia && vaga.tempo_experiencia_minimo > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong style={{ color: "#718096" }}>🎓 EXPERIÊNCIA:</strong>{" "}
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            Mínimo {vaga.tempo_experiencia_minimo} {vaga.tempo_experiencia_minimo === 1 ? "ano" : "anos"}
                          </span>
                        </div>
                      )}

                      {/* 9. Instagram */}
                      {vaga.instagram_clinica && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong style={{ color: "#718096" }}>📸 INSTAGRAM:</strong>{" "}
                          <a
                            href={`https://instagram.com/${vaga.instagram_clinica.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#E4405F",
                              textDecoration: "none",
                              fontWeight: 600
                            }}
                          >
                            {vaga.instagram_clinica}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
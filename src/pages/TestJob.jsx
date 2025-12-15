import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw, MapPin, DollarSign } from "lucide-react";

export default function TestJob() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar todas as vagas
  const { data: vagas = [], isLoading, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      try {
        return await base44.entities.Job.list("-created_date");
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
        titulo: "Dentista para Plantão de Final de Semana",
        descricao: "Buscamos dentista experiente para plantões aos finais de semana.",
        tipo_vaga: "PLANTAO",
        tipo_profissional: "DENTISTA",
        especialidades_aceitas: ["Clínico Geral", "Endodontia"],
        tempo_minimo_formado: 2,
        dias_semana: ["SAB", "DOM"],
        cidade: "Goiânia",
        uf: "GO",
        valor_proposto: 800,
        tipo_remuneracao: "DIA",
        horario_inicio: "08:00",
        horario_fim: "18:00",
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
                Lista de Vagas ({vagas.length})
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
                {vagas.map((vaga) => (
                  <div
                    key={vaga.id}
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
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 8px 0"
                      }}>
                        {vaga.titulo}
                      </h3>

                      {vaga.descricao && (
                        <p style={{
                          fontSize: "14px",
                          color: "#718096",
                          lineHeight: 1.5,
                          margin: "0 0 12px 0",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        }}>
                          {vaga.descricao}
                        </p>
                      )}

                      {/* Badges */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {/* Status */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(vaga.status === "ABERTO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(vaga.status === "PAUSADO" && { background: "#FEF3C7", color: "#B7791F" }),
                          ...(vaga.status === "PREENCHIDO" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(vaga.status === "CANCELADO" && { background: "#FEE2E2", color: "#991B1B" }),
                          ...(vaga.status === "RASCUNHO" && { background: "#F3F4F6", color: "#4B5563" })
                        }}>
                          {vaga.status}
                        </span>

                        {/* Tipo Vaga */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(vaga.tipo_vaga === "PLANTAO" && { background: "#FED7AA", color: "#9A3412" }),
                          ...(vaga.tipo_vaga === "SUBSTITUICAO" && { background: "#FEF3C7", color: "#B7791F" }),
                          ...(vaga.tipo_vaga === "FIXO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(vaga.tipo_vaga === "TEMPORARIO" && { background: "#F3E8FF", color: "#6B21A8" })
                        }}>
                          {vaga.tipo_vaga}
                        </span>

                        {/* Tipo Profissional */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(vaga.tipo_profissional === "DENTISTA" && { background: "#FCE7F3", color: "#9F1239" }),
                          ...(vaga.tipo_profissional === "MEDICO" && { background: "#CCFBF1", color: "#115E59" })
                        }}>
                          {vaga.tipo_profissional}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* LOCALIZAÇÃO */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <MapPin className="w-4 h-4" style={{ color: "#718096" }} />
                      <p style={{
                        fontSize: "14px",
                        color: "#2D3748",
                        fontWeight: 500,
                        margin: 0
                      }}>
                        {vaga.cidade} - {vaga.uf}
                      </p>
                    </div>

                    {/* DIAS DA SEMANA */}
                    {vaga.dias_semana && vaga.dias_semana.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 8px 0"
                        }}>
                          📅 DIAS
                        </p>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {vaga.dias_semana.map((dia, idx) => (
                            <div key={idx} style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                              ...(dia === "SEG" && { background: "#DBEAFE", color: "#1E40AF" }),
                              ...(dia === "TER" && { background: "#FCE7F3", color: "#9F1239" }),
                              ...(dia === "QUA" && { background: "#D1FAE5", color: "#065F46" }),
                              ...(dia === "QUI" && { background: "#FEF3C7", color: "#B7791F" }),
                              ...(dia === "SEX" && { background: "#F3E8FF", color: "#6B21A8" }),
                              ...(dia === "SAB" && { background: "#FED7AA", color: "#9A3412" }),
                              ...(dia === "DOM" && { background: "#FEE2E2", color: "#991B1B" })
                            }}>
                              {dia[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* VALOR */}
                    {vaga.valor_proposto && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <DollarSign className="w-4 h-4" style={{ color: "#065F46" }} />
                        <p style={{
                          fontSize: "16px",
                          color: "#065F46",
                          fontWeight: 700,
                          margin: 0
                        }}>
                          R$ {vaga.valor_proposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <span style={{ fontSize: "12px", color: "#718096", marginLeft: "4px" }}>
                            /{vaga.tipo_remuneracao?.toLowerCase()}
                          </span>
                        </p>
                      </div>
                    )}
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
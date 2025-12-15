import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw, MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

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
      // Buscar ou criar uma empresa
      const empresas = await base44.entities.Company.list();
      let empresaId;

      if (empresas.length === 0) {
        const user = await base44.auth.me();
        const cnpjAleatorio = Math.random().toString().slice(2, 16);
        
        const novaEmpresa = await base44.entities.Company.create({
          user_id: user.id,
          razao_social: "Clínica Teste LTDA",
          nome_fantasia: "Clínica Teste",
          cnpj: cnpjAleatorio,
          tipo_empresa: "CLINICA",
          tipo_mundo: "ODONTOLOGIA",
          whatsapp: "62999998888",
          email: "teste@clinica.com",
          cidade: "Goiânia",
          uf: "GO",
          endereco_completo: "Rua Teste, 123",
          status_cadastro: "APROVADO"
        });
        empresaId = novaEmpresa.id;
      } else {
        empresaId = empresas[0].id;
      }

      // Criar vaga de teste
      const expiraEm30Dias = new Date();
      expiraEm30Dias.setDate(expiraEm30Dias.getDate() + 30);

      await base44.entities.Job.create({
        company_id: empresaId,
        titulo: "Dentista para Plantão de Final de Semana",
        descricao: "Buscamos dentista experiente para plantões aos finais de semana em nossa clínica. Ambiente agradável, equipe colaborativa e ótima remuneração.",
        tipo_vaga: "PLANTAO",
        tipo_mundo: "ODONTOLOGIA",
        especialidades_aceitas: ["Clínico Geral", "Endodontia", "Periodontia"],
        cidade: "Goiânia",
        uf: "GO",
        dias_semana: ["SAB", "DOM"],
        tempo_minimo_formado: 2,
        valor_proposto: 800,
        tipo_remuneracao: "DIA",
        status: "ABERTO",
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
                    {/* SEÇÃO 1: HEADER (TÍTULO + BADGES) */}
                    <div style={{ marginBottom: "16px" }}>
                      {/* Título */}
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 8px 0"
                      }}>
                        {vaga.titulo}
                      </h3>

                      {/* Descrição */}
                      {vaga.descricao && (
                        <p style={{
                          fontSize: "14px",
                          color: "#718096",
                          lineHeight: 1.6,
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
                        {/* Badge Status */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(vaga.status === "ABERTO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(vaga.status === "PREENCHIDO" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(vaga.status === "CANCELADO" && { background: "#FEE2E2", color: "#991B1B" })
                        }}>
                          {vaga.status}
                        </span>

                        {/* Badge Tipo Vaga */}
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

                        {/* Badge Tipo Mundo */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(vaga.tipo_mundo === "ODONTOLOGIA" && { background: "#FCE7F3", color: "#9F1239" }),
                          ...(vaga.tipo_mundo === "MEDICINA" && { background: "#CCFBF1", color: "#115E59" })
                        }}>
                          {vaga.tipo_mundo}
                        </span>
                      </div>
                    </div>

                    {/* Separador */}
                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* SEÇÃO 2: LOCALIZAÇÃO E DIAS */}
                    <div style={{ marginBottom: "16px" }}>
                      {/* Localização */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
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

                      {/* Dias da Semana */}
                      {vaga.dias_semana && vaga.dias_semana.length > 0 && (
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 8px 0"
                          }}>
                            📅 DIAS NECESSÁRIOS
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
                                {dia === "SEG" && "S"}
                                {dia === "TER" && "T"}
                                {dia === "QUA" && "Q"}
                                {dia === "QUI" && "Q"}
                                {dia === "SEX" && "S"}
                                {dia === "SAB" && "S"}
                                {dia === "DOM" && "D"}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SEÇÃO 3: ESPECIALIDADES */}
                    {vaga.especialidades_aceitas && vaga.especialidades_aceitas.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 8px 0"
                        }}>
                          🎯 ESPECIALIDADES ACEITAS
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {vaga.especialidades_aceitas.map((esp, idx) => (
                            <span key={idx} style={{
                              background: "#F0F9FF",
                              color: "#0369A1",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 500,
                              border: "1px solid #BAE6FD"
                            }}>
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Separador */}
                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* SEÇÃO 4: REQUISITOS E REMUNERAÇÃO */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px"
                    }}>
                      {/* Tempo Mínimo */}
                      {vaga.tempo_minimo_formado > 0 && (
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            TEMPO MÍNIMO
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            {vaga.tempo_minimo_formado} anos
                          </p>
                        </div>
                      )}

                      {/* Remuneração */}
                      {vaga.valor_proposto && (
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            <DollarSign className="w-3 h-3 inline mr-1" />
                            REMUNERAÇÃO
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
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

                    {/* Data de Expiração */}
                    {vaga.expires_at && (
                      <>
                        <div style={{ borderTop: "1px solid #E2E8F0", margin: "12px 0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar className="w-4 h-4" style={{ color: "#718096" }} />
                          <p style={{
                            fontSize: "12px",
                            color: "#718096",
                            margin: 0
                          }}>
                            Expira em: {format(new Date(vaga.expires_at), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </>
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
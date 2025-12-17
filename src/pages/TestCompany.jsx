import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw } from "lucide-react";

// Função para formatar CNPJ
const formatCNPJ = (cnpj) => {
  if (!cnpj) return "";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

// Função para formatar WhatsApp
const formatWhatsApp = (whatsapp) => {
  if (!whatsapp) return "";
  return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export default function TestCompany() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar todas as empresas
  const { data: empresas = [], isLoading, refetch } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      try {
        return await base44.entities.Company.list();
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        toast.error("Erro ao carregar empresas");
        return [];
      }
    }
  });

  const criarEmpresaTeste = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      const cnpjAleatorio = Math.random().toString().slice(2, 16);
      
      await base44.entities.Company.create({
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
        endereco_completo: "Rua Teste, 123 - Centro - CEP 74000-000",
        status_cadastro: "EM_ANALISE"
      });

      toast.success("✅ Empresa criada com sucesso!");
      queryClient.invalidateQueries(["companies"]);
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* SEÇÃO 1 - Criar Empresa */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Criar Empresa de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={criarEmpresaTeste}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Criando..." : "Criar Empresa de Teste"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Empresas */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Empresas ({empresas.length})
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
                <p className="text-gray-600 mt-4">Carregando empresas...</p>
              </div>
            ) : empresas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma empresa cadastrada ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {empresas.map((empresa) => (
                  <div
                    key={empresa.id}
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
                    {/* SEÇÃO 1: HEADER (NOME + BADGES) */}
                    <div style={{ marginBottom: "20px" }}>
                      {/* Nome Fantasia */}
                      <h3 style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 4px 0"
                      }}>
                        {empresa.nome_fantasia}
                      </h3>

                      {/* Razão Social */}
                      <p style={{
                        fontSize: "14px",
                        color: "#718096",
                        fontStyle: "italic",
                        margin: "0 0 12px 0"
                      }}>
                        {empresa.razao_social}
                      </p>

                      {/* Badges */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {/* Badge Status */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(empresa.status_cadastro === "EM_ANALISE" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(empresa.status_cadastro === "APROVADO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(empresa.status_cadastro === "REPROVADO" && { background: "#FEE2E2", color: "#991B1B" })
                        }}>
                          {empresa.status_cadastro === "EM_ANALISE" ? "EM ANÁLISE" : empresa.status_cadastro}
                        </span>

                        {/* Badge Tipo Empresa */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(empresa.tipo_empresa === "CLINICA" && { background: "#E0F2FE", color: "#075985" }),
                          ...(empresa.tipo_empresa === "CONSULTORIO" && { background: "#F3E8FF", color: "#6B21A8" }),
                          ...(empresa.tipo_empresa === "HOSPITAL" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(empresa.tipo_empresa === "FORNECEDOR" && { background: "#FED7AA", color: "#9A3412" })
                        }}>
                          {empresa.tipo_empresa}
                        </span>

                        {/* Badge Tipo Mundo */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(empresa.tipo_mundo === "ODONTOLOGIA" && { background: "#FCE7F3", color: "#9F1239" }),
                          ...(empresa.tipo_mundo === "MEDICINA" && { background: "#CCFBF1", color: "#115E59" }),
                          ...(empresa.tipo_mundo === "AMBOS" && { background: "#E0E7FF", color: "#3730A3" })
                        }}>
                          {empresa.tipo_mundo}
                        </span>
                      </div>
                    </div>

                    {/* Separador */}
                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* SEÇÃO 2: INFORMAÇÕES */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px"
                    }}>
                      {/* CNPJ */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          🏢 CNPJ
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {formatCNPJ(empresa.cnpj)}
                        </p>
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          📱 WHATSAPP
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {formatWhatsApp(empresa.whatsapp)}
                        </p>
                      </div>

                      {/* Email */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          ✉️ EMAIL
                        </p>
                        <a
                          href={`mailto:${empresa.email}`}
                          style={{
                            fontSize: "14px",
                            color: "#0B95DA",
                            textDecoration: "none",
                            fontWeight: 500
                          }}
                        >
                          {empresa.email}
                        </a>
                      </div>

                      {/* Cidade */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          📍 CIDADE
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {empresa.cidade} - {empresa.uf}
                        </p>
                      </div>
                    </div>

                    {/* Endereço Completo */}
                    {empresa.endereco_completo && (
                      <>
                        <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            🗺️ ENDEREÇO COMPLETO
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            lineHeight: 1.6,
                            margin: 0
                          }}>
                            {empresa.endereco_completo}
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
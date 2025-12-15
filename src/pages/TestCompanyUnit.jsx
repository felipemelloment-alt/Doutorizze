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

export default function TestCompanyUnit() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar todas as unidades
  const { data: units = [], isLoading, refetch } = useQuery({
    queryKey: ["companyUnits"],
    queryFn: async () => {
      try {
        return await base44.entities.CompanyUnit.list("-created_date");
      } catch (error) {
        console.error("Erro ao buscar unidades:", error);
        toast.error("Erro ao carregar unidades");
        return [];
      }
    }
  });

  const criarUnidadeTeste = async () => {
    setLoading(true);
    try {
      // Buscar ou criar um owner
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

      const cnpjAleatorio = Math.random().toString().slice(2, 16);

      await base44.entities.CompanyUnit.create({
        owner_id: ownerId,
        razao_social: "Clínica Odontológica Teste LTDA",
        nome_fantasia: "Clínica Teste",
        cnpj: cnpjAleatorio,
        tipo_empresa: "CLINICA",
        tipo_mundo: "ODONTOLOGIA",
        whatsapp: "62999998888",
        email: "clinica@teste.com",
        cidade: "Goiânia",
        uf: "GO",
        cep: "74000000",
        endereco: "Rua Teste",
        numero: "123",
        bairro: "Centro",
        status_cadastro: "APROVADO",
        ativo: true
      });

      toast.success("✅ Unidade criada com sucesso!");
      queryClient.invalidateQueries(["companyUnits"]);
    } catch (error) {
      console.error("Erro ao criar unidade:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SEÇÃO 1 - Criar Unidade */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Criar Unidade de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={criarUnidadeTeste}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Criando..." : "Criar Unidade de Teste"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Unidades */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Unidades ({units.length})
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
                <p className="text-gray-600 mt-4">Carregando unidades...</p>
              </div>
            ) : units.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma unidade cadastrada ainda</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {units.map((unit) => (
                  <div
                    key={unit.id}
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
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 4px 0"
                      }}>
                        {unit.nome_fantasia}
                      </h3>

                      <p style={{
                        fontSize: "14px",
                        color: "#718096",
                        fontStyle: "italic",
                        margin: "0 0 12px 0"
                      }}>
                        {unit.razao_social}
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
                          ...(unit.status_cadastro === "EM_ANALISE" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(unit.status_cadastro === "APROVADO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(unit.status_cadastro === "REPROVADO" && { background: "#FEE2E2", color: "#991B1B" })
                        }}>
                          {unit.status_cadastro === "EM_ANALISE" ? "EM ANÁLISE" : unit.status_cadastro}
                        </span>

                        {/* Badge Tipo Empresa */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          background: "#E0F2FE",
                          color: "#075985"
                        }}>
                          {unit.tipo_empresa}
                        </span>

                        {/* Badge Tipo Mundo */}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(unit.tipo_mundo === "ODONTOLOGIA" && { background: "#FCE7F3", color: "#9F1239" }),
                          ...(unit.tipo_mundo === "MEDICINA" && { background: "#CCFBF1", color: "#115E59" }),
                          ...(unit.tipo_mundo === "AMBOS" && { background: "#E0E7FF", color: "#3730A3" })
                        }}>
                          {unit.tipo_mundo}
                        </span>

                        {/* Badge Ativo */}
                        {unit.ativo && (
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            background: "#D1FAE5",
                            color: "#065F46"
                          }}>
                            ATIVO
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* INFORMAÇÕES */}
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
                          {formatCNPJ(unit.cnpj)}
                        </p>
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
                          {unit.cidade} - {unit.uf}
                        </p>
                      </div>

                      {/* Email */}
                      <div style={{ gridColumn: "1 / -1" }}>
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
                          href={`mailto:${unit.email}`}
                          style={{
                            fontSize: "14px",
                            color: "#0B95DA",
                            textDecoration: "none",
                            fontWeight: 500
                          }}
                        >
                          {unit.email}
                        </a>
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
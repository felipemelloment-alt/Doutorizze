import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw } from "lucide-react";

// Função para formatar CPF
const formatCPF = (cpf) => {
  if (!cpf) return "";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// Função para formatar WhatsApp
const formatWhatsApp = (whatsapp) => {
  if (!whatsapp) return "";
  return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export default function TestCompanyOwner() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar todos os donos
  const { data: owners = [], isLoading, refetch } = useQuery({
    queryKey: ["companyOwners"],
    queryFn: async () => {
      try {
        return await base44.entities.CompanyOwner.list("-created_date");
      } catch (error) {
        console.error("Erro ao buscar donos:", error);
        toast.error("Erro ao carregar donos");
        return [];
      }
    }
  });

  const criarDonoTeste = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const cpfAleatorio = Math.random().toString().slice(2, 13);
      
      await base44.entities.CompanyOwner.create({
        user_id: user.id,
        nome_completo: "João Silva Santos (TESTE)",
        cpf: cpfAleatorio,
        data_nascimento: "15031980",
        whatsapp: "62999887766",
        email: "joao.teste@doutorizze.com",
        status_cadastro: "EM_ANALISE"
      });

      toast.success("✅ Dono criado com sucesso!");
      queryClient.invalidateQueries(["companyOwners"]);
    } catch (error) {
      console.error("Erro ao criar dono:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SEÇÃO 1 - Criar Dono */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Criar Dono de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={criarDonoTeste}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Criando..." : "Criar Dono de Teste"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Donos */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Donos ({owners.length})
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
                <p className="text-gray-600 mt-4">Carregando donos...</p>
              </div>
            ) : owners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum dono cadastrado ainda</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {owners.map((owner) => (
                  <div
                    key={owner.id}
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
                        margin: "0 0 8px 0"
                      }}>
                        {owner.nome_completo}
                      </h3>

                      {/* Badge Status */}
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        ...(owner.status_cadastro === "EM_ANALISE" && { background: "#DBEAFE", color: "#1E40AF" }),
                        ...(owner.status_cadastro === "APROVADO" && { background: "#D1FAE5", color: "#065F46" }),
                        ...(owner.status_cadastro === "REPROVADO" && { background: "#FEE2E2", color: "#991B1B" })
                      }}>
                        {owner.status_cadastro === "EM_ANALISE" ? "EM ANÁLISE" : owner.status_cadastro}
                      </span>
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* INFORMAÇÕES */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px"
                    }}>
                      {/* CPF */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          🆔 CPF
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {formatCPF(owner.cpf)}
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
                          {formatWhatsApp(owner.whatsapp)}
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
                          href={`mailto:${owner.email}`}
                          style={{
                            fontSize: "14px",
                            color: "#0B95DA",
                            textDecoration: "none",
                            fontWeight: 500
                          }}
                        >
                          {owner.email}
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
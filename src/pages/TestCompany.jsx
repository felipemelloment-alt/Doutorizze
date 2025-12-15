import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Funções de formatação
const formatarCNPJ = (cnpj) => {
  if (!cnpj || cnpj.length !== 14) return cnpj;
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

const formatarWhatsApp = (whatsapp) => {
  if (!whatsapp || whatsapp.length !== 11) return whatsapp;
  return whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
};

// Cores dos badges por status
const statusColors = {
  EM_ANALISE: { bg: "#DBEAFE", color: "#1E40AF", text: "EM ANÁLISE" },
  APROVADO: { bg: "#D1FAE5", color: "#065F46", text: "APROVADO" },
  REPROVADO: { bg: "#FEE2E2", color: "#991B1B", text: "REPROVADO" }
};

const tipoEmpresaColors = {
  CLINICA: { bg: "#E0F2FE", color: "#075985" },
  CONSULTORIO: { bg: "#F3E8FF", color: "#6B21A8" },
  HOSPITAL: { bg: "#D1FAE5", color: "#065F46" },
  FORNECEDOR: { bg: "#FED7AA", color: "#9A3412" }
};

const tipoMundoColors = {
  ODONTOLOGIA: { bg: "#FCE7F3", color: "#9F1239" },
  MEDICINA: { bg: "#CCFBF1", color: "#115E59" },
  AMBOS: { bg: "#E0E7FF", color: "#3730A3" }
};

export default function TestCompany() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  const loadCompanies = async () => {
    try {
      console.log("📋 Carregando empresas...");
      const data = await base44.entities.Company.list();
      setCompanies(data);
      console.log("✅ Total:", data.length);
    } catch (error) {
      console.error("❌ Erro ao carregar:", error);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreateTest = async () => {
    try {
      setLoading(true);
      console.log("🚀 Iniciando criação de empresa...");
      
      const user = await base44.auth.me();
      console.log("👤 User:", user);
      
      const cnpjAleatorio = Math.random().toString().slice(2, 16);
      console.log("📄 CNPJ gerado:", cnpjAleatorio);
      
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
        endereco_completo: "Rua Teste, 123 - Centro - CEP 74000-000",
        status_cadastro: "EM_ANALISE"
      });
      
      console.log("✅ Empresa criada:", novaEmpresa);
      alert("✅ Empresa criada com sucesso!");
      loadCompanies();
      
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("❌ Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      background: "#F7FAFC"
    }}>
      {/* SEÇÃO 1: HEADER COM BOTÃO */}
      <div style={{
        background: "linear-gradient(135deg, #26D9D9 0%, #0B95DA 100%)",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ 
          width: "100%", 
          maxWidth: "1200px",
          textAlign: "center" 
        }}>
          <h1 style={{
            color: "#FFFFFF",
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "24px",
            margin: "0 0 24px 0"
          }}>
            Testar Cadastro de Empresas
          </h1>
          
          <button
            onClick={handleCreateTest}
            disabled={loading}
            style={{
              background: loading 
                ? "linear-gradient(135deg, #0873B5 0%, #065A8D 100%)"
                : "linear-gradient(135deg, #0B95DA 0%, #0873B5 100%)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(11, 149, 218, 0.2)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s ease",
              display: "block",
              margin: "0 auto"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "linear-gradient(135deg, #0873B5 0%, #065A8D 100%)";
                e.target.style.boxShadow = "0 4px 8px rgba(11, 149, 218, 0.3)";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = "linear-gradient(135deg, #0B95DA 0%, #0873B5 100%)";
                e.target.style.boxShadow = "0 2px 4px rgba(11, 149, 218, 0.2)";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? "⏳ Criando..." : "➕ Criar Empresa de Teste"}
          </button>
        </div>
      </div>

      {/* SEÇÃO 2: LISTA DE EMPRESAS */}
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px"
      }}>
        {/* Header da Lista */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#2D3748",
            margin: 0
          }}>
            Empresas Cadastradas ({companies.length})
          </h2>
          
          <button
            onClick={loadCompanies}
            style={{
              background: "transparent",
              color: "#0B95DA",
              border: "2px solid #0B95DA",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#0B95DA";
              e.target.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#0B95DA";
            }}
          >
            🔄 Atualizar
          </button>
        </div>

        {/* Grid de Cards */}
        {companies.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏢</div>
            <p style={{
              fontSize: "18px",
              color: "#718096",
              marginBottom: "8px",
              margin: "0 0 8px 0"
            }}>
              Nenhuma empresa cadastrada
            </p>
            <p style={{
              fontSize: "14px",
              color: "#A0AEC0",
              margin: 0
            }}>
              Clique no botão acima para criar uma empresa de teste
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "24px"
          }}>
            {companies.map((company) => (
              <div
                key={company.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  cursor: "default"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Nome Fantasia */}
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#2D3748",
                  marginBottom: "4px",
                  margin: "0 0 4px 0"
                }}>
                  {company.nome_fantasia}
                </h3>

                {/* Razão Social */}
                <p style={{
                  fontSize: "14px",
                  color: "#718096",
                  marginBottom: "16px",
                  margin: "0 0 16px 0"
                }}>
                  {company.razao_social}
                </p>

                {/* Badges */}
                <div style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "16px"
                }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: statusColors[company.status_cadastro]?.bg,
                    color: statusColors[company.status_cadastro]?.color
                  }}>
                    {statusColors[company.status_cadastro]?.text}
                  </span>

                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: tipoEmpresaColors[company.tipo_empresa]?.bg,
                    color: tipoEmpresaColors[company.tipo_empresa]?.color
                  }}>
                    {company.tipo_empresa}
                  </span>

                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: tipoMundoColors[company.tipo_mundo]?.bg,
                    color: tipoMundoColors[company.tipo_mundo]?.color
                  }}>
                    {company.tipo_mundo}
                  </span>
                </div>

                {/* Separador */}
                <div style={{
                  borderTop: "1px solid #E2E8F0",
                  margin: "16px 0"
                }} />

                {/* Dados em Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px"
                }}>
                  {/* Coluna 1 */}
                  <div>
                    <p style={{
                      fontSize: "12px",
                      color: "#718096",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      margin: "0 0 4px 0"
                    }}>
                      CNPJ
                    </p>
                    <p style={{
                      fontSize: "14px",
                      color: "#2D3748",
                      fontWeight: 600,
                      margin: 0
                    }}>
                      {formatarCNPJ(company.cnpj)}
                    </p>

                    <p style={{
                      fontSize: "12px",
                      color: "#718096",
                      fontWeight: 500,
                      marginTop: "12px",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      margin: "12px 0 4px 0"
                    }}>
                      WHATSAPP
                    </p>
                    <p style={{
                      fontSize: "14px",
                      color: "#2D3748",
                      margin: 0
                    }}>
                      {formatarWhatsApp(company.whatsapp)}
                    </p>
                  </div>

                  {/* Coluna 2 */}
                  <div>
                    <p style={{
                      fontSize: "12px",
                      color: "#718096",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      margin: "0 0 4px 0"
                    }}>
                      EMAIL
                    </p>
                    <p style={{
                      fontSize: "14px",
                      color: "#0B95DA",
                      textDecoration: "none",
                      margin: 0
                    }}>
                      {company.email}
                    </p>

                    <p style={{
                      fontSize: "12px",
                      color: "#718096",
                      fontWeight: 500,
                      marginTop: "12px",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      margin: "12px 0 4px 0"
                    }}>
                      CIDADE
                    </p>
                    <p style={{
                      fontSize: "14px",
                      color: "#2D3748",
                      margin: 0
                    }}>
                      {company.cidade} - {company.uf}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
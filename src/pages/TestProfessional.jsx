import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Função para calcular idade
const calcularIdade = (dataNascimento) => {
  if (!dataNascimento || dataNascimento.length !== 8) return "N/A";
  const dia = parseInt(dataNascimento.substring(0, 2));
  const mes = parseInt(dataNascimento.substring(2, 4)) - 1;
  const ano = parseInt(dataNascimento.substring(4, 8));
  const nascimento = new Date(ano, mes, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

// Função para obter iniciais
const obterIniciais = (nomeCompleto) => {
  if (!nomeCompleto) return "??";
  const partes = nomeCompleto.trim().split(" ");
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

export default function TestProfessional() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar todos os profissionais
  const { data: profissionais = [], isLoading, refetch } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      try {
        return await base44.entities.Professional.list();
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
        toast.error("Erro ao carregar profissionais");
        return [];
      }
    }
  });

  const criarProfissionalTeste = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Professional.create({
        user_id: user.id,
        nome_completo: "Dr. João Silva (TESTE)",
        data_nascimento: "17021985",
        cpf: "12345678901",
        whatsapp: "62999998888",
        email: "teste@doutorizze.com",
        exibir_email: false,
        instagram: "@testefake",
        tipo_profissional: "DENTISTA",
        registro_conselho: "CRO-12345",
        uf_conselho: "GO",
        tempo_formado_anos: 10,
        especialidade_principal: "Endodontia",
        cidades_atendimento: ["Goiânia - GO", "Anápolis - GO"],
        dias_semana_disponiveis: ["SEG", "TER", "QUA"],
        disponibilidade_inicio: "IMEDIATO",
        aceita_freelance: true,
        forma_remuneracao: ["DIARIA", "PORCENTAGEM"],
        observacoes: "Profissional experiente com foco em qualidade",
        new_jobs_ativo: true,
        status_cadastro: "EM_ANALISE"
      });

      toast.success("✅ Profissional criado com sucesso!");
      queryClient.invalidateQueries(["professionals"]);
    } catch (error) {
      console.error("Erro ao criar profissional:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SEÇÃO 1 - Criar Profissional */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Criar Profissional de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={criarProfissionalTeste}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Criando..." : "Criar Profissional de Teste"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Profissionais */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Profissionais ({profissionais.length})
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
                <p className="text-gray-600 mt-4">Carregando profissionais...</p>
              </div>
            ) : profissionais.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum profissional cadastrado ainda</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {profissionais.map((prof) => (
                  <div
                    key={prof.id}
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
                    {/* SEÇÃO 1: HEADER (FOTO + NOME + BADGES) */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
                      {/* Foto ou Iniciais */}
                      {prof.selfie_documento_url ? (
                        <img
                          src={prof.selfie_documento_url}
                          alt={prof.nome_completo}
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            border: "3px solid #0B95DA",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #0B95DA, #26D9D9)",
                          color: "#FFFFFF",
                          fontSize: "32px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {obterIniciais(prof.nome_completo)}
                        </div>
                      )}

                      {/* Nome + Badges */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: "22px",
                          fontWeight: 700,
                          color: "#2D3748",
                          margin: "0 0 4px 0"
                        }}>
                          {prof.nome_completo}
                        </h3>
                        <p style={{
                          fontSize: "14px",
                          color: "#718096",
                          fontStyle: "italic",
                          margin: "0 0 8px 0"
                        }}>
                          {prof.especialidade_principal}
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
                            ...(prof.status_cadastro === "EM_ANALISE" && { background: "#DBEAFE", color: "#1E40AF" }),
                            ...(prof.status_cadastro === "APROVADO" && { background: "#D1FAE5", color: "#065F46" }),
                            ...(prof.status_cadastro === "REPROVADO" && { background: "#FEE2E2", color: "#991B1B" })
                          }}>
                            {prof.status_cadastro === "EM_ANALISE" ? "EM ANÁLISE" : prof.status_cadastro}
                          </span>

                          {/* Badge Tipo */}
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            ...(prof.tipo_profissional === "DENTISTA" && { background: "#F3E8FF", color: "#6B21A8" }),
                            ...(prof.tipo_profissional === "MEDICO" && { background: "#E0F2FE", color: "#075985" })
                          }}>
                            {prof.tipo_profissional}
                          </span>

                          {/* Badge NEW JOBS */}
                          {prof.new_jobs_ativo && (
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              background: "#DCFCE7",
                              color: "#166534"
                            }}>
                              🎯 NEW JOBS
                            </span>
                          )}

                          {/* Badge FREELANCE */}
                          {prof.aceita_freelance && (
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              background: "#FEF3C7",
                              color: "#B7791F"
                            }}>
                              ✅ FREELANCE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Separador */}
                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                    {/* SEÇÃO 2: INFORMAÇÕES PROFISSIONAIS */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px"
                    }}>
                      {/* Registro */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          🏥 REGISTRO
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {prof.registro_conselho}/{prof.uf_conselho}
                        </p>
                      </div>

                      {/* Tempo Formado */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          📅 TEMPO FORMADO
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {prof.tempo_formado_anos} anos
                        </p>
                      </div>

                      {/* Idade */}
                      <div>
                        <p style={{
                          fontSize: "11px",
                          color: "#718096",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          margin: "0 0 4px 0"
                        }}>
                          🎂 IDADE
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#2D3748",
                          fontWeight: 500,
                          margin: 0
                        }}>
                          {calcularIdade(prof.data_nascimento)} anos
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
                          {formatWhatsApp(prof.whatsapp)}
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
                        {prof.exibir_email ? (
                          <a
                            href={`mailto:${prof.email}`}
                            style={{
                              fontSize: "14px",
                              color: "#0B95DA",
                              textDecoration: "none",
                              fontWeight: 500
                            }}
                          >
                            {prof.email}
                          </a>
                        ) : (
                          <p style={{
                            fontSize: "14px",
                            color: "#A0AEC0",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            (oculto)
                          </p>
                        )}
                      </div>

                      {/* Instagram */}
                      {prof.instagram && (
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            📸 INSTAGRAM
                          </p>
                          <a
                            href={`https://instagram.com/${prof.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "14px",
                              color: "#0B95DA",
                              textDecoration: "none",
                              fontWeight: 500
                            }}
                          >
                            {prof.instagram}
                          </a>
                        </div>
                      )}

                      {/* Disponibilidade */}
                      {prof.disponibilidade_inicio && (
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            ⏰ DISPONIBILIDADE
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            {prof.disponibilidade_inicio === "IMEDIATO" && "Imediato"}
                            {prof.disponibilidade_inicio === "15_DIAS" && "15 dias"}
                            {prof.disponibilidade_inicio === "30_DIAS" && "30 dias"}
                            {prof.disponibilidade_inicio === "A_COMBINAR" && "A combinar"}
                          </p>
                        </div>
                      )}

                      {/* Formas de Remuneração */}
                      {prof.forma_remuneracao && prof.forma_remuneracao.length > 0 && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            💰 REMUNERAÇÃO
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            {prof.forma_remuneracao.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observações */}
                    {prof.observacoes && (
                      <>
                        <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 8px 0"
                          }}>
                            📝 OBSERVAÇÕES
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#4A5568",
                            lineHeight: 1.6,
                            margin: 0
                          }}>
                            {prof.observacoes}
                          </p>
                        </div>
                      </>
                    )}

                    {/* SEÇÃO 3: DISPONIBILIDADE E CONDIÇÕES */}
                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />
                    <div>
                      <p style={{
                        fontSize: "12px",
                        color: "#718096",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        margin: "0 0 12px 0"
                      }}>
                        🕐 Disponibilidade e Condições
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {/* Badge Disponibilidade */}
                        {prof.disponibilidade_inicio && (
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            ...(prof.disponibilidade_inicio === "IMEDIATO" && { background: "#D1FAE5", color: "#065F46" }),
                            ...(prof.disponibilidade_inicio === "15_DIAS" && { background: "#FEF3C7", color: "#B7791F" }),
                            ...(prof.disponibilidade_inicio === "30_DIAS" && { background: "#FED7AA", color: "#9A3412" }),
                            ...(prof.disponibilidade_inicio === "A_COMBINAR" && { background: "#DBEAFE", color: "#1E40AF" })
                          }}>
                            {prof.disponibilidade_inicio === "IMEDIATO" && "IMEDIATO"}
                            {prof.disponibilidade_inicio === "15_DIAS" && "EM 15 DIAS"}
                            {prof.disponibilidade_inicio === "30_DIAS" && "EM 30 DIAS"}
                            {prof.disponibilidade_inicio === "A_COMBINAR" && "A COMBINAR"}
                          </span>
                        )}

                        {/* Badges Forma Remuneração */}
                        {prof.forma_remuneracao && prof.forma_remuneracao.map((forma, idx) => (
                          <span key={idx} style={{
                            padding: "6px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            ...(forma === "DIARIA" && { background: "#E0F2FE", color: "#075985" }),
                            ...(forma === "PORCENTAGEM" && { background: "#DCFCE7", color: "#166534" }),
                            ...(forma === "FIXO" && { background: "#F3E8FF", color: "#6B21A8" }),
                            ...(forma === "A_COMBINAR" && { background: "#DBEAFE", color: "#1E40AF" })
                          }}>
                            {forma === "DIARIA" && "DIÁRIA"}
                            {forma === "PORCENTAGEM" && "% PRODUÇÃO"}
                            {forma === "FIXO" && "FIXO"}
                            {forma === "A_COMBINAR" && "A COMBINAR"}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* SEÇÃO 4: CIDADES DE ATENDIMENTO */}
                    <div>
                      <p style={{
                        fontSize: "12px",
                        color: "#718096",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        margin: "16px 0 8px 0"
                      }}>
                        📍 Cidades de Atendimento
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {prof.cidades_atendimento && prof.cidades_atendimento.length > 0 ? (
                          prof.cidades_atendimento.map((cidade, idx) => (
                            <span key={idx} style={{
                              background: "#F0F9FF",
                              color: "#0369A1",
                              padding: "6px 12px",
                              borderRadius: "12px",
                              fontSize: "13px",
                              fontWeight: 500,
                              border: "1px solid #BAE6FD"
                            }}>
                              {cidade}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "#A0AEC0", fontSize: "13px" }}>
                            Não informado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SEÇÃO 5: DIAS DISPONÍVEIS */}
                    <div>
                      <p style={{
                        fontSize: "12px",
                        color: "#718096",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        margin: "12px 0 8px 0"
                      }}>
                        📅 Dias Disponíveis
                      </p>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {prof.dias_semana_disponiveis && prof.dias_semana_disponiveis.length > 0 ? (
                          prof.dias_semana_disponiveis.map((dia, idx) => (
                            <div key={idx} style={{
                              width: "40px",
                              height: "40px",
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
                          ))
                        ) : (
                          <span style={{ color: "#A0AEC0", fontSize: "13px" }}>
                            Não informado
                          </span>
                        )}
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
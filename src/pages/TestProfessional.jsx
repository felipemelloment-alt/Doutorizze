import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, RefreshCcw } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";

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
  const { isAdmin, loading: loadingRole } = useUserRole();

  if (loadingRole) {
    return <div className="text-center py-12">Verificando permissões...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600">Esta página é exclusiva para administradores.</p>
        </div>
      </div>
    );
  }

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
        tempo_especialidade_anos: 3,
        cidades_atendimento: ["Goiânia - GO", "Anápolis - GO"],
        dias_semana_disponiveis: ["SEG", "TER", "QUA"],
        disponibilidade_inicio: "IMEDIATO",
        status_disponibilidade: "DISPONIVEL",
        aceita_freelance: true,
        forma_remuneracao: ["DIARIA", "PORCENTAGEM"],
        observacoes: "Profissional experiente com foco em qualidade",
        new_jobs_ativo: true,
        media_avaliacoes: 4.8,
        total_avaliacoes: 23,
        total_contratacoes: 45,
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
                    {/* HEADER COMPACTO */}
                    <div style={{ marginBottom: "16px" }}>
                      {/* Linha 1: NEW JOBS + Categoria */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        {prof.new_jobs_ativo && (
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "#DCFCE7",
                            color: "#166534"
                          }}>
                            🎯 NEW JOBS
                          </span>
                        )}
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          ...(prof.tipo_profissional === "DENTISTA" && { background: "#F3E8FF", color: "#6B21A8" }),
                          ...(prof.tipo_profissional === "MEDICO" && { background: "#E0F2FE", color: "#075985" })
                        }}>
                          {prof.tipo_profissional}
                        </span>
                      </div>

                      {/* Linha 2: Nome */}
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 6px 0"
                      }}>
                        {prof.nome_completo}
                      </h3>

                      {/* Linha 3: Cidade principal */}
                      <p style={{
                        fontSize: "13px",
                        color: "#718096",
                        margin: "0 0 6px 0"
                      }}>
                        Cidade: {prof.cidades_atendimento?.[0] || "N/A"}
                      </p>

                      {/* Linha 4: Especialidade + tempo + status */}
                      <p style={{
                        fontSize: "13px",
                        color: "#2D3748",
                        margin: "0 0 8px 0"
                      }}>
                        Espe: <strong>{prof.especialidade_principal || "N/A"}</strong>
                        {prof.tempo_especialidade_anos > 0 && (
                          <> / tempo: {prof.tempo_especialidade_anos} anos</>
                        )}
                        {" / "}
                        <span style={{
                          ...(prof.status_disponibilidade === "DISPONIVEL" && { color: "#065F46" }),
                          ...(prof.status_disponibilidade === "OCUPADO" && { color: "#B7791F" }),
                          ...(prof.status_disponibilidade === "INDISPONIVEL" && { color: "#991B1B" })
                        }}>
                          {prof.status_disponibilidade === "DISPONIVEL" && "Disponível"}
                          {prof.status_disponibilidade === "OCUPADO" && "Ocupado"}
                          {prof.status_disponibilidade === "INDISPONIVEL" && "Indisponível"}
                        </span>
                      </p>

                      {/* Linha 5: Badges Freelance + Cidade */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        {prof.aceita_freelance && (
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#FEF3C7",
                            color: "#B7791F"
                          }}>
                            ✅ FAZ FREELANCE
                          </span>
                        )}
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: "#F0F9FF",
                          color: "#0369A1"
                        }}>
                          📍 {prof.cidades_atendimento?.[0] || "N/A"}
                        </span>
                      </div>

                      {/* Linha 6: Avaliações */}
                      {prof.total_avaliacoes > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "14px" }}>⭐</span>
                          <span style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#2D3748"
                          }}>
                            {(prof.media_avaliacoes || 0).toFixed(1)}
                          </span>
                          <span style={{
                            fontSize: "12px",
                            color: "#718096"
                          }}>
                            ({prof.total_avaliacoes} {prof.total_avaliacoes === 1 ? "avaliação" : "avaliações"})
                          </span>
                        </div>
                      )}

                      {/* Badge Status Cadastro (visível só pro próprio usuário) */}
                      {prof.status_cadastro !== "APROVADO" && (
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(prof.status_cadastro === "EM_ANALISE" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(prof.status_cadastro === "REPROVADO" && { background: "#FEE2E2", color: "#991B1B" })
                        }}>
                          [{prof.status_cadastro === "EM_ANALISE" ? "EM ANÁLISE" : prof.status_cadastro}]
                        </span>
                      )}
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "12px 0" }} />

                    {/* CORPO DO CARD - INFORMAÇÕES COMPACTAS */}
                    <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
                      {/* 1. Registro */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>🏥 REGISTRO:</strong>{" "}
                        <span style={{ color: "#2D3748", fontWeight: 500 }}>
                          {prof.registro_conselho}/{prof.uf_conselho}
                        </span>
                      </div>

                      {/* 2. Tempo Formado / Especialista */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📅 TEMPO FORMADO / ESPECIALISTA:</strong>{" "}
                        <span style={{ color: "#2D3748", fontWeight: 500 }}>
                          Form: {prof.tempo_formado_anos} anos
                          {prof.tempo_especialidade_anos > 0 && (
                            <> / Esp: {prof.tempo_especialidade_anos} anos</>
                          )}
                        </span>
                      </div>

                      {/* 3. Idade */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>🎂 IDADE:</strong>{" "}
                        <span style={{ color: "#2D3748", fontWeight: 500 }}>
                          {calcularIdade(prof.data_nascimento)} anos
                        </span>
                      </div>

                      {/* 4. WhatsApp */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📱 WHATSAPP:</strong>{" "}
                        <a
                          href={`https://wa.me/55${prof.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#25D366",
                            textDecoration: "none",
                            fontWeight: 600
                          }}
                        >
                          {formatWhatsApp(prof.whatsapp)}
                        </a>
                      </div>

                      {/* 5. Instagram */}
                      {prof.instagram && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong style={{ color: "#718096" }}>📸 INSTAGRAM:</strong>{" "}
                          <a
                            href={`https://instagram.com/${prof.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#0B95DA",
                              textDecoration: "none",
                              fontWeight: 600
                            }}
                          >
                            {prof.instagram}
                          </a>
                        </div>
                      )}

                      {/* 6. Disponibilidade */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>⏰ DISPONIBILIDADE:</strong>{" "}
                        <span style={{ color: "#2D3748", fontWeight: 500 }}>
                          {prof.disponibilidade_inicio === "IMEDIATO" && "Imediato"}
                          {prof.disponibilidade_inicio === "15_DIAS" && "15 dias"}
                          {prof.disponibilidade_inicio === "30_DIAS" && "30 dias"}
                          {prof.disponibilidade_inicio === "60_DIAS" && "60 dias"}
                          {prof.disponibilidade_inicio === "A_COMBINAR" && "A combinar"}
                        </span>
                      </div>

                      {/* 7. Dias Disponíveis */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📅 DIAS DISPONÍVEIS:</strong>{" "}
                        {prof.dias_semana_disponiveis && prof.dias_semana_disponiveis.length > 0 ? (
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            {prof.dias_semana_disponiveis.includes("INTEGRAL") ? (
                              "INTEGRAL (todos os dias)"
                            ) : (
                              prof.dias_semana_disponiveis.map((dia, idx) => (
                                <span key={idx}>
                                  {dia === "SEG" && "Seg"}
                                  {dia === "TER" && "Ter"}
                                  {dia === "QUA" && "Qua"}
                                  {dia === "QUI" && "Qui"}
                                  {dia === "SEX" && "Sex"}
                                  {dia === "SAB" && "Sáb"}
                                  {dia === "DOM" && "Dom"}
                                  {idx < prof.dias_semana_disponiveis.length - 1 && " | "}
                                </span>
                              ))
                            )}
                          </span>
                        ) : (
                          <span style={{ color: "#A0AEC0" }}>Não informado</span>
                        )}
                      </div>

                      {/* 8. Cidades */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>📍 CIDADES:</strong>{" "}
                        {prof.cidades_atendimento && prof.cidades_atendimento.length > 0 ? (
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            {prof.cidades_atendimento.join(" / ")}
                          </span>
                        ) : (
                          <span style={{ color: "#A0AEC0" }}>Não informado</span>
                        )}
                      </div>

                      {/* 9. Remuneração */}
                      <div style={{ marginBottom: "8px" }}>
                        <strong style={{ color: "#718096" }}>💰 REMUNERAÇÃO:</strong>{" "}
                        {prof.forma_remuneracao && prof.forma_remuneracao.length > 0 ? (
                          <span style={{ color: "#2D3748", fontWeight: 500 }}>
                            {prof.forma_remuneracao.map((forma, idx) => (
                              <span key={idx}>
                                {forma === "DIARIA" && "DIÁRIA"}
                                {forma === "PORCENTAGEM" && "PORCENTAGEM"}
                                {forma === "FIXO" && "FIXO"}
                                {forma === "A_COMBINAR" && "A COMBINAR"}
                                {idx < prof.forma_remuneracao.length - 1 && " | "}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span style={{ color: "#A0AEC0" }}>Não informado</span>
                        )}
                      </div>

                      {/* 10. Observações */}
                      {prof.observacoes && (
                        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #E2E8F0" }}>
                          <strong style={{ color: "#718096" }}>📝 OBSERVAÇÕES:</strong>
                          <p style={{
                            color: "#2D3748",
                            margin: "6px 0 0 0",
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap"
                          }}>
                            {prof.observacoes}
                          </p>
                        </div>
                      )}
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
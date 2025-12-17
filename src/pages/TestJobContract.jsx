import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw, Copy, CheckCircle2, AlertCircle, Clock } from "lucide-react";

// Função para gerar string aleatória
function gerarAleatorio(tamanho) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$@&*%";
  let resultado = "";
  for (let i = 0; i < tamanho; i++) {
    resultado += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return resultado;
}

// Função para gerar token
function gerarToken(tipo, professionalId, unitId, jobId) {
  const identificador = `${tipo}_${professionalId}_${unitId}_${jobId}`;
  const base64 = btoa(identificador);
  const aleatorio1 = gerarAleatorio(8);
  const aleatorio2 = gerarAleatorio(10);
  return `dTz_${aleatorio1}_${base64}_${aleatorio2}`;
}

// Função para copiar texto
const copiarTexto = (texto, label) => {
  navigator.clipboard.writeText(texto);
  toast.success(`${label} copiado!`);
};

// Função para calcular dias restantes
const calcularDiasRestantes = (dataExpiracao) => {
  if (!dataExpiracao) return 0;
  const agora = new Date();
  const expira = new Date(dataExpiracao);
  const diff = expira - agora;
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
};

export default function TestJobContract() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar todos os contratos
  const { data: contratos = [], isLoading, refetch } = useQuery({
    queryKey: ["jobContracts"],
    queryFn: async () => {
      try {
        return await base44.entities.JobContract.list("-created_date");
      } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        toast.error("Erro ao carregar contratos");
        return [];
      }
    }
  });

  const simularContratacao = async () => {
    setLoading(true);
    try {
      // 1. Buscar primeira vaga ABERTA
      const vagas = await base44.entities.Job.filter({ status: "ABERTO" });
      if (vagas.length === 0) {
        toast.error("Nenhuma vaga aberta encontrada! Crie uma vaga primeiro.");
        setLoading(false);
        return;
      }
      const vaga = vagas[0];

      // 2. Buscar primeiro profissional APROVADO
      const profissionais = await base44.entities.Professional.filter({ status_cadastro: "APROVADO" });
      if (profissionais.length === 0) {
        toast.error("Nenhum profissional aprovado encontrado!");
        setLoading(false);
        return;
      }
      const profissional = profissionais[0];

      // 3. Gerar os 2 tokens
      const tokenDentista = gerarToken("DENTISTA", profissional.id, vaga.unit_id, vaga.id);
      const tokenClinica = gerarToken("CLINICA", profissional.id, vaga.unit_id, vaga.id);

      // 4. Criar datas de expiração (+7 dias)
      const agora = new Date();
      const expiraEm = new Date(agora);
      expiraEm.setDate(expiraEm.getDate() + 7);

      // Check if contract already exists
      const existingContract = await base44.entities.JobContract.filter({
        job_id: vaga.id,
        professional_id: profissional.id
      });

      if (existingContract.length > 0) {
        toast.warning("⚠️ A contract already exists for this job and professional!");
        setLoading(false);
        return;
      }

      // 5. Criar JobContract
      await base44.entities.JobContract.create({
        job_id: vaga.id,
        professional_id: profissional.id,
        unit_id: vaga.unit_id,
        token_dentista: tokenDentista,
        token_clinica: tokenClinica,
        token_created_at: agora.toISOString(),
        token_expires_at: expiraEm.toISOString(),
        status: "ATIVO"
      });

      toast.success("✅ Contratação simulada com sucesso!");
      queryClient.invalidateQueries(["jobContracts"]);
    } catch (error) {
      console.error("Erro ao simular contratação:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* SEÇÃO 1 - Simular Contratação */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Simular Contratação (Gerar Tokens)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">
              Essa função simula uma contratação entre uma clínica e um dentista, gerando 2 tokens únicos:
              <br />
              • <strong>Token Dentista</strong>: Para o dentista avaliar a clínica
              <br />
              • <strong>Token Clínica</strong>: Para a clínica avaliar o dentista
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                (Tokens expiram em 7 dias)
              </span>
            </p>
            <Button
              onClick={simularContratacao}
              disabled={loading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {loading ? "Criando..." : "🎯 Simular Contratação"}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - Lista de Contratos */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Lista de Contratos ({contratos.length})
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
                <p className="text-gray-600 mt-4">Carregando contratos...</p>
              </div>
            ) : contratos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum contrato criado ainda</p>
              </div>
            ) : (
              <div className="space-y-6">
                {contratos.map((contrato) => {
                  const diasRestantes = calcularDiasRestantes(contrato.token_expires_at);
                  const expirado = diasRestantes === 0;

                  return (
                    <div
                      key={contrato.id}
                      style={{
                        background: "#FFFFFF",
                        border: "2px solid #E2E8F0",
                        borderRadius: "12px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                    >
                      {/* HEADER */}
                      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#2D3748",
                            margin: "0 0 8px 0"
                          }}>
                            Contrato #{contrato.id.substring(0, 8)}
                          </h3>
                          <p style={{
                            fontSize: "13px",
                            color: "#718096",
                            margin: 0
                          }}>
                            Criado em: {new Date(contrato.created_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span style={{
                          padding: "6px 14px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          ...(contrato.status === "ATIVO" && { background: "#D1FAE5", color: "#065F46" }),
                          ...(contrato.status === "FINALIZADO" && { background: "#DBEAFE", color: "#1E40AF" }),
                          ...(contrato.status === "CANCELADO" && { background: "#FEE2E2", color: "#991B1B" })
                        }}>
                          {contrato.status}
                        </span>
                      </div>

                      <div style={{ borderTop: "1px solid #E2E8F0", margin: "16px 0" }} />

                      {/* INFORMAÇÕES */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                        {/* Vaga */}
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            💼 VAGA
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            ID: {contrato.job_id.substring(0, 12)}...
                          </p>
                        </div>

                        {/* Profissional */}
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            👨‍⚕️ PROFISSIONAL
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            ID: {contrato.professional_id.substring(0, 12)}...
                          </p>
                        </div>

                        {/* Clínica */}
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            🏥 CLÍNICA
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: "#2D3748",
                            fontWeight: 500,
                            margin: 0
                          }}>
                            ID: {contrato.unit_id.substring(0, 12)}...
                          </p>
                        </div>

                        {/* Expiração */}
                        <div>
                          <p style={{
                            fontSize: "11px",
                            color: "#718096",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            margin: "0 0 4px 0"
                          }}>
                            ⏰ EXPIRAÇÃO
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {expirado ? (
                              <>
                                <AlertCircle className="w-4 h-4" style={{ color: "#991B1B" }} />
                                <span style={{
                                  fontSize: "14px",
                                  color: "#991B1B",
                                  fontWeight: 600
                                }}>
                                  EXPIRADO
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4" style={{ color: "#B7791F" }} />
                                <span style={{
                                  fontSize: "14px",
                                  color: "#B7791F",
                                  fontWeight: 600
                                }}>
                                  {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* TOKENS */}
                      <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "16px" }}>
                        {/* Token Dentista */}
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                            <p style={{
                              fontSize: "11px",
                              color: "#718096",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              margin: 0
                            }}>
                              🔑 TOKEN DENTISTA {contrato.avaliacao_dentista_feita && <CheckCircle2 className="w-4 h-4 inline ml-2" style={{ color: "#065F46" }} />}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copiarTexto(contrato.token_dentista, "Token Dentista")}
                              style={{ padding: "4px 8px" }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div style={{
                            background: "#F0F9FF",
                            border: "1px solid #BAE6FD",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "#075985",
                            wordBreak: "break-all"
                          }}>
                            {contrato.token_dentista}
                          </div>
                        </div>

                        {/* Token Clínica */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                            <p style={{
                              fontSize: "11px",
                              color: "#718096",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              margin: 0
                            }}>
                              🔑 TOKEN CLÍNICA {contrato.avaliacao_clinica_feita && <CheckCircle2 className="w-4 h-4 inline ml-2" style={{ color: "#065F46" }} />}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copiarTexto(contrato.token_clinica, "Token Clínica")}
                              style={{ padding: "4px 8px" }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div style={{
                            background: "#FEF3C7",
                            border: "1px solid #FDE68A",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "#B7791F",
                            wordBreak: "break-all"
                          }}>
                            {contrato.token_clinica}
                          </div>
                        </div>
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
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Star, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function TestRating() {
  const [token, setToken] = useState("");
  const [validando, setValidando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [tokenValido, setTokenValido] = useState(null);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const queryClient = useQueryClient();

  const validarToken = async () => {
    if (!token.trim()) {
      toast.error("Por favor, cole o token");
      return;
    }

    setValidando(true);
    try {
      // 1. Buscar token no JobContract
      const contratos = await base44.entities.JobContract.list();
      const contratoEncontrado = contratos.find(
        c => c.token_dentista === token || c.token_clinica === token
      );

      if (!contratoEncontrado) {
        toast.error("❌ Token inválido!");
        setValidando(false);
        return;
      }

      // 2. Verificar se expirou
      const agora = new Date();
      const expira = new Date(contratoEncontrado.token_expires_at);
      if (agora > expira) {
        toast.error("❌ Token expirado!");
        setValidando(false);
        return;
      }

      // 3. Verificar se já foi usado
      const ehTokenDentista = contratoEncontrado.token_dentista === token;
      const jaUsado = ehTokenDentista 
        ? contratoEncontrado.avaliacao_dentista_feita 
        : contratoEncontrado.avaliacao_clinica_feita;

      if (jaUsado) {
        toast.error("❌ Token já foi utilizado!");
        setValidando(false);
        return;
      }

      // 4. Decodificar Base64
      const partes = token.split("_");
      if (partes.length < 3) {
        toast.error("❌ Token mal formatado!");
        setValidando(false);
        return;
      }

      const base64 = partes[2];
      let decoded;
      try {
        decoded = atob(base64);
      } catch (e) {
        toast.error("❌ Token mal formatado!");
        setValidando(false);
        return;
      }
      const [tipo, professionalId, unitId, jobId] = decoded.split("_");

      // 5. Buscar informações de quem será avaliado
      let nomeAvaliado = "";
      let avaliadoTipo = "";
      let avaliadoId = "";
      let avaliadorTipo = "";
      let avaliadorId = "";

      if (ehTokenDentista) {
        // Dentista avalia a clínica
        avaliadorTipo = "DENTISTA";
        avaliadorId = professionalId;
        avaliadoTipo = "CLINICA";
        avaliadoId = unitId;
        
        const unit = await base44.entities.CompanyUnit.filter({ id: unitId });
        nomeAvaliado = unit[0]?.nome_fantasia || "Clínica";
      } else {
        // Clínica avalia o dentista
        avaliadorTipo = "CLINICA";
        avaliadorId = unitId;
        avaliadoTipo = "DENTISTA";
        avaliadoId = professionalId;
        
        const prof = await base44.entities.Professional.filter({ id: professionalId });
        nomeAvaliado = prof[0]?.nome_completo || "Profissional";
      }

      // Token válido!
      setTokenValido({
        contrato: contratoEncontrado,
        nomeAvaliado,
        avaliadoTipo,
        avaliadoId,
        avaliadorTipo,
        avaliadorId,
        ehTokenDentista
      });

      toast.success("✅ Token válido! Agora avalie com estrelas.");
    } catch (error) {
      console.error("Erro ao validar token:", error);
      toast.error("❌ Erro ao validar: " + error.message);
    }
    setValidando(false);
  };

  const enviarAvaliacao = async () => {
    if (notaSelecionada === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas");
      return;
    }

    setEnviando(true);
    try {
      // 1. Criar registro em Rating
      await base44.entities.Rating.create({
        contract_id: tokenValido.contrato.id,
        token_validacao: token,
        avaliador_tipo: tokenValido.avaliadorTipo,
        avaliador_id: tokenValido.avaliadorId,
        avaliado_tipo: tokenValido.avaliadoTipo,
        avaliado_id: tokenValido.avaliadoId,
        nota: notaSelecionada
      });

      // 2. Marcar token como usado no JobContract
      const updateData = tokenValido.ehTokenDentista
        ? { avaliacao_dentista_feita: true }
        : { avaliacao_clinica_feita: true };

      await base44.entities.JobContract.update(tokenValido.contrato.id, updateData);

      // 3. Atualizar media_avaliacoes e total_avaliacoes
      if (tokenValido.avaliadoTipo === "DENTISTA") {
        const prof = await base44.entities.Professional.filter({ id: tokenValido.avaliadoId });
        if (prof.length > 0) {
          const profissional = prof[0];
          const totalAvaliacoes = (profissional.total_avaliacoes || 0) + 1;
          const somaAtual = (profissional.media_avaliacoes || 0) * (profissional.total_avaliacoes || 0);
          const novaMedia = (somaAtual + notaSelecionada) / totalAvaliacoes;

          await base44.entities.Professional.update(profissional.id, {
            media_avaliacoes: novaMedia,
            total_avaliacoes: totalAvaliacoes,
            status_disponibilidade: "INDISPONIVEL"
          });
        }
      } else {
        // Avaliado é CLINICA
        const units = await base44.entities.CompanyUnit.filter({ id: tokenValido.avaliadoId });
        if (units.length > 0) {
          const unit = units[0];
          const totalAvaliacoes = (unit.total_avaliacoes || 0) + 1;
          const somaAtual = (unit.media_avaliacoes || 0) * (unit.total_avaliacoes || 0);
          const novaMedia = (somaAtual + notaSelecionada) / totalAvaliacoes;

          await base44.entities.CompanyUnit.update(unit.id, {
            media_avaliacoes: novaMedia,
            total_avaliacoes: totalAvaliacoes
          });
        }
      }

      // 4. Atualizar Job status se clínica avaliou
      if (tokenValido.avaliadorTipo === "CLINICA") {
        await base44.entities.Job.update(tokenValido.contrato.job_id, {
          status: "PREENCHIDO"
        });
      }

      toast.success("🎉 Avaliação enviada com sucesso!");
      
      // Resetar
      setToken("");
      setTokenValido(null);
      setNotaSelecionada(0);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("❌ Erro: " + error.message);
    }
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        
        {/* CARD PRINCIPAL */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Sistema de Avaliação com Token
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* ETAPA 1: COLAR TOKEN */}
            {!tokenValido && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  🔑 Cole o token de avaliação:
                </label>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="dTz_k9#Xm$2P_REVOVF8xMjNfNDU2_q5@Rw&Y8*nL3"
                  className="font-mono text-sm"
                />
                <Button
                  onClick={validarToken}
                  disabled={validando}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  size="lg"
                >
                  {validando ? "Validando..." : "✨ Validar Token"}
                </Button>
              </div>
            )}

            {/* ETAPA 2: TOKEN VÁLIDO - AVALIAÇÃO */}
            {tokenValido && (
              <div className="space-y-6">
                {/* Sucesso */}
                <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-800">Token Válido!</p>
                    <p className="text-sm text-green-700">
                      Você está avaliando: <strong>{tokenValido.nomeAvaliado}</strong>
                    </p>
                  </div>
                </div>

                {/* Seleção de Estrelas */}
                <div>
                  <p className="text-center text-gray-700 font-semibold mb-4">
                    Selecione sua avaliação:
                  </p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <button
                        key={nota}
                        onClick={() => setNotaSelecionada(nota)}
                        className="transition-all transform hover:scale-125"
                      >
                        <Star
                          className="w-12 h-12"
                          style={{
                            color: nota <= notaSelecionada ? "#F9B500" : "#CBD5E0",
                            fill: nota <= notaSelecionada ? "#F9B500" : "transparent",
                            filter: nota <= notaSelecionada ? "drop-shadow(0 2px 4px rgba(249, 181, 0, 0.4))" : "none"
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  {notaSelecionada > 0 && (
                    <p className="text-center mt-4 text-lg font-bold text-gray-800">
                      Você selecionou: {notaSelecionada} {notaSelecionada === 1 ? "estrela" : "estrelas"} ⭐
                    </p>
                  )}
                </div>

                {/* Botão Enviar */}
                <Button
                  onClick={enviarAvaliacao}
                  disabled={enviando || notaSelecionada === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                  size="lg"
                >
                  {enviando ? "Enviando..." : "🎉 Enviar Avaliação"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* INSTRUÇÕES */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-lg">ℹ️ Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="font-bold text-purple-600">1.</span>
                <span>Copie o token recebido (Token Dentista ou Token Clínica)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-purple-600">2.</span>
                <span>Cole no campo acima e clique em "Validar Token"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-purple-600">3.</span>
                <span>Selecione de 1 a 5 estrelas para avaliar</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-purple-600">4.</span>
                <span>Clique em "Enviar Avaliação"</span>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Atenção:</strong> Cada token só pode ser usado uma vez e expira em 7 dias!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
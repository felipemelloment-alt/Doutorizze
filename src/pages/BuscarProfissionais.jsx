import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, X, Star } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

// Lista de especialidades
const especialidades = [
  "Clínico Geral",
  "Endodontia",
  "Implantodontia",
  "Ortodontia",
  "Periodontia",
  "Protese",
  "Odontopediatria",
  "Cirurgia",
  "Radiologia",
  "Harmonização Orofacial",
  "Outros"
];

// Lista de estados brasileiros
const estados = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", 
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

export default function BuscarProfissionais() {
  const [especialidade, setEspecialidade] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [profissionais, setProfissionais] = useState([]);
  const { isClinic, isAdmin, loading: loadingRole } = useUserRole();

  if (loadingRole) {
    return <div className="text-center py-12">Verificando permissões...</div>;
  }

  if (!isClinic && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Exclusivo para Clínicas</h1>
          <p className="text-gray-600">Apenas clínicas podem buscar profissionais.</p>
        </div>
      </div>
    );
  }

  const podesBuscar = especialidade && uf && cidade.trim();

  const buscarProfissionais = async () => {
    setBuscando(true);
    try {
      // Buscar profissionais aprovados e disponíveis com a especialidade
      const resultados = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO",
        status_disponibilidade: "DISPONIVEL",
        especialidade_principal: especialidade
      });

      // Filtrar por cidade
      const filtrados = resultados.filter(p =>
        p.cidades_atendimento &&
        p.cidades_atendimento.some(c =>
          c.toLowerCase().includes(cidade.toLowerCase()) &&
          c.toLowerCase().includes(uf.toLowerCase())
        )
      );

      // Ordenar por avaliação
      filtrados.sort((a, b) => b.media_avaliacoes - a.media_avaliacoes);

      setProfissionais(filtrados);
      setBuscaRealizada(true);

      if (filtrados.length === 0) {
        toast.info("Nenhum profissional encontrado para estes critérios");
      } else {
        toast.success(`${filtrados.length} ${filtrados.length === 1 ? "profissional encontrado" : "profissionais encontrados"}!`);
      }
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      toast.error("Erro ao buscar profissionais");
    }
    setBuscando(false);
  };

  const limparBusca = () => {
    setEspecialidade("");
    setUf("");
    setCidade("");
    setProfissionais([]);
    setBuscaRealizada(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* SEÇÃO 1 - FILTROS */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              🔍 Buscar Profissionais Disponíveis
            </CardTitle>
            <p className="text-sm text-blue-100 mt-2">
              Preencha os filtros abaixo para encontrar dentistas
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Campo 1: Especialidade */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Especialidade <span className="text-red-500">*</span>
                </label>
                <Select value={especialidade} onValueChange={setEspecialidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo 2: Estado */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Estado <span className="text-red-500">*</span>
                </label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo 3: Cidade */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite o nome da cidade"
                />
              </div>
            </div>

            <Button
              onClick={buscarProfissionais}
              disabled={!podesBuscar || buscando}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {buscando ? "Buscando..." : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  BUSCAR PROFISSIONAIS
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* SEÇÃO 2 - RESULTADOS */}
        {!buscaRealizada ? (
          // ESTADO INICIAL
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="py-16">
              <div className="text-center">
                <Search className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 font-semibold mb-2">
                  Preencha os filtros acima para ver os profissionais disponíveis
                </p>
                <p className="text-sm text-gray-400">
                  Busque por especialidade, estado e cidade
                </p>
              </div>
            </CardContent>
          </Card>
        ) : profissionais.length === 0 ? (
          // SEM RESULTADOS
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="py-16">
              <div className="text-center">
                <X className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 font-semibold mb-2">
                  Nenhum profissional encontrado para estes critérios
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Tente buscar em cidades vizinhas ou outras especialidades
                </p>
                <Button onClick={limparBusca} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // COM RESULTADOS
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {profissionais.length} {profissionais.length === 1 ? "profissional encontrado" : "profissionais encontrados"}
                  </CardTitle>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {especialidade}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {cidade}
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                      {uf}
                    </span>
                    <button
                      onClick={limparBusca}
                      className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-full text-xs font-semibold flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {/* HEADER */}
                    <div style={{ marginBottom: "12px" }}>
                      {/* Nome */}
                      <h3 style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#2D3748",
                        margin: "0 0 4px 0"
                      }}>
                        {prof.nome_completo}
                      </h3>

                      {/* Especialidade */}
                      <p style={{
                        fontSize: "13px",
                        color: "#718096",
                        margin: "0 0 6px 0"
                      }}>
                        {prof.especialidade_principal}
                      </p>

                      {/* Cidade principal */}
                      <p style={{
                        fontSize: "12px",
                        color: "#4A5568",
                        margin: "0 0 8px 0"
                      }}>
                        📍 {prof.cidades_atendimento?.[0] || "N/A"}
                      </p>

                      {/* Avaliações */}
                      {prof.total_avaliacoes > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                          <Star className="w-4 h-4" style={{ color: "#F9B500", fill: "#F9B500" }} />
                          <span style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#2D3748"
                          }}>
                            {prof.media_avaliacoes.toFixed(1)}
                          </span>
                          <span style={{
                            fontSize: "11px",
                            color: "#718096"
                          }}>
                            ({prof.total_avaliacoes})
                          </span>
                        </div>
                      )}

                      {/* Badge Disponível */}
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: "#D1FAE5",
                        color: "#065F46"
                      }}>
                        ✓ DISPONÍVEL
                      </span>
                    </div>

                    <div style={{ borderTop: "1px solid #E2E8F0", margin: "12px 0" }} />

                    {/* CORPO */}
                    <div style={{ fontSize: "12px", lineHeight: "1.6", marginBottom: "12px" }}>
                      {/* Tempo formado */}
                      <div style={{ marginBottom: "6px" }}>
                        <strong style={{ color: "#718096" }}>⏱️ Formado:</strong>{" "}
                        <span style={{ color: "#2D3748" }}>
                          {prof.tempo_formado_anos} anos
                        </span>
                      </div>

                      {/* Tempo especialista */}
                      {prof.tempo_especialidade_anos > 0 && (
                        <div style={{ marginBottom: "6px" }}>
                          <strong style={{ color: "#718096" }}>🎓 Especialista:</strong>{" "}
                          <span style={{ color: "#2D3748" }}>
                            {prof.tempo_especialidade_anos} anos
                          </span>
                        </div>
                      )}

                      {/* Dias disponíveis */}
                      <div style={{ marginBottom: "6px" }}>
                        <strong style={{ color: "#718096" }}>📅 Dias:</strong>{" "}
                        <span style={{ color: "#2D3748" }}>
                          {prof.dias_semana_disponiveis?.includes("INTEGRAL") ? (
                            "Todos"
                          ) : (
                            prof.dias_semana_disponiveis?.map(d => d).join(", ") || "N/A"
                          )}
                        </span>
                      </div>

                      {/* Remuneração */}
                      <div>
                        <strong style={{ color: "#718096" }}>💰 Aceita:</strong>{" "}
                        <span style={{ color: "#2D3748" }}>
                          {prof.forma_remuneracao?.map(f => 
                            f === "DIARIA" ? "Diária" :
                            f === "PORCENTAGEM" ? "%" :
                            f === "FIXO" ? "Fixo" : "Combinar"
                          ).join(", ") || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* BOTÃO */}
                    <Button
                      onClick={() => {
                        if (prof.whatsapp) {
                          window.open(`https://wa.me/55${prof.whatsapp}`, "_blank");
                        } else {
                          toast.info("WhatsApp não disponível");
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                      size="sm"
                    >
                      💬 Entrar em Contato
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
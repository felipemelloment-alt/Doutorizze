import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCcw } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";

// Funcao para formatar CPF
const formatCPF = (cpf) => {
  if (!cpf) return "";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// Funcao para formatar WhatsApp
const formatWhatsApp = (whatsapp) => {
  if (!whatsapp) return "";
  return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// Funcao para calcular idade
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

// Funcao para obter iniciais
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

  // IMPORTANTE: Hooks devem ser chamados ANTES de qualquer return condicional
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
    },
    enabled: isAdmin && !loadingRole
  });

  if (loadingRole) {
    return <div className="text-center py-12">Verificando permissoes...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600">Esta pagina e exclusiva para administradores.</p>
        </div>
      </div>
    );
  }

  const criarProfissionalTeste = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();

      await base44.entities.Professional.create({
        user_id: user.id,
        nome_completo: "Dr. Joao Silva (TESTE)",
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
        cidades_atendimento: ["Goiania - GO", "Anapolis - GO"],
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

      toast.success("Profissional criado com sucesso!");
      queryClient.invalidateQueries(["professionals"]);
    } catch (error) {
      console.error("Erro ao criar profissional:", error);
      toast.error("Erro: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* SECAO 1 - Criar Profissional */}
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

        {/* SECAO 2 - Lista de Profissionais */}
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
                <p className="mt-4 text-gray-600">Carregando profissionais...</p>
              </div>
            ) : profissionais.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhum profissional cadastrado ainda
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profissionais.map((prof) => (
                  <div
                    key={prof.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 transition-all"
                  >
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        {prof.new_jobs_ativo && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            NEW JOBS
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {prof.tipo_profissional}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{prof.nome_completo}</h3>
                      <p className="text-sm text-gray-600">
                        {prof.cidades_atendimento?.[0] || "N/A"}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">
                          {prof.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"}:
                        </span>{" "}
                        {prof.registro_conselho}/{prof.uf_conselho}
                      </p>
                      <p>
                        <span className="font-semibold">Especialidade:</span>{" "}
                        {prof.especialidade_principal || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Tempo Formado:</span>{" "}
                        {prof.tempo_formado_anos} anos
                      </p>
                      <p>
                        <span className="font-semibold">WhatsApp:</span>{" "}
                        {formatWhatsApp(prof.whatsapp)}
                      </p>
                      <p>
                        <span className="font-semibold">Idade:</span>{" "}
                        {calcularIdade(prof.data_nascimento)} anos
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {prof.aceita_freelance && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                          FREELANCE
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        prof.status_disponibilidade === "DISPONIVEL"
                          ? "bg-green-100 text-green-700"
                          : prof.status_disponibilidade === "OCUPADO"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {prof.status_disponibilidade}
                      </span>
                      {prof.status_cadastro !== "APROVADO" && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                          {prof.status_cadastro}
                        </span>
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
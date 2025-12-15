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

// Cores dos badges por status
const statusColors = {
  EM_ANALISE: "bg-yellow-100 text-yellow-800 border-yellow-300",
  APROVADO: "bg-green-100 text-green-800 border-green-300",
  REPROVADO: "bg-red-100 text-red-800 border-red-300"
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
        tipo_profissional: "DENTISTA",
        registro_conselho: "CRO-12345",
        uf_conselho: "GO",
        tempo_formado_anos: 10,
        especialidade_principal: "Endodontia",
        cidades_atendimento: ["Goiânia - GO", "Anápolis - GO"],
        dias_semana_disponiveis: ["SEG", "TER", "QUA"],
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
                  <Card
                    key={prof.id}
                    className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all"
                  >
                    <CardContent className="pt-6 space-y-4">
                      {/* Nome */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {prof.nome_completo}
                        </h3>
                        <p className="text-sm text-gray-500">{prof.especialidade_principal}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`border-2 font-semibold ${statusColors[prof.status_cadastro]}`}>
                          {prof.status_cadastro}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 border-2 border-purple-300">
                          {prof.tipo_profissional}
                        </Badge>
                      </div>

                      {/* Informações */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">CPF:</span>
                          <span className="font-semibold">{formatCPF(prof.cpf)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">WhatsApp:</span>
                          <span className="font-semibold">{formatWhatsApp(prof.whatsapp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-semibold text-blue-600">{prof.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
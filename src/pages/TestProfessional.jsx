import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function TestProfessional() {
  const [loading, setLoading] = useState(false);
  const [createdPro, setCreatedPro] = useState(null);

  const criarProfissionalTeste = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      const novoProfissional = await base44.entities.Professional.create({
        user_id: user.id,
        nome_completo: 'Dr. João Silva (TESTE)',
        data_nascimento: '17021985',
        cpf: '12345678901',
        whatsapp: '62999998888',
        email: 'teste@doutorizze.com',
        tipo_profissional: 'DENTISTA',
        registro_conselho: 'CRO-12345',
        uf_conselho: 'GO',
        tempo_formado_anos: 10,
        especialidade_principal: 'Endodontia',
        cidades_atendimento: ['Goiânia - GO', 'Anápolis - GO'],
        dias_semana_disponiveis: ['SEG', 'TER', 'QUA'],
        new_jobs_ativo: true,
        status_cadastro: 'EM_ANALISE'
      });

      console.log('✅ Profissional criado:', novoProfissional);
      setCreatedPro(novoProfissional);
      toast.success('Profissional de teste criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      toast.error('Erro: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-4 border-yellow-400 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">🧪 Teste - Criar Profissional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={criarProfissionalTeste}
              disabled={loading}
              size="lg"
              className="w-full gradient-yellow-pink text-white font-bold"
            >
              {loading ? 'Criando...' : '✅ Criar Profissional de Teste'}
            </Button>

            {createdPro && (
              <Card className="bg-green-50 border-2 border-green-400">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-green-900 mb-2">✅ Profissional Criado:</h3>
                  <pre className="bg-white p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(createdPro, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
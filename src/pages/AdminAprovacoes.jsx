import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Search, Clock, FileText } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";

export default function AdminAprovacoes() {
  const { isAdmin, loading: loadingRole } = useUserRole();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [modalDocumento, setModalDocumento] = useState(null);
  const [modalRejeitar, setModalRejeitar] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  // Fetch pending professionals
  const { data: profissionaisPendentes = [], isLoading: loadingProf } = useQuery({
    queryKey: ["profissionaisPendentes"],
    queryFn: async () => {
      try {
        return await base44.entities.Professional.filter({ status_cadastro: "EM_ANALISE" });
      } catch (error) {
        console.error("Error fetching professionals:", error);
        return [];
      }
    }
  });

  // Fetch pending clinics
  const { data: clinicasPendentes = [], isLoading: loadingClinica } = useQuery({
    queryKey: ["clinicasPendentes"],
    queryFn: async () => {
      try {
        return await base44.entities.CompanyOwner.filter({ status_cadastro: "EM_ANALISE" });
      } catch (error) {
        console.error("Error fetching clinics:", error);
        return [];
      }
    }
  });

  if (loadingRole) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const aprovarProfissional = async (id) => {
    try {
      await base44.entities.Professional.update(id, { 
        status_cadastro: "APROVADO",
        approved_at: new Date().toISOString(),
        approved_by: "admin"
      });
      toast.success("Profissional aprovado com sucesso!");
      queryClient.invalidateQueries(["profissionaisPendentes"]);
    } catch (error) {
      toast.error("Erro ao aprovar: " + error.message);
    }
  };

  const rejeitarProfissional = async () => {
    if (!modalRejeitar || !motivoRejeicao.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }
    try {
      await base44.entities.Professional.update(modalRejeitar.id, {
        status_cadastro: "REPROVADO",
        motivo_reprovacao: motivoRejeicao
      });
      toast.success("Cadastro rejeitado");
      setModalRejeitar(null);
      setMotivoRejeicao("");
      queryClient.invalidateQueries(["profissionaisPendentes"]);
    } catch (error) {
      toast.error("Erro ao rejeitar: " + error.message);
    }
  };

  const aprovarClinica = async (id) => {
    try {
      await base44.entities.CompanyOwner.update(id, { 
        status_cadastro: "APROVADO",
        approved_at: new Date().toISOString(),
        approved_by: "admin"
      });
      toast.success("Clínica aprovada com sucesso!");
      queryClient.invalidateQueries(["clinicasPendentes"]);
    } catch (error) {
      toast.error("Erro ao aprovar: " + error.message);
    }
  };

  const rejeitarClinica = async () => {
    if (!modalRejeitar || !motivoRejeicao.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }
    try {
      await base44.entities.CompanyOwner.update(modalRejeitar.id, {
        status_cadastro: "REPROVADO",
        motivo_reprovacao: motivoRejeicao
      });
      toast.success("Cadastro rejeitado");
      setModalRejeitar(null);
      setMotivoRejeicao("");
      queryClient.invalidateQueries(["clinicasPendentes"]);
    } catch (error) {
      toast.error("Erro ao rejeitar: " + error.message);
    }
  };

  const handleRejeitar = () => {
    if (modalRejeitar.tipo_profissional) {
      // É um profissional
      rejeitarProfissional();
    } else {
      // É uma clínica
      rejeitarClinica();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Painel de Aprovações
            </CardTitle>
            <p className="text-blue-100">
              Gerencie cadastros pendentes de profissionais e clínicas
            </p>
          </CardHeader>
        </Card>

        {/* Tabs and Content */}
        <Tabs defaultValue="profissionais">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profissionais">
              Profissionais ({profissionaisPendentes.length})
            </TabsTrigger>
            <TabsTrigger value="clinicas">
              Clínicas ({clinicasPendentes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profissionais" className="mt-6">
            {/* List of pending professionals */}
            <div className="grid gap-4">
              {loadingProf ? (
                <div className="text-center py-8">Carregando...</div>
              ) : profissionaisPendentes.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                  Nenhum profissional pendente de aprovação
                </Card>
              ) : (
                profissionaisPendentes.map((prof) => (
                  <Card key={prof.id} className="border-2 border-yellow-200 shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {prof.nome_completo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {prof.tipo_profissional === "DENTISTA" ? "Dentista" : "Médico"} - {prof.especialidade_principal}
                          </p>
                          <p className="text-sm text-gray-500">
                            {prof.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"}: {prof.registro_conselho} - {prof.uf_conselho}
                          </p>
                          <p className="text-sm text-gray-500">
                            {prof.cidades_atendimento?.[0] || "Cidade não informada"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Email: {prof.email} | WhatsApp: {prof.whatsapp}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {prof.carteirinha_conselho_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalDocumento(prof.carteirinha_conselho_url)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Documento
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => aprovarProfissional(prof.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setModalRejeitar(prof)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="clinicas" className="mt-6">
            {/* List of pending clinics */}
            <div className="grid gap-4">
              {loadingClinica ? (
                <div className="text-center py-8">Carregando...</div>
              ) : clinicasPendentes.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                  Nenhuma clínica pendente de aprovação
                </Card>
              ) : (
                clinicasPendentes.map((clinica) => (
                  <Card key={clinica.id} className="border-2 border-yellow-200 shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {clinica.nome_completo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            CPF: {clinica.cpf}
                          </p>
                          <p className="text-sm text-gray-500">
                            Email: {clinica.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            WhatsApp: {clinica.whatsapp}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => aprovarClinica(clinica.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setModalRejeitar(clinica)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Document Modal */}
        <Dialog open={!!modalDocumento} onOpenChange={() => setModalDocumento(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Documento do Registro</DialogTitle>
            </DialogHeader>
            {modalDocumento && (
              <div className="flex justify-center">
                <img
                  src={modalDocumento}
                  alt="Documento"
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={!!modalRejeitar} onOpenChange={() => setModalRejeitar(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Cadastro</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">
                Motivo da Rejeição *
              </label>
              <Textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalRejeitar(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleRejeitar}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Rejeição
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
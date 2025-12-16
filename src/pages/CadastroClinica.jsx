import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEspecialidades, getRegistroLabel } from "@/components/constants/especialidades";

export default function CadastroClinica() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [formData, setFormData] = useState({
    // ETAPA 1: Tipo e Dados do Responsável
    tipo_clinica: "",
    nome_responsavel: "",
    email: "",
    whatsapp: "",
    cpf_responsavel: "",
    data_nascimento: "",

    // ETAPA 2: Dados da Empresa
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",

    // ETAPA 3: Primeira Unidade
    nome_unidade: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    telefone: "",
    whatsapp_unidade: "",
    email_unidade: "",
    registro_responsavel: "",
    nome_responsavel_tecnico: "",
    especialidades_atendidas: [],
    quantidade_cadeiras: "",
    horario_funcionamento: "",
    foto_fachada: null,

    // ETAPA 4: Aceite
    aceita_termos: false
  });

  const totalEtapas = 4;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  // Funções de máscara
  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraWhatsApp = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const aplicarMascaraData = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+?$/, "$1");
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleEspecialidade = (especialidade) => {
    setFormData(prev => {
      const especialidades = prev.especialidades_atendidas.includes(especialidade)
        ? prev.especialidades_atendidas.filter(e => e !== especialidade)
        : [...prev.especialidades_atendidas, especialidade];
      return { ...prev, especialidades_atendidas: especialidades };
    });
  };

  const buscarCEP = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    
    if (cepLimpo.length !== 8) {
      toast.error("CEP inválido");
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();

      if (dados.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        uf: dados.uf || ""
      }));

      toast.success("Endereço preenchido automaticamente!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
    setBuscandoCep(false);
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.tipo_clinica) {
          toast.error("Selecione o tipo de clínica");
          return false;
        }
        if (!formData.nome_responsavel) {
          toast.error("Preencha o nome do responsável");
          return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error("Preencha um email válido");
          return false;
        }
        if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um WhatsApp válido (11 dígitos)");
          return false;
        }
        if (!formData.cpf_responsavel || formData.cpf_responsavel.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um CPF válido");
          return false;
        }
        if (!formData.data_nascimento) {
          toast.error("Preencha a data de nascimento");
          return false;
        }
        return true;

      case 2:
        if (!formData.razao_social) {
          toast.error("Preencha a razão social");
          return false;
        }
        if (!formData.nome_fantasia) {
          toast.error("Preencha o nome fantasia");
          return false;
        }
        if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
          toast.error("Preencha um CNPJ válido");
          return false;
        }
        return true;

      case 3:
        if (!formData.cep) {
          toast.error("Preencha o CEP");
          return false;
        }
        if (!formData.endereco) {
          toast.error("Preencha o endereço");
          return false;
        }
        if (!formData.numero) {
          toast.error("Preencha o número");
          return false;
        }
        if (!formData.cidade) {
          toast.error("Preencha a cidade");
          return false;
        }
        if (!formData.uf) {
          toast.error("Preencha a UF");
          return false;
        }
        if (!formData.telefone) {
          toast.error("Preencha o telefone");
          return false;
        }
        if (!formData.registro_responsavel) {
          toast.error(`Preencha o número ${getRegistroLabel(formData.tipo_clinica === "ODONTOLOGIA" ? "ODONTOLOGIA" : "MEDICINA")} do responsável técnico`);
          return false;
        }
        if (!formData.nome_responsavel_tecnico) {
          toast.error("Preencha o nome do responsável técnico");
          return false;
        }
        return true;

      case 4:
        if (!formData.aceita_termos) {
          toast.error("Você deve aceitar os Termos de Uso e Política de Privacidade");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const proximaEtapa = () => {
    if (validarEtapa(etapaAtual)) {
      setEtapaAtual(prev => Math.min(prev + 1, totalEtapas));
    }
  };

  const etapaAnterior = () => {
    setEtapaAtual(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = async (campo, file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas imagens JPG/PNG são permitidas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange(campo, file_url);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo: " + error.message);
    }
  };

  const finalizarCadastro = async () => {
    if (!validarEtapa(4)) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();

      // Converter data de nascimento para formato ddmmaaaa
      const [dia, mes, ano] = formData.data_nascimento.split("/");
      const dataNascimento = `${dia}${mes}${ano}`;

      // 1. Criar CompanyOwner
      const owner = await base44.entities.CompanyOwner.create({
        user_id: user.id,
        nome_completo: formData.nome_responsavel,
        cpf: formData.cpf_responsavel.replace(/\D/g, ""),
        data_nascimento: dataNascimento,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        status_cadastro: "EM_ANALISE"
      });

      // 2. Criar CompanyUnit
      const dadosUnidade = {
        owner_id: owner.id,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_empresa: "CLINICA",
        tipo_mundo: formData.tipo_clinica,
        whatsapp: formData.whatsapp_unidade ? formData.whatsapp_unidade.replace(/\D/g, "") : formData.whatsapp.replace(/\D/g, ""),
        email: formData.email_unidade || formData.email,
        telefone_fixo: formData.telefone.replace(/\D/g, ""),
        cep: formData.cep.replace(/\D/g, ""),
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento || "",
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        nome_responsavel: formData.nome_responsavel_tecnico,
        status_cadastro: "EM_ANALISE",
        ativo: true
      };

      // Adicionar CRO ou CRM conforme o tipo
      if (formData.tipo_clinica === "ODONTOLOGIA") {
        dadosUnidade.cro_responsavel = formData.registro_responsavel;
      } else {
        dadosUnidade.crm_responsavel = formData.registro_responsavel;
      }

      // Adicionar foto se existir
      if (formData.foto_fachada) {
        dadosUnidade.foto_fachada_url = formData.foto_fachada;
      }

      await base44.entities.CompanyUnit.create(dadosUnidade);

      toast.success("✅ Cadastro realizado com sucesso! Aguarde a aprovação.");
      navigate("/CadastroSucesso");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("❌ Erro ao realizar cadastro: " + error.message);
    }
    setLoading(false);
  };

  const especialidades = getEspecialidades(formData.tipo_clinica || "ODONTOLOGIA");

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tipo de Clínica */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Tipo de Clínica: *</Label>
              <RadioGroup
                value={formData.tipo_clinica}
                onValueChange={(value) => handleInputChange("tipo_clinica", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-blue-400">
                  <RadioGroupItem value="ODONTOLOGIA" id="odonto" />
                  <Label htmlFor="odonto" className="cursor-pointer">Odontologia</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-blue-400">
                  <RadioGroupItem value="MEDICINA" id="medicina" />
                  <Label htmlFor="medicina" className="cursor-pointer">Medicina</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dados do Responsável */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="nome_responsavel">Nome Completo do Responsável *</Label>
                <Input
                  id="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                  placeholder="João Silva"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@clinica.com"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", aplicarMascaraWhatsApp(e.target.value))}
                  placeholder="(62) 99999-9999"
                  maxLength={15}
                />
              </div>

              <div>
                <Label htmlFor="cpf_responsavel">CPF do Responsável *</Label>
                <Input
                  id="cpf_responsavel"
                  value={formData.cpf_responsavel}
                  onChange={(e) => handleInputChange("cpf_responsavel", aplicarMascaraCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange("data_nascimento", aplicarMascaraData(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => handleInputChange("razao_social", e.target.value)}
                placeholder="Clínica Exemplo Ltda"
              />
            </div>

            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                placeholder="Clínica Exemplo"
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", aplicarMascaraCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* CEP com busca automática */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", aplicarMascaraCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  onBlur={buscarCEP}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={buscarCEP}
                  disabled={buscandoCep}
                  className="w-full"
                  variant="outline"
                >
                  {buscandoCep ? "Buscando..." : "Buscar CEP"}
                </Button>
              </div>
            </div>

            {/* Endereço */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua Exemplo"
                />
              </div>

              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Sala 10"
                />
              </div>

              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Centro"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    placeholder="Goiânia"
                  />
                </div>

                <div>
                  <Label htmlFor="uf">UF *</Label>
                  <Select value={formData.uf} onValueChange={(value) => handleInputChange("uf", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone Fixo *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", aplicarMascaraTelefone(e.target.value))}
                  placeholder="(62) 3333-3333"
                  maxLength={14}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp_unidade">WhatsApp da Unidade</Label>
                <Input
                  id="whatsapp_unidade"
                  value={formData.whatsapp_unidade}
                  onChange={(e) => handleInputChange("whatsapp_unidade", aplicarMascaraWhatsApp(e.target.value))}
                  placeholder="(62) 99999-9999"
                  maxLength={15}
                />
              </div>

              <div>
                <Label htmlFor="email_unidade">Email da Unidade</Label>
                <Input
                  id="email_unidade"
                  type="email"
                  value={formData.email_unidade}
                  onChange={(e) => handleInputChange("email_unidade", e.target.value)}
                  placeholder="unidade@clinica.com"
                />
              </div>
            </div>

            {/* Responsável Técnico */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Responsável Técnico</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_responsavel_tecnico">Nome do Responsável Técnico *</Label>
                  <Input
                    id="nome_responsavel_tecnico"
                    value={formData.nome_responsavel_tecnico}
                    onChange={(e) => handleInputChange("nome_responsavel_tecnico", e.target.value)}
                    placeholder="Dr. João Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="registro_responsavel">
                    {getRegistroLabel(formData.tipo_clinica || "ODONTOLOGIA")} do Responsável *
                  </Label>
                  <Input
                    id="registro_responsavel"
                    value={formData.registro_responsavel}
                    onChange={(e) => handleInputChange("registro_responsavel", e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Especialidades Atendidas (opcional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {especialidades.map((esp) => (
                  <div key={esp} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`esp-${esp}`}
                      checked={formData.especialidades_atendidas.includes(esp)}
                      onChange={() => toggleEspecialidade(esp)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer">
                      {esp}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantidade_cadeiras">
                  Quantidade de {formData.tipo_clinica === "ODONTOLOGIA" ? "Cadeiras" : "Consultórios"}
                </Label>
                <Input
                  id="quantidade_cadeiras"
                  type="number"
                  value={formData.quantidade_cadeiras}
                  onChange={(e) => handleInputChange("quantidade_cadeiras", e.target.value)}
                  placeholder="5"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="horario_funcionamento">Horário de Funcionamento</Label>
                <Input
                  id="horario_funcionamento"
                  value={formData.horario_funcionamento}
                  onChange={(e) => handleInputChange("horario_funcionamento", e.target.value)}
                  placeholder="Seg-Sex 8h-18h"
                />
              </div>
            </div>

            {/* Foto da Fachada */}
            <div>
              <Label htmlFor="foto_fachada">Foto da Fachada (opcional)</Label>
              <div className="mt-2">
                <Input
                  id="foto_fachada"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_fachada", e.target.files[0])}
                  className="cursor-pointer"
                />
                {formData.foto_fachada && (
                  <p className="text-xs text-green-600 mt-1">✓ Foto enviada</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Revisão dos Dados */}
            <div className="border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 REVISÃO DOS DADOS</h3>
              
              <div className="space-y-4">
                {/* Tipo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">TIPO DE CLÍNICA</h4>
                  <p className="text-base">{formData.tipo_clinica}</p>
                </div>

                {/* Responsável */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">RESPONSÁVEL PELA EMPRESA</h4>
                  <p><strong>Nome:</strong> {formData.nome_responsavel}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                  <p><strong>CPF:</strong> {formData.cpf_responsavel}</p>
                </div>

                {/* Empresa */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">DADOS DA EMPRESA</h4>
                  <p><strong>Razão Social:</strong> {formData.razao_social}</p>
                  <p><strong>Nome Fantasia:</strong> {formData.nome_fantasia}</p>
                  <p><strong>CNPJ:</strong> {formData.cnpj}</p>
                </div>

                {/* Unidade */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">PRIMEIRA UNIDADE</h4>
                  <p><strong>Endereço:</strong> {formData.endereco}, {formData.numero} {formData.complemento && `- ${formData.complemento}`}</p>
                  <p><strong>Bairro:</strong> {formData.bairro}</p>
                  <p><strong>Cidade:</strong> {formData.cidade} - {formData.uf}</p>
                  <p><strong>CEP:</strong> {formData.cep}</p>
                  <p><strong>Telefone:</strong> {formData.telefone}</p>
                  {formData.whatsapp_unidade && <p><strong>WhatsApp:</strong> {formData.whatsapp_unidade}</p>}
                  <p><strong>Responsável Técnico:</strong> {formData.nome_responsavel_tecnico}</p>
                  <p>
                    <strong>{getRegistroLabel(formData.tipo_clinica || "ODONTOLOGIA")}:</strong> {formData.registro_responsavel}
                  </p>
                  {formData.especialidades_atendidas.length > 0 && (
                    <p><strong>Especialidades:</strong> {formData.especialidades_atendidas.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Aceitar Termos */}
            <div className="flex items-start space-x-3 border-2 border-gray-200 rounded-lg p-4">
              <input
                type="checkbox"
                id="aceita_termos"
                checked={formData.aceita_termos}
                onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                className="w-5 h-5 mt-1"
              />
              <Label htmlFor="aceita_termos" className="cursor-pointer text-sm">
                Li e aceito os <span className="text-blue-600 underline">Termos de Uso</span> e{" "}
                <span className="text-blue-600 underline">Política de Privacidade</span>
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              Cadastro de Clínica
            </CardTitle>
            <p className="text-sm text-blue-100 mt-2">
              Etapa {etapaAtual} de {totalEtapas} - {
                etapaAtual === 1 ? "Tipo e Responsável" :
                etapaAtual === 2 ? "Dados da Empresa" :
                etapaAtual === 3 ? "Primeira Unidade" :
                "Revisão e Finalização"
              }
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <Progress value={progressoPercentual} className="h-3" />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {Math.round(progressoPercentual)}% concluído
              </p>
            </div>

            {/* Renderizar Etapa Atual */}
            {renderEtapa()}

            {/* Botões de Navegação */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={etapaAnterior}
                disabled={etapaAtual === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              {etapaAtual < totalEtapas ? (
                <Button
                  onClick={proximaEtapa}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={finalizarCadastro}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  {loading ? "Finalizando..." : "Finalizar Cadastro"}
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
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

export default function CadastroProfissional() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    // ETAPA 1: Tipo e Dados Básicos
    tipo_profissional: "",
    nome_completo: "",
    email: "",
    whatsapp: "",
    cpf: "",
    data_nascimento: "",
    genero: "",
    instagram: "",

    // ETAPA 2: Formação e Especialidade
    numero_registro: "",
    uf_registro: "",
    tempo_formado_anos: "",
    especialidade_principal: "",
    outras_especialidades: [],
    tempo_especialidade_anos: "",
    instituicao_formacao: "",

    // ETAPA 3: Disponibilidade
    cidades_atendimento: [],
    cidade_input: "",
    uf_input: "",
    dias_semana_disponiveis: [],
    turno_preferido: "",
    carga_horaria_desejada: "",
    disponibilidade_inicio: "",
    status_disponibilidade: "DISPONIVEL",
    aceita_freelance: false,

    // ETAPA 4: Preferências Financeiras
    forma_remuneracao: [],
    valor_minimo_diaria: "",
    porcentagem_minima: "",
    observacoes: "",

    // ETAPA 5: Documentos
    foto_perfil: null,
    documento_registro: null,
    curriculo: null,
    aceita_termos: false
  });

  const totalEtapas = 5;
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

  const aplicarMascaraWhatsApp = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
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

  const adicionarCidade = () => {
    if (!formData.cidade_input.trim() || !formData.uf_input) {
      toast.error("Preencha a cidade e UF");
      return;
    }
    
    if (formData.cidades_atendimento.length >= 5) {
      toast.error("Máximo de 5 cidades");
      return;
    }

    const cidadeCompleta = `${formData.cidade_input.trim()} - ${formData.uf_input}`;
    
    if (formData.cidades_atendimento.includes(cidadeCompleta)) {
      toast.error("Cidade já adicionada");
      return;
    }

    setFormData(prev => ({
      ...prev,
      cidades_atendimento: [...prev.cidades_atendimento, cidadeCompleta],
      cidade_input: "",
      uf_input: ""
    }));
  };

  const removerCidade = (cidade) => {
    setFormData(prev => ({
      ...prev,
      cidades_atendimento: prev.cidades_atendimento.filter(c => c !== cidade)
    }));
  };

  const toggleDiaSemana = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_semana_disponiveis.includes(dia)
        ? prev.dias_semana_disponiveis.filter(d => d !== dia)
        : [...prev.dias_semana_disponiveis, dia];
      return { ...prev, dias_semana_disponiveis: dias };
    });
  };

  const toggleFormaRemuneracao = (forma) => {
    setFormData(prev => {
      const formas = prev.forma_remuneracao.includes(forma)
        ? prev.forma_remuneracao.filter(f => f !== forma)
        : [...prev.forma_remuneracao, forma];
      return { ...prev, forma_remuneracao: formas };
    });
  };

  const toggleOutraEspecialidade = (especialidade) => {
    setFormData(prev => {
      const especialidades = prev.outras_especialidades.includes(especialidade)
        ? prev.outras_especialidades.filter(e => e !== especialidade)
        : [...prev.outras_especialidades, especialidade];
      return { ...prev, outras_especialidades: especialidades };
    });
  };

  // Validação por etapa
  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.tipo_profissional) {
          toast.error("Selecione o tipo de profissional");
          return false;
        }
        if (!formData.nome_completo) {
          toast.error("Preencha o nome completo");
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
        if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um CPF válido");
          return false;
        }
        if (!formData.data_nascimento) {
          toast.error("Preencha a data de nascimento");
          return false;
        }
        return true;

      case 2:
        if (!formData.numero_registro) {
          toast.error(`Preencha o número ${getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")}`);
          return false;
        }
        if (!formData.uf_registro) {
          toast.error("Selecione a UF do registro");
          return false;
        }
        if (!formData.tempo_formado_anos) {
          toast.error("Preencha o tempo de formado");
          return false;
        }
        if (!formData.especialidade_principal) {
          toast.error("Selecione a especialidade principal");
          return false;
        }
        return true;

      case 3:
        if (formData.cidades_atendimento.length === 0) {
          toast.error("Adicione pelo menos uma cidade de atendimento");
          return false;
        }
        if (formData.dias_semana_disponiveis.length === 0) {
          toast.error("Selecione pelo menos um dia disponível");
          return false;
        }
        if (!formData.turno_preferido) {
          toast.error("Selecione o turno preferido");
          return false;
        }
        return true;

      case 4:
        if (formData.forma_remuneracao.length === 0) {
          toast.error("Selecione pelo menos uma forma de remuneração");
          return false;
        }
        if (!formData.observacoes) {
          toast.error("Preencha as observações sobre seu trabalho");
          return false;
        }
        return true;

      case 5:
        if (!formData.documento_registro) {
          toast.error("É obrigatório enviar o documento do registro (CRO/CRM)");
          return false;
        }
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

    // Validar tipo de arquivo
    const allowedTypes = campo === "curriculo" 
      ? ["application/pdf"]
      : ["image/jpeg", "image/jpg", "image/png"];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(campo === "curriculo" ? "Apenas arquivos PDF são permitidos" : "Apenas imagens JPG/PNG são permitidas");
      return;
    }

    // Validar tamanho (max 5MB)
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
    if (!validarEtapa(5)) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();

      // Converter data de nascimento para formato ddmmaaaa
      const [dia, mes, ano] = formData.data_nascimento.split("/");
      const dataNascimento = `${dia}${mes}${ano}`;

      const dadosProfissional = {
        user_id: user.id,
        nome_completo: formData.nome_completo,
        cpf: formData.cpf.replace(/\D/g, ""),
        data_nascimento: dataNascimento,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        exibir_email: false,
        instagram: formData.instagram || "",
        tipo_profissional: formData.tipo_profissional,
        registro_conselho: formData.numero_registro,
        uf_conselho: formData.uf_registro,
        tempo_formado_anos: parseInt(formData.tempo_formado_anos),
        especialidade_principal: formData.especialidade_principal,
        tempo_especialidade_anos: formData.tempo_especialidade_anos ? parseInt(formData.tempo_especialidade_anos) : 0,
        cidades_atendimento: formData.cidades_atendimento,
        dias_semana_disponiveis: formData.dias_semana_disponiveis,
        disponibilidade_inicio: "IMEDIATO",
        status_disponibilidade: formData.status_disponibilidade,
        aceita_freelance: formData.aceita_freelance,
        forma_remuneracao: formData.forma_remuneracao,
        observacoes: formData.observacoes,
        new_jobs_ativo: true,
        status_cadastro: "EM_ANALISE"
      };

      // Adicionar documentos
      if (formData.documento_registro) dadosProfissional.carteirinha_conselho_url = formData.documento_registro;

      await base44.entities.Professional.create(dadosProfissional);

      toast.success("✅ Cadastro realizado com sucesso! Aguarde a aprovação.");
      navigate("/CadastroSucesso");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("❌ Erro ao realizar cadastro: " + error.message);
    }
    setLoading(false);
  };

  const especialidades = getEspecialidades(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA");

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tipo de Profissional */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Você é: *</Label>
              <RadioGroup
                value={formData.tipo_profissional}
                onValueChange={(value) => handleInputChange("tipo_profissional", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-blue-400">
                  <RadioGroupItem value="DENTISTA" id="dentista" />
                  <Label htmlFor="dentista" className="cursor-pointer">Dentista</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 flex-1 cursor-pointer hover:border-blue-400">
                  <RadioGroupItem value="MEDICO" id="medico" />
                  <Label htmlFor="medico" className="cursor-pointer">Médico</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Grid de Campos */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange("nome_completo", e.target.value)}
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
                  placeholder="joao@exemplo.com"
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
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", aplicarMascaraCPF(e.target.value))}
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

              <div>
                <Label htmlFor="genero">Gênero</Label>
                <Select value={formData.genero} onValueChange={(value) => handleInputChange("genero", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="instagram">Instagram (opcional)</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="@seuperfil"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="numero_registro">
                  Número do {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} *
                </Label>
                <Input
                  id="numero_registro"
                  value={formData.numero_registro}
                  onChange={(e) => handleInputChange("numero_registro", e.target.value)}
                  placeholder="12345"
                />
              </div>

              <div>
                <Label htmlFor="uf_registro">UF do Registro *</Label>
                <Select value={formData.uf_registro} onValueChange={(value) => handleInputChange("uf_registro", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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

            {/* Especialidade Principal */}
            <div>
              <Label htmlFor="especialidade_principal">Especialidade Principal *</Label>
              <Select
                value={formData.especialidade_principal}
                onValueChange={(value) => handleInputChange("especialidade_principal", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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

            {/* Outras Especialidades */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Outras Especialidades (opcional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {especialidades
                  .filter(esp => esp !== formData.especialidade_principal)
                  .map((esp) => (
                    <div key={esp} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`esp-${esp}`}
                        checked={formData.outras_especialidades.includes(esp)}
                        onChange={() => toggleOutraEspecialidade(esp)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer">
                        {esp}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tempo de Formado e Especialista */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="tempo_formado_anos">Anos de Formado *</Label>
                <Input
                  id="tempo_formado_anos"
                  type="number"
                  value={formData.tempo_formado_anos}
                  onChange={(e) => handleInputChange("tempo_formado_anos", e.target.value)}
                  placeholder="5"
                  min="0"
                  max="99"
                />
              </div>

              <div>
                <Label htmlFor="tempo_especialidade_anos">Anos de Especialidade (opcional)</Label>
                <Input
                  id="tempo_especialidade_anos"
                  type="number"
                  value={formData.tempo_especialidade_anos}
                  onChange={(e) => handleInputChange("tempo_especialidade_anos", e.target.value)}
                  placeholder="3"
                  min="0"
                  max="99"
                />
              </div>
            </div>

            {/* Instituição de Formação */}
            <div>
              <Label htmlFor="instituicao_formacao">Instituição de Formação (opcional)</Label>
              <Input
                id="instituicao_formacao"
                value={formData.instituicao_formacao}
                onChange={(e) => handleInputChange("instituicao_formacao", e.target.value)}
                placeholder="Ex: Universidade Federal de Goiás"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Cidades de Atendimento */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Cidades que Você Atende * (máx. 5)</Label>
              
              {/* Input para adicionar cidade */}
              <div className="grid grid-cols-12 gap-3 mb-4">
                <div className="col-span-7">
                  <Input
                    value={formData.cidade_input}
                    onChange={(e) => handleInputChange("cidade_input", e.target.value)}
                    placeholder="Ex: Goiânia"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarCidade())}
                  />
                </div>
                <div className="col-span-3">
                  <Select 
                    value={formData.uf_input} 
                    onValueChange={(value) => handleInputChange("uf_input", value)}
                  >
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
                <div className="col-span-2">
                  <Button 
                    type="button" 
                    onClick={adicionarCidade}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de cidades adicionadas */}
              {formData.cidades_atendimento.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cidades adicionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.cidades_atendimento.map((cidade, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                      >
                        <span>{cidade}</span>
                        <button
                          type="button"
                          onClick={() => removerCidade(cidade)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dias Disponíveis */}
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Dias Disponíveis * (selecione todos que puder)
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: "SEG", label: "Segunda" },
                  { value: "TER", label: "Terça" },
                  { value: "QUA", label: "Quarta" },
                  { value: "QUI", label: "Quinta" },
                  { value: "SEX", label: "Sexta" },
                  { value: "SAB", label: "Sábado" },
                  { value: "DOM", label: "Domingo" },
                  { value: "INTEGRAL", label: "Integral" }
                ].map((dia) => (
                  <Button
                    key={dia.value}
                    type="button"
                    variant={formData.dias_semana_disponiveis.includes(dia.value) ? "default" : "outline"}
                    onClick={() => toggleDiaSemana(dia.value)}
                    className={formData.dias_semana_disponiveis.includes(dia.value) ? "bg-blue-600" : ""}
                  >
                    {dia.label}
                  </Button>
                ))}
              </div>
              {formData.dias_semana_disponiveis.includes("INTEGRAL") && (
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ Integral significa disponibilidade em todos os dias da semana
                </p>
              )}
            </div>

            {/* Turno e Carga Horária */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="turno_preferido">Turno Preferido *</Label>
                <Select
                  value={formData.turno_preferido}
                  onValueChange={(value) => handleInputChange("turno_preferido", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANHA">Manhã</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                    <SelectItem value="NOITE">Noite</SelectItem>
                    <SelectItem value="INTEGRAL">Integral (qualquer turno)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="carga_horaria_desejada">Carga Horária Desejada (opcional)</Label>
                <Input
                  id="carga_horaria_desejada"
                  value={formData.carga_horaria_desejada}
                  onChange={(e) => handleInputChange("carga_horaria_desejada", e.target.value)}
                  placeholder="Ex: 20h semanais, 4h por dia"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Formas de Remuneração */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Formas de Remuneração que Aceita *</Label>
              <div className="space-y-3">
                {[
                  { value: "DIARIA", label: "Diária (valor por dia trabalhado)" },
                  { value: "PORCENTAGEM", label: "Porcentagem (% sobre procedimentos)" },
                  { value: "FIXO", label: "Fixo (salário mensal fixo)" },
                  { value: "A_COMBINAR", label: "A Combinar" }
                ].map((forma) => (
                  <div
                    key={forma.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.forma_remuneracao.includes(forma.value)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => toggleFormaRemuneracao(forma.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.forma_remuneracao.includes(forma.value)}
                        onChange={() => {}}
                        className="w-5 h-5 text-blue-600"
                      />
                      <Label className="cursor-pointer text-base">
                        {forma.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campos Condicionais */}
            {(formData.forma_remuneracao.includes("DIARIA") || formData.forma_remuneracao.includes("PORCENTAGEM")) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Valor Mínimo Diária */}
                {formData.forma_remuneracao.includes("DIARIA") && (
                  <div>
                    <Label htmlFor="valor_minimo_diaria">Valor Mínimo Diária (opcional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="valor_minimo_diaria"
                        type="number"
                        value={formData.valor_minimo_diaria}
                        onChange={(e) => handleInputChange("valor_minimo_diaria", e.target.value)}
                        placeholder="500"
                        className="pl-10"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {/* Porcentagem Mínima */}
                {formData.forma_remuneracao.includes("PORCENTAGEM") && (
                  <div>
                    <Label htmlFor="porcentagem_minima">Porcentagem Mínima (opcional)</Label>
                    <div className="relative">
                      <Input
                        id="porcentagem_minima"
                        type="number"
                        value={formData.porcentagem_minima}
                        onChange={(e) => handleInputChange("porcentagem_minima", e.target.value)}
                        placeholder="30"
                        className="pr-10"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dica */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>DICA:</strong> Deixar valores em branco significa que você está aberto a negociação.
              </p>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">
                Observações sobre trabalho e disponibilidade *
              </Label>
              <textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Fale sobre sua experiência, preferências de trabalho, horários que prefere, tipo de clínica que procura, etc."
                className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.observacoes.length}/500 caracteres
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Uploads */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📤 UPLOADS</h3>
              
              <div className="space-y-4">
                {/* Foto de Perfil */}
                <div>
                  <Label htmlFor="foto_perfil">Foto de Perfil (recomendado)</Label>
                  <div className="mt-2">
                    <Input
                      id="foto_perfil"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileUpload("foto_perfil", e.target.files[0])}
                      className="cursor-pointer"
                    />
                    {formData.foto_perfil && (
                      <p className="text-xs text-green-600 mt-1">✓ Arquivo enviado</p>
                    )}
                  </div>
                </div>

                {/* Documento do Registro */}
                <div>
                  <Label htmlFor="documento_registro" className="text-red-600">
                    Documento do {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} * (obrigatório)
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="documento_registro"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={(e) => handleFileUpload("documento_registro", e.target.files[0])}
                      className="cursor-pointer"
                    />
                    {formData.documento_registro && (
                      <p className="text-xs text-green-600 mt-1">✓ Arquivo enviado</p>
                    )}
                  </div>
                </div>

                {/* Currículo */}
                <div>
                  <Label htmlFor="curriculo">Currículo (opcional)</Label>
                  <div className="mt-2">
                    <Input
                      id="curriculo"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload("curriculo", e.target.files[0])}
                      className="cursor-pointer"
                    />
                    {formData.curriculo && (
                      <p className="text-xs text-green-600 mt-1">✓ Arquivo enviado</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Apenas PDF, máximo 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revisão dos Dados */}
            <div className="border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 REVISÃO DOS DADOS</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Tipo:</strong> {formData.tipo_profissional === "DENTISTA" ? "Dentista" : "Médico"}</p>
                <p><strong>Nome:</strong> {formData.nome_completo}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                <p>
                  <strong>{getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")}:</strong>{" "}
                  {formData.numero_registro} - {formData.uf_registro}
                </p>
                <p><strong>Especialidade:</strong> {formData.especialidade_principal}</p>
                {formData.outras_especialidades.length > 0 && (
                  <p><strong>Outras especialidades:</strong> {formData.outras_especialidades.join(", ")}</p>
                )}
                <p><strong>Formado há:</strong> {formData.tempo_formado_anos} anos</p>
                {formData.tempo_especialidade_anos && (
                  <p><strong>Especialista há:</strong> {formData.tempo_especialidade_anos} anos</p>
                )}
                {formData.instituicao_formacao && (
                  <p><strong>Instituição:</strong> {formData.instituicao_formacao}</p>
                )}
                <p><strong>Cidades:</strong> {formData.cidades_atendimento.join(", ")}</p>
                <p>
                  <strong>Dias:</strong>{" "}
                  {formData.dias_semana_disponiveis.map(d => {
                    const dias = {
                      SEG: "Segunda", TER: "Terça", QUA: "Quarta", QUI: "Quinta",
                      SEX: "Sexta", SAB: "Sábado", DOM: "Domingo", INTEGRAL: "Integral"
                    };
                    return dias[d];
                  }).join(", ")}
                </p>
                <p><strong>Turno:</strong> {
                  formData.turno_preferido === "MANHA" ? "Manhã" :
                  formData.turno_preferido === "TARDE" ? "Tarde" :
                  formData.turno_preferido === "NOITE" ? "Noite" : "Integral"
                }</p>
                {formData.carga_horaria_desejada && (
                  <p><strong>Carga horária:</strong> {formData.carga_horaria_desejada}</p>
                )}
                <p>
                  <strong>Remuneração:</strong>{" "}
                  {formData.forma_remuneracao.map(f => {
                    const formas = { DIARIA: "Diária", PORCENTAGEM: "Porcentagem", FIXO: "Fixo", A_COMBINAR: "A Combinar" };
                    let texto = formas[f];
                    if (f === "DIARIA" && formData.valor_minimo_diaria) texto += ` (mín R$ ${formData.valor_minimo_diaria})`;
                    if (f === "PORCENTAGEM" && formData.porcentagem_minima) texto += ` (mín ${formData.porcentagem_minima}%)`;
                    return texto;
                  }).join(", ")}
                </p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              Cadastro de Profissional
            </CardTitle>
            <p className="text-sm text-blue-100 mt-2">
              Etapa {etapaAtual} de {totalEtapas} - {
                etapaAtual === 1 ? "Dados Básicos" :
                etapaAtual === 2 ? "Formação e Especialidade" :
                etapaAtual === 3 ? "Disponibilidade" :
                etapaAtual === 4 ? "Preferências Financeiras" :
                "Documentos e Revisão"
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
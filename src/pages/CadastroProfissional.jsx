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
    registro_conselho: "",
    uf_conselho: "",
    tempo_formado_anos: "",
    especialidade_principal: "",
    tempo_especialidade_anos: "",

    // ETAPA 3: Disponibilidade
    cidades_atendimento: [""],
    dias_semana_disponiveis: [],
    disponibilidade_inicio: "",
    status_disponibilidade: "DISPONIVEL",
    aceita_freelance: false,

    // ETAPA 4: Preferências Financeiras
    forma_remuneracao: [],
    observacoes: "",

    // ETAPA 5: Documentos
    selfie_documento_url: "",
    documento_frente_url: "",
    documento_verso_url: "",
    carteirinha_conselho_url: ""
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

  const handleCidadeChange = (index, valor) => {
    const novasCidades = [...formData.cidades_atendimento];
    novasCidades[index] = valor;
    setFormData(prev => ({ ...prev, cidades_atendimento: novasCidades }));
  };

  const adicionarCidade = () => {
    if (formData.cidades_atendimento.length < 5) {
      setFormData(prev => ({
        ...prev,
        cidades_atendimento: [...prev.cidades_atendimento, ""]
      }));
    }
  };

  const removerCidade = (index) => {
    if (formData.cidades_atendimento.length > 1) {
      const novasCidades = formData.cidades_atendimento.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, cidades_atendimento: novasCidades }));
    }
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
        if (!formData.registro_conselho) {
          toast.error(`Preencha o número ${getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")}`);
          return false;
        }
        if (!formData.uf_conselho) {
          toast.error("Selecione a UF do conselho");
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
        if (formData.cidades_atendimento.filter(c => c.trim()).length === 0) {
          toast.error("Preencha pelo menos uma cidade de atendimento");
          return false;
        }
        if (formData.dias_semana_disponiveis.length === 0) {
          toast.error("Selecione pelo menos um dia da semana");
          return false;
        }
        if (!formData.disponibilidade_inicio) {
          toast.error("Selecione quando pode começar");
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
        registro_conselho: formData.registro_conselho,
        uf_conselho: formData.uf_conselho,
        tempo_formado_anos: parseInt(formData.tempo_formado_anos),
        especialidade_principal: formData.especialidade_principal,
        tempo_especialidade_anos: formData.tempo_especialidade_anos ? parseInt(formData.tempo_especialidade_anos) : 0,
        cidades_atendimento: formData.cidades_atendimento.filter(c => c.trim()),
        dias_semana_disponiveis: formData.dias_semana_disponiveis,
        disponibilidade_inicio: formData.disponibilidade_inicio,
        status_disponibilidade: formData.status_disponibilidade,
        aceita_freelance: formData.aceita_freelance,
        forma_remuneracao: formData.forma_remuneracao,
        observacoes: formData.observacoes,
        new_jobs_ativo: true,
        status_cadastro: "EM_ANALISE"
      };

      // Adicionar URLs de documentos se existirem
      if (formData.selfie_documento_url) dadosProfissional.selfie_documento_url = formData.selfie_documento_url;
      if (formData.documento_frente_url) dadosProfissional.documento_frente_url = formData.documento_frente_url;
      if (formData.documento_verso_url) dadosProfissional.documento_verso_url = formData.documento_verso_url;
      if (formData.carteirinha_conselho_url) dadosProfissional.carteirinha_conselho_url = formData.carteirinha_conselho_url;

      await base44.entities.Professional.create(dadosProfissional);

      toast.success("✅ Cadastro realizado com sucesso! Aguarde a aprovação.");
      navigate("/");
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
                <Label htmlFor="registro_conselho">
                  {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} *
                </Label>
                <Input
                  id="registro_conselho"
                  value={formData.registro_conselho}
                  onChange={(e) => handleInputChange("registro_conselho", e.target.value)}
                  placeholder="12345"
                />
              </div>

              <div>
                <Label htmlFor="uf_conselho">UF do Conselho *</Label>
                <Select value={formData.uf_conselho} onValueChange={(value) => handleInputChange("uf_conselho", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GO">GO</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tempo_formado_anos">Tempo de Formado (anos) *</Label>
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

              <div className="md:col-span-2">
                <Label htmlFor="tempo_especialidade_anos">Tempo como Especialista (anos) - Opcional</Label>
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Cidades de Atendimento */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Cidades de Atendimento * (máx. 5)</Label>
              {formData.cidades_atendimento.map((cidade, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <Input
                    value={cidade}
                    onChange={(e) => handleCidadeChange(index, e.target.value)}
                    placeholder="Goiânia - GO"
                    className="flex-1"
                  />
                  {formData.cidades_atendimento.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removerCidade(index)}
                      className="text-red-600"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
              {formData.cidades_atendimento.length < 5 && (
                <Button type="button" variant="outline" onClick={adicionarCidade} className="w-full">
                  + Adicionar Cidade
                </Button>
              )}
            </div>

            {/* Dias da Semana */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Dias da Semana Disponíveis *</Label>
              <div className="grid grid-cols-4 gap-3">
                {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM", "INTEGRAL"].map((dia) => (
                  <Button
                    key={dia}
                    type="button"
                    variant={formData.dias_semana_disponiveis.includes(dia) ? "default" : "outline"}
                    onClick={() => toggleDiaSemana(dia)}
                    className={formData.dias_semana_disponiveis.includes(dia) ? "bg-blue-600" : ""}
                  >
                    {dia}
                  </Button>
                ))}
              </div>
            </div>

            {/* Disponibilidade de Início */}
            <div>
              <Label htmlFor="disponibilidade_inicio">Quando pode começar? *</Label>
              <Select
                value={formData.disponibilidade_inicio}
                onValueChange={(value) => handleInputChange("disponibilidade_inicio", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMEDIATO">Imediato</SelectItem>
                  <SelectItem value="15_DIAS">15 dias</SelectItem>
                  <SelectItem value="30_DIAS">30 dias</SelectItem>
                  <SelectItem value="60_DIAS">60 dias</SelectItem>
                  <SelectItem value="A_COMBINAR">A combinar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aceita Freelance */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="aceita_freelance"
                checked={formData.aceita_freelance}
                onChange={(e) => handleInputChange("aceita_freelance", e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="aceita_freelance" className="cursor-pointer">
                Aceito trabalho de substituição/freelance
              </Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Formas de Remuneração */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Formas de Remuneração Aceitas *</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "DIARIA", label: "Diária" },
                  { value: "PORCENTAGEM", label: "Porcentagem" },
                  { value: "FIXO", label: "Fixo" },
                  { value: "A_COMBINAR", label: "A Combinar" }
                ].map((forma) => (
                  <Button
                    key={forma.value}
                    type="button"
                    variant={formData.forma_remuneracao.includes(forma.value) ? "default" : "outline"}
                    onClick={() => toggleFormaRemuneracao(forma.value)}
                    className={formData.forma_remuneracao.includes(forma.value) ? "bg-blue-600" : ""}
                  >
                    {forma.label}
                  </Button>
                ))}
              </div>
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
                placeholder="Fale sobre sua experiência, preferências de trabalho, etc."
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📄 O envio de documentos é opcional nesta etapa. Você pode finalizar o cadastro agora e enviar os documentos depois.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Selfie segurando documento (opcional)</Label>
                <Input type="file" accept="image/*" className="mt-1" />
              </div>

              <div>
                <Label>Documento frente (opcional)</Label>
                <Input type="file" accept="image/*" className="mt-1" />
              </div>

              <div>
                <Label>Documento verso (opcional)</Label>
                <Input type="file" accept="image/*" className="mt-1" />
              </div>

              <div>
                <Label>Carteirinha do conselho (opcional)</Label>
                <Input type="file" accept="image/*" className="mt-1" />
              </div>
            </div>

            {/* Revisão dos Dados */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Revisão dos Dados</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Tipo:</strong> {formData.tipo_profissional}</p>
                <p><strong>Nome:</strong> {formData.nome_completo}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                <p><strong>Especialidade:</strong> {formData.especialidade_principal}</p>
                <p><strong>Cidades:</strong> {formData.cidades_atendimento.filter(c => c).join(", ")}</p>
              </div>
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
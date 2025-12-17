import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ArrowRight, 
  UserRound, 
  FileText, 
  MapPin, 
  DollarSign, 
  Upload,
  Camera,
  CheckCircle2
} from "lucide-react";
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
    // Normalizar nomes: remover espaços duplicados e trim inicial
    if (campo === "nome_completo") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
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
        if (!formData.nome_completo.trim() || formData.nome_completo.trim().length < 3) {
          toast.error("Nome completo deve ter no mínimo 3 caracteres");
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
        nome_completo: formData.nome_completo.trim(),
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

  const etapasConfig = [
    { numero: 1, titulo: "Dados Básicos", icon: UserRound },
    { numero: 2, titulo: "Formação", icon: FileText },
    { numero: 3, titulo: "Disponibilidade", icon: MapPin },
    { numero: 4, titulo: "Remuneração", icon: DollarSign },
    { numero: 5, titulo: "Documentos", icon: Upload }
  ];

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tipo de Profissional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Você é: *</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleInputChange("tipo_profissional", "DENTISTA")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                    formData.tipo_profissional === "DENTISTA"
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipo_profissional === "DENTISTA" ? "border-yellow-400" : "border-gray-300"
                    }`}>
                      {formData.tipo_profissional === "DENTISTA" && (
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">Dentista 🦷</span>
                  </div>
                </div>
                <div
                  onClick={() => handleInputChange("tipo_profissional", "MEDICO")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                    formData.tipo_profissional === "MEDICO"
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipo_profissional === "MEDICO" ? "border-yellow-400" : "border-gray-300"
                    }`}>
                      {formData.tipo_profissional === "MEDICO" && (
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">Médico 🩺</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                  placeholder="João Silva"
                  maxLength={120}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.nome_completo.length}/120 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="joao@exemplo.com"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", aplicarMascaraWhatsApp(e.target.value))}
                  placeholder="(62) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CPF *</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", aplicarMascaraCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento *</label>
                <input
                  type="text"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange("data_nascimento", aplicarMascaraData(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gênero (opcional)</label>
                <select
                  value={formData.genero}
                  onChange={(e) => handleInputChange("genero", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram (opcional)</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="@seuperfil"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número do {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} *
                </label>
                <input
                  type="text"
                  value={formData.numero_registro}
                  onChange={(e) => handleInputChange("numero_registro", e.target.value)}
                  placeholder="12345"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">UF do Registro *</label>
                <select
                  value={formData.uf_registro}
                  onChange={(e) => handleInputChange("uf_registro", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Especialidade Principal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidade Principal *</label>
              <select
                value={formData.especialidade_principal}
                onChange={(e) => handleInputChange("especialidade_principal", e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
              >
                <option value="">Selecione</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            {/* Outras Especialidades */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Outras Especialidades (opcional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                {especialidades
                  .filter(esp => esp !== formData.especialidade_principal)
                  .map((esp) => (
                    <div key={esp} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`esp-${esp}`}
                        checked={formData.outras_especialidades.includes(esp)}
                        onChange={() => toggleOutraEspecialidade(esp)}
                        className="w-4 h-4 accent-yellow-400"
                      />
                      <label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer text-gray-700">
                        {esp}
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tempo de Formado e Especialista */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Anos de Formado *</label>
                <input
                  type="number"
                  value={formData.tempo_formado_anos}
                  onChange={(e) => handleInputChange("tempo_formado_anos", e.target.value)}
                  placeholder="5"
                  min="0"
                  max="99"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Anos de Especialidade (opcional)</label>
                <input
                  type="number"
                  value={formData.tempo_especialidade_anos}
                  onChange={(e) => handleInputChange("tempo_especialidade_anos", e.target.value)}
                  placeholder="3"
                  min="0"
                  max="99"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>
            </div>

            {/* Instituição de Formação */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instituição de Formação (opcional)</label>
              <input
                type="text"
                value={formData.instituicao_formacao}
                onChange={(e) => handleInputChange("instituicao_formacao", e.target.value)}
                placeholder="Ex: Universidade Federal de Goiás"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Cidades de Atendimento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Cidades que Você Atende * (máx. 5)</label>
              
              {/* Input para adicionar cidade */}
              <div className="grid grid-cols-12 gap-3 mb-4">
                <div className="col-span-7">
                  <input
                    type="text"
                    value={formData.cidade_input}
                    onChange={(e) => handleInputChange("cidade_input", e.target.value)}
                    placeholder="Ex: Goiânia"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarCidade())}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={formData.uf_input}
                    onChange={(e) => handleInputChange("uf_input", e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                  >
                    <option value="">UF</option>
                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={adicionarCidade}
                    className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Lista de cidades adicionadas */}
              {formData.cidades_atendimento.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.cidades_atendimento.map((cidade, index) => (
                    <div
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
                    >
                      <span>{cidade}</span>
                      <button
                        type="button"
                        onClick={() => removerCidade(cidade)}
                        className="text-yellow-600 hover:text-yellow-900 font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dias Disponíveis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dias Disponíveis * (selecione todos que puder)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "SEG", label: "Seg" },
                  { value: "TER", label: "Ter" },
                  { value: "QUA", label: "Qua" },
                  { value: "QUI", label: "Qui" },
                  { value: "SEX", label: "Sex" },
                  { value: "SAB", label: "Sáb" },
                  { value: "DOM", label: "Dom" },
                  { value: "INTEGRAL", label: "Integral" }
                ].map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDiaSemana(dia.value)}
                    className={`py-3 px-4 rounded-xl font-bold transition-all ${
                      formData.dias_semana_disponiveis.includes(dia.value)
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-400"
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
              {formData.dias_semana_disponiveis.includes("INTEGRAL") && (
                <p className="text-xs text-yellow-600 mt-2 font-medium">
                  ℹ️ Integral significa disponibilidade em todos os dias da semana
                </p>
              )}
            </div>

            {/* Turno e Carga Horária */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Turno Preferido *</label>
                <select
                  value={formData.turno_preferido}
                  onChange={(e) => handleInputChange("turno_preferido", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                  <option value="INTEGRAL">Integral (qualquer turno)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carga Horária Desejada (opcional)</label>
                <input
                  type="text"
                  value={formData.carga_horaria_desejada}
                  onChange={(e) => handleInputChange("carga_horaria_desejada", e.target.value)}
                  placeholder="Ex: 20h semanais, 4h por dia"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">Formas de Remuneração que Aceita *</label>
              <div className="space-y-3">
                {[
                  { value: "DIARIA", label: "Diária (valor por dia trabalhado)" },
                  { value: "PORCENTAGEM", label: "Porcentagem (% sobre procedimentos)" },
                  { value: "FIXO", label: "Fixo (salário mensal fixo)" },
                  { value: "A_COMBINAR", label: "A Combinar" }
                ].map((forma) => (
                  <div
                    key={forma.value}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                      formData.forma_remuneracao.includes(forma.value)
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                    onClick={() => toggleFormaRemuneracao(forma.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.forma_remuneracao.includes(forma.value) ? "border-yellow-400 bg-yellow-400" : "border-gray-300"
                      }`}>
                        {formData.forma_remuneracao.includes(forma.value) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{forma.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campos Condicionais */}
            {(formData.forma_remuneracao.includes("DIARIA") || formData.forma_remuneracao.includes("PORCENTAGEM")) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.forma_remuneracao.includes("DIARIA") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Mínimo Diária (opcional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input
                        type="number"
                        value={formData.valor_minimo_diaria}
                        onChange={(e) => handleInputChange("valor_minimo_diaria", e.target.value)}
                        placeholder="500"
                        min="0"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                {formData.forma_remuneracao.includes("PORCENTAGEM") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Porcentagem Mínima (opcional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.porcentagem_minima}
                        onChange={(e) => handleInputChange("porcentagem_minima", e.target.value)}
                        placeholder="30"
                        min="0"
                        max="100"
                        className="w-full pl-4 pr-12 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observações sobre trabalho e disponibilidade *
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Fale sobre sua experiência, preferências de trabalho, horários que prefere, tipo de clínica que procura, etc."
                className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.observacoes.length}/500 caracteres
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Uploads */}
            <div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-yellow-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-yellow-500" />
                  Documentos
                </h3>
                <p className="text-sm text-gray-600">Envie seus documentos para validação do cadastro</p>
              </div>
              
              <div className="space-y-4">
                {/* Foto de Perfil */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Foto de Perfil (recomendado)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-yellow-400 hover:bg-yellow-50/50 transition-all cursor-pointer group">
                    <input
                      type="file"
                      id="foto_perfil"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileUpload("foto_perfil", e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="foto_perfil" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center transition-all">
                        <Camera className="w-8 h-8 text-gray-400 group-hover:text-yellow-500" />
                      </div>
                      <p className="text-gray-700 font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-sm mt-1">JPG ou PNG, máx 5MB</p>
                    </label>
                    {formData.foto_perfil && (
                      <p className="text-green-600 text-sm mt-2 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Arquivo enviado!
                      </p>
                    )}
                  </div>
                </div>

                {/* Documento do Registro */}
                <div>
                  <label className="block text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                    Documento do {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} * 
                    <span className="text-xs">(obrigatório)</span>
                  </label>
                  <div className="border-2 border-dashed border-red-300 rounded-2xl p-8 text-center hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer group">
                    <input
                      type="file"
                      id="documento_registro"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={(e) => handleFileUpload("documento_registro", e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="documento_registro" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-all">
                        <FileText className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-gray-700 font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-sm mt-1">PDF, JPG ou PNG</p>
                    </label>
                    {formData.documento_registro && (
                      <p className="text-green-600 text-sm mt-2 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Documento enviado!
                      </p>
                    )}
                  </div>
                </div>

                {/* Currículo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Currículo (opcional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-yellow-400 hover:bg-yellow-50/50 transition-all cursor-pointer group">
                    <input
                      type="file"
                      id="curriculo"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload("curriculo", e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="curriculo" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center transition-all">
                        <FileText className="w-8 h-8 text-gray-400 group-hover:text-yellow-500" />
                      </div>
                      <p className="text-gray-700 font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-sm mt-1">Apenas PDF, máx 5MB</p>
                    </label>
                    {formData.curriculo && (
                      <p className="text-green-600 text-sm mt-2 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Currículo enviado!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Revisão dos Dados */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Resumo do Cadastro</h3>
              <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
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
                  <p><strong>Outras especialidades:</strong> {formData.outras_especialidades.slice(0, 3).join(", ")}{formData.outras_especialidades.length > 3 && "..."}</p>
                )}
                <p><strong>Formado há:</strong> {formData.tempo_formado_anos} anos</p>
                <p><strong>Cidades:</strong> {formData.cidades_atendimento.slice(0, 2).join(", ")}{formData.cidades_atendimento.length > 2 && "..."}</p>
                <p><strong>Dias:</strong> {formData.dias_semana_disponiveis.length} dias selecionados</p>
              </div>
            </div>

            {/* Aceitar Termos */}
            <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-yellow-400 transition-all">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="aceita_termos"
                  checked={formData.aceita_termos}
                  onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-yellow-400"
                />
                <label htmlFor="aceita_termos" className="cursor-pointer text-sm text-gray-700">
                  Li e aceito os <span className="text-yellow-500 font-bold underline">Termos de Uso</span> e{" "}
                  <span className="text-yellow-500 font-bold underline">Política de Privacidade</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-medium py-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
            <UserRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Cadastro Profissional</h1>
          <p className="text-gray-500 mt-2">Preencha seus dados para começar</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoPercentual}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2 px-1">
            <span>Etapa {etapaAtual} de {totalEtapas}</span>
            <span className="font-bold">{Math.round(progressoPercentual)}% completo</span>
          </div>
        </div>

        {/* Indicadores de Etapa */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2 px-1">
          {etapasConfig.map((etapa) => (
            <div key={etapa.numero} className="flex flex-col items-center min-w-[70px]">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                etapaAtual === etapa.numero
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-110"
                  : etapaAtual > etapa.numero
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}>
                {etapaAtual > etapa.numero ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <etapa.icon className="w-6 h-6" />
                )}
              </div>
              <span className={`text-xs font-semibold text-center ${
                etapaAtual === etapa.numero ? "text-gray-900" : "text-gray-500"
              }`}>
                {etapa.titulo}
              </span>
            </div>
          ))}
        </div>

        {/* Card do Formulário */}
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="p-6 md:p-8">
            {renderEtapa()}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse md:flex-row gap-4 p-6 bg-gray-50">
            <button
              onClick={etapaAnterior}
              disabled={etapaAtual === 1}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={finalizarCadastro}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Finalizando..." : "Finalizar Cadastro"}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
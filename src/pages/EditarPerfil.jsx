import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  Save,
  User,
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  Camera,
  X
} from "lucide-react";
import { getEspecialidades, getRegistroLabel } from "@/components/constants/especialidades";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pessoais");

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome_completo: "",
    data_nascimento: "",
    cpf: "",
    whatsapp: "",
    email: "",
    exibir_email: false,
    instagram: "",
    tipo_profissional: "",
    registro_conselho: "",
    uf_conselho: "",
    especialidade_principal: "",
    tempo_formado_anos: "",
    tempo_especialidade_anos: "",
    status_disponibilidade: "DISPONIVEL",
    aceita_freelance: false,
    dias_semana_disponiveis: [],
    disponibilidade_inicio: "",
    forma_remuneracao: [],
    cidades_atendimento: [],
    cidade_input: "",
    uf_input: "",
    observacoes: "",
    selfie_documento_url: "",
    carteirinha_conselho_url: ""
  });

  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf_input);

  // Buscar profissional
  const { data: professional, isLoading } = useQuery({
    queryKey: ["myProfessional"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const result = await base44.entities.Professional.filter({ user_id: user.id });
      return result[0] || null;
    }
  });

  // Preencher formulário ao carregar dados
  useEffect(() => {
    if (professional) {
      // Formatar data de nascimento de ddmmaaaa para DD/MM/AAAA
      let dataNascimentoFormatada = "";
      if (professional.data_nascimento?.length === 8) {
        const dia = professional.data_nascimento.slice(0, 2);
        const mes = professional.data_nascimento.slice(2, 4);
        const ano = professional.data_nascimento.slice(4, 8);
        dataNascimentoFormatada = `${dia}/${mes}/${ano}`;
      }

      setFormData({
        nome_completo: professional.nome_completo || "",
        data_nascimento: dataNascimentoFormatada,
        cpf: professional.cpf || "",
        whatsapp: professional.whatsapp || "",
        email: professional.email || "",
        exibir_email: professional.exibir_email || false,
        instagram: professional.instagram || "",
        tipo_profissional: professional.tipo_profissional || "",
        registro_conselho: professional.registro_conselho || "",
        uf_conselho: professional.uf_conselho || "",
        especialidade_principal: professional.especialidade_principal || "",
        tempo_formado_anos: professional.tempo_formado_anos?.toString() || "",
        tempo_especialidade_anos: professional.tempo_especialidade_anos?.toString() || "",
        status_disponibilidade: professional.status_disponibilidade || "DISPONIVEL",
        aceita_freelance: professional.aceita_freelance || false,
        dias_semana_disponiveis: professional.dias_semana_disponiveis || [],
        disponibilidade_inicio: professional.disponibilidade_inicio || "",
        forma_remuneracao: professional.forma_remuneracao || [],
        cidades_atendimento: professional.cidades_atendimento || [],
        cidade_input: "",
        uf_input: "",
        observacoes: professional.observacoes || "",
        selfie_documento_url: professional.selfie_documento_url || "",
        carteirinha_conselho_url: professional.carteirinha_conselho_url || ""
      });
    }
  }, [professional]);

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Professional.update(professional.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfessional"] });
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      toast.success("✅ Perfil atualizado com sucesso!");
      navigate(createPageUrl("MeuPerfil"));
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    }
  });

  const handleInputChange = (campo, valor) => {
    if (campo === "nome_completo") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  // Máscaras
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

  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const adicionarCidade = () => {
    if (!formData.cidade_input.trim() || !formData.uf_input) {
      toast.error("Preencha a cidade e UF");
      return;
    }
    
    if (formData.cidades_atendimento.length >= 6) {
      toast.error("Máximo de 6 cidades");
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

  const handleFileUpload = async (campo, file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas imagens JPG/PNG ou PDF são permitidos");
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
      toast.error("Erro ao enviar arquivo: " + error.message);
    }
  };

  const handleSalvar = async () => {
    // Validações
    if (!formData.nome_completo.trim() || formData.nome_completo.trim().length < 3) {
      toast.error("Nome completo deve ter no mínimo 3 caracteres");
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Preencha um email válido");
      return;
    }
    if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) {
      toast.error("Preencha um WhatsApp válido (11 dígitos)");
      return;
    }
    if (formData.cidades_atendimento.length === 0) {
      toast.error("Adicione pelo menos uma cidade de atendimento");
      return;
    }
    if (formData.dias_semana_disponiveis.length === 0) {
      toast.error("Selecione pelo menos um dia disponível");
      return;
    }

    // Converter data de nascimento para formato ddmmaaaa
    let dataNascimento = professional.data_nascimento;
    if (formData.data_nascimento) {
      const [dia, mes, ano] = formData.data_nascimento.split("/");
      dataNascimento = `${dia}${mes}${ano}`;
    }

    const dadosAtualizados = {
      nome_completo: formData.nome_completo.trim(),
      data_nascimento: dataNascimento,
      whatsapp: formData.whatsapp.replace(/\D/g, ""),
      email: formData.email,
      exibir_email: formData.exibir_email,
      instagram: formData.instagram || "",
      registro_conselho: formData.registro_conselho,
      uf_conselho: formData.uf_conselho,
      especialidade_principal: formData.especialidade_principal,
      tempo_formado_anos: parseInt(formData.tempo_formado_anos),
      tempo_especialidade_anos: formData.tempo_especialidade_anos ? parseInt(formData.tempo_especialidade_anos) : 0,
      status_disponibilidade: formData.status_disponibilidade,
      aceita_freelance: formData.aceita_freelance,
      dias_semana_disponiveis: formData.dias_semana_disponiveis,
      disponibilidade_inicio: formData.disponibilidade_inicio,
      forma_remuneracao: formData.forma_remuneracao,
      cidades_atendimento: formData.cidades_atendimento,
      observacoes: formData.observacoes,
      selfie_documento_url: formData.selfie_documento_url,
      carteirinha_conselho_url: formData.carteirinha_conselho_url
    };

    updateMutation.mutate(dadosAtualizados);
  };

  const especialidades = getEspecialidades(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(createPageUrl("MeuPerfil"))}
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold shadow-lg">
              {formData.nome_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Editar Perfil</h1>
              <p className="text-white/80">Mantenha seus dados atualizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full bg-gray-100 p-2 rounded-none">
              <TabsTrigger value="pessoais" className="data-[state=active]:bg-white rounded-lg">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Pessoais</span>
              </TabsTrigger>
              <TabsTrigger value="profissionais" className="data-[state=active]:bg-white rounded-lg">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Profissionais</span>
              </TabsTrigger>
              <TabsTrigger value="disponibilidade" className="data-[state=active]:bg-white rounded-lg">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Disponibilidade</span>
              </TabsTrigger>
              <TabsTrigger value="localizacao" className="data-[state=active]:bg-white rounded-lg">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Localização</span>
              </TabsTrigger>
              <TabsTrigger value="sobre" className="data-[state=active]:bg-white rounded-lg">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Sobre</span>
              </TabsTrigger>
              <TabsTrigger value="documentos" className="data-[state=active]:bg-white rounded-lg">
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Documentos</span>
              </TabsTrigger>
            </TabsList>

            {/* SEÇÃO 1 - DADOS PESSOAIS */}
            <TabsContent value="pessoais" className="p-6 md:p-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Dados Pessoais</h2>
                <p className="text-gray-600">Informações básicas do seu perfil</p>
              </div>

              {/* Foto Perfil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Foto de Perfil</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {formData.nome_completo?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="foto_perfil"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                    />
                    <label
                      htmlFor="foto_perfil"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Alterar Foto
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Formato quadrado (1:1), mínimo 500x500px</p>
                  </div>
                </div>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento *</label>
                  <input
                    type="text"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange("data_nascimento", aplicarMascaraData(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={aplicarMascaraCPF(formData.cpf)}
                    disabled
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">CPF não pode ser alterado</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label>
                <input
                  type="text"
                  value={aplicarMascaraWhatsApp(formData.whatsapp)}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value.replace(/\D/g, ""))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Exibir email publicamente</p>
                  <p className="text-sm text-gray-600">Clínicas poderão ver seu email</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange("exibir_email", !formData.exibir_email)}
                  className={`w-14 h-8 rounded-full transition-all ${formData.exibir_email ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.exibir_email ? "ml-7" : "ml-1"}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                    placeholder="seuperfil"
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* SEÇÃO 2 - DADOS PROFISSIONAIS */}
            <TabsContent value="profissionais" className="p-6 md:p-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Dados Profissionais</h2>
                <p className="text-gray-600">Suas credenciais e experiência</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Profissional</label>
                <input
                  type="text"
                  value={formData.tipo_profissional === "DENTISTA" ? "Dentista 🦷" : "Médico 🩺"}
                  disabled
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Tipo não pode ser alterado após cadastro</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número {getRegistroLabel(formData.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA")} *
                  </label>
                  <input
                    type="text"
                    value={formData.registro_conselho}
                    onChange={(e) => handleInputChange("registro_conselho", e.target.value)}
                    placeholder="12345"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">UF do Registro *</label>
                  <select
                    value={formData.uf_conselho}
                    onChange={(e) => handleInputChange("uf_conselho", e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                  >
                    <option value="">Selecione</option>
                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidade Principal *</label>
                <select
                  value={formData.especialidade_principal}
                  onChange={(e) => handleInputChange("especialidade_principal", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo de Formado (anos) *</label>
                  <input
                    type="number"
                    value={formData.tempo_formado_anos}
                    onChange={(e) => handleInputChange("tempo_formado_anos", e.target.value)}
                    min="0"
                    placeholder="Ex: 5"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo na Especialidade (anos)</label>
                  <input
                    type="number"
                    value={formData.tempo_especialidade_anos}
                    onChange={(e) => handleInputChange("tempo_especialidade_anos", e.target.value)}
                    min="0"
                    placeholder="Ex: 3"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* SEÇÃO 3 - DISPONIBILIDADE */}
            <TabsContent value="disponibilidade" className="p-6 md:p-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Disponibilidade</h2>
                <p className="text-gray-600">Configure quando e como você pode trabalhar</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Atual *</label>
                <select
                  value={formData.status_disponibilidade}
                  onChange={(e) => handleInputChange("status_disponibilidade", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="DISPONIVEL">✅ Disponível</option>
                  <option value="OCUPADO">⏳ Ocupado</option>
                  <option value="INDISPONIVEL">🔴 Indisponível</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Aceita trabalho freelance/substituição</p>
                  <p className="text-sm text-gray-600">Trabalhos pontuais e temporários</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange("aceita_freelance", !formData.aceita_freelance)}
                  className={`w-14 h-8 rounded-full transition-all ${formData.aceita_freelance ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.aceita_freelance ? "ml-7" : "ml-1"}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Dias Disponíveis *</label>
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
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400"
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Disponibilidade para Início *</label>
                <select
                  value={formData.disponibilidade_inicio}
                  onChange={(e) => handleInputChange("disponibilidade_inicio", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="IMEDIATO">Imediato</option>
                  <option value="15_DIAS">15 dias</option>
                  <option value="30_DIAS">30 dias</option>
                  <option value="60_DIAS">60 dias</option>
                  <option value="A_COMBINAR">A combinar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Formas de Remuneração Aceitas *</label>
                <div className="space-y-3">
                  {[
                    { value: "DIARIA", label: "Diária (valor por dia trabalhado)" },
                    { value: "PORCENTAGEM", label: "Porcentagem (% sobre procedimentos)" },
                    { value: "FIXO", label: "Fixo (salário mensal)" },
                    { value: "A_COMBINAR", label: "A Combinar" }
                  ].map((forma) => (
                    <div
                      key={forma.value}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        formData.forma_remuneracao.includes(forma.value)
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => toggleFormaRemuneracao(forma.value)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.forma_remuneracao.includes(forma.value) ? "border-blue-400 bg-blue-400" : "border-gray-300"
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
            </TabsContent>

            {/* SEÇÃO 4 - LOCALIZAÇÃO */}
            <TabsContent value="localizacao" className="p-6 md:p-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Cidades de Atendimento</h2>
                <p className="text-gray-600">Onde você pode trabalhar (máximo 6 cidades)</p>
              </div>

              {/* Input para adicionar cidade */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <select
                    value={formData.uf_input}
                    onChange={(e) => {
                      handleInputChange("uf_input", e.target.value);
                      handleInputChange("cidade_input", "");
                    }}
                    disabled={formData.cidades_atendimento.length >= 6}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">UF</option>
                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-7">
                  <CityAutocomplete
                    value={formData.cidade_input}
                    onChange={(cidade) => handleInputChange("cidade_input", cidade)}
                    cidades={cidades}
                    loading={loadingCidades}
                    disabled={!formData.uf_input || formData.cidades_atendimento.length >= 6}
                    placeholder={!formData.uf_input ? "Selecione UF primeiro" : "Selecione a cidade"}
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={adicionarCidade}
                    disabled={formData.cidades_atendimento.length >= 6}
                    className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {formData.cidades_atendimento.length >= 6 && (
                <p className="text-xs text-orange-600 font-medium">
                  ⚠️ Limite máximo de 6 cidades atingido
                </p>
              )}

              {/* Lista de cidades adicionadas */}
              {formData.cidades_atendimento.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Cidades Adicionadas ({formData.cidades_atendimento.length}/6)</p>
                  <div className="flex flex-wrap gap-3">
                    {formData.cidades_atendimento.map((cidade, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{cidade}</span>
                        <button
                          type="button"
                          onClick={() => removerCidade(cidade)}
                          className="text-blue-600 hover:text-blue-900 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma cidade adicionada ainda</p>
                </div>
              )}
            </TabsContent>

            {/* SEÇÃO 5 - SOBRE VOCÊ */}
            <TabsContent value="sobre" className="p-6 md:p-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Sobre Você</h2>
                <p className="text-gray-600">Conte mais sobre sua experiência e diferenciais</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações *</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Fale sobre sua experiência, preferências de trabalho, horários que prefere, tipo de clínica que procura, diferenciais..."
                  className="w-full min-h-[200px] px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.observacoes.length}/500 caracteres
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Dica: Mencione sua experiência, tipo de ambiente que busca, valores e objetivos profissionais
                </p>
              </div>
            </TabsContent>

            {/* SEÇÃO 6 - DOCUMENTOS */}
            <TabsContent value="documentos" className="p-6 md:p-8 space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Documentos</h2>
                <p className="text-gray-600">Mantenha seus documentos atualizados</p>
              </div>

              {/* Selfie com Documento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto com Documento</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer">
                  <input
                    type="file"
                    id="selfie_documento"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileUpload("selfie_documento_url", e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="selfie_documento" className="cursor-pointer">
                    {formData.selfie_documento_url ? (
                      <div>
                        <img src={formData.selfie_documento_url} alt="Selfie" className="w-40 h-40 mx-auto rounded-xl object-cover mb-3" />
                        <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Documento enviado
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('selfie_documento').click();
                          }}
                          className="mt-3 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
                        >
                          Trocar Foto
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-gray-700 font-semibold">Clique para enviar</p>
                        <p className="text-gray-400 text-sm mt-1">JPG ou PNG</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Carteira Profissional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carteira Profissional (CRO/CRM)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer">
                  <input
                    type="file"
                    id="carteirinha_conselho"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileUpload("carteirinha_conselho_url", e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="carteirinha_conselho" className="cursor-pointer">
                    {formData.carteirinha_conselho_url ? (
                      <div>
                        <div className="w-40 h-40 mx-auto rounded-xl bg-gray-100 mb-3 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Documento enviado
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('carteirinha_conselho').click();
                          }}
                          className="mt-3 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
                        >
                          Trocar Documento
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-purple-100 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-gray-700 font-semibold">Clique para enviar</p>
                        <p className="text-gray-400 text-sm mt-1">PDF, JPG ou PNG</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Botões Fixos no Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button
              onClick={() => navigate(createPageUrl("MeuPerfil"))}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={updateMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
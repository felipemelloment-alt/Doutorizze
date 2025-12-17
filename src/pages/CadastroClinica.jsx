import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ArrowRight, 
  Building2, 
  User, 
  MapPin, 
  Stethoscope, 
  Upload,
  Camera,
  CheckCircle2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEspecialidades } from "@/components/constants/especialidades";

export default function CadastroClinica() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    // ETAPA 1: Tipo e Dados da Empresa
    tipo_mundo: "",
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    telefone_comercial: "",
    email: "",
    whatsapp: "",

    // ETAPA 2: Responsável
    nome_responsavel: "",
    cpf_responsavel: "",
    cargo_responsavel: "",
    documento_responsavel: null,

    // ETAPA 3: Endereço
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    ponto_referencia: "",

    // ETAPA 4: Especialidades e Fotos
    especialidades_atendidas: [],
    logo_clinica: null,
    foto_fachada: null,

    // ETAPA 5: Revisão e Termos
    aceita_termos: false
  });

  const totalEtapas = 5;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  // Funções de máscara
  const aplicarMascaraCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const handleInputChange = (campo, valor) => {
    // Normalizar nomes e razão social: remover espaços duplicados e trim inicial
    if (campo === "razao_social" || campo === "nome_fantasia" || campo === "nome_responsavel") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const buscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
        complemento: data.complemento || ""
      }));

      toast.success("CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
    setBuscandoCep(false);
  };

  const toggleEspecialidade = (especialidade) => {
    setFormData(prev => {
      const especialidades = prev.especialidades_atendidas.includes(especialidade)
        ? prev.especialidades_atendidas.filter(e => e !== especialidade)
        : [...prev.especialidades_atendidas, especialidade];
      return { ...prev, especialidades_atendidas: especialidades };
    });
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.tipo_mundo) {
          toast.error("Selecione o tipo de clínica");
          return false;
        }
        if (!formData.razao_social.trim() || formData.razao_social.trim().length < 3) {
          toast.error("Razão social deve ter no mínimo 3 caracteres");
          return false;
        }
        if (!formData.nome_fantasia.trim() || formData.nome_fantasia.trim().length < 3) {
          toast.error("Nome fantasia deve ter no mínimo 3 caracteres");
          return false;
        }
        if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
          toast.error("Preencha um CNPJ válido");
          return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error("Preencha um email válido");
          return false;
        }
        if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um WhatsApp válido");
          return false;
        }
        return true;

      case 2:
        if (!formData.nome_responsavel.trim() || formData.nome_responsavel.trim().length < 3) {
          toast.error("Nome do responsável deve ter no mínimo 3 caracteres");
          return false;
        }
        if (!formData.cpf_responsavel || formData.cpf_responsavel.replace(/\D/g, "").length !== 11) {
          toast.error("Preencha um CPF válido para o responsável");
          return false;
        }
        if (!formData.documento_responsavel) {
          toast.error("É obrigatório enviar o documento do responsável");
          return false;
        }
        return true;

      case 3:
        if (!formData.cep) {
          toast.error("Preencha o CEP");
          return false;
        }
        if (!formData.endereco || !formData.numero || !formData.cidade || !formData.uf) {
          toast.error("Preencha todos os campos obrigatórios do endereço");
          return false;
        }
        return true;

      case 4:
        if (formData.especialidades_atendidas.length === 0) {
          toast.error("Selecione pelo menos uma especialidade atendida");
          return false;
        }
        return true;

      case 5:
        if (!formData.aceita_termos) {
          toast.error("Você deve aceitar os Termos de Uso");
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
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo: " + error.message);
    }
  };

  const finalizarCadastro = async () => {
    if (!validarEtapa(5)) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();

      // Criar CompanyOwner
      const dadosOwner = {
        user_id: user.id,
        nome_completo: formData.nome_responsavel.trim(),
        cpf: formData.cpf_responsavel.replace(/\D/g, ""),
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        documento_frente_url: formData.documento_responsavel,
        status_cadastro: "EM_ANALISE"
      };

      const owner = await base44.entities.CompanyOwner.create(dadosOwner);

      // Criar CompanyUnit
      const dadosUnit = {
        owner_id: owner.id,
        razao_social: formData.razao_social.trim(),
        nome_fantasia: formData.nome_fantasia.trim(),
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_empresa: "CLINICA",
        tipo_mundo: formData.tipo_mundo,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        email: formData.email,
        telefone_fixo: formData.telefone_comercial ? formData.telefone_comercial.replace(/\D/g, "") : "",
        cep: formData.cep.replace(/\D/g, ""),
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        ponto_referencia: formData.ponto_referencia,
        nome_responsavel: formData.nome_responsavel,
        documento_responsavel_url: formData.documento_responsavel,
        foto_fachada_url: formData.foto_fachada,
        status_cadastro: "EM_ANALISE",
        ativo: true
      };

      await base44.entities.CompanyUnit.create(dadosUnit);

      toast.success("✅ Cadastro realizado com sucesso! Aguarde a aprovação.");
      navigate("/CadastroSucesso");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("❌ Erro ao realizar cadastro: " + error.message);
    }
    setLoading(false);
  };

  const especialidades = getEspecialidades(formData.tipo_mundo);

  const etapasConfig = [
    { numero: 1, titulo: "Dados Empresa", icon: Building2 },
    { numero: 2, titulo: "Responsável", icon: User },
    { numero: 3, titulo: "Endereço", icon: MapPin },
    { numero: 4, titulo: "Especialidades", icon: Stethoscope },
    { numero: 5, titulo: "Documentos", icon: Upload }
  ];

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tipo de Clínica */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Clínica: *</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleInputChange("tipo_mundo", "ODONTOLOGIA")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                    formData.tipo_mundo === "ODONTOLOGIA"
                      ? "border-pink-400 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipo_mundo === "ODONTOLOGIA" ? "border-pink-400" : "border-gray-300"
                    }`}>
                      {formData.tipo_mundo === "ODONTOLOGIA" && (
                        <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">Odontologia 🦷</span>
                  </div>
                </div>
                <div
                  onClick={() => handleInputChange("tipo_mundo", "MEDICINA")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                    formData.tipo_mundo === "MEDICINA"
                      ? "border-pink-400 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipo_mundo === "MEDICINA" ? "border-pink-400" : "border-gray-300"
                    }`}>
                      {formData.tipo_mundo === "MEDICINA" && (
                        <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">Medicina 🩺</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social *</label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => handleInputChange("razao_social", e.target.value)}
                  placeholder="Clínica Odontológica Silva Ltda"
                  maxLength={120}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.razao_social.length}/120 caracteres</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia *</label>
                <input
                  type="text"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                  placeholder="Clínica Silva"
                  maxLength={120}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.nome_fantasia.length}/120 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ *</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", aplicarMascaraCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone Comercial (opcional)</label>
                <input
                  type="text"
                  value={formData.telefone_comercial}
                  onChange={(e) => handleInputChange("telefone_comercial", aplicarMascaraTelefone(e.target.value))}
                  placeholder="(62) 3333-3333"
                  maxLength={15}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@clinica.com"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", aplicarMascaraTelefone(e.target.value))}
                  placeholder="(62) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-100">
              <p className="text-sm text-gray-700">
                ℹ️ Informe os dados do responsável técnico ou proprietário da clínica
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo do Responsável *</label>
                <input
                  type="text"
                  value={formData.nome_responsavel}
                  onChange={(e) => handleInputChange("nome_responsavel", e.target.value)}
                  placeholder="Dr. João Silva"
                  maxLength={120}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.nome_responsavel.length}/120 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CPF do Responsável *</label>
                <input
                  type="text"
                  value={formData.cpf_responsavel}
                  onChange={(e) => handleInputChange("cpf_responsavel", aplicarMascaraCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo (opcional)</label>
                <input
                  type="text"
                  value={formData.cargo_responsavel}
                  onChange={(e) => handleInputChange("cargo_responsavel", e.target.value)}
                  placeholder="Ex: Proprietário, Diretor Clínico"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
            </div>

            {/* Upload Documento Responsável */}
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                Documento do Responsável * <span className="text-xs">(RG ou CNH)</span>
              </label>
              <div className="border-2 border-dashed border-red-300 rounded-2xl p-8 text-center hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  id="documento_responsavel"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => handleFileUpload("documento_responsavel", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="documento_responsavel" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-all">
                    <Upload className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-700 font-semibold">Clique para enviar</p>
                  <p className="text-gray-400 text-sm mt-1">PDF, JPG ou PNG</p>
                </label>
                {formData.documento_responsavel && (
                  <p className="text-green-600 text-sm mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Documento enviado!
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* CEP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", aplicarMascaraCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={buscarCEP}
                  disabled={buscandoCep}
                  className="px-6 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {buscandoCep ? "..." : "Buscar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço *</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, Avenida..."
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Sala 101"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Centro"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Goiânia"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <select
                  value={formData.uf}
                  onChange={(e) => handleInputChange("uf", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ponto de Referência (opcional)</label>
                <input
                  type="text"
                  value={formData.ponto_referencia}
                  onChange={(e) => handleInputChange("ponto_referencia", e.target.value)}
                  placeholder="Ex: Em frente ao Shopping..."
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Especialidades */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Especialidades Atendidas *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                {especialidades.map((esp) => (
                  <div key={esp} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`esp-${esp}`}
                      checked={formData.especialidades_atendidas.includes(esp)}
                      onChange={() => toggleEspecialidade(esp)}
                      className="w-4 h-4 accent-pink-400"
                    />
                    <label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer text-gray-700">
                      {esp}
                    </label>
                  </div>
                ))}
              </div>

              {/* Especialidades Selecionadas */}
              {formData.especialidades_atendidas.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selecionadas ({formData.especialidades_atendidas.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.especialidades_atendidas.map((esp) => (
                      <span
                        key={esp}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                      >
                        {esp}
                        <button
                          type="button"
                          onClick={() => toggleEspecialidade(esp)}
                          className="text-pink-600 hover:text-pink-900 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo da Clínica (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-pink-400 hover:bg-pink-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  id="logo_clinica"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("logo_clinica", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="logo_clinica" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 group-hover:bg-pink-100 flex items-center justify-center transition-all">
                    <Camera className="w-8 h-8 text-gray-400 group-hover:text-pink-500" />
                  </div>
                  <p className="text-gray-700 font-semibold">Clique para enviar</p>
                  <p className="text-gray-400 text-sm mt-1">JPG ou PNG, máx 5MB</p>
                </label>
                {formData.logo_clinica && (
                  <p className="text-green-600 text-sm mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Logo enviada!
                  </p>
                )}
              </div>
            </div>

            {/* Upload Foto Fachada */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto da Fachada (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-pink-400 hover:bg-pink-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  id="foto_fachada"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_fachada", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_fachada" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 group-hover:bg-pink-100 flex items-center justify-center transition-all">
                    <Camera className="w-8 h-8 text-gray-400 group-hover:text-pink-500" />
                  </div>
                  <p className="text-gray-700 font-semibold">Clique para enviar</p>
                  <p className="text-gray-400 text-sm mt-1">JPG ou PNG, máx 5MB</p>
                </label>
                {formData.foto_fachada && (
                  <p className="text-green-600 text-sm mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Foto enviada!
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Revisão dos Dados */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Resumo do Cadastro</h3>
              <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
                <p><strong>Tipo:</strong> {formData.tipo_mundo === "ODONTOLOGIA" ? "Clínica Odontológica" : "Clínica Médica"}</p>
                <p><strong>Razão Social:</strong> {formData.razao_social}</p>
                <p><strong>Nome Fantasia:</strong> {formData.nome_fantasia}</p>
                <p><strong>CNPJ:</strong> {formData.cnpj}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                <hr className="my-2" />
                <p><strong>Responsável:</strong> {formData.nome_responsavel}</p>
                <p><strong>CPF Responsável:</strong> {formData.cpf_responsavel}</p>
                {formData.cargo_responsavel && <p><strong>Cargo:</strong> {formData.cargo_responsavel}</p>}
                <hr className="my-2" />
                <p><strong>Endereço:</strong> {formData.endereco}, {formData.numero}</p>
                <p><strong>Bairro:</strong> {formData.bairro}</p>
                <p><strong>Cidade:</strong> {formData.cidade} - {formData.uf}</p>
                <p><strong>CEP:</strong> {formData.cep}</p>
                <hr className="my-2" />
                <p><strong>Especialidades:</strong> {formData.especialidades_atendidas.slice(0, 3).join(", ")}{formData.especialidades_atendidas.length > 3 && "..."}</p>
              </div>
            </div>

            {/* Aceitar Termos */}
            <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-pink-400 transition-all">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="aceita_termos"
                  checked={formData.aceita_termos}
                  onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-pink-400"
                />
                <label htmlFor="aceita_termos" className="cursor-pointer text-sm text-gray-700">
                  Li e aceito os <span className="text-pink-500 font-bold underline">Termos de Uso</span> e{" "}
                  <span className="text-pink-500 font-bold underline">Política de Privacidade</span>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium py-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Cadastro de Clínica</h1>
          <p className="text-gray-500 mt-2">Preencha os dados da sua clínica</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoPercentual}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-pink-500 to-red-500"
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
                  ? "bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg scale-110"
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
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
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
                {loading ? "Cadastrando..." : "Cadastrar Clínica"}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
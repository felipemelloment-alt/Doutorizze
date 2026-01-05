import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Upload,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Phone,
  FileText
} from "lucide-react";

const tiposInstituicao = [
  { value: "UNIVERSIDADE", label: "Universidade" },
  { value: "FACULDADE", label: "Faculdade" },
  { value: "CENTRO_CURSOS", label: "Centro de Cursos" },
  { value: "EAD", label: "Plataforma EAD" },
  { value: "OUTRO", label: "Outro" }
];

const areasOpcoes = [
  { value: "ODONTOLOGIA", label: "Odontologia" },
  { value: "MEDICINA", label: "Medicina" },
  { value: "AMBOS", label: "Ambos" }
];

const modalidadesOpcoes = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "EAD", label: "EAD" },
  { value: "HIBRIDO", label: "Híbrido" }
];

export default function CadastroInstituicao() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo_instituicao: "",
    areas: [],
    modalidades: [],
    nome_responsavel: "",
    cargo_responsavel: "",
    email: "",
    email_responsavel: "",
    whatsapp: "",
    telefone: "",
    site: "",
    cep: "",
    cidade: "",
    uf: "",
    endereco: "",
    numero: "",
    bairro: "",
    logo_url: "",
    documento_url: "",
    aceito_termos: false
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) console.warn("CadastroInstituicao: Auth timeout");
      }, 5000);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (isMounted) setUser(currentUser);
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn("Erro ao carregar usuário:", error?.message || error);
      }
    };
    loadUser();

    return () => { isMounted = false; };
  }, []);

  const cadastrarMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.EducationInstitution.create({
        ...data,
        user_id: user.id,
        status_cadastro: "PENDENTE",
        ativo: true,
        total_cursos: 0,
        total_visualizacoes: 0
      });
    },
    onSuccess: () => {
      navigate(createPageUrl("CadastroSucesso") + "?tipo=instituicao");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar: " + error.message);
    }
  });

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success("✅ Logo enviado!");
    } catch (error) {
      toast.error("Erro ao enviar logo: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setUploadingDoc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, documento_url: file_url });
      toast.success("✅ Documento enviado!");
    } catch (error) {
      toast.error("Erro ao enviar documento: " + error.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData({
        ...formData,
        cep: cepLimpo,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || ""
      });
      toast.success("✅ CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setBuscandoCep(false);
    }
  };

  const mascararCNPJ = (value) => {
    const numeros = value.replace(/\D/g, "");
    return numeros
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const mascararCEP = (value) => {
    const numeros = value.replace(/\D/g, "");
    return numeros.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const mascararTelefone = (value) => {
    const numeros = value.replace(/\D/g, "");
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d)/, "($1) $2-$3").slice(0, 14);
    }
    return numeros.replace(/(\d{2})(\d{5})(\d)/, "($1) $2-$3").slice(0, 15);
  };

  const validarEtapa1 = () => {
    if (!formData.razao_social) return "Informe a razão social";
    if (!formData.nome_fantasia) return "Informe o nome fantasia";
    if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) return "CNPJ inválido";
    if (!formData.tipo_instituicao) return "Selecione o tipo de instituição";
    if (formData.areas.length === 0) return "Selecione pelo menos uma área de atuação";
    if (formData.modalidades.length === 0) return "Selecione pelo menos uma modalidade";
    return null;
  };

  const validarEtapa2 = () => {
    if (!formData.nome_responsavel) return "Informe o nome do responsável";
    if (!formData.cargo_responsavel) return "Informe o cargo";
    if (!formData.email) return "Informe o email institucional";
    if (!formData.email_responsavel) return "Informe o email do responsável";
    if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, "").length !== 11) return "WhatsApp inválido";
    return null;
  };

  const validarEtapa3 = () => {
    if (!formData.cep || formData.cep.replace(/\D/g, "").length !== 8) return "CEP inválido";
    if (!formData.cidade) return "Informe a cidade";
    if (!formData.uf) return "Informe o estado";
    if (!formData.endereco) return "Informe o endereço";
    if (!formData.numero) return "Informe o número";
    if (!formData.bairro) return "Informe o bairro";
    if (!formData.documento_url) return "Envie o documento MEC ou registro";
    if (!formData.aceito_termos) return "Aceite os termos de uso";
    return null;
  };

  const proximaEtapa = () => {
    let erro = null;
    if (etapaAtual === 1) erro = validarEtapa1();
    if (etapaAtual === 2) erro = validarEtapa2();

    if (erro) {
      toast.error(erro);
      return;
    }

    setEtapaAtual(etapaAtual + 1);
  };

  const handleSubmit = () => {
    const erro = validarEtapa3();
    if (erro) {
      toast.error(erro);
      return;
    }

    const dataToSend = {
      ...formData,
      cnpj: formData.cnpj.replace(/\D/g, ""),
      cep: formData.cep.replace(/\D/g, ""),
      whatsapp: formData.whatsapp.replace(/\D/g, ""),
      telefone: formData.telefone ? formData.telefone.replace(/\D/g, "") : undefined,
      logo_url: formData.logo_url || undefined,
      site: formData.site || undefined
    };

    delete dataToSend.aceito_termos;
    cadastrarMutation.mutate(dataToSend);
  };

  const toggleArrayItem = (field, value) => {
    const current = formData[field];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: newValue });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-4xl mx-auto p-6 pb-24 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => etapaAtual === 1 ? navigate(-1) : setEtapaAtual(etapaAtual - 1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Cadastro de Instituição</h1>
              <p className="text-gray-600">Universidades, faculdades e centros de ensino</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((etapa) => (
              <React.Fragment key={etapa}>
                <div className={`flex-1 h-2 rounded-full transition-all ${
                  etapa <= etapaAtual ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gray-200"
                }`} />
                {etapa < 3 && <div className="w-2" />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm font-semibold text-gray-600">
            <span className={etapaAtual === 1 ? "text-orange-600" : ""}>1. Dados</span>
            <span className={etapaAtual === 2 ? "text-orange-600" : ""}>2. Contato</span>
            <span className={etapaAtual === 3 ? "text-orange-600" : ""}>3. Endereço</span>
          </div>
        </div>

        {/* Formulário */}
        <AnimatePresence mode="wait">
          {/* ETAPA 1 - DADOS DA INSTITUIÇÃO */}
          {etapaAtual === 1 && (
            <motion.div
              key="etapa1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-black text-gray-900">Dados da Instituição</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    value={formData.razao_social}
                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    placeholder="Razão social completa"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    placeholder="Nome fantasia"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: mascararCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Tipo de Instituição *
                  </label>
                  <select
                    value={formData.tipo_instituicao}
                    onChange={(e) => setFormData({ ...formData, tipo_instituicao: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  >
                    <option value="">Selecione</option>
                    {tiposInstituicao.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Áreas de Atuação * (selecione uma ou mais)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {areasOpcoes.map((area) => (
                      <button
                        key={area.value}
                        type="button"
                        onClick={() => toggleArrayItem("areas", area.value)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                          formData.areas.includes(area.value)
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {area.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Modalidades Oferecidas * (selecione uma ou mais)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {modalidadesOpcoes.map((mod) => (
                      <button
                        key={mod.value}
                        type="button"
                        onClick={() => toggleArrayItem("modalidades", mod.value)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                          formData.modalidades.includes(mod.value)
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {mod.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={proximaEtapa}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ETAPA 2 - CONTATO */}
          {etapaAtual === 2 && (
            <motion.div
              key="etapa2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-black text-gray-900">Informações de Contato</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_responsavel}
                    onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    placeholder="Nome completo"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Cargo do Responsável *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo_responsavel}
                    onChange={(e) => setFormData({ ...formData, cargo_responsavel: e.target.value })}
                    placeholder="Ex: Diretor, Coordenador"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Email Institucional *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@instituicao.com.br"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Email do Responsável *
                  </label>
                  <input
                    type="email"
                    value={formData.email_responsavel}
                    onChange={(e) => setFormData({ ...formData, email_responsavel: e.target.value })}
                    placeholder="responsavel@instituicao.com.br"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    WhatsApp * (com DDD)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: mascararTelefone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Telefone (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: mascararTelefone(e.target.value) })}
                    placeholder="(00) 0000-0000"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Site (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="https://www.instituicao.com.br"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setEtapaAtual(1)}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={proximaEtapa}
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ETAPA 3 - ENDEREÇO E DOCUMENTOS */}
          {etapaAtual === 3 && (
            <motion.div
              key="etapa3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-black text-gray-900">Endereço e Documentos</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => {
                      const cep = mascararCEP(e.target.value);
                      setFormData({ ...formData, cep });
                      if (cep.replace(/\D/g, "").length === 8) {
                        buscarCep(cep);
                      }
                    }}
                    placeholder="00000-000"
                    disabled={buscandoCep}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none disabled:bg-gray-50"
                  />
                  {buscandoCep && <p className="text-sm text-blue-600 mt-1">Buscando CEP...</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Número"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, Avenida..."
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Bairro"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Cidade"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    UF *
                  </label>
                  <input
                    type="text"
                    value={formData.uf}
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                    placeholder="UF"
                    maxLength={2}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Uploads */}
              <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-900">Documentos</h3>
                </div>

                {/* Upload Logo */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Logo da Instituição (Opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                      uploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        <span className="text-gray-600 font-medium">Enviando logo...</span>
                      </>
                    ) : formData.logo_url ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <span className="text-green-600 font-medium">Logo enviado ✓</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600 font-medium">Clique para enviar logo (máx. 5MB)</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Upload Documento */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Documento MEC ou Registro * (PDF, PNG, JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleUploadDoc}
                    disabled={uploadingDoc}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label
                    htmlFor="doc-upload"
                    className={`flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                      uploadingDoc ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingDoc ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        <span className="text-gray-600 font-medium">Enviando documento...</span>
                      </>
                    ) : formData.documento_url ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <span className="text-green-600 font-medium">Documento enviado ✓</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600 font-medium">Clique para enviar documento (máx. 10MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Termos */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aceito_termos}
                    onChange={(e) => setFormData({ ...formData, aceito_termos: e.target.checked })}
                    className="mt-1 w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-900">
                    <strong>Li e aceito os termos de uso</strong> e declaro que as informações fornecidas são verdadeiras.
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setEtapaAtual(2)}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={cadastrarMutation.isPending}
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cadastrarMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Finalizar Cadastro
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
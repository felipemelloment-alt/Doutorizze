import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Building2,
  Package,
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";

const tiposProdutos = [
  { value: "EQUIPAMENTOS", label: "Equipamentos" },
  { value: "MATERIAIS", label: "Materiais de Consumo" },
  { value: "SOFTWARE", label: "Software/Sistemas" },
  { value: "MOVEIS", label: "Móveis/Mobiliário" },
  { value: "OUTROS", label: "Outros" }
];

export default function CadastroFornecedor() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [user, setUser] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo_produtos: [],
    area_atuacao: "",
    nome_responsavel: "",
    cargo_responsavel: "",
    email: "",
    whatsapp: "",
    telefone_fixo: "",
    site: "",
    instagram: "",
    cep: "",
    cidade: "",
    uf: "",
    endereco: "",
    numero: "",
    bairro: "",
    logo_url: "",
    contrato_social_url: "",
    aceito_termos: false,
    confirmo_veracidade: false
  });

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Máscaras
  const maskCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const maskCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  // Buscar CEP
  const buscarCEP = async (cep) => {
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
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || ""
      });
      toast.success("CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setBuscandoCep(false);
    }
  };

  // Upload de imagens
  const handleLogoUpload = async (e) => {
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

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setUploadingDoc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, contrato_social_url: file_url });
      toast.success("✅ Documento enviado!");
    } catch (error) {
      toast.error("Erro ao enviar documento: " + error.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Toggle tipo de produto
  const toggleTipoProduto = (tipo) => {
    const current = formData.tipo_produtos;
    if (current.includes(tipo)) {
      setFormData({ ...formData, tipo_produtos: current.filter(t => t !== tipo) });
    } else {
      setFormData({ ...formData, tipo_produtos: [...current, tipo] });
    }
  };

  // Validações por etapa
  const validarEtapa1 = () => {
    if (!formData.razao_social) {
      toast.error("Preencha a Razão Social");
      return false;
    }
    if (!formData.nome_fantasia) {
      toast.error("Preencha o Nome Fantasia");
      return false;
    }
    const cnpjLimpo = formData.cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) {
      toast.error("CNPJ inválido");
      return false;
    }
    if (formData.tipo_produtos.length === 0) {
      toast.error("Selecione pelo menos um tipo de produto");
      return false;
    }
    if (!formData.area_atuacao) {
      toast.error("Selecione a área de atuação");
      return false;
    }
    return true;
  };

  const validarEtapa2 = () => {
    if (!formData.nome_responsavel) {
      toast.error("Preencha o nome do responsável");
      return false;
    }
    if (!formData.cargo_responsavel) {
      toast.error("Preencha o cargo do responsável");
      return false;
    }
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Email inválido");
      return false;
    }
    const whatsappLimpo = formData.whatsapp.replace(/\D/g, "");
    if (whatsappLimpo.length !== 11) {
      toast.error("WhatsApp inválido");
      return false;
    }
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      toast.error("CEP inválido");
      return false;
    }
    if (!formData.cidade || !formData.uf || !formData.endereco || !formData.numero || !formData.bairro) {
      toast.error("Preencha todos os campos de endereço");
      return false;
    }
    return true;
  };

  const validarEtapa3 = () => {
    if (!formData.contrato_social_url) {
      toast.error("É necessário enviar o Contrato Social ou Cartão CNPJ");
      return false;
    }
    if (!formData.aceito_termos) {
      toast.error("Você precisa aceitar os Termos de Uso");
      return false;
    }
    if (!formData.confirmo_veracidade) {
      toast.error("Você precisa confirmar a veracidade das informações");
      return false;
    }
    return true;
  };

  // Navegação entre etapas
  const proximaEtapa = () => {
    if (etapa === 1 && !validarEtapa1()) return;
    if (etapa === 2 && !validarEtapa2()) return;
    setEtapa(etapa + 1);
  };

  const voltarEtapa = () => {
    setEtapa(etapa - 1);
  };

  // Mutation para criar fornecedor
  const cadastroMutation = useMutation({
    mutationFn: async () => {
      if (!validarEtapa3()) throw new Error("Validação falhou");
      if (!user) throw new Error("Usuário não encontrado");

      const dados = {
        user_id: user.id,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_produtos: formData.tipo_produtos,
        area_atuacao: formData.area_atuacao,
        nome_responsavel: formData.nome_responsavel,
        cargo_responsavel: formData.cargo_responsavel,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        telefone_fixo: formData.telefone_fixo ? formData.telefone_fixo.replace(/\D/g, "") : undefined,
        site: formData.site || undefined,
        instagram: formData.instagram || undefined,
        cep: formData.cep.replace(/\D/g, ""),
        cidade: formData.cidade,
        uf: formData.uf,
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        logo_url: formData.logo_url || undefined,
        contrato_social_url: formData.contrato_social_url,
        status_cadastro: "PENDENTE"
      };

      return await base44.entities.Supplier.create(dados);
    },
    onSuccess: () => {
      toast.success("🎉 Cadastro enviado com sucesso!");
      setTimeout(() => {
        navigate(createPageUrl("CadastroSucesso") + "?tipo=fornecedor");
      }, 500);
    },
    onError: (error) => {
      toast.error("Erro ao finalizar cadastro: " + error.message);
    }
  });

  const handleFinalizar = () => {
    cadastroMutation.mutate();
  };

  const etapas = [
    { numero: 1, titulo: "Dados da Empresa", icon: Building2 },
    { numero: 2, titulo: "Contato e Endereço", icon: Package },
    { numero: 3, titulo: "Documentos", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-12">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white font-medium mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <h1 className="text-white text-3xl md:text-4xl font-black mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            Cadastro de Fornecedor
          </h1>
          <p className="text-white/90 text-lg">Etapa {etapa} de 3: {etapas[etapa - 1].titulo}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-4">
          <div className="flex items-center justify-between">
            {etapas.map((e, index) => {
              const Icon = e.icon;
              const concluido = etapa > e.numero;
              const ativo = etapa === e.numero;

              return (
                <React.Fragment key={e.numero}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      concluido ? "bg-green-500 text-white" : 
                      ativo ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : 
                      "bg-gray-200 text-gray-400"
                    }`}>
                      {concluido ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium hidden md:block ${
                      ativo ? "text-orange-600" : "text-gray-500"
                    }`}>
                      {e.titulo}
                    </span>
                  </div>
                  {index < etapas.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      concluido ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo das etapas */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* ETAPA 1 - DADOS DA EMPRESA */}
        {etapa === 1 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Dados da Empresa</h2>
                <p className="text-gray-600">Informações sobre seu negócio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="Nome completo da empresa"
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
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="Nome comercial"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Área de Atuação *
                </label>
                <select
                  value={formData.area_atuacao}
                  onChange={(e) => setFormData({ ...formData, area_atuacao: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="ODONTOLOGIA">Odontologia</option>
                  <option value="MEDICINA">Medicina</option>
                  <option value="AMBOS">Ambos</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Tipo de Produtos * (selecione um ou mais)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tiposProdutos.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => toggleTipoProduto(tipo.value)}
                      className={`p-4 rounded-xl border-2 font-medium transition-all ${
                        formData.tipo_produtos.includes(tipo.value)
                          ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                          : "border-gray-200 text-gray-600 hover:border-yellow-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.tipo_produtos.includes(tipo.value)
                            ? "border-yellow-500 bg-yellow-500"
                            : "border-gray-300"
                        }`}>
                          {formData.tipo_produtos.includes(tipo.value) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{tipo.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={proximaEtapa}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                Próxima Etapa
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2 - CONTATO E ENDEREÇO */}
        {etapa === 2 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Contato e Endereço</h2>
                <p className="text-gray-600">Dados para comunicação</p>
              </div>
            </div>

            {/* Responsável */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Responsável pela Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_responsavel}
                    onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo_responsavel}
                    onChange={(e) => setFormData({ ...formData, cargo_responsavel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    placeholder="Ex: Gerente, Proprietário"
                  />
                </div>
              </div>
            </div>

            {/* Contatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: maskPhone(e.target.value) })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Telefone Fixo (opcional)
                </label>
                <input
                  type="text"
                  value={formData.telefone_fixo}
                  onChange={(e) => setFormData({ ...formData, telefone_fixo: maskPhone(e.target.value) })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Site (opcional)
                </label>
                <input
                  type="url"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="https://seusite.com.br"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Instagram (opcional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-r-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    placeholder="seuusuario"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-orange-50 rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: maskCEP(e.target.value) })}
                    onBlur={() => buscarCEP(formData.cep)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    placeholder="00000-000"
                  />
                  {buscandoCep && <p className="text-xs text-blue-600 mt-1">Buscando CEP...</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
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
                    maxLength={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={voltarEtapa}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={proximaEtapa}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                Próxima Etapa
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3 - DOCUMENTOS */}
        {etapa === 3 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Documentos</h2>
                <p className="text-gray-600">Envie os documentos necessários</p>
              </div>
            </div>

            {/* Upload Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Logo da Empresa (opcional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                    uploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
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
                      <span className="text-gray-600 font-medium">
                        Clique para enviar logo (PNG, JPG - máx. 5MB)
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Documento */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Contrato Social ou Cartão CNPJ * (obrigatório)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleDocUpload}
                  disabled={uploadingDoc}
                  className="hidden"
                  id="doc-upload"
                />
                <label
                  htmlFor="doc-upload"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    uploadingDoc ? "border-gray-300 opacity-50 cursor-not-allowed" : 
                    formData.contrato_social_url ? "border-green-400 bg-green-50" : 
                    "border-red-300 bg-red-50 hover:border-red-400"
                  }`}
                >
                  {uploadingDoc ? (
                    <>
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                      <span className="text-gray-600 font-medium">Enviando documento...</span>
                    </>
                  ) : formData.contrato_social_url ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-green-600 font-medium">Documento enviado ✓</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-red-500" />
                      <span className="text-red-700 font-medium">
                        Clique para enviar documento (PDF, imagem - máx. 10MB)
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Checkboxes de Confirmação */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aceito_termos}
                  onChange={(e) => setFormData({ ...formData, aceito_termos: e.target.checked })}
                  className="mt-1 w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400"
                />
                <span className="text-sm text-gray-900">
                  <strong>Li e aceito os Termos de Uso</strong> e Política de Privacidade da plataforma.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.confirmo_veracidade}
                  onChange={(e) => setFormData({ ...formData, confirmo_veracidade: e.target.checked })}
                  className="mt-1 w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400"
                />
                <span className="text-sm text-gray-900">
                  <strong>Confirmo que todas as informações fornecidas são verdadeiras</strong> e estou ciente de que informações falsas podem resultar no bloqueio da conta.
                </span>
              </label>
            </div>

            {/* Aviso */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-1">Análise de Cadastro</p>
                  <p>
                    Seu cadastro será analisado pela nossa equipe em até <strong>48 horas úteis</strong>. Você receberá uma notificação por email assim que for aprovado.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={voltarEtapa}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={handleFinalizar}
                disabled={cadastroMutation.isPending}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cadastroMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Finalizar Cadastro
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
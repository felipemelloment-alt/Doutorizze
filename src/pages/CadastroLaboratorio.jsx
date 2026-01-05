import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  FlaskConical,
  Microscope,
  Upload,
  CheckCircle,
  Loader2,
  Camera,
  Building2,
  DollarSign,
  Clock,
  Trash2,
  Plus
} from "lucide-react";

export default function CadastroLaboratorio() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  const [formData, setFormData] = useState({
    // ETAPA 1
    tipo_laboratorio: "", // "PROTESE_DENTARIA" ou outros
    categoria: "", // "ODONTOLOGIA" ou "MEDICINA"
    
    // ETAPA 2
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    telefone: "",
    email: "",
    whatsapp: "",
    site: "",
    instagram: "",
    endereco_completo: "",
    cidade: "",
    uf: "",
    descricao: "",
    
    // ETAPA 3 - Serviços
    servicos: [{ nome: "", preco_fora: "", preco_app: "", tempo_entrega: "" }], // Inicia com 1 serviço vazio
    
    // ETAPA 4 - Verificação
    foto_documento_url: "",
    selfie_documento_url: "",
    logo_url: "",
    token_acesso: ""
  });

  // Máscaras
  const aplicarMascaraCNPJ = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  // Gerar token único
  const gerarTokenAcesso = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `DTZ-${timestamp}-${random}`.toUpperCase();
  };

  // Adicionar serviço
  const adicionarServico = () => {
    if (formData.servicos.length >= 20) {
      toast.error("Máximo de 20 serviços permitido");
      return;
    }
    setFormData({
      ...formData,
      servicos: [...formData.servicos, { nome: "", preco_fora: "", preco_app: "", tempo_entrega: "" }]
    });
  };

  // Remover serviço
  const removerServico = (index) => {
    if (formData.servicos.length <= 1) {
      toast.error("Mínimo de 1 serviço obrigatório");
      return;
    }
    setFormData({
      ...formData,
      servicos: formData.servicos.filter((_, i) => i !== index)
    });
  };

  // Atualizar serviço
  const atualizarServico = (index, campo, valor) => {
    const novosServicos = [...formData.servicos];
    novosServicos[index][campo] = valor;
    setFormData({ ...formData, servicos: novosServicos });
  };

  // Calcular desconto
  const calcularDesconto = (precoFora, precoApp) => {
    const fora = parseFloat(precoFora) || 0;
    const app = parseFloat(precoApp) || 0;
    if (fora === 0 || app >= fora) return null;
    const desconto = ((fora - app) / fora) * 100;
    return desconto.toFixed(0);
  };

  // Upload com câmera
  const handleCameraUpload = async (campo) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Força câmera
    
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }

      const setLoading = campo === "foto_documento_url" ? setUploadingDoc : 
                         campo === "selfie_documento_url" ? setUploadingSelfie : 
                         setUploadingLogo;

      setLoading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, [campo]: file_url });
        toast.success("✅ Foto enviada!");
      } catch (error) {
        toast.error("Erro ao enviar: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  // Validações
  const validarEtapa1 = () => {
    if (!formData.tipo_laboratorio) {
      toast.error("Selecione o tipo de laboratório");
      return false;
    }
    return true;
  };

  const validarEtapa2 = () => {
    if (!formData.razao_social || !formData.nome_fantasia) {
      toast.error("Preencha razão social e nome fantasia");
      return false;
    }
    if (formData.cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("CNPJ inválido");
      return false;
    }
    if (!formData.email?.includes("@")) {
      toast.error("Email inválido");
      return false;
    }
    if (formData.whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("WhatsApp inválido");
      return false;
    }
    if (!formData.cidade || !formData.uf) {
      toast.error("Preencha cidade e estado");
      return false;
    }
    if (!formData.descricao) {
      toast.error("Preencha a descrição do laboratório");
      return false;
    }
    return true;
  };

  const validarEtapa3 = () => {
    if (formData.servicos.length === 0) {
      toast.error("Adicione pelo menos 1 serviço");
      return false;
    }
    for (let i = 0; i < formData.servicos.length; i++) {
      const s = formData.servicos[i];
      if (!s.nome || !s.preco_fora || !s.preco_app || !s.tempo_entrega) {
        toast.error(`Serviço ${i + 1}: Preencha todos os campos`);
        return false;
      }
    }
    return true;
  };

  const validarEtapa4 = () => {
    if (!formData.foto_documento_url) {
      toast.error("Tire uma foto do documento");
      return false;
    }
    if (!formData.selfie_documento_url) {
      toast.error("Tire uma selfie segurando o documento");
      return false;
    }
    if (!formData.logo_url) {
      toast.error("Envie uma foto/logo do laboratório");
      return false;
    }
    return true;
  };

  const proximaEtapa = () => {
    if (etapa === 1 && !validarEtapa1()) return;
    if (etapa === 2 && !validarEtapa2()) return;
    if (etapa === 3 && !validarEtapa3()) return;
    setEtapa(etapa + 1);
  };

  const cadastrarMutation = useMutation({
    mutationFn: async () => {
      if (!validarEtapa4()) throw new Error("Validação falhou");
      const user = await base44.auth.me();

      // Gerar token
      const token = gerarTokenAcesso();

      const dados = {
        user_id: user.id,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_laboratorio: formData.tipo_laboratorio,
        categoria: formData.categoria,
        servicos_oferecidos: formData.servicos.map(s => s.nome),
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        telefone: formData.telefone?.replace(/\D/g, "") || undefined,
        site: formData.site || undefined,
        nome_responsavel: formData.razao_social,
        cep: "",
        cidade: formData.cidade,
        uf: formData.uf,
        endereco: formData.endereco_completo || "",
        numero: "",
        bairro: "",
        logo_url: formData.logo_url,
        documento_url: formData.foto_documento_url,
        descricao: formData.descricao,
        status_cadastro: "EM_ANALISE"
      };

      await base44.entities.Laboratorio.create(dados);
      
      return token;
    },
    onSuccess: (token) => {
      toast.success(`Cadastro enviado! Seu token de acesso: ${token}`);
      toast.info("Guarde este token! Você precisará dele para acessar a plataforma.", { duration: 6000 });
      setTimeout(() => {
        navigate(createPageUrl("CadastroSucesso"), { state: { token } });
      }, 2000);
    },
    onError: (error) => toast.error("Erro: " + error.message)
  });

  const progressoPercentual = (etapa / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white pb-12">
      {/* Header Dark */}
      <div className="bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => etapa === 1 ? navigate(-1) : setEtapa(etapa - 1)}
            className="flex items-center gap-2 text-white/90 hover:text-white font-medium mb-4"
          >
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="text-3xl font-black text-white mb-2">Cadastro de Laboratório</h1>
          <p className="text-white/80">Etapa {etapa} de 4</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progressoPercentual}%` }}
            className="h-full bg-gradient-to-r from-pink-500 to-orange-500"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* ETAPA 1: TIPO DE LABORATÓRIO */}
        {etapa === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl font-black mb-2">Tipo de Laboratório</h2>
              <p className="text-gray-400">Selecione o tipo do seu laboratório</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Prótese */}
              <button
                onClick={() => setFormData({ ...formData, tipo_laboratorio: "PROTESE_DENTARIA", categoria: "ODONTOLOGIA" })}
                className={`p-8 rounded-3xl border-4 transition-all ${
                  formData.tipo_laboratorio === "PROTESE_DENTARIA"
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-pink-500/50"
                }`}
              >
                <FlaskConical className="w-16 h-16 mx-auto mb-4 text-pink-500" />
                <h3 className="text-2xl font-black mb-3">Laboratório de Prótese</h3>
                <p className="text-gray-400 mb-4">Para técnicos em prótese dentária</p>
                <span className="text-sm text-gray-500">Área: Odontologia</span>
                {formData.tipo_laboratorio === "PROTESE_DENTARIA" && (
                  <CheckCircle className="w-8 h-8 mx-auto mt-4 text-green-500" />
                )}
              </button>

              {/* Card Médico */}
              <button
                onClick={() => setFormData({ ...formData, tipo_laboratorio: "ANALISES_CLINICAS", categoria: "MEDICINA" })}
                className={`p-8 rounded-3xl border-4 transition-all ${
                  formData.tipo_laboratorio === "ANALISES_CLINICAS"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-blue-500/50"
                }`}
              >
                <Microscope className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-black mb-3">Laboratório Médico</h3>
                <p className="text-gray-400 mb-4">Exames laboratoriais e diagnósticos</p>
                <span className="text-sm text-gray-500">Área: Medicina</span>
                {formData.tipo_laboratorio === "ANALISES_CLINICAS" && (
                  <CheckCircle className="w-8 h-8 mx-auto mt-4 text-green-500" />
                )}
              </button>
            </div>

            <button
              onClick={proximaEtapa}
              disabled={!formData.tipo_laboratorio}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ETAPA 2: DADOS DO LABORATÓRIO */}
        {etapa === 2 && (
          <div className="bg-gray-800 rounded-3xl p-6 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black">Dados do Laboratório</h2>
              <p className="text-gray-400">Informações básicas do seu laboratório</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Nome do Laboratório *</label>
                <input
                  type="text"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                  placeholder="Ex: Laboratório Dental Premium"
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">CNPJ *</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: aplicarMascaraCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Telefone *</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: aplicarMascaraTelefone(e.target.value) })}
                  placeholder="(00) 0000-0000"
                  maxLength={15}
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@lab.com"
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">WhatsApp *</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: aplicarMascaraTelefone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Site</label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="www.seulab.com.br"
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@seulab"
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Endereço Completo *</label>
                <input
                  type="text"
                  value={formData.endereco_completo}
                  onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
                  placeholder="Rua, número, bairro"
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="São Paulo"
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Estado *</label>
                <select
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-pink-500 outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="RS">RS</option>
                  <option value="PR">PR</option>
                  <option value="SC">SC</option>
                  <option value="BA">BA</option>
                  <option value="PE">PE</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Descrição do Laboratório *</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva os serviços e diferenciais do seu laboratório..."
                  rows={3}
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none resize-none"
                />
              </div>
            </div>

            <button
              onClick={proximaEtapa}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ETAPA 3: TABELA DE SERVIÇOS */}
        {etapa === 3 && (
          <div className="bg-gray-800 rounded-3xl p-6 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black">Tabela de Serviços</h2>
              <p className="text-gray-400">
                {formData.tipo_laboratorio === "PROTESE_DENTARIA" 
                  ? "Cadastre os serviços de prótese com preços e prazo"
                  : "Cadastre os exames com preços e tempo de resultado"}
              </p>
            </div>

            {/* Alerta Importante */}
            <div className="bg-orange-900/30 border-2 border-orange-500 rounded-xl p-4">
              <p className="text-sm text-orange-200">
                <strong>IMPORTANTE:</strong> Cadastre o preço FORA do app e o preço COM DESCONTO dentro do app. 
                Isso destaca sua vantagem competitiva para os usuários!
              </p>
            </div>

            {/* Lista de Serviços */}
            <div className="space-y-4">
              {formData.servicos.map((servico, index) => (
                <div key={index} className="bg-gray-700 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg">Serviço {index + 1}</span>
                    <button
                      onClick={() => removerServico(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Nome do {formData.tipo_laboratorio === "PROTESE_DENTARIA" ? "Serviço" : "Exame"} *
                    </label>
                    <input
                      type="text"
                      value={servico.nome}
                      onChange={(e) => atualizarServico(index, "nome", e.target.value)}
                      placeholder={formData.tipo_laboratorio === "PROTESE_DENTARIA" ? "Ex: Coroa de Porcelana" : "Ex: Hemograma Completo"}
                      className="w-full px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Preço Fora do App *
                      </label>
                      <input
                        type="number"
                        value={servico.preco_fora}
                        onChange={(e) => atualizarServico(index, "preco_fora", e.target.value)}
                        placeholder="R$ 0,00"
                        className="w-full px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-pink-400">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Preço no App *
                      </label>
                      <input
                        type="number"
                        value={servico.preco_app}
                        onChange={(e) => atualizarServico(index, "preco_app", e.target.value)}
                        placeholder="R$ 0,00"
                        className="w-full px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 outline-none"
                      />
                      {calcularDesconto(servico.preco_fora, servico.preco_app) && (
                        <p className="text-green-400 text-xs mt-1 font-bold">
                          Desconto de {calcularDesconto(servico.preco_fora, servico.preco_app)}%
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formData.tipo_laboratorio === "PROTESE_DENTARIA" ? "Tempo de Entrega" : "Tempo de Resultado"} *
                      </label>
                      <select
                        value={servico.tempo_entrega}
                        onChange={(e) => atualizarServico(index, "tempo_entrega", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-xl text-white focus:border-pink-500 outline-none"
                      >
                        <option value="">Selecione</option>
                        <option value="1h">1 hora</option>
                        <option value="2h">2 horas</option>
                        <option value="4h">4 horas</option>
                        <option value="24h">24 horas</option>
                        <option value="48h">48 horas</option>
                        <option value="3dias">3 dias</option>
                        <option value="5dias">5 dias</option>
                        <option value="7dias">7 dias</option>
                        <option value="10dias">10 dias</option>
                        <option value="15dias">15 dias</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={adicionarServico}
                disabled={formData.servicos.length >= 20}
                className="w-full py-4 border-2 border-dashed border-gray-600 text-gray-400 hover:border-pink-500 hover:text-pink-500 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Serviço ({formData.servicos.length}/20)
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEtapa(2)}
                className="flex-1 py-4 border-2 border-gray-600 text-white font-bold rounded-2xl hover:bg-gray-700 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 4: VERIFICAÇÃO DE IDENTIDADE */}
        {etapa === 4 && (
          <div className="bg-gray-800 rounded-3xl p-6 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black">Verificação de Identidade</h2>
              <p className="text-gray-400">Envie os documentos para validação</p>
            </div>

            {/* Alerta Segurança */}
            <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-xl p-4">
              <p className="text-sm text-yellow-200">
                <strong>SEGURANÇA:</strong> Seus documentos serão enviados para validação manual. 
                Após aprovação, você receberá um TOKEN de acesso único por email.
              </p>
            </div>

            <div className="space-y-4">
              {/* Foto Documento */}
              <div>
                <label className="block text-sm font-bold mb-2">Foto do Documento (RG ou CNH) *</label>
                <p className="text-xs text-gray-400 mb-3">Apenas câmera - não é permitido usar galeria</p>
                {formData.foto_documento_url ? (
                  <div className="flex items-center gap-3 p-4 bg-green-900/30 border-2 border-green-500 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-green-300 font-medium">Foto do documento enviada ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCameraUpload("foto_documento_url")}
                    disabled={uploadingDoc}
                    className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-pink-500 transition-all disabled:opacity-50"
                  >
                    {uploadingDoc ? (
                      <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-gray-300 font-medium">
                      {uploadingDoc ? "Enviando..." : "Abrir Câmera"}
                    </span>
                  </button>
                )}
              </div>

              {/* Selfie Segurando Documento */}
              <div>
                <label className="block text-sm font-bold mb-2">Selfie Segurando o Documento *</label>
                <p className="text-xs text-gray-400 mb-3">O documento deve estar visível e legível</p>
                {formData.selfie_documento_url ? (
                  <div className="flex items-center gap-3 p-4 bg-green-900/30 border-2 border-green-500 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-green-300 font-medium">Selfie enviada ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCameraUpload("selfie_documento_url")}
                    disabled={uploadingSelfie}
                    className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-pink-500 transition-all disabled:opacity-50"
                  >
                    {uploadingSelfie ? (
                      <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-gray-300 font-medium">
                      {uploadingSelfie ? "Enviando..." : "Abrir Câmera"}
                    </span>
                  </button>
                )}
              </div>

              {/* Foto/Logo Laboratório */}
              <div>
                <label className="block text-sm font-bold mb-2">Foto ou Logo do Laboratório *</label>
                {formData.logo_url ? (
                  <div className="flex items-center gap-3 p-4 bg-green-900/30 border-2 border-green-500 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-green-300 font-medium">Logo enviado ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCameraUpload("logo_url")}
                    disabled={uploadingLogo}
                    className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-pink-500 transition-all disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-gray-300 font-medium">
                      {uploadingLogo ? "Enviando..." : "Abrir Câmera"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Termos */}
            <div className="bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-300">
                Ao enviar o cadastro, você concorda com os <strong className="text-pink-400">Termos de Uso</strong> e{" "}
                <strong className="text-pink-400">Política de Privacidade</strong>. 
                A Doutorizze NÃO se responsabiliza por negociações entre usuários.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEtapa(3)}
                className="flex-1 py-4 border-2 border-gray-600 text-white font-bold rounded-2xl hover:bg-gray-700 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={() => cadastrarMutation.mutate()}
                disabled={cadastrarMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cadastrarMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Enviar Cadastro
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
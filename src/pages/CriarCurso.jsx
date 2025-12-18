import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  GraduationCap,
  ChevronLeft,
  Upload,
  CheckCircle2,
  DollarSign,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Save,
  Send,
  X
} from "lucide-react";

const tiposCurso = [
  { value: "POS_GRADUACAO", label: "Pós-Graduação" },
  { value: "ESPECIALIZACAO", label: "Especialização" },
  { value: "EXTENSAO", label: "Extensão" },
  { value: "ATUALIZACAO", label: "Atualização" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CONGRESSO", label: "Congresso" }
];

const especialidadesOdonto = [
  "Ortodontia", "Implantodontia", "Endodontia", "Periodontia",
  "Prótese", "Estética", "Cirurgia", "Odontopediatria"
];

const especialidadesMedicina = [
  "Cardiologia", "Ortopedia", "Neurologia", "Pediatria",
  "Dermatologia", "Psiquiatria", "Cirurgia Geral", "Ginecologia"
];

export default function CriarCurso() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [instituicao, setInstituicao] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    area: "",
    especialidade: "",
    carga_horaria: "",
    duracao_meses: "",
    modalidade: "",
    certificacao: "",
    valor_total: "",
    tem_parcelamento: false,
    valor_parcela: "",
    numero_parcelas: "",
    tem_desconto: false,
    percentual_desconto: "",
    valor_com_desconto: "",
    data_inicio: "",
    data_fim: "",
    inscricoes_ate: "",
    vagas_totais: "",
    vagas_restantes: "",
    cidade: "",
    uf: "",
    endereco: "",
    imagem_principal_url: "",
    imagens_extras: []
  });

  const [uploadingPrincipal, setUploadingPrincipal] = useState(false);
  const [uploadingExtras, setUploadingExtras] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const instResults = await base44.entities.EducationInstitution.filter({ user_id: currentUser.id });
        setInstituicao(instResults[0] || null);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const criarCursoMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Course.create(data);
    },
    onSuccess: () => {
      toast.success("✅ Curso publicado com sucesso!");
      navigate(createPageUrl("MeusCursos"));
    },
    onError: (error) => {
      toast.error("Erro ao publicar curso: " + error.message);
    }
  });

  const handleUploadPrincipal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingPrincipal(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem_principal_url: file_url });
      toast.success("✅ Imagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploadingPrincipal(false);
    }
  };

  const handleUploadExtra = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.imagens_extras.length + files.length > 4) {
      toast.error("Máximo de 4 imagens extras.");
      return;
    }

    setUploadingExtras(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setFormData({ 
        ...formData, 
        imagens_extras: [...formData.imagens_extras, ...urls].slice(0, 4)
      });
      toast.success("✅ Imagens enviadas!");
    } catch (error) {
      toast.error("Erro ao enviar imagens: " + error.message);
    } finally {
      setUploadingExtras(false);
    }
  };

  const removerImagemExtra = (index) => {
    const novasImagens = formData.imagens_extras.filter((_, i) => i !== index);
    setFormData({ ...formData, imagens_extras: novasImagens });
  };

  const calcularValorComDesconto = () => {
    if (!formData.valor_total || !formData.percentual_desconto) return;
    const valor = parseFloat(formData.valor_total);
    const desconto = parseFloat(formData.percentual_desconto);
    const valorFinal = valor - (valor * desconto / 100);
    setFormData({ ...formData, valor_com_desconto: valorFinal.toFixed(2) });
  };

  useEffect(() => {
    if (formData.tem_desconto && formData.valor_total && formData.percentual_desconto) {
      calcularValorComDesconto();
    }
  }, [formData.valor_total, formData.percentual_desconto, formData.tem_desconto]);

  const validarFormulario = (status) => {
    if (!formData.titulo) return "Título é obrigatório";
    if (!formData.descricao) return "Descrição é obrigatória";
    if (!formData.tipo) return "Selecione o tipo de curso";
    if (!formData.area) return "Selecione a área";
    if (!formData.especialidade) return "Selecione a especialidade";
    if (!formData.carga_horaria) return "Informe a carga horária";
    if (!formData.duracao_meses) return "Informe a duração";
    if (!formData.modalidade) return "Selecione a modalidade";
    if (!formData.valor_total) return "Informe o valor total";
    if (!formData.data_inicio) return "Informe a data de início";
    if (!formData.inscricoes_ate) return "Informe o prazo de inscrições";
    if (!formData.vagas_totais) return "Informe o número de vagas";
    
    if (formData.modalidade !== "EAD") {
      if (!formData.cidade) return "Informe a cidade";
      if (!formData.uf) return "Informe o UF";
    }

    if (status === "ATIVO" && !formData.imagem_principal_url) {
      return "Adicione uma imagem principal para publicar";
    }

    return null;
  };

  const handleSubmit = (status) => {
    const erro = validarFormulario(status);
    if (erro) {
      toast.error(erro);
      return;
    }

    const dataToSend = {
      institution_id: instituicao.id,
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      area: formData.area,
      especialidade: formData.especialidade,
      carga_horaria: parseFloat(formData.carga_horaria),
      duracao_meses: parseFloat(formData.duracao_meses),
      modalidade: formData.modalidade,
      certificacao: formData.certificacao || undefined,
      valor_total: parseFloat(formData.valor_total),
      valor_parcela: formData.tem_parcelamento ? parseFloat(formData.valor_parcela) : undefined,
      numero_parcelas: formData.tem_parcelamento ? parseInt(formData.numero_parcelas) : undefined,
      tem_desconto: formData.tem_desconto,
      percentual_desconto: formData.tem_desconto ? parseFloat(formData.percentual_desconto) : undefined,
      valor_com_desconto: formData.tem_desconto ? parseFloat(formData.valor_com_desconto) : undefined,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim || undefined,
      inscricoes_ate: formData.inscricoes_ate,
      vagas_totais: parseInt(formData.vagas_totais),
      vagas_restantes: parseInt(formData.vagas_totais),
      cidade: formData.cidade || undefined,
      uf: formData.uf || undefined,
      endereco: formData.endereco || undefined,
      imagem_principal_url: formData.imagem_principal_url,
      imagens_extras: formData.imagens_extras.length > 0 ? formData.imagens_extras : undefined,
      status: status,
      destaque: false,
      visualizacoes: 0,
      cliques_inscricao: 0
    };

    criarCursoMutation.mutate(dataToSend);
  };

  if (!user || !instituicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  const especialidadesDisponiveis = formData.area === "ODONTOLOGIA" 
    ? especialidadesOdonto 
    : formData.area === "MEDICINA"
    ? especialidadesMedicina
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden pb-24">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Publicar Novo Curso</h1>
              <p className="text-gray-600">Crie e publique cursos e especializações</p>
            </div>
          </div>
        </div>

        {/* SEÇÃO 1 - INFORMAÇÕES DO CURSO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4">Informações do Curso</h2>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Título do Curso *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Especialização em Ortodontia"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o curso, conteúdo programático, diferenciais..."
              rows={6}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Tipo de Curso *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                <option value="">Selecione</option>
                {tiposCurso.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Área *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value, especialidade: "" })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                <option value="">Selecione</option>
                <option value="ODONTOLOGIA">Odontologia</option>
                <option value="MEDICINA">Medicina</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Especialidade *
              </label>
              <select
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                disabled={!formData.area}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione uma área primeiro</option>
                {especialidadesDisponiveis.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 2 - DETALHES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4">Detalhes</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Carga Horária (horas) *
              </label>
              <input
                type="number"
                value={formData.carga_horaria}
                onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
                placeholder="360"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Duração (meses) *
              </label>
              <input
                type="number"
                value={formData.duracao_meses}
                onChange={(e) => setFormData({ ...formData, duracao_meses: e.target.value })}
                placeholder="12"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Modalidade *
              </label>
              <select
                value={formData.modalidade}
                onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              >
                <option value="">Selecione</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="EAD">EAD</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Certificação/Reconhecimento (Opcional)
              </label>
              <input
                type="text"
                value={formData.certificacao}
                onChange={(e) => setFormData({ ...formData, certificacao: e.target.value })}
                placeholder="Ex: Reconhecido pelo MEC"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 3 - VALORES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-gray-900">Valores</h2>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Valor Total (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valor_total}
              onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
              placeholder="5000.00"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
            />
          </div>

          {/* Parcelamento */}
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-bold text-gray-900">Oferecer Parcelamento</span>
              <input
                type="checkbox"
                checked={formData.tem_parcelamento}
                onChange={(e) => setFormData({ ...formData, tem_parcelamento: e.target.checked })}
                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
              />
            </label>

            {formData.tem_parcelamento && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Valor da Parcela (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_parcela}
                    onChange={(e) => setFormData({ ...formData, valor_parcela: e.target.value })}
                    placeholder="500.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Número de Parcelas
                  </label>
                  <input
                    type="number"
                    value={formData.numero_parcelas}
                    onChange={(e) => setFormData({ ...formData, numero_parcelas: e.target.value })}
                    placeholder="12"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desconto */}
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-bold text-gray-900">Oferecer Desconto</span>
              <input
                type="checkbox"
                checked={formData.tem_desconto}
                onChange={(e) => setFormData({ ...formData, tem_desconto: e.target.checked })}
                className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
              />
            </label>

            {formData.tem_desconto && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Percentual de Desconto (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.percentual_desconto}
                    onChange={(e) => setFormData({ ...formData, percentual_desconto: e.target.value })}
                    placeholder="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  />
                </div>
                {formData.valor_com_desconto && (
                  <div className="p-3 bg-white rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Valor com Desconto:</p>
                    <p className="text-2xl font-black text-green-600">
                      R$ {parseFloat(formData.valor_com_desconto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* SEÇÃO 4 - DATAS E VAGAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-gray-900">Datas e Vagas</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Data de Fim (Opcional)
              </label>
              <input
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Inscrições até *
              </label>
              <input
                type="date"
                value={formData.inscricoes_ate}
                onChange={(e) => setFormData({ ...formData, inscricoes_ate: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Número de Vagas *
              </label>
              <input
                type="number"
                value={formData.vagas_totais}
                onChange={(e) => setFormData({ ...formData, vagas_totais: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* SEÇÃO 5 - LOCAL */}
        {(formData.modalidade === "PRESENCIAL" || formData.modalidade === "HIBRIDO") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-black text-gray-900">Localização</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="São Paulo"
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
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Endereço Completo (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* SEÇÃO 6 - IMAGENS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-gray-900">Imagens</h2>
          </div>

          {/* Imagem Principal */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Imagem Principal *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadPrincipal}
              disabled={uploadingPrincipal}
              className="hidden"
              id="imagem-principal"
            />
            <label
              htmlFor="imagem-principal"
              className={`flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                uploadingPrincipal ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploadingPrincipal ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 font-medium">Enviando...</span>
                </>
              ) : formData.imagem_principal_url ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <span className="text-green-600 font-medium">Imagem enviada ✓</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600 font-medium">Clique para enviar (máx. 5MB)</span>
                </>
              )}
            </label>
          </div>

          {/* Imagens Extras */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Imagens Extras (até 4)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUploadExtra}
              disabled={uploadingExtras || formData.imagens_extras.length >= 4}
              className="hidden"
              id="imagens-extras"
            />
            <label
              htmlFor="imagens-extras"
              className={`flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                uploadingExtras || formData.imagens_extras.length >= 4 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploadingExtras ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 font-medium">Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600 font-medium">
                    {formData.imagens_extras.length}/4 imagens
                  </span>
                </>
              )}
            </label>

            {formData.imagens_extras.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {formData.imagens_extras.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Extra ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removerImagemExtra(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* BOTÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <button
            onClick={() => handleSubmit("RASCUNHO")}
            disabled={criarCursoMutation.isPending}
            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSubmit("ATIVO")}
            disabled={criarCursoMutation.isPending}
            className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {criarCursoMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Publicando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publicar Curso
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
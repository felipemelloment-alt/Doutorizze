import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Package,
  DollarSign,
  Image as ImageIcon,
  Truck,
  Save,
  Send
} from "lucide-react";

const categorias = [
  { value: "EQUIPAMENTO", label: "Equipamento" },
  { value: "MATERIAL", label: "Material de Consumo" },
  { value: "SOFTWARE", label: "Software/Sistema" },
  { value: "MOVEL", label: "Móvel/Mobiliário" },
  { value: "SERVICO", label: "Serviço" }
];

const condicoes = [
  { value: "NOVO", label: "Novo" },
  { value: "SEMINOVO", label: "Seminovo" },
  { value: "USADO", label: "Usado" }
];

const ufs = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CriarPromocao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [uploadingPrincipal, setUploadingPrincipal] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    marca: "",
    modelo: "",
    condicao: "NOVO",
    preco_original: "",
    preco_promocional: "",
    imagem_principal: "",
    imagens_extras: [],
    quantidade_disponivel: 0,
    data_validade: "",
    garantia: "",
    frete_gratis: false,
    regioes_entrega: [],
    prazo_entrega: "",
    brasil_todo: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const supplierResult = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        setSupplier(supplierResult[0] || null);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Calcular desconto
  const calcularDesconto = () => {
    const original = parseFloat(formData.preco_original) || 0;
    const promocional = parseFloat(formData.preco_promocional) || 0;
    if (original > 0 && promocional > 0 && promocional < original) {
      return Math.round(((original - promocional) / original) * 100);
    }
    return 0;
  };

  const desconto = calcularDesconto();

  // Upload imagem principal
  const handleImagemPrincipalUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingPrincipal(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem_principal: file_url });
      toast.success("✅ Imagem principal enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploadingPrincipal(false);
    }
  };

  // Upload imagens extras
  const handleImagemExtraUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.imagens_extras.length >= 4) {
      toast.error("Máximo de 4 imagens extras");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploadingExtra(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ 
        ...formData, 
        imagens_extras: [...formData.imagens_extras, file_url] 
      });
      toast.success("✅ Imagem extra adicionada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploadingExtra(false);
    }
  };

  // Remover imagem extra
  const removerImagemExtra = (index) => {
    const novasImagens = formData.imagens_extras.filter((_, i) => i !== index);
    setFormData({ ...formData, imagens_extras: novasImagens });
  };

  // Toggle UF
  const toggleUF = (uf) => {
    if (formData.brasil_todo) return;
    
    const current = formData.regioes_entrega;
    if (current.includes(uf)) {
      setFormData({ ...formData, regioes_entrega: current.filter(u => u !== uf) });
    } else {
      setFormData({ ...formData, regioes_entrega: [...current, uf] });
    }
  };

  // Toggle Brasil Todo
  const toggleBrasilTodo = () => {
    if (!formData.brasil_todo) {
      setFormData({ ...formData, brasil_todo: true, regioes_entrega: ["BRASIL_TODO"] });
    } else {
      setFormData({ ...formData, brasil_todo: false, regioes_entrega: [] });
    }
  };

  // Validações
  const validarFormulario = () => {
    if (!formData.titulo) {
      toast.error("Preencha o título da promoção");
      return false;
    }
    if (!formData.descricao || formData.descricao.length < 20) {
      toast.error("Descrição deve ter pelo menos 20 caracteres");
      return false;
    }
    if (!formData.categoria) {
      toast.error("Selecione uma categoria");
      return false;
    }
    const original = parseFloat(formData.preco_original);
    const promocional = parseFloat(formData.preco_promocional);
    if (!original || original <= 0) {
      toast.error("Preço original inválido");
      return false;
    }
    if (!promocional || promocional <= 0) {
      toast.error("Preço promocional inválido");
      return false;
    }
    if (promocional >= original) {
      toast.error("Preço promocional deve ser menor que o original");
      return false;
    }
    if (!formData.imagem_principal) {
      toast.error("Adicione pelo menos uma imagem");
      return false;
    }
    return true;
  };

  // Mutation criar promoção
  const criarPromocaoMutation = useMutation({
    mutationFn: async (status) => {
      if (!validarFormulario()) throw new Error("Validação falhou");
      if (!supplier) throw new Error("Fornecedor não encontrado");

      const dados = {
        supplier_id: supplier.id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        marca: formData.marca || undefined,
        modelo: formData.modelo || undefined,
        condicao: formData.condicao,
        preco_original: parseFloat(formData.preco_original),
        preco_promocional: parseFloat(formData.preco_promocional),
        desconto_percentual: desconto,
        imagem_principal: formData.imagem_principal,
        imagens_extras: formData.imagens_extras.length > 0 ? formData.imagens_extras : undefined,
        quantidade_disponivel: parseInt(formData.quantidade_disponivel) || 0,
        data_validade: formData.data_validade || undefined,
        garantia: formData.garantia || undefined,
        frete_gratis: formData.frete_gratis,
        regioes_entrega: formData.regioes_entrega.length > 0 ? formData.regioes_entrega : undefined,
        prazo_entrega: formData.prazo_entrega || undefined,
        status
      };

      const promocao = await base44.entities.Promotion.create(dados);

      // Atualizar total de promoções do fornecedor
      await base44.entities.Supplier.update(supplier.id, {
        total_promocoes: (supplier.total_promocoes || 0) + 1
      });

      return promocao;
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["promocoes"] });
      if (status === "ATIVO") {
        toast.success("🎉 Promoção publicada com sucesso!");
      } else {
        toast.success("💾 Rascunho salvo com sucesso!");
      }
      setTimeout(() => {
        navigate(createPageUrl("MinhasPromocoes"));
      }, 500);
    },
    onError: (error) => {
      toast.error("Erro ao criar promoção: " + error.message);
    }
  });

  const handleSalvarRascunho = () => {
    criarPromocaoMutation.mutate("RASCUNHO");
  };

  const handlePublicar = () => {
    criarPromocaoMutation.mutate("ATIVO");
  };

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Criar Nova Promoção</h1>
          <p className="text-gray-600">Preencha os dados do produto ou serviço em oferta</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-8">
          {/* SEÇÃO 1 - PRODUTO */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Informações do Produto</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Título da Promoção *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="Ex: Cadeira Odontológica Premium - 40% OFF"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none resize-none"
                  placeholder="Descreva detalhes, especificações técnicas, benefícios..."
                />
                <p className="text-xs text-gray-500 mt-1">{formData.descricao.length} caracteres (mínimo 20)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  >
                    <option value="">Selecione</option>
                    {categorias.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Condição do Produto *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {condicoes.map((cond) => (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, condicao: cond.value })}
                      className={`p-3 rounded-xl border-2 font-medium transition-all ${
                        formData.condicao === cond.value
                          ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                          : "border-gray-200 text-gray-600 hover:border-yellow-300"
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2 - PREÇOS */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Preços</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Preço Original (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco_original}
                  onChange={(e) => setFormData({ ...formData, preco_original: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Preço Promocional (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco_promocional}
                  onChange={(e) => setFormData({ ...formData, preco_promocional: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {desconto > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎉</div>
                  <div>
                    <p className="text-sm text-gray-600">Desconto automático:</p>
                    <p className="text-3xl font-black text-green-600">{desconto}% OFF</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 3 - IMAGENS */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Imagens</h2>
            </div>

            {/* Imagem Principal */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Imagem Principal *
              </label>
              {formData.imagem_principal ? (
                <div className="relative">
                  <img 
                    src={formData.imagem_principal} 
                    alt="Principal" 
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, imagem_principal: "" })}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagemPrincipalUpload}
                    disabled={uploadingPrincipal}
                    className="hidden"
                    id="imagem-principal"
                  />
                  <label
                    htmlFor="imagem-principal"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                      uploadingPrincipal ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingPrincipal ? (
                      <>
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-2" />
                        <span className="text-gray-600 font-medium">Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-gray-600 font-medium">Clique para adicionar imagem</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG - máx. 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Imagens Extras */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Imagens Extras (até 4)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.imagens_extras.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img} 
                      alt={`Extra ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removerImagemExtra(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {formData.imagens_extras.length < 4 && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagemExtraUpload}
                      disabled={uploadingExtra}
                      className="hidden"
                      id="imagem-extra"
                    />
                    <label
                      htmlFor="imagem-extra"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all ${
                        uploadingExtra ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploadingExtra ? (
                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-600">Adicionar</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO 4 - DISPONIBILIDADE */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Disponibilidade</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Quantidade Disponível
                </label>
                <input
                  type="number"
                  value={formData.quantidade_disponivel}
                  onChange={(e) => setFormData({ ...formData, quantidade_disponivel: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="0 = ilimitado"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Validade da Promoção
                </label>
                <input
                  type="date"
                  value={formData.data_validade}
                  onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Garantia
                </label>
                <input
                  type="text"
                  value={formData.garantia}
                  onChange={(e) => setFormData({ ...formData, garantia: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="Ex: 12 meses"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 5 - ENTREGA */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Entrega</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.frete_gratis}
                  onChange={(e) => setFormData({ ...formData, frete_gratis: e.target.checked })}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                />
                <span className="text-sm font-bold text-gray-900">
                  Frete Grátis 🎁
                </span>
              </label>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Regiões de Entrega
                </label>
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={toggleBrasilTodo}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      formData.brasil_todo
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🇧🇷 Brasil Todo
                  </button>
                </div>
                {!formData.brasil_todo && (
                  <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                    {ufs.map((uf) => (
                      <button
                        key={uf}
                        type="button"
                        onClick={() => toggleUF(uf)}
                        className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                          formData.regioes_entrega.includes(uf)
                            ? "bg-yellow-400 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {uf}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Prazo de Entrega
                </label>
                <input
                  type="text"
                  value={formData.prazo_entrega}
                  onChange={(e) => setFormData({ ...formData, prazo_entrega: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  placeholder="Ex: 5 a 10 dias úteis"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões Fixos */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button
              onClick={handleSalvarRascunho}
              disabled={criarPromocaoMutation.isPending}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {criarPromocaoMutation.isPending && criarPromocaoMutation.variables === "RASCUNHO" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Rascunho
                </>
              )}
            </button>
            <button
              onClick={handlePublicar}
              disabled={criarPromocaoMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {criarPromocaoMutation.isPending && criarPromocaoMutation.variables === "ATIVO" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publicar Promoção
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  Camera,
  Video,
  Phone,
  AlertCircle
} from "lucide-react";
import { getCatalogo, getCamposDinamicos } from "@/components/marketplace/catalogoMarketplace";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userWhatsApp, setUserWhatsApp] = useState("");

  const [formData, setFormData] = useState({
    tipo_mundo: "",
    categoria: "",
    subcategoria: "",
    titulo_item: "",
    descricao: "",
    marca: "",
    condicao: "",
    ano_fabricacao: "",
    especificacoes: {},
    preco: "",
    localizacao: "",
    cidade: "",
    uf: "",
    telefone_contato: "",
    whatsapp_visivel: false,
    whatsapp_verificado: false,
    foto_frontal: "",
    foto_lateral: "",
    foto_placa: "",
    fotos: [],
    video_url: "",
    flag_sem_foto_placa: false
  });

  const totalEtapas = 5;

  // Detectar usuário e tipo
  useEffect(() => {
    const detectUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Redirecionar se não completou onboarding
        if (!currentUser.vertical || !currentUser.tipo_conta) {
          navigate(createPageUrl("OnboardingVertical"));
          return;
        }

        let tipoDetectado = currentUser.tipo_conta;
        let telefone = "";
        let areaForcada = currentUser.vertical;

        // Buscar dados específicos
        if (currentUser.tipo_conta === "PROFISSIONAL") {
          const profs = await base44.entities.Professional.filter({ user_id: currentUser.id });
          if (profs.length > 0) {
            telefone = profs[0].whatsapp;
          }
        } else if (currentUser.tipo_conta === "CLINICA") {
          const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
          if (owners.length > 0) {
            const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
            if (units.length > 0) {
              telefone = units[0].whatsapp;
              areaForcada = units[0].tipo_mundo;
            }
          }
        } else if (currentUser.tipo_conta === "FORNECEDOR") {
          const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
          if (suppliers.length > 0) {
            telefone = suppliers[0].whatsapp;
            areaForcada = suppliers[0].area_atuacao || currentUser.vertical;
          }
        }

        setUserType(tipoDetectado);
        setUserWhatsApp(telefone);
        setFormData(prev => ({
          ...prev,
          tipo_mundo: areaForcada,
          telefone_contato: telefone,
          whatsapp_verificado: !!telefone
        }));
      } catch (error) {
        console.error("Erro ao detectar usuário:", error);
      }
    };
    detectUser();
  }, []);

  // Mutation para criar
  const createItemMutation = useMutation({
    mutationFn: async (itemData) => {
      const { calcularScoresCompletos } = await import("@/components/marketplace/scoreEngine");
      
      // Calcular scores completos
      const scores = calcularScoresCompletos(itemData, {
        identidade_verificada: false,
        media_avaliacoes: 0,
        taxa_resposta_rapida: false,
        total_vendas: 0,
        dias_cadastrado: 0
      });

      const dadosCompletos = {
        ...itemData,
        score_anuncio: scores.score_anuncio,
        score_produto: scores.score_produto,
        score_vendedor: scores.score_vendedor,
        score_ranking: scores.score_ranking,
        pode_destacar: scores.pode_destacar,
        bloqueado_auto: !scores.pode_exibir,
        motivo_bloqueio: scores.motivos_restricao.join("; ") || null,
        status: !scores.pode_exibir ? "SUSPENSO" : "ATIVO"
      };

      return await base44.entities.MarketplaceItem.create(dadosCompletos);
    },
    onSuccess: async (novoItem) => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceItems"] });

      try {
        await base44.functions.invoke('notifyRadarMatches', { marketplace_item_id: novoItem.id });
      } catch (error) {
        console.log("Erro ao notificar radares:", error);
      }

      toast.success("✅ Anúncio publicado com sucesso!");
      navigate(createPageUrl("Marketplace"));
    },
    onError: (error) => {
      toast.error("Erro ao criar anúncio: " + error.message);
    }
  });

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleEspecificacaoChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      especificacoes: { ...prev.especificacoes, [campo]: valor }
    }));
  };

  const handleFileUpload = async (campo, file) => {
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Apenas imagens JPG/PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange(campo, file_url);
      
      // Adicionar também ao array fotos
      if (campo.startsWith("foto_")) {
        setFormData(prev => ({
          ...prev,
          fotos: [...new Set([...prev.fotos, file_url])] // Evitar duplicatas
        }));
      }
      
      toast.success("Foto enviada!");
    } catch (error) {
      toast.error("Erro ao enviar: " + error.message);
    }
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.categoria || !formData.subcategoria) {
          toast.error("Selecione categoria e subcategoria");
          return false;
        }
        return true;
      case 2:
        if (!formData.titulo_item.trim() || formData.titulo_item.length < 10) {
          toast.error("Título deve ter no mínimo 10 caracteres");
          return false;
        }
        if (!formData.descricao.trim() || formData.descricao.length < 30) {
          toast.error("Descrição deve ter no mínimo 30 caracteres");
          return false;
        }
        if (!formData.marca.trim()) {
          toast.error("Preencha a marca");
          return false;
        }
        if (!formData.condicao) {
          toast.error("Selecione a condição");
          return false;
        }
        
        // Validar campos dinâmicos obrigatórios
        const camposDinamicos = getCamposDinamicos(formData.tipo_mundo, formData.subcategoria);
        for (const campo of camposDinamicos) {
          if (campo.obrigatorio && !formData.especificacoes[campo.campo]) {
            toast.error(`Campo obrigatório: ${campo.label}`);
            return false;
          }
        }
        return true;
      case 3:
        if (!formData.foto_frontal || !formData.foto_lateral) {
          toast.error("Envie pelo menos as fotos frontal e lateral");
          return false;
        }
        return true;
      case 4:
        if (!formData.preco || parseFloat(formData.preco) <= 0) {
          toast.error("Preencha um preço válido");
          return false;
        }
        if (!formData.cidade || !formData.uf) {
          toast.error("Preencha a localização");
          return false;
        }
        return true;
      case 5:
        if (!formData.telefone_contato) {
          toast.error("Número de contato é obrigatório");
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

  const finalizarAnuncio = async () => {
    if (!validarEtapa(5)) return;

    const localizacao = `${formData.cidade} - ${formData.uf}`;
    
    // Montar array de fotos
    const todasFotos = [
      formData.foto_frontal,
      formData.foto_lateral,
      formData.foto_placa
    ].filter(Boolean);

    const dadosAnuncio = {
      tipo_mundo: formData.tipo_mundo,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria,
      titulo_item: formData.titulo_item.trim(),
      descricao: formData.descricao.trim(),
      marca: formData.marca.trim(),
      condicao: formData.condicao,
      ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao) : null,
      especificacoes: formData.especificacoes,
      preco: parseFloat(formData.preco),
      localizacao,
      telefone_contato: formData.telefone_contato,
      whatsapp_visivel: formData.whatsapp_visivel,
      whatsapp_verificado: formData.whatsapp_verificado,
      foto_frontal: formData.foto_frontal,
      foto_lateral: formData.foto_lateral,
      foto_placa: formData.foto_placa || null,
      fotos: todasFotos,
      video_url: formData.video_url || null,
      flag_sem_foto_placa: !formData.foto_placa,
      anunciante_id: user.id,
      anunciante_tipo: userType,
      anunciante_nome: user.full_name
    };

    createItemMutation.mutate(dadosAnuncio);
  };

  const catalogo = getCatalogo(formData.tipo_mundo);
  const camposDinamicos = getCamposDinamicos(formData.tipo_mundo, formData.subcategoria);

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Categoria do Produto</h2>

            {/* Área - Travada ou Selecionável */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Área</label>
              {userType === "FORNECEDOR" ? (
                <select
                  value={formData.tipo_mundo}
                  onChange={(e) => {
                    handleInputChange("tipo_mundo", e.target.value);
                    handleInputChange("categoria", "");
                    handleInputChange("subcategoria", "");
                  }}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="ODONTOLOGIA">🦷 Odontologia</option>
                  <option value="MEDICINA">🩺 Medicina</option>
                </select>
              ) : (
                <div className={`p-4 rounded-xl font-bold ${
                  formData.tipo_mundo === "ODONTOLOGIA"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {formData.tipo_mundo === "ODONTOLOGIA" ? "🦷 Odontologia" : "🩺 Medicina"}
                </div>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Categoria *</label>
              <div className="grid grid-cols-1 gap-3">
                {catalogo.categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      handleInputChange("categoria", cat.id);
                      handleInputChange("subcategoria", "");
                    }}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      formData.categoria === cat.id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <span className="font-bold text-gray-900 text-lg">{cat.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategoria */}
            {formData.categoria && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Subcategoria *</label>
                <div className="grid grid-cols-2 gap-3">
                  {catalogo.categorias
                    .find(c => c.id === formData.categoria)
                    ?.subcategorias.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleInputChange("subcategoria", sub.id)}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.subcategoria === sub.id
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-gray-200 hover:border-yellow-300"
                        }`}
                      >
                        <span className="font-semibold text-gray-900">{sub.nome}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Detalhes do Produto</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Anúncio *</label>
              <input
                type="text"
                value={formData.titulo_item}
                onChange={(e) => handleInputChange("titulo_item", e.target.value)}
                placeholder="Ex: Autoclave Cristófoli 12 Litros - Revisada"
                maxLength={100}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.titulo_item.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição Completa *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva detalhadamente o produto, estado de conservação, motivo da venda, etc."
                className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.descricao.length}/1000</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Marca *</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  placeholder="Ex: Cristófoli, Dabi Atlante"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ano de Fabricação</label>
                <input
                  type="number"
                  value={formData.ano_fabricacao}
                  onChange={(e) => handleInputChange("ano_fabricacao", e.target.value)}
                  placeholder="2020"
                  min="1980"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Condição *</label>
              <div className="grid grid-cols-3 gap-3">
                {["NOVO", "SEMINOVO", "USADO"].map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleInputChange("condicao", cond)}
                    className={`py-3 px-4 border-2 rounded-xl font-bold transition-all ${
                      formData.condicao === cond
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-700 hover:border-yellow-300"
                    }`}
                  >
                    {cond === "NOVO" ? "Novo" : cond === "SEMINOVO" ? "Seminovo" : "Usado"}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos Dinâmicos */}
            {camposDinamicos.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Especificações Técnicas</h3>
                <div className="space-y-4">
                  {camposDinamicos.map((campo) => (
                    <div key={campo.campo}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {campo.label} {campo.obrigatorio && "*"}
                      </label>
                      
                      {campo.tipo === "text" && (
                        <input
                          type="text"
                          value={formData.especificacoes[campo.campo] || ""}
                          onChange={(e) => handleEspecificacaoChange(campo.campo, e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        />
                      )}

                      {campo.tipo === "number" && (
                        <input
                          type="number"
                          value={formData.especificacoes[campo.campo] || ""}
                          onChange={(e) => handleEspecificacaoChange(campo.campo, e.target.value)}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        />
                      )}

                      {campo.tipo === "select" && (
                        <select
                          value={formData.especificacoes[campo.campo] || ""}
                          onChange={(e) => handleEspecificacaoChange(campo.campo, e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                        >
                          <option value="">Selecione</option>
                          {campo.opcoes.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {campo.tipo === "boolean" && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleEspecificacaoChange(campo.campo, true)}
                            className={`flex-1 py-3 border-2 rounded-xl font-bold transition-all ${
                              formData.especificacoes[campo.campo] === true
                                ? "border-green-400 bg-green-50 text-green-700"
                                : "border-gray-200 text-gray-700"
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEspecificacaoChange(campo.campo, false)}
                            className={`flex-1 py-3 border-2 rounded-xl font-bold transition-all ${
                              formData.especificacoes[campo.campo] === false
                                ? "border-red-400 bg-red-50 text-red-700"
                                : "border-gray-200 text-gray-700"
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Fotos do Produto</h2>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-bold mb-1">⚠️ Fotos Obrigatórias para Qualidade</p>
                  <p>Anúncios com fotos completas têm 3x mais visualizações e vendem mais rápido!</p>
                </div>
              </div>
            </div>

            {/* Foto Frontal */}
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                📸 Foto Frontal * <span className="text-xs text-gray-500">(obrigatória)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all cursor-pointer">
                <input
                  type="file"
                  id="foto_frontal"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_frontal", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_frontal" className="cursor-pointer">
                  {formData.foto_frontal ? (
                    <div>
                      <img src={formData.foto_frontal} alt="Frontal" className="w-48 h-48 mx-auto rounded-xl object-cover mb-3" />
                      <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Foto frontal enviada
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-700 font-semibold">Clique para enviar foto frontal</p>
                      <p className="text-gray-400 text-sm">Mostre o produto de frente</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Foto Lateral */}
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                📸 Foto Lateral * <span className="text-xs text-gray-500">(obrigatória)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all cursor-pointer">
                <input
                  type="file"
                  id="foto_lateral"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_lateral", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_lateral" className="cursor-pointer">
                  {formData.foto_lateral ? (
                    <div>
                      <img src={formData.foto_lateral} alt="Lateral" className="w-48 h-48 mx-auto rounded-xl object-cover mb-3" />
                      <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Foto lateral enviada
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-700 font-semibold">Clique para enviar foto lateral</p>
                      <p className="text-gray-400 text-sm">Mostre o produto de lado</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Foto Placa/Etiqueta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                🏷️ Foto da Placa/Etiqueta <span className="text-xs text-yellow-600">(recomendado)</span>
              </label>
              <div className="border-2 border-dashed border-yellow-300 rounded-2xl p-6 text-center hover:border-yellow-400 transition-all cursor-pointer bg-yellow-50/50">
                <input
                  type="file"
                  id="foto_placa"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileUpload("foto_placa", e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="foto_placa" className="cursor-pointer">
                  {formData.foto_placa ? (
                    <div>
                      <img src={formData.foto_placa} alt="Placa" className="w-48 h-48 mx-auto rounded-xl object-cover mb-3" />
                      <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Foto da placa enviada
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                      <p className="text-gray-700 font-semibold">Foto da placa de identificação</p>
                      <p className="text-gray-500 text-sm">Aumenta a confiabilidade em 40%</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Vídeo Opcional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🎥 Link do Vídeo (opcional)</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleInputChange("video_url", e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo ou similar</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Preço e Localização</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preço (R$) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">R$</span>
                <input
                  type="number"
                  value={formData.preco}
                  onChange={(e) => handleInputChange("preco", e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 text-xl font-bold focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <select
                  value={formData.uf}
                  onChange={(e) => handleInputChange("uf", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {UFS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Ex: Goiânia"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Contato e Finalização</h2>

            {/* WhatsApp Toggle */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Exibir WhatsApp no anúncio?</p>
                    <p className="text-sm text-gray-600">Compradores podem te chamar diretamente</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange("whatsapp_visivel", !formData.whatsapp_visivel)}
                  className={`w-14 h-8 rounded-full transition-all ${formData.whatsapp_visivel ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.whatsapp_visivel ? "ml-7" : "ml-1"}`}></div>
                </button>
              </div>

              {formData.whatsapp_visivel && (
                <div className="bg-white rounded-xl p-4 border border-green-300">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>WhatsApp verificado:</strong> ({userWhatsApp?.slice(0, 2)}) {userWhatsApp?.slice(2, 7)}-{userWhatsApp?.slice(7)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Número verificado no seu cadastro</span>
                  </div>
                </div>
              )}

              {!formData.whatsapp_visivel && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-300">
                  <p className="text-sm text-blue-700">
                    💬 Compradores usarão o <strong>chat interno</strong> (expira em 48h)
                  </p>
                </div>
              )}
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Resumo do Anúncio</h3>
              <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
                <p><strong>Categoria:</strong> {formData.subcategoria}</p>
                <p><strong>Título:</strong> {formData.titulo_item}</p>
                <p><strong>Marca:</strong> {formData.marca}</p>
                <p><strong>Condição:</strong> {formData.condicao}</p>
                <p><strong>Preço:</strong> R$ {parseFloat(formData.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p><strong>Localização:</strong> {formData.cidade} - {formData.uf}</p>
                <p><strong>Fotos:</strong> {[formData.foto_frontal, formData.foto_lateral, formData.foto_placa].filter(Boolean).length} enviadas</p>
                {formData.whatsapp_visivel && <p className="text-green-600">✓ WhatsApp visível</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 mb-6">
        <button
          onClick={() => navigate(createPageUrl("Marketplace"))}
          className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
        <h1 className="text-3xl font-black text-white">Criar Anúncio</h1>
        <p className="text-white/80">Preencha os dados do produto</p>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressoPercentual}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Etapa {etapaAtual} de {totalEtapas}</p>
        </div>

        {/* Formulário */}
        <motion.div
          key={etapaAtual}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {renderEtapa()}
          </div>

          <div className="flex gap-4 p-6 bg-gray-50">
            <button
              onClick={etapaAnterior}
              disabled={etapaAtual === 1}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Voltar
            </button>

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={finalizarAnuncio}
                disabled={createItemMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createItemMutation.isPending ? "Publicando..." : "Publicar Anúncio"}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
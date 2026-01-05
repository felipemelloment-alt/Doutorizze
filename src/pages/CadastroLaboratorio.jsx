import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  FlaskConical,
  Upload,
  CheckCircle,
  Loader2,
  MapPin
} from "lucide-react";

const tiposLaboratorio = [
  { value: "PROTESE_DENTARIA", label: "Prótese Dentária" },
  { value: "ANALISES_CLINICAS", label: "Análises Clínicas" },
  { value: "IMAGEM", label: "Diagnóstico por Imagem" },
  { value: "PATOLOGIA", label: "Patologia" },
  { value: "OUTRO", label: "Outro" }
];

const categorias = [
  { value: "ODONTOLOGIA", label: "Odontologia" },
  { value: "MEDICINA", label: "Medicina" },
  { value: "AMBOS", label: "Ambos" }
];

const servicosProtese = [
  "Prótese Total", "Prótese Parcial Removível", "Coroas e Pontes",
  "Facetas", "Implantes sobre Implantes", "Provisórios",
  "Placas de Bruxismo", "Aparelhos Ortodônticos"
];

export default function CadastroLaboratorio() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo_laboratorio: "",
    categoria: "",
    servicos_oferecidos: [],
    email: "",
    whatsapp: "",
    telefone: "",
    site: "",
    nome_responsavel: "",
    registro_responsavel: "",
    cep: "",
    cidade: "",
    uf: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
    logo_url: "",
    documento_url: "",
    licenca_anvisa: "",
    horario_funcionamento: "",
    prazo_entrega_medio: "",
    descricao: "",
    aceito_termos: false
  });

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
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          cep,
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || ""
        }));
        toast.success("CEP encontrado!");
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    }
  };

  const toggleServico = (servico) => {
    const current = formData.servicos_oferecidos;
    if (current.includes(servico)) {
      setFormData({ ...formData, servicos_oferecidos: current.filter(s => s !== servico) });
    } else {
      setFormData({ ...formData, servicos_oferecidos: [...current, servico] });
    }
  };

  const handleUpload = async (e, tipo) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = tipo === "logo" ? setUploadingLogo : setUploadingDoc;
    const maxSize = tipo === "logo" ? 5 : 10;

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize}MB.`);
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [tipo === "logo" ? "logo_url" : "documento_url"]: file_url }));
      toast.success(`✅ ${tipo === "logo" ? "Logo" : "Documento"} enviado!`);
    } catch (error) {
      toast.error("Erro ao enviar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const validarEtapa1 = () => {
    if (!formData.razao_social || !formData.nome_fantasia) {
      toast.error("Preencha razão social e nome fantasia");
      return false;
    }
    if (formData.cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("CNPJ inválido");
      return false;
    }
    if (!formData.tipo_laboratorio || !formData.categoria) {
      toast.error("Selecione tipo e categoria");
      return false;
    }
    return true;
  };

  const validarEtapa2 = () => {
    if (!formData.email?.includes("@")) {
      toast.error("Email inválido");
      return false;
    }
    if (formData.whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("WhatsApp inválido");
      return false;
    }
    if (!formData.nome_responsavel) {
      toast.error("Informe o responsável técnico");
      return false;
    }
    return true;
  };

  const validarEtapa3 = () => {
    if (!formData.cidade || !formData.uf) {
      toast.error("Preencha cidade e UF");
      return false;
    }
    if (!formData.documento_url) {
      toast.error("Envie o documento");
      return false;
    }
    if (!formData.aceito_termos) {
      toast.error("Aceite os termos");
      return false;
    }
    return true;
  };

  const proximaEtapa = () => {
    if (etapa === 1 && !validarEtapa1()) return;
    if (etapa === 2 && !validarEtapa2()) return;
    setEtapa(etapa + 1);
  };

  const cadastrarMutation = useMutation({
    mutationFn: async () => {
      if (!validarEtapa3()) throw new Error("Validação falhou");
      const user = await base44.auth.me();

      return await base44.entities.Laboratorio.create({
        user_id: user.id,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        tipo_laboratorio: formData.tipo_laboratorio,
        categoria: formData.categoria,
        servicos_oferecidos: formData.servicos_oferecidos,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        telefone: formData.telefone?.replace(/\D/g, "") || undefined,
        site: formData.site || undefined,
        nome_responsavel: formData.nome_responsavel,
        registro_responsavel: formData.registro_responsavel || undefined,
        cep: formData.cep.replace(/\D/g, ""),
        cidade: formData.cidade,
        uf: formData.uf,
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        complemento: formData.complemento || undefined,
        logo_url: formData.logo_url || undefined,
        documento_url: formData.documento_url,
        licenca_anvisa: formData.licenca_anvisa || undefined,
        horario_funcionamento: formData.horario_funcionamento || undefined,
        prazo_entrega_medio: formData.prazo_entrega_medio || undefined,
        descricao: formData.descricao || undefined,
        status_cadastro: "EM_ANALISE"
      });
    },
    onSuccess: () => navigate(createPageUrl("CadastroSucesso") + "?tipo=laboratorio"),
    onError: (error) => toast.error("Erro: " + error.message)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-6">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Cadastro de Laboratório</h1>
          <p className="text-gray-600">Etapa {etapa} de 3</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                num <= etapa ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {num < etapa ? <CheckCircle className="w-6 h-6" /> : num}
              </div>
              {num < 3 && <div className={`h-1 w-16 rounded-full ${num < etapa ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gray-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          {/* ETAPA 1 */}
          {etapa === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Razão Social *</label>
                  <input
                    type="text"
                    value={formData.razao_social}
                    onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Nome Fantasia *</label>
                  <input
                    type="text"
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: aplicarMascaraCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Tipo *</label>
                  <select
                    value={formData.tipo_laboratorio}
                    onChange={(e) => setFormData({ ...formData, tipo_laboratorio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  >
                    <option value="">Selecione</option>
                    {tiposLaboratorio.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Categoria *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {categorias.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, categoria: c.value })}
                        className={`p-3 rounded-xl border-2 font-medium transition-all ${
                          formData.categoria === c.value
                            ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                            : "border-gray-200 text-gray-600 hover:border-yellow-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formData.tipo_laboratorio === "PROTESE_DENTARIA" && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Serviços Oferecidos</label>
                  <div className="grid grid-cols-2 gap-2">
                    {servicosProtese.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleServico(s)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          formData.servicos_oferecidos.includes(s)
                            ? "border-teal-400 bg-teal-50 text-teal-700"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 2 */}
          {etapa === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">WhatsApp *</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: aplicarMascaraTelefone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: aplicarMascaraTelefone(e.target.value) })}
                    placeholder="(00) 0000-0000"
                    maxLength={14}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Site</label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="www.exemplo.com.br"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Responsável Técnico *</label>
                  <input
                    type="text"
                    value={formData.nome_responsavel}
                    onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">CRO/CRM do Responsável</label>
                  <input
                    type="text"
                    value={formData.registro_responsavel}
                    onChange={(e) => setFormData({ ...formData, registro_responsavel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={formData.horario_funcionamento}
                    onChange={(e) => setFormData({ ...formData, horario_funcionamento: e.target.value })}
                    placeholder="Seg-Sex 8h às 18h"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Prazo Médio de Entrega</label>
                  <input
                    type="text"
                    value={formData.prazo_entrega_medio}
                    onChange={(e) => setFormData({ ...formData, prazo_entrega_medio: e.target.value })}
                    placeholder="Ex: 5 a 7 dias úteis"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3 */}
          {etapa === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">CEP *</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => {
                      const v = aplicarMascaraCEP(e.target.value);
                      setFormData({ ...formData, cep: v });
                      if (v.replace(/\D/g, "").length === 8) buscarCEP(v);
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">UF *</label>
                  <input
                    type="text"
                    value={formData.uf}
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Número</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Bairro</label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Logo</label>
                  {formData.logo_url ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">Logo enviado</span>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400">
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "logo")} className="hidden" disabled={uploadingLogo} />
                      {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-gray-400" />}
                      <span className="text-gray-600">{uploadingLogo ? "Enviando..." : "Enviar logo"}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Documento (CNPJ/Alvará) *</label>
                  {formData.documento_url ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">Documento enviado</span>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400">
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleUpload(e, "doc")} className="hidden" disabled={uploadingDoc} />
                      {uploadingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-gray-400" />}
                      <span className="text-gray-600">{uploadingDoc ? "Enviando..." : "Enviar documento"}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Descrição do Laboratório</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    placeholder="Conte um pouco sobre seu laboratório..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none resize-none"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-4 border-t">
                  <input
                    type="checkbox"
                    checked={formData.aceito_termos}
                    onChange={(e) => setFormData({ ...formData, aceito_termos: e.target.checked })}
                    className="mt-1 w-5 h-5"
                  />
                  <span className="text-sm text-gray-900">
                    Declaro que as informações são verdadeiras e aceito os <strong>Termos de Uso</strong>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            {etapa > 1 && (
              <button onClick={() => setEtapa(etapa - 1)} className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50">
                Voltar
              </button>
            )}
            {etapa < 3 ? (
              <button onClick={proximaEtapa} className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all">
                Continuar
              </button>
            ) : (
              <button
                onClick={() => cadastrarMutation.mutate()}
                disabled={cadastrarMutation.isPending}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cadastrarMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Finalizando...</> : <><CheckCircle className="w-5 h-5" /> Finalizar</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
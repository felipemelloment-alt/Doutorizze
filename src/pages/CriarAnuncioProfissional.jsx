import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle2,
  User
} from "lucide-react";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";

export default function CriarAnuncioProfissional() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [professional, setProfessional] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipos_vaga_interesse: [],
    cidades_interesse: [],
    uf: "",
    cidadeTemp: "",
    dias_semana_disponiveis: [],
    horario_preferencia_inicio: "",
    horario_preferencia_fim: "",
    disponibilidade_inicio: "",
    formas_remuneracao_aceitas: [],
    pretensao_salarial_min: "",
    pretensao_salarial_max: "",
    aceita_freelance: false
  });

  const { cidades } = useIBGECidades(formData.uf);

  useEffect(() => {
    const loadProfessional = async () => {
      try {
        const user = await base44.auth.me();
        const profs = await base44.entities.Professional.filter({ user_id: user.id });
        if (profs[0]) {
          setProfessional(profs[0]);
          setFormData(prev => ({
            ...prev,
            uf: profs[0].uf_conselho || ""
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar profissional:", error);
      }
    };
    loadProfessional();
  }, []);

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleItem = (campo, item) => {
    setFormData(prev => ({
      ...prev,
      [campo]: prev[campo].includes(item)
        ? prev[campo].filter(i => i !== item)
        : [...prev[campo], item]
    }));
  };

  const adicionarCidade = () => {
    if (!formData.cidadeTemp || formData.cidades_interesse.length >= 5) return;
    if (formData.cidades_interesse.includes(formData.cidadeTemp + " - " + formData.uf)) {
      toast.error("Cidade já adicionada");
      return;
    }
    setFormData(prev => ({
      ...prev,
      cidades_interesse: [...prev.cidades_interesse, formData.cidadeTemp + " - " + formData.uf],
      cidadeTemp: ""
    }));
  };

  const removerCidade = (cidade) => {
    setFormData(prev => ({
      ...prev,
      cidades_interesse: prev.cidades_interesse.filter(c => c !== cidade)
    }));
  };

  const validarEtapa = (etapaNum) => {
    if (etapaNum === 1) {
      if (!formData.titulo.trim()) return toast.error("Preencha o título");
      if (!formData.descricao.trim()) return toast.error("Preencha a descrição");
      if (formData.tipos_vaga_interesse.length === 0) return toast.error("Selecione tipo de vaga");
      return true;
    }
    if (etapaNum === 2) {
      if (formData.cidades_interesse.length === 0) return toast.error("Adicione pelo menos uma cidade");
      if (formData.dias_semana_disponiveis.length === 0) return toast.error("Selecione dias disponíveis");
      if (!formData.disponibilidade_inicio) return toast.error("Informe quando pode começar");
      return true;
    }
    if (etapaNum === 3) {
      if (formData.formas_remuneracao_aceitas.length === 0) return toast.error("Selecione formas de remuneração");
      return true;
    }
    return true;
  };

  const proximaEtapa = () => {
    if (validarEtapa(etapa)) {
      setEtapa(prev => prev + 1);
    }
  };

  const publicar = async () => {
    if (!validarEtapa(3)) return;
    if (!professional) return toast.error("Profissional não encontrado");

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);

      await base44.entities.ProfessionalAd.create({
        professional_id: professional.id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo_profissional: professional.tipo_profissional,
        especialidade_principal: professional.especialidade_principal,
        especialidades_extras: [],
        tempo_formado_anos: professional.tempo_formado_anos,
        tempo_experiencia_anos: professional.tempo_formado_anos,
        tipos_vaga_interesse: formData.tipos_vaga_interesse,
        cidades_interesse: formData.cidades_interesse,
        uf: formData.uf,
        dias_semana_disponiveis: formData.dias_semana_disponiveis,
        horario_preferencia_inicio: formData.horario_preferencia_inicio || null,
        horario_preferencia_fim: formData.horario_preferencia_fim || null,
        disponibilidade_inicio: formData.disponibilidade_inicio,
        formas_remuneracao_aceitas: formData.formas_remuneracao_aceitas,
        pretensao_salarial_min: formData.pretensao_salarial_min ? parseFloat(formData.pretensao_salarial_min.replace(/\./g, "").replace(",", ".")) : null,
        pretensao_salarial_max: formData.pretensao_salarial_max ? parseFloat(formData.pretensao_salarial_max.replace(/\./g, "").replace(",", ".")) : null,
        aceita_freelance: formData.aceita_freelance,
        status: "ATIVO",
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

      toast.success("✅ Anúncio publicado!");
      navigate(createPageUrl("MeusAnuncios"));
    } catch (error) {
      toast.error("Erro: " + error.message);
    }
    setLoading(false);
  };

  const aplicarMascaraDinheiro = (value) => {
    const numero = value.replace(/\D/g, "");
    if (!numero) return "";
    const valorEmReais = (parseInt(numero) / 100).toFixed(2);
    return valorEmReais.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-4">
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white drop-shadow-lg">Criar Anúncio</h1>
                  <p className="text-white/90 text-sm">Mostre que você está disponível</p>
                </div>
              </div>

              <div className="h-3 bg-white/30 rounded-full overflow-hidden backdrop-blur">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(etapa / 3) * 100}%` }}
                  className="h-full bg-white shadow-lg"
                />
              </div>
              <p className="text-xs text-white/90 mt-2 font-semibold">Etapa {etapa} de 3 • {Math.round((etapa / 3) * 100)}% completo</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <motion.div 
          key={etapa} 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 border-gray-100"
        >
          {etapa === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Anúncio *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Ex: Dentista Ortodontista Disponível para Clínica"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sobre Você *</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Conte sobre sua experiência, habilidades e o que você busca..."
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  maxLength={800}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.descricao.length}/800</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vaga de Interesse *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(professional?.tipo_profissional === "DENTISTA" 
                    ? ["SUBSTITUICAO", "FIXO", "TEMPORARIO"]
                    : ["PLANTAO", "SUBSTITUICAO", "FIXO", "TEMPORARIO"]
                  ).map((tipo) => (
                    <motion.button
                      key={tipo}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleItem("tipos_vaga_interesse", tipo)}
                      className={`py-3 px-4 rounded-xl font-bold transition-all text-sm shadow-md ${
                        formData.tipos_vaga_interesse.includes(tipo)
                          ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:shadow-lg"
                      }`}
                    >
                      {tipo === "PLANTAO" && "🏥 Plantão"}
                      {tipo === "SUBSTITUICAO" && "🔄 Substituição"}
                      {tipo === "FIXO" && "📌 Fixo"}
                      {tipo === "TEMPORARIO" && "⏱️ Temporário"}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.label 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={formData.aceita_freelance}
                  onChange={(e) => handleChange("aceita_freelance", e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-sm text-gray-700 font-semibold">⚡ Aceito trabalho freelance/substituição temporária</span>
              </motion.label>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidades de Interesse * (até 5)</label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={formData.uf}
                    onChange={(e) => handleChange("uf", e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">UF</option>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  <CityAutocomplete
                    value={formData.cidadeTemp}
                    onChange={(v) => handleChange("cidadeTemp", v)}
                    cidades={cidades}
                    disabled={!formData.uf}
                    placeholder="Selecione a cidade"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={adicionarCidade}
                    disabled={!formData.cidadeTemp || formData.cidades_interesse.length >= 5}
                    className="px-5 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add
                  </motion.button>
                </div>

                {formData.cidades_interesse.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {formData.cidades_interesse.map((cidade) => (
                      <span key={cidade} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {cidade}
                        <button onClick={() => removerCidade(cidade)} className="text-blue-600 hover:text-blue-900 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dias Disponíveis *</label>
                <div className="grid grid-cols-4 gap-2">
                  {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM", "INTEGRAL"].map((dia) => (
                    <motion.button
                      key={dia}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleItem("dias_semana_disponiveis", dia)}
                      className={`py-2.5 rounded-lg font-bold text-xs transition-all ${
                        formData.dias_semana_disponiveis.includes(dia)
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-400"
                      }`}
                    >
                      {dia}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Início</label>
                  <input
                    type="time"
                    value={formData.horario_preferencia_inicio}
                    onChange={(e) => handleChange("horario_preferencia_inicio", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Fim</label>
                  <input
                    type="time"
                    value={formData.horario_preferencia_fim}
                    onChange={(e) => handleChange("horario_preferencia_fim", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quando Pode Começar? *</label>
                <select
                  value={formData.disponibilidade_inicio}
                  onChange={(e) => handleChange("disponibilidade_inicio", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="IMEDIATO">Imediato</option>
                  <option value="15_DIAS">15 dias</option>
                  <option value="30_DIAS">30 dias</option>
                  <option value="60_DIAS">60 dias</option>
                  <option value="A_COMBINAR">A combinar</option>
                </select>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Formas de Remuneração Aceitas *</label>
                <div className="grid grid-cols-2 gap-3">
                  {["FIXO", "DIARIA", "PORCENTAGEM", "A_COMBINAR"].map((tipo) => (
                    <motion.button
                      key={tipo}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleItem("formas_remuneracao_aceitas", tipo)}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md ${
                        formData.formas_remuneracao_aceitas.includes(tipo)
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:shadow-lg"
                      }`}
                    >
                      {tipo === "FIXO" && "💰 Fixo (CLT)"}
                      {tipo === "DIARIA" && "📅 Diária"}
                      {tipo === "PORCENTAGEM" && "📊 Porcentagem"}
                      {tipo === "A_COMBINAR" && "💬 A Combinar"}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pretensão Salarial (opcional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">R$</span>
                      <input
                        type="text"
                        value={formData.pretensao_salarial_min}
                        onChange={(e) => handleChange("pretensao_salarial_min", aplicarMascaraDinheiro(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">R$</span>
                      <input
                        type="text"
                        value={formData.pretensao_salarial_max}
                        onChange={(e) => handleChange("pretensao_salarial_max", aplicarMascaraDinheiro(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-2xl p-5 border-2 border-orange-200"
              >
                <h3 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2">
                  📋 Resumo do Anúncio
                </h3>
                <div className="space-y-2 text-sm bg-white rounded-xl p-4">
                  <p className="flex items-start gap-2"><strong className="text-gray-900 min-w-[100px]">Título:</strong> <span className="text-gray-700">{formData.titulo}</span></p>
                  <p className="flex items-start gap-2"><strong className="text-gray-900 min-w-[100px]">Tipos vaga:</strong> <span className="text-gray-700">{formData.tipos_vaga_interesse.join(", ")}</span></p>
                  <p className="flex items-start gap-2"><strong className="text-gray-900 min-w-[100px]">Cidades:</strong> <span className="text-gray-700">{formData.cidades_interesse.slice(0, 2).join(", ")}{formData.cidades_interesse.length > 2 && "..."}</span></p>
                  <p className="flex items-start gap-2"><strong className="text-gray-900 min-w-[100px]">Início:</strong> <span className="text-gray-700">{formData.disponibilidade_inicio}</span></p>
                  <p className="flex items-start gap-2"><strong className="text-gray-900 min-w-[100px]">Pagamento:</strong> <span className="text-gray-700">{formData.formas_remuneracao_aceitas.join(", ")}</span></p>
                </div>
              </motion.div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {etapa > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEtapa(prev => prev - 1)}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Voltar
              </motion.button>
            )}
            {etapa < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={publicar}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Publicando..." : "✅ Publicar Anúncio"}
                <CheckCircle2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
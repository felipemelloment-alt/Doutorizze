import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ChevronLeft, ArrowRight, Briefcase, FileText, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function CriarVagaHospital() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospital, setHospital] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    tipo_profissional: "MEDICO",
    especialidades_aceitas: [],
    exige_experiencia: false,
    tempo_experiencia_minimo: "",
    falar_com: "",
    selecao_dias: "",
    dias_semana: [],
    horario_inicio: "",
    horario_fim: "",
    valor_proposto: "",
    tipo_remuneracao: "",
    aceita_termos: false
  });

  const totalEtapas = 4;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  useEffect(() => {
    const loadHospital = async () => {
      try {
        const user = await base44.auth.me();
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        if (hospitals[0]) {
          setHospital(hospitals[0]);
          setFormData(prev => ({
            ...prev,
            cidade: hospitals[0].cidade || "",
            uf: hospitals[0].uf || ""
          }));
        }
      } catch (error) {
        toast.error("Erro ao carregar dados do hospital");
      }
    };
    loadHospital();
  }, []);

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleEspecialidade = (especialidade) => {
    setFormData(prev => {
      const especialidades = prev.especialidades_aceitas.includes(especialidade)
        ? prev.especialidades_aceitas.filter(e => e !== especialidade)
        : [...prev.especialidades_aceitas, especialidade];
      return { ...prev, especialidades_aceitas: especialidades };
    });
  };

  const toggleDiaSemana = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia];
      return { ...prev, dias_semana: dias };
    });
  };

  const aplicarMascaraDinheiro = (value) => {
    const numero = value.replace(/\D/g, "");
    if (!numero) return "";
    const valorEmReais = (parseInt(numero) / 100).toFixed(2);
    return valorEmReais.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const especialidadesMedicina = [
    "Clínico Geral", "Cardiologia", "Dermatologia", "Ginecologia e Obstetrícia",
    "Ortopedia e Traumatologia", "Pediatria", "Psiquiatria", "Oftalmologia", "Neurologia", "Anestesiologia"
  ];

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.tipo_vaga) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 2:
        if (formData.especialidades_aceitas.length === 0 || !formData.falar_com.trim()) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 3:
        if (!formData.selecao_dias || !formData.horario_inicio || !formData.horario_fim) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        return true;
      case 4:
        if (!formData.tipo_remuneracao || !formData.aceita_termos) {
          toast.error("Preencha todos os campos obrigatórios");
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

  const publicarVaga = async () => {
    if (!validarEtapa(4) || !hospital) return;

    setLoading(true);
    try {
      const valorPropostoNumero = formData.valor_proposto 
        ? parseFloat(formData.valor_proposto.replace(/\./g, "").replace(",", "."))
        : null;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await base44.entities.Job.create({
        unit_id: hospital.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        tipo_vaga: formData.tipo_vaga,
        tipo_profissional: formData.tipo_profissional,
        especialidades_aceitas: formData.especialidades_aceitas,
        exige_experiencia: formData.exige_experiencia,
        tempo_experiencia_minimo: formData.exige_experiencia ? parseInt(formData.tempo_experiencia_minimo) : 0,
        selecao_dias: formData.selecao_dias,
        dias_semana: formData.selecao_dias === "ESPECIFICOS" ? formData.dias_semana : [],
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        cidade: formData.cidade,
        uf: formData.uf,
        valor_proposto: valorPropostoNumero,
        tipo_remuneracao: formData.tipo_remuneracao,
        falar_com: formData.falar_com,
        status: "ABERTO",
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

      toast.success("✅ Vaga publicada com sucesso!");
      navigate(createPageUrl("MinhasVagasHospital"));
    } catch (error) {
      toast.error("❌ Erro ao publicar vaga: " + error.message);
    }
    setLoading(false);
  };

  const etapasConfig = [
    { numero: 1, titulo: "Informações", icon: Briefcase },
    { numero: 2, titulo: "Requisitos", icon: FileText },
    { numero: 3, titulo: "Horários", icon: Clock },
    { numero: 4, titulo: "Remuneração", icon: DollarSign }
  ];

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Vaga *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ex: Médico Cardiologista"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição Detalhada *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva a vaga..."
                className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none resize-none"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vaga *</label>
              <select
                value={formData.tipo_vaga}
                onChange={(e) => handleInputChange("tipo_vaga", e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
              >
                <option value="">Selecione</option>
                <option value="PLANTAO">Plantão</option>
                <option value="FIXO">Fixo</option>
                <option value="TEMPORARIO">Temporário</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Especialidades Aceitas *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {especialidadesMedicina.map((esp) => (
                  <div key={esp} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`esp-${esp}`}
                      checked={formData.especialidades_aceitas.includes(esp)}
                      onChange={() => toggleEspecialidade(esp)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer text-gray-700">
                      {esp}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Falar com *</label>
              <input
                type="text"
                value={formData.falar_com}
                onChange={(e) => handleInputChange("falar_com", e.target.value)}
                placeholder="Nome do responsável"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Período *</label>
              <div className="space-y-3">
                {[
                  { value: "ESPECIFICOS", label: "📅 Dias Específicos" },
                  { value: "SEMANA_TODA", label: "🗓️ Semana Toda" },
                  { value: "MES_TODO", label: "📆 Mês Todo" }
                ].map((opcao) => (
                  <div
                    key={opcao.value}
                    className={`border-2 rounded-2xl p-4 cursor-pointer ${
                      formData.selecao_dias === opcao.value ? "border-blue-400 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => handleInputChange("selecao_dias", opcao.value)}
                  >
                    {opcao.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Início *</label>
                <input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => handleInputChange("horario_inicio", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Fim *</label>
                <input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => handleInputChange("horario_fim", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Remuneração *</label>
              <select
                value={formData.tipo_remuneracao}
                onChange={(e) => handleInputChange("tipo_remuneracao", e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
              >
                <option value="">Selecione</option>
                <option value="FIXO">Fixo (mensal)</option>
                <option value="DIARIA">Diária</option>
                <option value="PORCENTAGEM">Porcentagem</option>
                <option value="A_COMBINAR">A Combinar</option>
              </select>
            </div>

            {formData.tipo_remuneracao !== "A_COMBINAR" && formData.tipo_remuneracao && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Proposto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                  <input
                    type="text"
                    value={formData.valor_proposto}
                    onChange={(e) => handleInputChange("valor_proposto", aplicarMascaraDinheiro(e.target.value))}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="border-2 border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="aceita_termos"
                  checked={formData.aceita_termos}
                  onChange={(e) => handleInputChange("aceita_termos", e.target.checked)}
                  className="w-5 h-5 mt-0.5"
                />
                <label htmlFor="aceita_termos" className="cursor-pointer text-sm text-gray-700">
                  Li e aceito os Termos de Publicação
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-500 font-medium py-2">
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Criar Nova Vaga - Hospital</h1>
        </div>

        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressoPercentual}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Etapa {etapaAtual} de {totalEtapas}</span>
            <span className="font-bold">{Math.round(progressoPercentual)}%</span>
          </div>
        </div>

        <motion.div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            {renderEtapa()}
          </div>

          <div className="flex gap-4 p-6 bg-gray-50">
            <button
              onClick={etapaAnterior}
              disabled={etapaAtual === 1}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 disabled:opacity-50"
            >
              Voltar
            </button>

            {etapaAtual < totalEtapas ? (
              <button
                onClick={proximaEtapa}
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-2xl shadow-lg"
              >
                Continuar
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            ) : (
              <button
                onClick={publicarVaga}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50"
              >
                {loading ? "Publicando..." : "Publicar Vaga"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useUserArea } from "@/components/hooks/useUserArea";
import { 
  ChevronLeft, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  Clock, 
  DollarSign,
  CheckCircle2,
  Plus,
  X,
  Calendar as CalendarIcon,
  AlertCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import CityAutocomplete from "@/components/forms/CityAutocomplete";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CriarVaga() {
  const navigate = useNavigate();
  const { userArea } = useUserArea();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    // ETAPA 1
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    job_type: "full-time",
    tipo_profissional: userArea === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO",
    accepts_applications_from: {
      professionals: true,
      freelancers: false
    },

    // ETAPA 2
    especialidades_aceitas: [],
    required_skills: [],
    preferred_skills: [],
    exige_experiencia: false,
    tempo_experiencia_minimo: "",
    falar_com: "",

    // ETAPA 3
    selecao_dias: "",
    dias_semana: [],
    horario_inicio: "",
    horario_fim: "",
    cidade: "",
    uf: "",
    instagram_clinica: "",

    // ETAPA 4
    valor_proposto: "",
    tipo_remuneracao: "",
    project_details: {
      budget_type: "fixed",
      budget_range: { min: "", max: "", currency: "BRL" },
      duration_estimate: "",
      deadline: null
    },
    aceita_termos: false
  });
  
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState("required");

  const totalEtapas = 4;
  const progressoPercentual = (etapaAtual / totalEtapas) * 100;

  // Hook para buscar cidades após formData ser declarado
  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  // Carregar unidade da clínica
  useEffect(() => {
    const loadUnit = async () => {
      try {
        const user = await base44.auth.me();
        const owner = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        if (owner[0]) {
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owner[0].id });
          if (units[0]) {
            setUnit(units[0]);
            // Preencher cidade e UF da unidade
            setFormData(prev => ({
              ...prev,
              cidade: units[0].cidade || "",
              uf: units[0].uf || ""
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar unidade:", error);
        toast.error("Erro ao carregar dados da clínica");
      }
    };
    loadUnit();
  }, []);

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleProjectDetailsChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      project_details: { ...prev.project_details, [campo]: valor }
    }));
  };

  const handleBudgetRangeChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      project_details: {
        ...prev.project_details,
        budget_range: { ...prev.project_details.budget_range, [campo]: valor }
      }
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const field = skillType === "required" ? "required_skills" : "preferred_skills";
    if (formData[field].includes(newSkill.trim())) {
      toast.error("Habilidade já adicionada");
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], newSkill.trim()]
    }));
    setNewSkill("");
  };

  const removeSkill = (skill, type) => {
    const field = type === "required" ? "required_skills" : "preferred_skills";
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(s => s !== skill)
    }));
  };

  const isFreelanceMode = formData.job_type === "freelance" || formData.job_type === "contract" || formData.accepts_applications_from.freelancers;

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

  // Máscara para valor monetário
  const aplicarMascaraDinheiro = (value) => {
    const numero = value.replace(/\D/g, "");
    if (!numero) return "";
    const valorEmReais = (parseInt(numero) / 100).toFixed(2);
    return valorEmReais.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Especialidades por tipo
  const especialidadesOdonto = [
    "Clínico Geral", "Ortodontia", "Endodontia", "Implantodontia", 
    "Periodontia", "Prótese", "Odontopediatria", "Cirurgia Bucomaxilofacial",
    "Radiologia Odontológica", "Estética Dental"
  ];

  const especialidadesMedicina = [
    "Clínico Geral", "Cardiologia", "Dermatologia", "Ginecologia e Obstetrícia",
    "Ortopedia e Traumatologia", "Pediatria", "Psiquiatria", "Oftalmologia"
  ];

  const especialidades = formData.tipo_profissional === "DENTISTA" 
    ? especialidadesOdonto 
    : especialidadesMedicina;

  // Validação por etapa
  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1:
        if (!formData.titulo.trim()) {
          toast.error("Preencha o título da vaga");
          return false;
        }
        if (!formData.descricao.trim()) {
          toast.error("Preencha a descrição da vaga");
          return false;
        }
        if (!formData.tipo_vaga) {
          toast.error("Selecione o tipo de vaga");
          return false;
        }
        if (!formData.tipo_profissional) {
          toast.error("Selecione o tipo de profissional");
          return false;
        }
        if (!formData.accepts_applications_from.professionals && !formData.accepts_applications_from.freelancers) {
          toast.error("Selecione pelo menos um tipo de candidato");
          return false;
        }
        return true;

      case 2:
        if (formData.especialidades_aceitas.length === 0) {
          toast.error("Selecione pelo menos uma especialidade");
          return false;
        }
        if (formData.exige_experiencia && !formData.tempo_experiencia_minimo) {
          toast.error("Informe o tempo mínimo de experiência");
          return false;
        }
        if (!formData.falar_com.trim()) {
          toast.error("Informe com quem os candidatos devem falar");
          return false;
        }
        return true;

      case 3:
        if (!formData.selecao_dias) {
          toast.error("Selecione o tipo de período");
          return false;
        }
        if (formData.selecao_dias === "ESPECIFICOS" && formData.dias_semana.length === 0) {
          toast.error("Selecione pelo menos um dia da semana");
          return false;
        }
        if (!formData.horario_inicio || !formData.horario_fim) {
          toast.error("Preencha os horários");
          return false;
        }
        if (!formData.cidade.trim() || !formData.uf) {
          toast.error("Preencha a cidade e UF");
          return false;
        }
        return true;

      case 4:
        if (isFreelanceMode) {
          const { min, max } = formData.project_details.budget_range;
          if (!min || !max) {
            toast.error("Preencha a faixa de orçamento");
            return false;
          }
          if (parseFloat(min) >= parseFloat(max)) {
            toast.error("Orçamento mínimo deve ser menor que o máximo");
            return false;
          }
        } else {
          if (formData.tipo_remuneracao !== "A_COMBINAR" && !formData.valor_proposto) {
            toast.error("Informe o valor proposto ou selecione 'A Combinar'");
            return false;
          }
          if (!formData.tipo_remuneracao) {
            toast.error("Selecione o tipo de remuneração");
            return false;
          }
        }
        if (!formData.aceita_termos) {
          toast.error("Você deve aceitar os termos");
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
    if (!validarEtapa(4)) return;
    if (!unit) {
      toast.error("Unidade não encontrada");
      return;
    }

    setLoading(true);
    try {
      // Converter valor proposto
      const valorPropostoNumero = formData.valor_proposto 
        ? parseFloat(formData.valor_proposto.replace(/\./g, "").replace(",", "."))
        : null;

      // Data de expiração (30 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const dadosVaga = {
        unit_id: unit.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        tipo_vaga: formData.tipo_vaga,
        job_type: formData.job_type,
        tipo_profissional: formData.tipo_profissional,
        accepts_applications_from: formData.accepts_applications_from,
        especialidades_aceitas: formData.especialidades_aceitas,
        required_skills: formData.required_skills,
        preferred_skills: formData.preferred_skills,
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
        project_details: isFreelanceMode ? {
          ...formData.project_details,
          budget_range: {
            min: parseFloat(formData.project_details.budget_range.min),
            max: parseFloat(formData.project_details.budget_range.max),
            currency: "BRL"
          }
        } : null,
        falar_com: formData.falar_com,
        instagram_clinica: formData.instagram_clinica || "",
        status: "ABERTO",
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };

      await base44.entities.Job.create(dadosVaga);

      toast.success("✅ Vaga publicada com sucesso!");
      navigate(createPageUrl("MinhasVagas"));
    } catch (error) {
      console.error("Erro ao publicar vaga:", error);
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
                placeholder="Ex: Dentista para Ortodontia"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição Detalhada *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva a vaga, responsabilidades, perfil desejado..."
                className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.descricao.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vaga *</label>
                <select
                  value={formData.tipo_vaga}
                  onChange={(e) => handleInputChange("tipo_vaga", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="PLANTAO">Plantão</option>
                  <option value="SUBSTITUICAO">Substituição</option>
                  <option value="FIXO">Fixo</option>
                  <option value="TEMPORARIO">Temporário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Contrato *</label>
                <select
                  value={formData.job_type}
                  onChange={(e) => handleInputChange("job_type", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                  <option value="temporary">Temporário</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Aceita candidaturas de: *</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <Checkbox
                    checked={formData.accepts_applications_from.professionals}
                    onCheckedChange={(checked) => handleInputChange("accepts_applications_from", {
                      ...formData.accepts_applications_from,
                      professionals: checked
                    })}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Profissionais CLT/PJ</p>
                    <p className="text-sm text-gray-500">Dentistas e médicos tradicionais</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 cursor-pointer">
                  <Checkbox
                    checked={formData.accepts_applications_from.freelancers}
                    onCheckedChange={(checked) => handleInputChange("accepts_applications_from", {
                      ...formData.accepts_applications_from,
                      freelancers: checked
                    })}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Freelancers</p>
                    <p className="text-sm text-gray-500">Profissionais por projeto</p>
                  </div>
                </label>
              </div>
            </div>

            {formData.accepts_applications_from.freelancers && (
              <Alert className="bg-purple-50 border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Modo Freelance ativado!</strong> Você precisará fornecer orçamento e detalhes do projeto na etapa 4.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Especialidades Aceitas *</label>
              {!formData.tipo_profissional && (
                <p className="text-sm text-gray-500 mb-4">Selecione o tipo de profissional primeiro</p>
              )}
              
              {formData.especialidades_aceitas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-pink-50 rounded-xl border border-pink-200">
                  {formData.especialidades_aceitas.map((esp) => (
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
              )}

              {formData.tipo_profissional && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                  {especialidades.map((esp) => (
                    <div key={esp} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`esp-${esp}`}
                        checked={formData.especialidades_aceitas.includes(esp)}
                        onChange={() => toggleEspecialidade(esp)}
                        className="w-4 h-4 accent-pink-400"
                      />
                      <label htmlFor={`esp-${esp}`} className="text-sm cursor-pointer text-gray-700">
                        {esp}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Exige Experiência?</label>
                <button
                  type="button"
                  onClick={() => handleInputChange("exige_experiencia", !formData.exige_experiencia)}
                  className={`w-14 h-8 rounded-full transition-all ${
                    formData.exige_experiencia ? "bg-pink-500" : "bg-gray-300"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${
                    formData.exige_experiencia ? "ml-7" : "ml-1"
                  }`}></div>
                </button>
              </div>

              {formData.exige_experiencia && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo Mínimo (anos) *</label>
                  <input
                    type="number"
                    value={formData.tempo_experiencia_minimo}
                    onChange={(e) => handleInputChange("tempo_experiencia_minimo", e.target.value)}
                    placeholder="Ex: 2"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Falar com *</label>
              <input
                type="text"
                value={formData.falar_com}
                onChange={(e) => handleInputChange("falar_com", e.target.value)}
                placeholder="Ex: Dr. João Silva"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Nome do responsável para contato</p>
            </div>

            {/* Sistema de Skills */}
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Habilidades</h3>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Ex: Implantodontia, Gestão de equipe..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white outline-none"
                >
                  <option value="required">Obrigatória</option>
                  <option value="preferred">Desejável</option>
                </select>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar
                </button>
              </div>

              {formData.required_skills.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Obrigatórias:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.required_skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-red-100 text-red-700 border-red-300 border-2 px-3 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill, "required")}
                          className="ml-2 hover:text-red-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.preferred_skills.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Desejáveis:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="border-2 px-3 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill, "preferred")}
                          className="ml-2 hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
                  { value: "SEMANA_TODA", label: "🗓️ Semana Toda (Seg-Sex)" },
                  { value: "MES_TODO", label: "📆 Mês Todo (disponibilidade integral)" }
                ].map((opcao) => (
                  <div
                    key={opcao.value}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      formData.selecao_dias === opcao.value
                        ? "border-pink-400 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                    onClick={() => handleInputChange("selecao_dias", opcao.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.selecao_dias === opcao.value ? "border-pink-400" : "border-gray-300"
                      }`}>
                        {formData.selecao_dias === opcao.value && (
                          <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{opcao.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.selecao_dias === "ESPECIFICOS" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Selecione os Dias *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: "SEG", label: "Seg" },
                    { value: "TER", label: "Ter" },
                    { value: "QUA", label: "Qua" },
                    { value: "QUI", label: "Qui" },
                    { value: "SEX", label: "Sex" },
                    { value: "SAB", label: "Sáb" },
                    { value: "DOM", label: "Dom" },
                    { value: "INTEGRAL", label: "Integral" }
                  ].map((dia) => (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.value)}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        formData.dias_semana.includes(dia.value)
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-400"
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Início *</label>
                <input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => handleInputChange("horario_inicio", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Fim *</label>
                <input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => handleInputChange("horario_fim", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">UF *</label>
                <select
                  value={formData.uf}
                  onChange={(e) => {
                    handleInputChange("uf", e.target.value);
                    handleInputChange("cidade", "");
                  }}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                <CityAutocomplete
                  value={formData.cidade}
                  onChange={(cidade) => handleInputChange("cidade", cidade)}
                  cidades={cidades}
                  loading={loadingCidades}
                  disabled={!formData.uf}
                  placeholder={!formData.uf ? "Selecione UF primeiro" : "Selecione a cidade"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram da Clínica (opcional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                <input
                  type="text"
                  value={formData.instagram_clinica}
                  onChange={(e) => handleInputChange("instagram_clinica", e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                  placeholder="suaclinica"
                  className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Tabs defaultValue={isFreelanceMode ? "projeto" : "salario"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="salario">Salário Mensal</TabsTrigger>
                <TabsTrigger value="projeto">Orçamento Projeto</TabsTrigger>
              </TabsList>

              <TabsContent value="salario" className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Remuneração *</label>
                  <select
                    value={formData.tipo_remuneracao}
                    onChange={(e) => handleInputChange("tipo_remuneracao", e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="FIXO">Fixo (mensal)</option>
                    <option value="DIARIA">Diária</option>
                    <option value="PORCENTAGEM">Porcentagem</option>
                    <option value="A_COMBINAR">A Combinar</option>
                  </select>
                </div>

                {formData.tipo_remuneracao !== "A_COMBINAR" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Proposto *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input
                        type="text"
                        value={formData.valor_proposto}
                        onChange={(e) => handleInputChange("valor_proposto", aplicarMascaraDinheiro(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projeto" className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Orçamento *</label>
                  <select
                    value={formData.project_details.budget_type}
                    onChange={(e) => handleProjectDetailsChange("budget_type", e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                  >
                    <option value="fixed">Valor Fixo</option>
                    <option value="hourly">Por Hora</option>
                    <option value="daily">Por Dia</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orçamento Mínimo *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={formData.project_details.budget_range.min}
                        onChange={(e) => handleBudgetRangeChange("min", e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orçamento Máximo *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={formData.project_details.budget_range.max}
                        onChange={(e) => handleBudgetRangeChange("max", e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duração Estimada</label>
                  <input
                    type="text"
                    value={formData.project_details.duration_estimate}
                    onChange={(e) => handleProjectDetailsChange("duration_estimate", e.target.value)}
                    placeholder="Ex: 2 semanas, 1 mês"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-left flex items-center gap-2 hover:border-purple-400 transition-all"
                      >
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        {formData.project_details.deadline ? (
                          format(new Date(formData.project_details.deadline), "PPP", { locale: ptBR })
                        ) : (
                          <span className="text-gray-500">Selecione uma data</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.project_details.deadline ? new Date(formData.project_details.deadline) : undefined}
                        onSelect={(date) => handleProjectDetailsChange("deadline", date?.toISOString())}
                        disabled={(date) => date < new Date()}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>
            </Tabs>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Resumo da Vaga</h3>
              <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
                <p><strong>Título:</strong> {formData.titulo}</p>
                <p><strong>Tipo:</strong> {formData.tipo_vaga}</p>
                <p><strong>Profissional:</strong> {formData.tipo_profissional}</p>
                <p><strong>Especialidades:</strong> {formData.especialidades_aceitas.slice(0, 3).join(", ")}{formData.especialidades_aceitas.length > 3 && "..."}</p>
                <p><strong>Período:</strong> {formData.selecao_dias}</p>
                <p><strong>Horário:</strong> {formData.horario_inicio} - {formData.horario_fim}</p>
                <p><strong>Local:</strong> {formData.cidade} - {formData.uf}</p>
                <p><strong>Remuneração:</strong> {formData.tipo_remuneracao === "A_COMBINAR" ? "A Combinar" : `R$ ${formData.valor_proposto}`}</p>
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
                  Li e aceito os <span className="text-pink-500 font-bold underline">Termos de Publicação</span> e concordo
                  que esta vaga será visível para profissionais cadastrados na plataforma
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-3 md:p-8">
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Criar Nova Vaga</h1>
          <p className="text-gray-500 mt-2">Preencha as informações da oportunidade</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoPercentual}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
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
                  ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg scale-110"
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
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={publicarVaga}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Publicando..." : "Publicar Vaga"}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
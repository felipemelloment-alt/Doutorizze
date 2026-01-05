import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Briefcase,
  Save
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";

export default function EditarVaga() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    tipo_profissional: "",
    especialidades_aceitas: [],
    exige_experiencia: false,
    tempo_experiencia_minimo: "",
    falar_com: "",
    selecao_dias: "",
    dias_semana: [],
    horario_inicio: "",
    horario_fim: "",
    cidade: "",
    uf: "",
    instagram_clinica: "",
    valor_proposto: "",
    tipo_remuneracao: ""
  });

  // Buscar vaga
  const { data: vaga, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.Job.filter({ id });
      return result[0] || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Preencher formulário quando vaga for carregada
  useEffect(() => {
    if (vaga) {
      setFormData({
        titulo: vaga.titulo || "",
        descricao: vaga.descricao || "",
        tipo_vaga: vaga.tipo_vaga || "",
        tipo_profissional: vaga.tipo_profissional || "",
        especialidades_aceitas: vaga.especialidades_aceitas || [],
        exige_experiencia: vaga.exige_experiencia || false,
        tempo_experiencia_minimo: vaga.tempo_experiencia_minimo?.toString() || "",
        falar_com: vaga.falar_com || "",
        selecao_dias: vaga.selecao_dias || "",
        dias_semana: vaga.dias_semana || [],
        horario_inicio: vaga.horario_inicio || "",
        horario_fim: vaga.horario_fim || "",
        cidade: vaga.cidade || "",
        uf: vaga.uf || "",
        instagram_clinica: vaga.instagram_clinica || "",
        valor_proposto: vaga.valor_proposto ? formatarValor(vaga.valor_proposto) : "",
        tipo_remuneracao: vaga.tipo_remuneracao || ""
      });
    }
  }, [vaga]);

  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  // Mutation para atualizar vaga
  const updateMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.Job.update(id, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job"] });
      queryClient.invalidateQueries({ queryKey: ["clinicJobs"] });
      toast.success("✅ Vaga atualizada com sucesso!");
      navigate(createPageUrl("MinhasVagas"));
    },
    onError: (error) => {
      toast.error("❌ Erro ao atualizar vaga: " + error.message);
    }
  });

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

  const formatarValor = (valor) => {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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

  const handleSalvar = async () => {
    // Validação básica
    if (!formData.titulo.trim()) {
      toast.error("Preencha o título da vaga");
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error("Preencha a descrição da vaga");
      return;
    }
    if (formData.especialidades_aceitas.length === 0) {
      toast.error("Selecione pelo menos uma especialidade");
      return;
    }

    setLoading(true);

    try {
      const valorPropostoNumero = formData.valor_proposto 
        ? parseFloat(formData.valor_proposto.replace(/\./g, "").replace(",", "."))
        : null;

      const dadosAtualizados = {
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
        valor_proposto: valorPropostoNumero,
        tipo_remuneracao: formData.tipo_remuneracao,
        falar_com: formData.falar_com,
        instagram_clinica: formData.instagram_clinica || ""
      };

      updateMutation.mutate(dadosAtualizados);
    } catch (error) {
      toast.error("Erro ao processar dados: " + error.message);
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-900 font-bold text-xl mb-4">Vaga não encontrada</p>
          <button
            onClick={() => navigate(createPageUrl("MinhasVagas"))}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar para Minhas Vagas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(createPageUrl("MinhasVagas"))}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium py-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Editar Vaga</h1>
          <p className="text-gray-500 mt-2">Atualize as informações da oportunidade</p>
        </div>

        {/* Card do Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="p-6 md:p-8 space-y-6">
            {/* INFORMAÇÕES BÁSICAS */}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Profissional *</label>
                <select
                  value={formData.tipo_profissional}
                  onChange={(e) => {
                    handleInputChange("tipo_profissional", e.target.value);
                    handleInputChange("especialidades_aceitas", []);
                  }}
                  disabled
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed appearance-none transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="DENTISTA">Dentista</option>
                  <option value="MEDICO">Médico</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Tipo não pode ser alterado</p>
              </div>
            </div>

            {/* ESPECIALIDADES */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Especialidades Aceitas *</label>
              
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

            {/* EXPERIÊNCIA */}
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
            </div>

            {/* HORÁRIOS E DIAS */}
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

            {/* LOCALIZAÇÃO - BLOQUEADA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">UF</label>
                <input
                  type="text"
                  value={formData.uf}
                  disabled
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Localização não pode ser alterada</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  disabled
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed outline-none"
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

            {/* REMUNERAÇÃO */}
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
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse md:flex-row gap-4 p-6 bg-gray-50 border-t">
            <button
              onClick={() => navigate(createPageUrl("MinhasVagas"))}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleSalvar}
              disabled={loading || updateMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading || updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
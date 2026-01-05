import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,
  User,
  MapPin,
  Phone,
  DollarSign,
  FileText,
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  Building2,
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { 
  criarSubstituicao, 
  publicarSubstituicao 
} from "@/components/api/substituicao";
import {
  ESPECIALIDADES,
  PROCEDIMENTOS_ODONTO,
  FORMAS_PAGAMENTO
} from "@/components/constants/substituicao";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";

export default function CriarSubstituicao() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [clinicaUnits, setClinicaUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [formData, setFormData] = useState({
    criado_por_tipo: location.state?.criado_por_tipo || "PROFISSIONAL",
    // Etapa 1 - Tipo de Data
    tipo_data: "",
    data_hora_imediata: "",
    data_especifica: "",
    horario_inicio: "",
    horario_fim: "",
    periodo_inicio: "",
    periodo_fim: "",
    horarios_periodo: [],
    
    // Etapa 2 - Profissional
    tipo_profissional: "DENTISTA",
    especialidade_necessaria: "",
    tempo_minimo_formado_anos: 0,
    
    // Etapa 3 - Local
    clinica_id: "",
    unidade_id: "",
    nome_clinica: "",
    endereco_completo: "",
    cidade: "",
    uf: "",
    referencia: "",
    link_maps: "",
    
    // Etapa 4 - Responsável
    responsavel_nome: "",
    responsavel_cargo: "",
    responsavel_whatsapp: "",
    responsavel_esta_ciente: false,
    
    // Etapa 5 - Remuneração
    tipo_remuneracao: "",
    valor_diaria: "",
    procedimentos_porcentagem: [],
    quem_paga: "",
    forma_pagamento: "",
    dados_pagamento: {},
    
    // Etapa 6 - Detalhes
    tipo_atendimento: "",
    pacientes_agendados: [],
    estimativa_pacientes: "",
    tempo_medio_atendimento_minutos: "",
    procedimentos_esperados: [],
    observacoes_atendimento: "",
    materiais_disponiveis: "",
    acesso_sistema: "",
    observacoes: ""
  });

  const { cidades, loading: loadingCidades } = useIBGECidades(formData.uf);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Se profissional criando, buscar dados
        if (formData.criado_por_tipo === "PROFISSIONAL") {
          const professionals = await base44.entities.Professional.filter({ 
            user_id: currentUser.id 
          });
          if (professionals.length > 0) {
            setProfessional(professionals[0]);
            
            // Buscar vínculos com clínicas
            const vinculos = await base44.entities.VinculoProfissionalClinica.filter({
              professional_id: professionals[0].id,
              ativo: true
            });
            
            if (vinculos.length > 0) {
              const clinicaIds = [...new Set(vinculos.map(v => v.clinica_id))];
              const units = await Promise.all(
                clinicaIds.map(id => base44.entities.CompanyUnit.filter({ id }))
              );
              setClinicaUnits(units.flat());
            }
          }
        }

        // Se clínica criando
        if (formData.criado_por_tipo === "CLINICA") {
          const owners = await base44.entities.CompanyOwner.filter({ 
            user_id: currentUser.id 
          });
          if (owners.length > 0) {
            const units = await base44.entities.CompanyUnit.filter({ 
              owner_id: owners[0].id,
              ativo: true
            });
            setClinicaUnits(units);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      }
    };
    loadData();
  }, [formData.criado_por_tipo]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const substituicao = await criarSubstituicao(data);
      await publicarSubstituicao(substituicao.id);
      return substituicao;
    },
    onSuccess: () => {
      toast.success("✅ Vaga publicada com sucesso!");
      navigate(createPageUrl("VagasDisponiveis"));
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar vaga");
    }
  });

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.tipo_data) return false;
        if (formData.tipo_data === "IMEDIATO" && !formData.data_hora_imediata) return false;
        if (formData.tipo_data === "DATA_ESPECIFICA" && (!formData.data_especifica || !formData.horario_inicio || !formData.horario_fim)) return false;
        if (formData.tipo_data === "PERIODO" && (!formData.periodo_inicio || !formData.periodo_fim)) return false;
        return true;
      case 2:
        return formData.especialidade_necessaria !== "";
      case 3:
        return formData.unidade_id && formData.cidade && formData.uf;
      case 4:
        return formData.responsavel_nome && formData.responsavel_whatsapp && formData.responsavel_esta_ciente;
      case 5:
        if (!formData.tipo_remuneracao || !formData.quem_paga || !formData.forma_pagamento) return false;
        if (formData.tipo_remuneracao === "DIARIA" && !formData.valor_diaria) return false;
        if (formData.tipo_remuneracao === "PORCENTAGEM" && formData.procedimentos_porcentagem.length === 0) return false;
        return true;
      case 6:
        if (!formData.tipo_atendimento) return false;
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(6, prev + 1));
      window.scrollTo(0, 0);
    } else {
      toast.error("Preencha todos os campos obrigatórios");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const dataToSend = {
      ...formData,
      criado_por_user_id: user.id,
      profissional_que_sera_substituido_id: formData.criado_por_tipo === "PROFISSIONAL" ? professional?.id : null,
      clinica_id: selectedUnit?.owner_id,
      nome_clinica: selectedUnit?.nome_fantasia,
      endereco_completo: `${selectedUnit?.endereco}, ${selectedUnit?.numero}${selectedUnit?.complemento ? `, ${selectedUnit?.complemento}` : ''} - ${selectedUnit?.bairro}`,
      cidade: selectedUnit?.cidade,
      uf: selectedUnit?.uf,
      link_maps: selectedUnit?.google_maps_link,
      referencia: selectedUnit?.ponto_referencia
    };

    createMutation.mutate(dataToSend);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { number: 1, title: "Data", icon: Calendar },
    { number: 2, title: "Profissional", icon: User },
    { number: 3, title: "Local", icon: MapPin },
    { number: 4, title: "Responsável", icon: Phone },
    { number: 5, title: "Remuneração", icon: DollarSign },
    { number: 6, title: "Detalhes", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white mb-2">
              {formData.criado_por_tipo === "PROFISSIONAL" ? "🩺" : "🏥"} Nova Substituição
            </h1>
            <p className="text-white/90">
              {formData.criado_por_tipo === "PROFISSIONAL" 
                ? "Configure sua substituição" 
                : "Busque um profissional"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted 
                        ? "bg-green-500 text-white" 
                        : isActive 
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-110" 
                          : "bg-gray-200 text-gray-400"
                    }`}>
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs font-bold ${isActive ? "text-yellow-600" : "text-gray-500"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            {/* ETAPA 1 - TIPO DE DATA */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  📅 Quando precisa da substituição?
                </h2>

                <div className="space-y-4">
                  {/* IMEDIATO */}
                  <button
                    onClick={() => updateFormData("tipo_data", "IMEDIATO")}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      formData.tipo_data === "IMEDIATO"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.tipo_data === "IMEDIATO" ? "bg-red-500" : "bg-red-100"
                      }`}>
                        <Clock className={`w-6 h-6 ${
                          formData.tipo_data === "IMEDIATO" ? "text-white" : "text-red-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">🚨 IMEDIATO / HOJE</h3>
                        <p className="text-sm text-gray-600">Preciso de alguém agora ou ainda hoje</p>
                      </div>
                      {formData.tipo_data === "IMEDIATO" && (
                        <Check className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </button>

                  {formData.tipo_data === "IMEDIATO" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pl-4"
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Data e Hora de Início
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.data_hora_imediata}
                        onChange={(e) => updateFormData("data_hora_imediata", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 outline-none"
                      />
                    </motion.div>
                  )}

                  {/* DATA ESPECÍFICA */}
                  <button
                    onClick={() => updateFormData("tipo_data", "DATA_ESPECIFICA")}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      formData.tipo_data === "DATA_ESPECIFICA"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.tipo_data === "DATA_ESPECIFICA" ? "bg-yellow-500" : "bg-yellow-100"
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                          formData.tipo_data === "DATA_ESPECIFICA" ? "text-white" : "text-yellow-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">📆 DATA ESPECÍFICA</h3>
                        <p className="text-sm text-gray-600">Preciso em um dia e horário específico</p>
                      </div>
                      {formData.tipo_data === "DATA_ESPECIFICA" && (
                        <Check className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                  </button>

                  {formData.tipo_data === "DATA_ESPECIFICA" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pl-4 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Data</label>
                        <input
                          type="date"
                          value={formData.data_especifica}
                          onChange={(e) => updateFormData("data_especifica", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Horário Início</label>
                          <input
                            type="time"
                            value={formData.horario_inicio}
                            onChange={(e) => updateFormData("horario_inicio", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Horário Fim</label>
                          <input
                            type="time"
                            value={formData.horario_fim}
                            onChange={(e) => updateFormData("horario_fim", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PERÍODO */}
                  <button
                    onClick={() => updateFormData("tipo_data", "PERIODO")}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      formData.tipo_data === "PERIODO"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.tipo_data === "PERIODO" ? "bg-blue-500" : "bg-blue-100"
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                          formData.tipo_data === "PERIODO" ? "text-white" : "text-blue-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">📊 PERÍODO</h3>
                        <p className="text-sm text-gray-600">Preciso durante vários dias (férias, licença)</p>
                      </div>
                      {formData.tipo_data === "PERIODO" && (
                        <Check className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                  </button>

                  {formData.tipo_data === "PERIODO" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pl-4 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Data Início</label>
                          <input
                            type="date"
                            value={formData.periodo_inicio}
                            onChange={(e) => updateFormData("periodo_inicio", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Data Fim</label>
                          <input
                            type="date"
                            value={formData.periodo_fim}
                            onChange={(e) => updateFormData("periodo_fim", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* ETAPA 2 - PROFISSIONAL NECESSÁRIO */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  👨‍⚕️ Que tipo de profissional precisa?
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Especialidade Necessária *
                    </label>
                    <select
                      value={formData.especialidade_necessaria}
                      onChange={(e) => updateFormData("especialidade_necessaria", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {ESPECIALIDADES.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tempo Mínimo de Formado (anos)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tempo_minimo_formado_anos}
                      onChange={(e) => updateFormData("tempo_minimo_formado_anos", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                      placeholder="0 = sem requisito"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = aceita recém-formados
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3 - LOCAL */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  📍 Onde será a substituição?
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Selecione a Clínica/Unidade *
                    </label>
                    {clinicaUnits.length === 0 ? (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mb-2" />
                        <p className="text-sm text-gray-700">
                          Nenhuma clínica vinculada encontrada. 
                          {formData.criado_por_tipo === "PROFISSIONAL" 
                            ? " Você precisa estar vinculado a uma clínica para criar vagas."
                            : " Cadastre uma unidade primeiro."}
                        </p>
                      </div>
                    ) : (
                      <select
                        value={formData.unidade_id}
                        onChange={(e) => {
                          const unit = clinicaUnits.find(u => u.id === e.target.value);
                          setSelectedUnit(unit);
                          updateFormData("unidade_id", e.target.value);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                      >
                        <option value="">Selecione...</option>
                        {clinicaUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.nome_fantasia} - {unit.cidade}/{unit.uf}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedUnit && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
                    >
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Informações da Clínica
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Nome:</strong> {selectedUnit.nome_fantasia}</p>
                        <p><strong>Endereço:</strong> {selectedUnit.endereco}, {selectedUnit.numero}</p>
                        <p><strong>Bairro:</strong> {selectedUnit.bairro}</p>
                        <p><strong>Cidade:</strong> {selectedUnit.cidade}/{selectedUnit.uf}</p>
                        {selectedUnit.ponto_referencia && (
                          <p><strong>Referência:</strong> {selectedUnit.ponto_referencia}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* ETAPA 4 - RESPONSÁVEL */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  📞 Quem é o responsável pela confirmação?
                </h2>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-700">
                    Após escolher um candidato, enviaremos um WhatsApp para esta pessoa confirmar a substituição.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nome do Responsável *
                    </label>
                    <input
                      type="text"
                      value={formData.responsavel_nome}
                      onChange={(e) => updateFormData("responsavel_nome", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                      placeholder="Ex: Dr. João Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cargo/Função *
                    </label>
                    <select
                      value={formData.responsavel_cargo}
                      onChange={(e) => updateFormData("responsavel_cargo", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="PROPRIETARIO">Proprietário</option>
                      <option value="GERENTE">Gerente</option>
                      <option value="COORDENADOR">Coordenador</option>
                      <option value="DENTISTA_RESPONSAVEL">Dentista Responsável</option>
                      <option value="SECRETARIA">Secretária</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={formData.responsavel_whatsapp}
                      onChange={(e) => updateFormData("responsavel_whatsapp", e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                      placeholder="11999999999"
                      maxLength="11"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas números (11 dígitos)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.responsavel_esta_ciente}
                        onChange={(e) => updateFormData("responsavel_esta_ciente", e.target.checked)}
                        className="w-5 h-5 mt-1 rounded border-2 border-yellow-400"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          ✅ Confirmo que esta pessoa está CIENTE *
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          O responsável receberá um WhatsApp para confirmar ou rejeitar a substituição
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 5 - REMUNERAÇÃO */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  💰 Como será a remuneração?
                </h2>

                <div className="space-y-6">
                  {/* Tipo Remuneração */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Tipo de Remuneração *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => updateFormData("tipo_remuneracao", "DIARIA")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.tipo_remuneracao === "DIARIA"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-bold">Diária Fixa</p>
                        <p className="text-xs text-gray-600 mt-1">Valor por dia</p>
                      </button>
                      <button
                        onClick={() => updateFormData("tipo_remuneracao", "PORCENTAGEM")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.tipo_remuneracao === "PORCENTAGEM"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-bold">Porcentagem</p>
                        <p className="text-xs text-gray-600 mt-1">% por procedimento</p>
                      </button>
                    </div>
                  </div>

                  {/* Se Diária */}
                  {formData.tipo_remuneracao === "DIARIA" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Valor da Diária *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                          R$
                        </span>
                        <input
                          type="number"
                          value={formData.valor_diaria}
                          onChange={(e) => updateFormData("valor_diaria", e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 outline-none"
                          placeholder="500.00"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Se Porcentagem */}
                  {formData.tipo_remuneracao === "PORCENTAGEM" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">
                          Procedimentos e Porcentagens *
                        </label>
                        <button
                          onClick={() => {
                            updateFormData("procedimentos_porcentagem", [
                              ...formData.procedimentos_porcentagem,
                              { procedimento: "", porcentagem: "" }
                            ]);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </button>
                      </div>
                      
                      {formData.procedimentos_porcentagem.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <select
                            value={item.procedimento}
                            onChange={(e) => {
                              const updated = [...formData.procedimentos_porcentagem];
                              updated[index].procedimento = e.target.value;
                              updateFormData("procedimentos_porcentagem", updated);
                            }}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                          >
                            <option value="">Selecione...</option>
                            {PROCEDIMENTOS_ODONTO.map(proc => (
                              <option key={proc.id} value={proc.label}>{proc.label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={item.porcentagem}
                            onChange={(e) => {
                              const updated = [...formData.procedimentos_porcentagem];
                              updated[index].porcentagem = e.target.value;
                              updateFormData("procedimentos_porcentagem", updated);
                            }}
                            className="w-24 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                            placeholder="50"
                          />
                          <span className="flex items-center font-bold text-gray-600">%</span>
                          <button
                            onClick={() => {
                              const updated = formData.procedimentos_porcentagem.filter((_, i) => i !== index);
                              updateFormData("procedimentos_porcentagem", updated);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Quem Paga */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Quem paga a substituição? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => updateFormData("quem_paga", "DENTISTA")}
                        disabled={formData.criado_por_tipo === "CLINICA"}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.quem_paga === "DENTISTA"
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-200 hover:border-yellow-300"
                        } ${formData.criado_por_tipo === "CLINICA" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <p className="font-bold">👨‍⚕️ Dentista</p>
                        <p className="text-xs text-gray-600 mt-1">Eu pago</p>
                      </button>
                      <button
                        onClick={() => updateFormData("quem_paga", "CLINICA")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.quem_paga === "CLINICA"
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <p className="font-bold">🏥 Clínica</p>
                        <p className="text-xs text-gray-600 mt-1">Clínica paga</p>
                      </button>
                    </div>
                  </div>

                  {/* Forma Pagamento */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Forma de Pagamento *
                    </label>
                    <select
                      value={formData.forma_pagamento}
                      onChange={(e) => updateFormData("forma_pagamento", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {FORMAS_PAGAMENTO.map(forma => (
                        <option key={forma.value} value={forma.value}>{forma.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 6 - DETALHES E RESUMO */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  📝 Detalhes Finais (Opcional)
                </h2>

                <div className="space-y-6">
                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Observações Gerais
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => updateFormData("observacoes", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none h-32 resize-none"
                      placeholder="Informações adicionais importantes..."
                    ></textarea>
                  </div>

                  {/* Resumo */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                    <h3 className="font-black text-lg mb-4">📋 RESUMO DA VAGA</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-bold">
                          {formData.criado_por_tipo === "PROFISSIONAL" ? "👨‍⚕️ Profissional" : "🏥 Clínica"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quando:</span>
                        <span className="font-bold">
                          {formData.tipo_data === "IMEDIATO" && "🚨 IMEDIATO"}
                          {formData.tipo_data === "DATA_ESPECIFICA" && `📅 ${formData.data_especifica}`}
                          {formData.tipo_data === "PERIODO" && `📊 ${formData.periodo_inicio} a ${formData.periodo_fim}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Especialidade:</span>
                        <span className="font-bold">{formData.especialidade_necessaria}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Local:</span>
                        <span className="font-bold">{selectedUnit?.nome_fantasia}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remuneração:</span>
                        <span className="font-bold">
                          {formData.tipo_remuneracao === "DIARIA" && `R$ ${formData.valor_diaria}`}
                          {formData.tipo_remuneracao === "PORCENTAGEM" && "% por procedimento"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quem paga:</span>
                        <span className="font-bold">
                          {formData.quem_paga === "DENTISTA" ? "👨‍⚕️ Dentista" : "🏥 Clínica"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-300 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          )}
          
          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                validateStep(currentStep)
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Próximo
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !validateStep(6)}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                validateStep(6) && !createMutation.isPending
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  PUBLICAR VAGA
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
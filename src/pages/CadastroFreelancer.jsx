import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Upload, Briefcase, DollarSign, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "DESIGN", label: "Design", icon: "🎨" },
  { id: "TECNOLOGIA", label: "Tecnologia", icon: "💻" },
  { id: "MARKETING", label: "Marketing", icon: "📱" },
  { id: "REDACAO", label: "Redação", icon: "✍️" },
  { id: "VIDEO", label: "Vídeo/Foto", icon: "🎬" },
  { id: "CONSULTORIA", label: "Consultoria", icon: "💼" },
  { id: "ADMINISTRATIVO", label: "Administrativo", icon: "📊" },
  { id: "OUTRO", label: "Outro", icon: "⭐" }
];

export default function CadastroFreelancer() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profile_photo: "",
    bio: "",
    title: "",
    category: "",
    skills: [],
    years_experience: "",
    work_preferences: {
      remote: true,
      onsite: false,
      hybrid: false
    },
    availability_hours_week: "",
    pricing: {
      hourly_rate: "",
      daily_rate: "",
      project_min: "",
      currency: "BRL"
    }
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Preencher dados do user
        setFormData(prev => ({
          ...prev,
          name: currentUser.full_name || "",
          email: currentUser.email || ""
        }));
      } catch (error) {
        toast.error("Erro ao carregar dados do usuário");
      }
    };
    loadUser();
  }, []);

  const createFreelancerMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Freelancer.create({
        ...data,
        user_id: user.id,
        portfolio_items: [],
        certifications: [],
        rating: {
          average: 0,
          count: 0,
          breakdown: { quality: 0, communication: 0, deadline: 0, value: 0 }
        },
        stats: {
          jobs_completed: 0,
          jobs_active: 0,
          total_earned: 0,
          response_time: 0,
          on_time_delivery: 0
        },
        is_active: true,
        is_available: true,
        is_verified: false
      });
    },
    onSuccess: async () => {
      // Atualizar user role
      await base44.auth.updateMe({ is_freelancer: true });
      toast.success("🎉 Cadastro freelancer concluído!");
      navigate(createPageUrl("DashboardFreelancer"));
    },
    onError: (error) => {
      toast.error("Erro ao criar cadastro: " + error.message);
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (formData.skills.includes(skillInput.trim())) {
      toast.error("Habilidade já adicionada");
      return;
    }
    if (formData.skills.length >= 15) {
      toast.error("Máximo de 15 habilidades");
      return;
    }
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()]
    }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange("profile_photo", file_url);
      toast.success("Foto enviada!");
    } catch (error) {
      toast.error("Erro ao enviar foto");
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone) {
          toast.error("Preencha todos os campos obrigatórios");
          return false;
        }
        if (formData.phone.length !== 11) {
          toast.error("Telefone deve ter 11 dígitos");
          return false;
        }
        return true;
      case 2:
        if (!formData.title || !formData.category) {
          toast.error("Preencha título e categoria");
          return false;
        }
        if (formData.skills.length === 0) {
          toast.error("Adicione pelo menos uma habilidade");
          return false;
        }
        return true;
      case 3:
        if (!formData.work_preferences.remote && !formData.work_preferences.onsite && !formData.work_preferences.hybrid) {
          toast.error("Selecione pelo menos uma preferência de trabalho");
          return false;
        }
        return true;
      case 4:
        if (!formData.pricing.hourly_rate && !formData.pricing.daily_rate && !formData.pricing.project_min) {
          toast.error("Preencha pelo menos um valor");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      const submitData = {
        ...formData,
        years_experience: parseInt(formData.years_experience) || 0,
        availability_hours_week: parseInt(formData.availability_hours_week) || 0,
        pricing: {
          hourly_rate: parseFloat(formData.pricing.hourly_rate) || 0,
          daily_rate: parseFloat(formData.pricing.daily_rate) || 0,
          project_min: parseFloat(formData.pricing.project_min) || 0,
          currency: "BRL"
        }
      };
      createFreelancerMutation.mutate(submitData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Informações Básicas</h2>
              <p className="text-gray-600">Vamos começar com seus dados principais</p>
            </div>

            {/* Foto de Perfil */}
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="file"
                  id="profile_photo"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="profile_photo"
                  className="cursor-pointer block w-32 h-32 rounded-full border-4 border-dashed border-gray-300 hover:border-purple-400 transition-all overflow-hidden bg-gray-50"
                >
                  {formData.profile_photo ? (
                    <img src={formData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">Clique para adicionar foto</p>
              </div>
            </div>

            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Seu nome completo"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="seu@email.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Telefone/WhatsApp *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                placeholder="62999998888"
                maxLength={11}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas números</p>
            </div>

            <div>
              <Label>Bio Profissional</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Conte um pouco sobre você e sua experiência..."
                className="mt-2 min-h-[120px]"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Perfil Profissional</h2>
              <p className="text-gray-600">O que você faz e suas habilidades</p>
            </div>

            <div>
              <Label>Título Profissional *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Designer Gráfico, Desenvolvedor Frontend"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Categoria *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleInputChange("category", cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.category === cat.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-sm font-semibold">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Habilidades *</Label>
              <div className="space-y-2 mt-2">
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-xl">
                    {formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-purple-600 rounded-full px-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Ex: Photoshop, React, SEO"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Pressione Enter ou + para adicionar (máx. 15)</p>
              </div>
            </div>

            <div>
              <Label>Anos de Experiência</Label>
              <Input
                type="number"
                value={formData.years_experience}
                onChange={(e) => handleInputChange("years_experience", e.target.value)}
                placeholder="0"
                min="0"
                max="50"
                className="mt-2"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Preferências de Trabalho</h2>
              <p className="text-gray-600">Como você prefere trabalhar?</p>
            </div>

            <div>
              <Label className="mb-3 block">Modalidade de Trabalho *</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-green-400 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.work_preferences.remote}
                    onChange={(e) => handleNestedChange("work_preferences", "remote", e.target.checked)}
                    className="w-5 h-5 accent-green-500"
                  />
                  <div>
                    <div className="font-semibold">Remoto</div>
                    <div className="text-sm text-gray-500">Trabalho 100% online</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-green-400 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.work_preferences.onsite}
                    onChange={(e) => handleNestedChange("work_preferences", "onsite", e.target.checked)}
                    className="w-5 h-5 accent-green-500"
                  />
                  <div>
                    <div className="font-semibold">Presencial</div>
                    <div className="text-sm text-gray-500">Trabalho no local</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-green-400 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.work_preferences.hybrid}
                    onChange={(e) => handleNestedChange("work_preferences", "hybrid", e.target.checked)}
                    className="w-5 h-5 accent-green-500"
                  />
                  <div>
                    <div className="font-semibold">Híbrido</div>
                    <div className="text-sm text-gray-500">Combinação de remoto e presencial</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <Label>Horas Disponíveis por Semana</Label>
              <Input
                type="number"
                value={formData.availability_hours_week}
                onChange={(e) => handleInputChange("availability_hours_week", e.target.value)}
                placeholder="40"
                min="0"
                max="168"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Quantas horas pode dedicar a projetos?</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Valores</h2>
              <p className="text-gray-600">Quanto você cobra pelos seus serviços?</p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-4">
              <p className="text-sm text-yellow-800">
                💡 Preencha pelo menos um valor. Você pode ajustar depois.
              </p>
            </div>

            <div>
              <Label>Valor por Hora (R$)</Label>
              <Input
                type="number"
                value={formData.pricing.hourly_rate}
                onChange={(e) => handleNestedChange("pricing", "hourly_rate", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Valor por Dia (R$)</Label>
              <Input
                type="number"
                value={formData.pricing.daily_rate}
                onChange={(e) => handleNestedChange("pricing", "daily_rate", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Valor Mínimo de Projeto (R$)</Label>
              <Input
                type="number"
                value={formData.pricing.project_min}
                onChange={(e) => handleNestedChange("pricing", "project_min", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Valor mínimo que você aceita para um projeto</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-white mb-2">Cadastro Freelancer</h1>
          <p className="text-white/80">Crie seu perfil e comece a trabalhar em projetos</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === currentStep
                    ? "bg-purple-600 text-white"
                    : step < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-16 md:w-32 mx-2 ${
                    step < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">
          Etapa {currentStep} de {totalSteps}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            {renderStep()}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-6 border-t-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createFreelancerMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white"
                >
                  {createFreelancerMutation.isPending ? "Finalizando..." : "Finalizar Cadastro"}
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
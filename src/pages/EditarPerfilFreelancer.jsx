import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Upload, Save } from "lucide-react";

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

export default function EditarPerfilFreelancer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: freelancer, isLoading } = useQuery({
    queryKey: ["freelancer", user?.id],
    queryFn: async () => {
      const result = await base44.entities.Freelancer.filter({ user_id: user?.id });
      return result[0];
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profile_photo: "",
    bio: "",
    title: "",
    category: "",
    skills: [],
    years_experience: 0,
    work_preferences: { remote: true, onsite: false, hybrid: false },
    availability_hours_week: 0,
    pricing: { hourly_rate: 0, daily_rate: 0, project_min: 0, currency: "BRL" },
    is_available: true
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (freelancer) {
      setFormData({
        name: freelancer.name || "",
        email: freelancer.email || "",
        phone: freelancer.phone || "",
        profile_photo: freelancer.profile_photo || "",
        bio: freelancer.bio || "",
        title: freelancer.title || "",
        category: freelancer.category || "",
        skills: freelancer.skills || [],
        years_experience: freelancer.years_experience || 0,
        work_preferences: freelancer.work_preferences || { remote: true, onsite: false, hybrid: false },
        availability_hours_week: freelancer.availability_hours_week || 0,
        pricing: freelancer.pricing || { hourly_rate: 0, daily_rate: 0, project_min: 0, currency: "BRL" },
        is_available: freelancer.is_available ?? true
      });
    }
  }, [freelancer]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Freelancer.update(freelancer.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["freelancer"]);
      toast.success("Perfil atualizado!");
      navigate(createPageUrl("DashboardFreelancer"));
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(createPageUrl("DashboardFreelancer"))}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-white">Editar Perfil</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-8">
          {/* Foto */}
          <div className="text-center">
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <label htmlFor="photo" className="cursor-pointer inline-block">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-dashed border-gray-300 hover:border-purple-400 overflow-hidden bg-gray-50">
                {formData.profile_photo ? (
                  <img src={formData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Clique para alterar foto</p>
            </label>
          </div>

          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Dados Básicos</h3>
            
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Telefone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                maxLength={11}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="mt-2 min-h-[120px]"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000</p>
            </div>
          </div>

          {/* Profissional */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Perfil Profissional</h3>

            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Categoria *</Label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleInputChange("category", cat.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.category === cat.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-semibold">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Habilidades</Label>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-xl mt-2 mb-2">
                  {formData.skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-sm">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-purple-600 rounded-full px-1">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Adicionar habilidade"
                />
                <Button type="button" onClick={addSkill} variant="outline">+</Button>
              </div>
            </div>

            <div>
              <Label>Anos de Experiência</Label>
              <Input
                type="number"
                value={formData.years_experience}
                onChange={(e) => handleInputChange("years_experience", parseInt(e.target.value) || 0)}
                min="0"
                className="mt-2"
              />
            </div>
          </div>

          {/* Trabalho */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Preferências de Trabalho</h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.work_preferences.remote}
                  onChange={(e) => handleNestedChange("work_preferences", "remote", e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
                <span>Remoto</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.work_preferences.onsite}
                  onChange={(e) => handleNestedChange("work_preferences", "onsite", e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
                <span>Presencial</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.work_preferences.hybrid}
                  onChange={(e) => handleNestedChange("work_preferences", "hybrid", e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
                <span>Híbrido</span>
              </label>
            </div>

            <div>
              <Label>Horas Disponíveis/Semana</Label>
              <Input
                type="number"
                value={formData.availability_hours_week}
                onChange={(e) => handleInputChange("availability_hours_week", parseInt(e.target.value) || 0)}
                min="0"
                className="mt-2"
              />
            </div>
          </div>

          {/* Valores */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Valores</h3>

            <div>
              <Label>Valor por Hora (R$)</Label>
              <Input
                type="number"
                value={formData.pricing.hourly_rate}
                onChange={(e) => handleNestedChange("pricing", "hourly_rate", parseFloat(e.target.value) || 0)}
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
                onChange={(e) => handleNestedChange("pricing", "daily_rate", parseFloat(e.target.value) || 0)}
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
                onChange={(e) => handleNestedChange("pricing", "project_min", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="mt-2"
              />
            </div>
          </div>

          {/* Disponibilidade */}
          <div>
            <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => handleInputChange("is_available", e.target.checked)}
                className="w-5 h-5 accent-green-500"
              />
              <div>
                <div className="font-semibold">Disponível para novos projetos</div>
                <div className="text-sm text-gray-500">Clientes poderão ver que você está aceitando trabalhos</div>
              </div>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white h-14 text-lg"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            <Save className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
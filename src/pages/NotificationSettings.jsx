import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Bell,
  Mail,
  MessageCircle,
  Save,
  Smartphone,
  CheckCircle2
} from "lucide-react";

const Toggle = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${
          enabled
            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
            : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

export default function NotificationSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [preferences, setPreferences] = useState({
    vagas_super_jobs: {
      ativo: true,
      canal_push: true,
      canal_email: true,
      canal_whatsapp: false
    },
    vagas_semelhante: {
      ativo: true,
      canal_push: true,
      canal_email: false,
      canal_whatsapp: false
    },
    mensagens_chat: {
      ativo: true,
      canal_push: true,
      canal_email: false
    },
    status_cadastro: {
      ativo: true,
      canal_push: true,
      canal_email: true,
      canal_whatsapp: true
    },
    noticias: {
      ativo: true,
      canal_push: true,
      canal_email: false
    },
    receber_whatsapp: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          setUserType(professionals[0].tipo_profissional === "DENTISTA" ? "DENTISTA" : "MEDICO");
          setWhatsappNumber(professionals[0].whatsapp || "");
        } else {
          const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
          if (owners.length > 0) {
            setUserType("CLINICA");
            setWhatsappNumber(owners[0].whatsapp || "");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const { data: existingPreferences, isLoading } = useQuery({
    queryKey: ["notificationPreferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const prefs = await base44.entities.NotificationPreference.filter({
        created_by: user.email
      });
      return prefs.length > 0 ? prefs[0] : null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        vagas_super_jobs: existingPreferences.vagas_super_jobs || preferences.vagas_super_jobs,
        vagas_semelhante: existingPreferences.vagas_semelhante || preferences.vagas_semelhante,
        mensagens_chat: existingPreferences.mensagens_chat || preferences.mensagens_chat,
        status_cadastro: existingPreferences.status_cadastro || preferences.status_cadastro,
        noticias: existingPreferences.noticias || preferences.noticias,
        receber_whatsapp: existingPreferences.vagas_super_jobs?.canal_whatsapp || false
      });
    }
  }, [existingPreferences]);

  const salvarPreferenciasMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userType) return;

      const dadosPreferencias = {
        usuario_tipo: userType,
        vagas_super_jobs: preferences.vagas_super_jobs,
        vagas_semelhante: preferences.vagas_semelhante,
        mensagens_chat: preferences.mensagens_chat,
        status_cadastro: preferences.status_cadastro,
        noticias: preferences.noticias
      };

      if (existingPreferences) {
        await base44.entities.NotificationPreference.update(
          existingPreferences.id,
          dadosPreferencias
        );
      } else {
        await base44.entities.NotificationPreference.create(dadosPreferencias);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      toast.success("✅ Preferências salvas com sucesso!");
    },
    onError: (error) => {
      toast.error("❌ Erro ao salvar preferências: " + error.message);
    },
  });

  const handleToggle = (categoria, campo, valor) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      newPrefs[categoria] = {
        ...newPrefs[categoria],
        [campo]: valor
      };
      return newPrefs;
    });
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="px-4 pt-4 pb-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Configurações de Notificações</h1>
            <p className="text-gray-500 mt-1">Escolha como quer ser notificado</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Notificações Push</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Toggle
              enabled={preferences.vagas_super_jobs.ativo}
              onChange={(value) => handleToggle("vagas_super_jobs", "ativo", value)}
              label="Super Jobs ⚡"
              description="Vagas com alta compatibilidade com seu perfil"
            />
            <Toggle
              enabled={preferences.vagas_semelhante.ativo}
              onChange={(value) => handleToggle("vagas_semelhante", "ativo", value)}
              label="Vagas Semelhantes 🎯"
              description="Oportunidades relacionadas à sua especialidade"
            />
            <Toggle
              enabled={preferences.mensagens_chat.ativo}
              onChange={(value) => handleToggle("mensagens_chat", "ativo", value)}
              label="Mensagens de Clínicas 💬"
              description="Receba propostas e mensagens diretas"
            />
            <Toggle
              enabled={preferences.status_cadastro.ativo}
              onChange={(value) => handleToggle("status_cadastro", "ativo", value)}
              label="Atualizações do Cadastro 📋"
              description="Aprovações, pendências e verificações"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Notificações por E-mail</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Toggle
              enabled={preferences.vagas_super_jobs.canal_email}
              onChange={(value) => handleToggle("vagas_super_jobs", "canal_email", value)}
              label="Super Jobs por E-mail 📧"
              description="Receba as melhores vagas na sua caixa de entrada"
            />
            <Toggle
              enabled={preferences.noticias.canal_email}
              onChange={(value) => handleToggle("noticias", "canal_email", value)}
              label="Newsletter NEW JOBS 📰"
              description="Novidades, dicas e atualizações da plataforma"
            />
            <Toggle
              enabled={preferences.status_cadastro.canal_email}
              onChange={(value) => handleToggle("status_cadastro", "canal_email", value)}
              label="Confirmações e Avisos Importantes 🔔"
              description="Status do cadastro, aprovações e alertas críticos"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Notificações por WhatsApp</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Receber por WhatsApp 💚</p>
                  <p className="text-sm text-gray-500 mt-0.5">Apenas para vagas Super Jobs</p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !preferences.receber_whatsapp;
                    setPreferences(prev => ({
                      ...prev,
                      receber_whatsapp: newValue,
                      vagas_super_jobs: {
                        ...prev.vagas_super_jobs,
                        canal_whatsapp: newValue
                      }
                    }));
                  }}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
                    preferences.receber_whatsapp
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      preferences.receber_whatsapp ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {preferences.receber_whatsapp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número do WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(aplicarMascaraTelefone(e.target.value))}
                    placeholder="(62) 99999-9999"
                    maxLength={15}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ Usaremos este número para enviar notificações importantes
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5"
        >
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Privacidade</h3>
              <p className="text-sm text-blue-700">
                Seus dados estão seguros. Você pode alterar essas preferências a qualquer momento.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-4 right-4 z-30"
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => salvarPreferenciasMutation.mutate()}
            disabled={salvarPreferenciasMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {salvarPreferenciasMutation.isPending ? "Salvando..." : "Salvar Preferências"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
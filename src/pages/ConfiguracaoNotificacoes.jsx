import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Bell,
  Mail,
  MessageCircle,
  Briefcase,
  Users,
  Tag,
  CheckCircle2,
  Save
} from "lucide-react";

export default function ConfiguracaoNotificacoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    notificacoes_push: true,
    notificacoes_email: true,
    notificacoes_whatsapp: false,
    novas_vagas_matching: true,
    candidaturas_recebidas: true,
    mensagens_chat: true,
    promocoes_parceiros: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser.notificacoes_config) {
          setConfig(prev => ({ ...prev, ...currentUser.notificacoes_config }));
        }
      } catch (error) {
        // Erro silencioso
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleToggle = (campo) => {
    setConfig(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        notificacoes_config: config
      });
      toast.success("✅ Preferências salvas com sucesso!");
    } catch (error) {
      toast.error("❌ Erro ao salvar: " + error.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  const SwitchItem = ({ checked, onChange, icon: Icon, title, description }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-yellow-300 transition-all">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{title}</p>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-14 h-8 rounded-full transition-all flex-shrink-0 ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${
            checked ? "ml-7" : "ml-1"
          } mt-1`}
        ></div>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Notificações</h1>
              <p className="text-sm text-gray-600">Configure suas preferências</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-500" />
            Canais de Notificação
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Escolha como deseja receber notificações
          </p>

          <div className="space-y-3">
            <SwitchItem
              checked={config.notificacoes_push}
              onChange={() => handleToggle("notificacoes_push")}
              icon={Bell}
              title="Notificações Push"
              description="Alertas no app e navegador"
            />
            <SwitchItem
              checked={config.notificacoes_email}
              onChange={() => handleToggle("notificacoes_email")}
              icon={Mail}
              title="Notificações por Email"
              description="Receber emails importantes"
            />
            <SwitchItem
              checked={config.notificacoes_whatsapp}
              onChange={() => handleToggle("notificacoes_whatsapp")}
              icon={MessageCircle}
              title="Notificações WhatsApp"
              description="Mensagens urgentes no WhatsApp"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            O que você quer receber
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Personalize os tipos de notificações
          </p>

          <div className="space-y-3">
            <SwitchItem
              checked={config.novas_vagas_matching}
              onChange={() => handleToggle("novas_vagas_matching")}
              icon={Briefcase}
              title="Novas Vagas Matching"
              description="Vagas que combinam com seu perfil"
            />
            <SwitchItem
              checked={config.candidaturas_recebidas}
              onChange={() => handleToggle("candidaturas_recebidas")}
              icon={Users}
              title="Candidaturas Recebidas"
              description="Quando alguém se candidatar às suas vagas"
            />
            <SwitchItem
              checked={config.mensagens_chat}
              onChange={() => handleToggle("mensagens_chat")}
              icon={MessageCircle}
              title="Mensagens no Chat"
              description="Novas mensagens nas conversas"
            />
            <SwitchItem
              checked={config.promocoes_parceiros}
              onChange={() => handleToggle("promocoes_parceiros")}
              icon={Tag}
              title="Promoções de Parceiros"
              description="Ofertas exclusivas e descontos"
            />
          </div>
        </motion.div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">💡 Dica:</p>
              <p>
                Mantenha as notificações ativas para não perder oportunidades importantes.
                Você pode ajustar as configurações a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
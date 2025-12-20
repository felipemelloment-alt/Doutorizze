import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  Newspaper,
  Heart,
  Cpu,
  Building2,
  Tag,
  GraduationCap,
  ShoppingBag,
  MapPin,
  Bell,
  Save
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tiposConteudo = [
  { id: "NOVIDADE", label: "Novidades Doutorizze", icon: Newspaper, defaultOn: true },
  { id: "NOTICIA_SAUDE", label: "Notícias de Saúde", icon: Heart, defaultOn: true },
  { id: "NOTICIA_IA", label: "IA & Tecnologia", icon: Cpu, defaultOn: true },
  { id: "PARCEIRO", label: "Parceiros e Financeiras", icon: Building2, defaultOn: true },
  { id: "PROMOCAO", label: "Promoções", icon: Tag, defaultOn: true },
  { id: "CURSO", label: "Cursos e Pós-graduação", icon: GraduationCap, defaultOn: true },
  { id: "DESTAQUE_MARKETPLACE", label: "Destaques Marketplace", icon: ShoppingBag, defaultOn: true }
];

export default function FeedConfig() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({
    tiposAtivos: tiposConteudo.map(t => t.id),
    apenasEstado: false,
    estadoFiltro: "",
    frequenciaNotificacao: "SEMPRE"
  });
  const [saving, setSaving] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Buscar preferências salvas
        const prefs = await base44.entities.NotificationPreference.filter({ user_id: currentUser.id });
        if (prefs.length > 0 && prefs[0].feed_config) {
          setConfig(prefs[0].feed_config);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };
    loadConfig();
  }, []);

  const toggleTipo = (tipoId) => {
    setConfig(prev => ({
      ...prev,
      tiposAtivos: prev.tiposAtivos.includes(tipoId)
        ? prev.tiposAtivos.filter(t => t !== tipoId)
        : [...prev.tiposAtivos, tipoId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar nas preferências de notificação
      const prefs = await base44.entities.NotificationPreference.filter({ user_id: user.id });
      if (prefs.length > 0) {
        await base44.entities.NotificationPreference.update(prefs[0].id, { feed_config: config });
      } else {
        await base44.entities.NotificationPreference.create({ 
          user_id: user.id, 
          feed_config: config 
        });
      }
      toast.success("Configurações salvas!");
      navigate(createPageUrl("Feed"));
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
        <button
          onClick={() => navigate(createPageUrl("Feed"))}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-black text-white">Configurar Feed</h1>
            <p className="text-white/80 text-sm">Personalize o que você quer ver</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-6">
        {/* Tipos de Conteúdo */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tipos de Conteúdo</h2>
          <div className="space-y-4">
            {tiposConteudo.map((tipo) => {
              const Icon = tipo.icon;
              const isActive = config.tiposAtivos.includes(tipo.id);
              return (
                <div 
                  key={tipo.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {tipo.label}
                    </span>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleTipo(tipo.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtro Geográfico */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            Filtro por Região
          </h2>
          
          <div className="flex items-center justify-between py-2 mb-4">
            <span className="font-medium text-gray-700">Mostrar apenas do meu estado</span>
            <Switch
              checked={config.apenasEstado}
              onCheckedChange={(checked) => setConfig({ ...config, apenasEstado: checked })}
            />
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            Notificações
          </h2>
          
          <Select 
            value={config.frequenciaNotificacao} 
            onValueChange={(value) => setConfig({ ...config, frequenciaNotificacao: value })}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMPRE">Notificar sempre</SelectItem>
              <SelectItem value="DIARIO">Resumo diário</SelectItem>
              <SelectItem value="NUNCA">Não notificar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}
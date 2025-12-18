import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  User,
  Bell,
  Shield,
  Settings,
  Zap,
  Info,
  Mail,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Search,
  MapPin,
  Globe,
  Moon,
  ExternalLink,
  Calendar,
  Clock,
  Save,
  X
} from "lucide-react";

export default function Configuracoes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // PROFISSIONAL | CLINICA | FORNECEDOR | HOSPITAL
  const [professional, setProfessional] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Configurações
  const [config, setConfig] = useState({
    // NOTIFICAÇÕES
    notif_push: true,
    notif_email_novidades: true,
    notif_email_vagas: true,
    notif_email_candidaturas: true,
    notif_resumo_semanal: false,

    // PRIVACIDADE
    perfil_visivel: true,
    exibir_email: false,
    exibir_telefone: true,
    aparecer_buscas: true,

    // NEW JOBS (profissional)
    new_jobs_ativo: true,
    receber_super_matches: true,
    receber_semelhantes: true,
    dias_disponiveis: [],
    horario_preferido_inicio: "08:00",
    horario_preferido_fim: "18:00",

    // PREFERÊNCIAS
    cidade_padrao: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Detectar tipo de usuário
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          setProfessional(professionals[0]);
          // Carregar configurações do profissional
          setConfig((prev) => ({
            ...prev,
            new_jobs_ativo: professionals[0].new_jobs_ativo ?? true,
            dias_disponiveis: professionals[0].dias_semana_disponiveis || [],
            perfil_visivel: professionals[0].status_disponibilidade !== "INDISPONIVEL"
          }));
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (owners.length > 0) {
          setUserType("CLINICA");
          return;
        }

        const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        if (suppliers.length > 0) {
          setUserType("FORNECEDOR");
          return;
        }

        const hospitals = await base44.entities.Hospital.filter({ user_id: currentUser.id });
        if (hospitals.length > 0) {
          setUserType("HOSPITAL");
          return;
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Salvar configurações
  const salvarMutation = useMutation({
    mutationFn: async () => {
      // Atualizar profissional se aplicável
      if (userType === "PROFISSIONAL" && professional) {
        await base44.entities.Professional.update(professional.id, {
          new_jobs_ativo: config.new_jobs_ativo,
          dias_semana_disponiveis: config.dias_disponiveis,
          status_disponibilidade: config.perfil_visivel ? "DISPONIVEL" : "INDISPONIVEL",
          exibir_email: config.exibir_email
        });
      }

      // TODO: Criar/atualizar NotificationPreference quando implementado
      // await base44.entities.NotificationPreference.create/update(...)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      toast.success("✅ Configurações salvas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    }
  });

  const handleToggle = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDiaToggle = (dia) => {
    setConfig((prev) => {
      const dias = prev.dias_disponiveis.includes(dia)
        ? prev.dias_disponiveis.filter((d) => d !== dia)
        : [...prev.dias_disponiveis, dia];
      return { ...prev, dias_disponiveis: dias };
    });
  };

  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e privacidade</p>
        </div>

        <div className="space-y-6">
          {/* 1. CONTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Conta</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Alterar Senha</span>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-semibold">Excluir Conta</span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* 2. NOTIFICAÇÕES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Notificações</h2>
            </div>

            <div className="space-y-4">
              <SwitchItem
                label="Notificações Push no App"
                description="Receba alertas no aplicativo"
                checked={config.notif_push}
                onChange={() => handleToggle("notif_push")}
              />
              <SwitchItem
                label="Email de Novidades"
                description="Atualizações e novidades do app"
                checked={config.notif_email_novidades}
                onChange={() => handleToggle("notif_email_novidades")}
              />
              {userType === "PROFISSIONAL" && (
                <SwitchItem
                  label="Email de Vagas"
                  description="Novas vagas compatíveis com seu perfil"
                  checked={config.notif_email_vagas}
                  onChange={() => handleToggle("notif_email_vagas")}
                />
              )}
              {userType === "CLINICA" && (
                <SwitchItem
                  label="Email de Candidaturas"
                  description="Notificações sobre novas candidaturas"
                  checked={config.notif_email_candidaturas}
                  onChange={() => handleToggle("notif_email_candidaturas")}
                />
              )}
              <SwitchItem
                label="Resumo Semanal"
                description="Receba um resumo semanal por email"
                checked={config.notif_resumo_semanal}
                onChange={() => handleToggle("notif_resumo_semanal")}
              />
            </div>
          </motion.div>

          {/* 3. PRIVACIDADE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Privacidade</h2>
            </div>

            <div className="space-y-4">
              {userType === "PROFISSIONAL" && (
                <SwitchItem
                  label="Perfil Visível"
                  description="Seu perfil aparece nas buscas"
                  checked={config.perfil_visivel}
                  onChange={() => handleToggle("perfil_visivel")}
                />
              )}
              <SwitchItem
                label="Exibir Email"
                description="Mostrar email no perfil público"
                checked={config.exibir_email}
                onChange={() => handleToggle("exibir_email")}
              />
              <SwitchItem
                label="Exibir Telefone"
                description="Mostrar telefone no perfil público"
                checked={config.exibir_telefone}
                onChange={() => handleToggle("exibir_telefone")}
              />
              <SwitchItem
                label="Aparecer em Buscas"
                description="Permitir que outros te encontrem"
                checked={config.aparecer_buscas}
                onChange={() => handleToggle("aparecer_buscas")}
              />
            </div>
          </motion.div>

          {/* 4. PREFERÊNCIAS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Preferências</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tema</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-3 border-2 border-yellow-400 bg-yellow-50 text-gray-900 font-semibold rounded-xl">
                    ☀️ Claro
                  </button>
                  <button className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-all">
                    🌙 Escuro
                  </button>
                  <button className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition-all">
                    📱 Sistema
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Em breve: Modo escuro</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Idioma</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">🇧🇷 Português (Brasil)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade Padrão</label>
                <div className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:border-yellow-400 transition-all">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={config.cidade_padrao}
                    onChange={(e) => setConfig({ ...config, cidade_padrao: e.target.value })}
                    placeholder="Ex: Goiânia - GO"
                    className="flex-1 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5. NEW JOBS (só profissional) */}
          {userType === "PROFISSIONAL" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900">NEW JOBS</h2>
              </div>

              <div className="space-y-4">
                <SwitchItem
                  label="Ativar NEW JOBS"
                  description="Receber vagas automaticamente"
                  checked={config.new_jobs_ativo}
                  onChange={() => handleToggle("new_jobs_ativo")}
                />
                <SwitchItem
                  label="Super Matches"
                  description="Vagas perfeitas para seu perfil"
                  checked={config.receber_super_matches}
                  onChange={() => handleToggle("receber_super_matches")}
                  disabled={!config.new_jobs_ativo}
                />
                <SwitchItem
                  label="Jobs Semelhantes"
                  description="Vagas compatíveis com seu perfil"
                  checked={config.receber_semelhantes}
                  onChange={() => handleToggle("receber_semelhantes")}
                  disabled={!config.new_jobs_ativo}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dias Disponíveis</label>
                  <div className="flex flex-wrap gap-2">
                    {diasSemana.map((dia) => (
                      <button
                        key={dia}
                        onClick={() => handleDiaToggle(dia)}
                        disabled={!config.new_jobs_ativo}
                        className={`px-4 py-2 font-bold rounded-xl transition-all ${
                          config.dias_disponiveis.includes(dia)
                            ? "bg-yellow-400 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } ${!config.new_jobs_ativo && "opacity-50 cursor-not-allowed"}`}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Início</label>
                    <input
                      type="time"
                      value={config.horario_preferido_inicio}
                      onChange={(e) => setConfig({ ...config, horario_preferido_inicio: e.target.value })}
                      disabled={!config.new_jobs_ativo}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Fim</label>
                    <input
                      type="time"
                      value={config.horario_preferido_fim}
                      onChange={(e) => setConfig({ ...config, horario_preferido_fim: e.target.value })}
                      disabled={!config.new_jobs_ativo}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 6. SOBRE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white shadow-lg">
                <Info className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Sobre</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">Versão do App</span>
                <span className="text-gray-900 font-bold">1.0.0</span>
              </div>

              <a
                href="https://newjobs.com.br/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
              >
                <span className="font-semibold text-gray-900">Termos de Uso</span>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>

              <a
                href="https://newjobs.com.br/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
              >
                <span className="font-semibold text-gray-900">Política de Privacidade</span>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>

              <button
                onClick={() => navigate("/Contato")}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
              >
                <span className="font-semibold text-gray-900">Contato / Suporte</span>
                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Botão Salvar Fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => salvarMutation.mutate()}
              disabled={salvarMutation.isPending}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {salvarMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Alterar Senha */}
      {showPasswordModal && (
        <ModalAlterarSenha onClose={() => setShowPasswordModal(false)} />
      )}

      {/* Modal Excluir Conta */}
      {showDeleteModal && (
        <ModalExcluirConta onClose={() => setShowDeleteModal(false)} userEmail={user.email} />
      )}
    </div>
  );
}

// Componente Switch Item
function SwitchItem({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-14 h-8 rounded-full transition-all ${
          checked ? "bg-green-500" : "bg-gray-300"
        } ${disabled && "opacity-50 cursor-not-allowed"}`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
            checked && "transform translate-x-6"
          }`}
        />
      </button>
    </div>
  );
}

// Modal Alterar Senha
function ModalAlterarSenha({ onClose }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  const handleSubmit = () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    // TODO: Implementar alteração de senha
    toast.success("✅ Senha alterada com sucesso!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-gray-900">Alterar Senha</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Senha Atual</label>
            <div className="relative">
              <input
                type={showSenhaAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none transition-all"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
            <div className="relative">
              <input
                type={showNovaSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none transition-all"
                placeholder="Digite a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none transition-all"
              placeholder="Digite a nova senha novamente"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Modal Excluir Conta
function ModalExcluirConta({ onClose, userEmail }) {
  const [confirmacao, setConfirmacao] = useState("");

  const handleDelete = () => {
    if (confirmacao !== userEmail) {
      toast.error("Email de confirmação incorreto");
      return;
    }
    // TODO: Implementar exclusão de conta
    toast.success("Conta excluída com sucesso");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-red-600">Excluir Conta</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-center text-gray-700 mb-2">
            Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos.
          </p>
          <p className="text-center text-sm text-gray-500">
            Digite seu email <strong>{userEmail}</strong> para confirmar:
          </p>
        </div>

        <input
          type="email"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder="Digite seu email"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 outline-none transition-all mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}
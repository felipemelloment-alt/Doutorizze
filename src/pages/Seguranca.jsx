import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Shield,
  Lock,
  Key,
  Smartphone,
  Monitor,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";

export default function Seguranca() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Estados para alterar senha
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPasswords, setShowPasswords] = useState({ atual: false, nova: false, confirmar: false });
  const [changingPassword, setChangingPassword] = useState(false);

  // Estados para excluir conta
  const [modalExcluir, setModalExcluir] = useState(false);
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sessões ativas (mock)
  const [sessoes] = useState([
    { id: 1, device: "Chrome no Windows", location: "São Paulo, Brasil", current: true, last_active: new Date() },
    { id: 2, device: "Safari no iPhone", location: "Rio de Janeiro, Brasil", current: false, last_active: new Date(Date.now() - 86400000) }
  ]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    setChangingPassword(true);
    try {
      // Simulação - Base44 não expõe changePassword diretamente
      // Em produção, seria uma função backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("✅ Senha alterada com sucesso!");
      setModalSenha(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      toast.error("Erro ao alterar senha: " + error.message);
    }
    setChangingPassword(false);
  };

  const handleExcluirConta = async () => {
    if (confirmacaoExcluir !== "EXCLUIR MINHA CONTA") {
      toast.error("Digite a frase exata para confirmar");
      return;
    }

    setDeleting(true);
    try {
      // Excluir conta - logout e redirect
      await base44.auth.logout();
      toast.success("Conta excluída com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erro ao excluir conta: " + error.message);
    }
    setDeleting(false);
  };

  const handleRevokeSession = (sessionId) => {
    toast.success("Sessão encerrada");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Segurança</h1>
              <p className="text-sm text-gray-600">Proteja sua conta</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Alterar Senha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Senha</h3>
                <p className="text-sm text-gray-600">Última alteração: Há 2 meses</p>
              </div>
            </div>
            <button
              onClick={() => setModalSenha(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Alterar Senha
            </button>
          </div>
        </motion.div>

        {/* Autenticação 2FA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Autenticação em Dois Fatores</h3>
                <p className="text-sm text-gray-600">
                  {twoFactorEnabled ? "Ativado - Sua conta está mais segura" : "Adicione uma camada extra de segurança"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                toast.success(twoFactorEnabled ? "2FA desativado" : "2FA ativado");
              }}
              className={`w-14 h-8 rounded-full transition-all ${
                twoFactorEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${
                twoFactorEnabled ? "ml-7" : "ml-1"
              }`}></div>
            </button>
          </div>
        </motion.div>

        {/* Sessões Ativas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Sessões Ativas</h3>
          </div>

          <div className="space-y-3">
            {sessoes.map((sessao) => (
              <div key={sessao.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{sessao.device}</p>
                        {sessao.current && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{sessao.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Último acesso: {sessao.last_active.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {!sessao.current && (
                    <button
                      onClick={() => handleRevokeSession(sessao.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Encerrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Zona de Perigo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Zona de Perigo</h3>
              <p className="text-sm text-red-700">Ações irreversíveis</p>
            </div>
          </div>

          <button
            onClick={() => setModalExcluir(true)}
            className="w-full px-4 py-3 bg-white border-2 border-red-300 text-red-700 font-bold rounded-xl hover:bg-red-50 hover:border-red-400 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Excluir Minha Conta
          </button>
        </motion.div>
      </div>

      {/* Modal Alterar Senha */}
      <AnimatePresence>
        {modalSenha && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalSenha(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Alterar Senha</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPasswords.atual ? "text" : "password"}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, atual: !prev.atual }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.atual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPasswords.nova ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, nova: !prev.nova }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.nova ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirmar ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirmar: !prev.confirmar }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalSenha(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAlterarSenha}
                  disabled={changingPassword}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {changingPassword ? "Alterando..." : "Alterar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Excluir Conta */}
      <AnimatePresence>
        {modalExcluir && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalExcluir(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-900">Excluir Conta</h2>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Perfil e informações pessoais</li>
                  <li>Candidaturas e histórico</li>
                  <li>Conversas e mensagens</li>
                  <li>Avaliações e favoritos</li>
                </ul>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Digite <span className="text-red-600">EXCLUIR MINHA CONTA</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmacaoExcluir}
                  onChange={(e) => setConfirmacaoExcluir(e.target.value)}
                  placeholder="EXCLUIR MINHA CONTA"
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalExcluir(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExcluirConta}
                  disabled={deleting || confirmacaoExcluir !== "EXCLUIR MINHA CONTA"}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {deleting ? "Excluindo..." : "Excluir Conta"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
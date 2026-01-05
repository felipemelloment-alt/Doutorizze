import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { UserRound, Building2, Package, Hospital, GraduationCap, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingTipoConta() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) console.warn("OnboardingTipoConta: Auth timeout");
      }, 5000);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (!isMounted) return;

        setUser(currentUser);

        if (!currentUser?.vertical) {
          navigate(createPageUrl("OnboardingVertical"));
          return;
        }

        if (currentUser.tipo_conta) {
          navigate(createPageUrl("Feed"));
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn("Erro ao verificar usuário:", error?.message || error);
      }
    };
    checkUser();

    return () => { isMounted = false; };
  }, []);

  const handleSelectTipoConta = async (tipoConta, routeCadastro) => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ tipo_conta: tipoConta });
      toast.success(`Tipo de conta: ${tipoConta}`);
      navigate(createPageUrl(routeCadastro));
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  const verticalEmoji = user.vertical === "ODONTOLOGIA" ? "🦷" : "🩺";
  const verticalNome = user.vertical === "ODONTOLOGIA" ? "Odontologia" : "Medicina";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden p-6">
      {/* Elementos Decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(createPageUrl("OnboardingVertical"))}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg mb-6">
            <span className="text-3xl">{verticalEmoji}</span>
            <span className="font-black text-gray-900">{verticalNome}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Como você quer se cadastrar?
          </h1>
          <p className="text-xl text-gray-600">
            Escolha o tipo de conta ideal para você
          </p>
        </div>

        {/* Grid de Opções */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profissional */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleSelectTipoConta("PROFISSIONAL", "CadastroProfissional")}
            disabled={loading}
            className="bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-yellow-400 transition-all duration-300 disabled:opacity-50 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <UserRound className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Profissional
            </h3>

            <p className="text-gray-600 mb-6">
              {user.vertical === "ODONTOLOGIA" ? "Dentista buscando vagas" : "Médico buscando vagas"}
            </p>

            <div className="py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl group-hover:shadow-lg transition-all">
              Continuar →
            </div>
          </motion.button>

          {/* Clínica/Consultório */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleSelectTipoConta("CLINICA", "CadastroClinica")}
            disabled={loading}
            className="bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-pink-400 transition-all duration-300 disabled:opacity-50 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Clínica / Consultório
            </h3>

            <p className="text-gray-600 mb-6">
              Quero contratar profissionais
            </p>

            <div className="py-3 px-6 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-2xl group-hover:shadow-lg transition-all">
              Continuar →
            </div>
          </motion.button>

          {/* Fornecedor */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleSelectTipoConta("FORNECEDOR", "CadastroFornecedor")}
            disabled={loading}
            className="bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-purple-400 transition-all duration-300 disabled:opacity-50 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Package className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Fornecedor / Revenda
            </h3>

            <p className="text-gray-600 mb-6">
              Anunciar produtos, equipamentos e promoções
            </p>

            <div className="py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-2xl group-hover:shadow-lg transition-all">
              Continuar →
            </div>
          </motion.button>

          {/* Hospital */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => handleSelectTipoConta("HOSPITAL", "CadastroHospital")}
            disabled={loading}
            className="bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-blue-400 transition-all duration-300 disabled:opacity-50 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Hospital className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Hospital
            </h3>

            <p className="text-gray-600 mb-6">
              Contratar médicos e gerenciar equipe
            </p>

            <div className="py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl group-hover:shadow-lg transition-all">
              Continuar →
            </div>
          </motion.button>

          {/* Instituição de Ensino */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => handleSelectTipoConta("INSTITUICAO", "CadastroInstituicao")}
            disabled={loading}
            className="bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-indigo-400 transition-all duration-300 disabled:opacity-50 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <GraduationCap className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Instituição de Ensino
            </h3>

            <p className="text-gray-600 mb-6">
              Oferecer cursos e especializações
            </p>

            <div className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-2xl group-hover:shadow-lg transition-all">
              Continuar →
            </div>
          </motion.button>
        </div>

        {/* Info Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
            <span className="text-2xl">{verticalEmoji}</span>
            <span className="font-bold text-gray-900">Você está em: {verticalNome}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
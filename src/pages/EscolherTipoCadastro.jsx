import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, UserRound, Building2, CheckCircle, Package, Hospital } from "lucide-react";

export default function EscolherTipoCadastro() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 overflow-hidden">
      {/* Elementos Decorativos */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-30 hidden md:block"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl opacity-30 hidden md:block"></div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute top-40 right-20 text-4xl hidden md:block"
      >
        ⚡
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        className="absolute bottom-40 left-20 text-4xl hidden md:block"
      >
        ⚡
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Header/Logo */}
        <div className="pt-8 pb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center shadow-xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">
            NEW JOBS
          </h1>
          <p className="text-gray-500 text-sm">Plataforma de Saúde</p>
        </div>

        {/* Título Principal */}
        <div className="text-center mb-10 px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-3xl"
            >
              ✨
            </motion.span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
              Qual é o seu perfil?
            </h2>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.75 }}
              className="text-3xl"
            >
              ✨
            </motion.span>
          </div>
          <p className="text-gray-600 text-lg">Escolha como deseja se cadastrar</p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-4 mb-8">
          {/* Card Profissional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/CadastroProfissional")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 cursor-pointer group relative"
          >
            {/* Ícone Central */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
            >
              <UserRound className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>

            {/* Título */}
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
              Sou Profissional
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Dentista, Médico ou Especialista
            </p>

            {/* Lista de Benefícios */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Encontre vagas na sua região</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Receba propostas de clínicas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Perfil profissional completo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Match inteligente com vagas</span>
              </div>
            </div>

            {/* Botão */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Cadastrar como Profissional →
            </motion.button>
          </motion.div>

          {/* Card Clínica */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate("/CadastroClinica")}
            className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-transparent hover:border-pink-400 hover:shadow-pink-200/50 transition-all duration-300 cursor-pointer group"
          >
            {/* Ícone Central */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-400 via-red-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
            >
              <Building2 className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>

            {/* Título */}
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
              Sou Clínica
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Clínica, Consultório ou Hospital
            </p>

            {/* Lista de Benefícios */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Encontre profissionais qualificados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Publique vagas ilimitadas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Gerencie candidaturas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Contrate com segurança</span>
              </div>
            </div>

            {/* Botão */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Cadastrar como Clínica →
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-4">
          <span className="text-gray-600">Já tem uma conta? </span>
          <button
            onClick={() => navigate("/login")}
            className="text-yellow-500 hover:text-yellow-600 font-bold ml-2 hover:underline transition-colors"
          >
            Fazer login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, UserRound, Building2, CheckCircle, Package, Hospital, GraduationCap } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-8">
          {/* Card Profissional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/CadastroProfissional")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 cursor-pointer group relative"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
              <UserRound className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">
              Sou Profissional
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Busco vagas e oportunidades
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Cadastrar →
            </motion.button>
          </motion.div>

          {/* Card Freelancer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            onClick={() => navigate("/CadastroFreelancer")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-purple-400 transition-all duration-300 cursor-pointer group relative"
          >
            <span className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full">
              NOVO
            </span>

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <Briefcase className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">
              Sou Freelancer
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Trabalho por projeto
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Cadastrar →
            </motion.button>
          </motion.div>

          {/* Card Clínica */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => navigate("/CadastroClinica")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 cursor-pointer group relative"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-xl">
              <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">
              Tenho uma Clínica/Consultório
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Quero contratar profissionais
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Cadastrar →
            </motion.button>
          </motion.div>

          {/* Card Fornecedor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate("/CadastroFornecedor")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 cursor-pointer group relative"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl">
              <Package className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">
              Sou Fornecedor
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Quero anunciar produtos e promoções
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Cadastrar →
            </motion.button>
          </motion.div>

          {/* Card Hospital */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={() => navigate("/CadastroHospital")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 cursor-pointer group relative"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl">
              <Hospital className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">
              Sou Hospital/Rede
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Contratação em grande escala
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Cadastrar →
            </motion.button>
          </motion.div>

          {/* Card Instituição de Ensino */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => navigate("/CadastroInstituicao")}
            className="bg-white rounded-3xl p-6 shadow-xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 cursor-pointer group relative"
          >
            <span className="absolute top-2 right-2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
              NOVO
            </span>

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-xl">
              <GraduationCap className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">
              Instituição de Ensino
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              Publicar cursos e pós-graduações
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Cadastrar →
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
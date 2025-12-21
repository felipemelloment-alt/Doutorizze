import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  UserCircle, 
  Building2, 
  ArrowRight,
  Briefcase,
  Stethoscope,
  Zap
} from "lucide-react";

export default function EscolherTipoCriador() {
  const navigate = useNavigate();
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const continuar = () => {
    if (!tipoSelecionado) return;
    navigate(createPageUrl("CriarSubstituicao"), { 
      state: { criado_por_tipo: tipoSelecionado } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Decoração */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute top-4 right-8 text-4xl animate-pulse">⚡</div>
          <div className="absolute bottom-4 left-8 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>⚡</div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
              🔄
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              SUBSTITUIÇÃO URGENTE
            </h1>
            <p className="text-white/90 text-lg">
              Vamos começar! Quem está criando a vaga?
            </p>
          </div>
        </motion.div>

        {/* Pergunta Principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Quem vai criar a vaga?
          </h2>
          <p className="text-gray-600 text-lg">
            Selecione abaixo para continuar
          </p>
        </motion.div>

        {/* Cards de Seleção */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Card Profissional */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setTipoSelecionado("PROFISSIONAL")}
            className={`group relative bg-white rounded-3xl p-8 border-4 transition-all duration-300 hover:scale-105 ${
              tipoSelecionado === "PROFISSIONAL"
                ? "border-yellow-400 shadow-2xl shadow-yellow-200"
                : "border-gray-200 hover:border-yellow-300 shadow-xl hover:shadow-2xl"
            }`}
          >
            {/* Badge Selecionado */}
            {tipoSelecionado === "PROFISSIONAL" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              >
                ✓
              </motion.div>
            )}

            {/* Ícone */}
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
              tipoSelecionado === "PROFISSIONAL"
                ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                : "bg-gradient-to-br from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200"
            }`}>
              <UserCircle className={`w-12 h-12 ${
                tipoSelecionado === "PROFISSIONAL" ? "text-white" : "text-yellow-600"
              }`} />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              👨‍⚕️ EU (Profissional)
            </h3>

            {/* Descrição */}
            <p className="text-gray-600 text-base mb-4">
              Preciso de alguém para me substituir na clínica onde trabalho
            </p>

            {/* Exemplos */}
            <div className="bg-yellow-50 rounded-xl p-4 text-left">
              <p className="text-sm text-gray-700 font-semibold mb-2">Exemplos:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Vou viajar e preciso de substituto</li>
                <li>• Tenho um compromisso importante</li>
                <li>• Férias programadas</li>
              </ul>
            </div>

            {/* Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
              <Briefcase className="w-4 h-4 text-yellow-700" />
              <span className="text-sm font-bold text-yellow-700">Você escolhe o substituto</span>
            </div>
          </motion.button>

          {/* Card Clínica */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setTipoSelecionado("CLINICA")}
            className={`group relative bg-white rounded-3xl p-8 border-4 transition-all duration-300 hover:scale-105 ${
              tipoSelecionado === "CLINICA"
                ? "border-pink-400 shadow-2xl shadow-pink-200"
                : "border-gray-200 hover:border-pink-300 shadow-xl hover:shadow-2xl"
            }`}
          >
            {/* Badge Selecionado */}
            {tipoSelecionado === "CLINICA" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              >
                ✓
              </motion.div>
            )}

            {/* Ícone */}
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
              tipoSelecionado === "CLINICA"
                ? "bg-gradient-to-br from-pink-400 to-red-500"
                : "bg-gradient-to-br from-pink-100 to-red-100 group-hover:from-pink-200 group-hover:to-red-200"
            }`}>
              <Building2 className={`w-12 h-12 ${
                tipoSelecionado === "CLINICA" ? "text-white" : "text-pink-600"
              }`} />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              🏥 CLÍNICA
            </h3>

            {/* Descrição */}
            <p className="text-gray-600 text-base mb-4">
              A clínica precisa de um profissional para substituição
            </p>

            {/* Exemplos */}
            <div className="bg-pink-50 rounded-xl p-4 text-left">
              <p className="text-sm text-gray-700 font-semibold mb-2">Exemplos:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Profissional saiu da clínica</li>
                <li>• Cobertura temporária urgente</li>
                <li>• Reforço em dias específicos</li>
              </ul>
            </div>

            {/* Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-red-100 rounded-full">
              <Stethoscope className="w-4 h-4 text-pink-700" />
              <span className="text-sm font-bold text-pink-700">Clínica escolhe o candidato</span>
            </div>
          </motion.button>
        </div>

        {/* Informação Importante */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Como funciona?</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
                  <span>Você cria a vaga com todos os detalhes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
                  <span>Profissionais se candidatam</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
                  <span>Você escolhe o melhor candidato</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">4</span>
                  <span>Confirmação via WhatsApp com a clínica</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">5</span>
                  <span>Substituição realizada! ✅</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Botão Continuar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={continuar}
            disabled={!tipoSelecionado}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
              tipoSelecionado
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {tipoSelecionado ? "CONTINUAR" : "SELECIONE UMA OPÇÃO"}
            {tipoSelecionado && <ArrowRight className="w-6 h-6" />}
          </button>
        </motion.div>

        {/* Estatísticas */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mt-8"
        >
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-black gradient-yellow-pink bg-clip-text text-transparent">250+</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Substituições realizadas</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-black gradient-yellow-pink bg-clip-text text-transparent">98%</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Taxa de sucesso</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-black gradient-yellow-pink bg-clip-text text-transparent">4.9⭐</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Avaliação média</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
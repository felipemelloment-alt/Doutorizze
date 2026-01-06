import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Briefcase,
  Zap,
  ShoppingBag,
  Sparkles
} from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          navigate(createPageUrl("Feed"));
        }
      }, 8000);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (!isMounted) return;

        setUser(currentUser);

        if (currentUser?.onboarding_completo) {
          redirectToDashboard();
          return;
        }

        // Detectar tipo de usuário (paralelo - otimizado)
        const [professionals, owners, suppliers, hospitals] = await Promise.all([
          base44.entities.Professional.filter({ user_id: currentUser.id }),
          base44.entities.CompanyOwner.filter({ user_id: currentUser.id }),
          base44.entities.Supplier.filter({ user_id: currentUser.id }),
          base44.entities.Hospital.filter({ user_id: currentUser.id })
        ]);

        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          return;
        }
        if (owners.length > 0) {
          setUserType("CLINICA");
          return;
        }
        if (suppliers.length > 0) {
          setUserType("FORNECEDOR");
          return;
        }
        if (hospitals.length > 0) {
          setUserType("HOSPITAL");
          return;
        }
      } catch (error) {
        clearTimeout(timeoutId);
      }
    };
    loadUser();

    return () => { isMounted = false; };
  }, []);

  const redirectToDashboard = () => {
    if (userType === "PROFISSIONAL") {
      navigate(createPageUrl("NewJobs"));
    } else if (userType === "CLINICA") {
      navigate(createPageUrl("DashboardClinica"));
    } else if (userType === "FORNECEDOR") {
      navigate(createPageUrl("DashboardFornecedor"));
    } else if (userType === "HOSPITAL") {
      navigate(createPageUrl("DashboardHospital"));
    } else {
      navigate(createPageUrl("Feed"));
    }
  };

  const handleComplete = async () => {
    try {
      // Marcar onboarding como completo
      await base44.auth.updateMe({ onboarding_completo: true });
      redirectToDashboard();
    } catch (error) {
      redirectToDashboard();
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      icon: Sparkles,
      title: "Bem-vindo ao Doutorizze!",
      description: "A maior plataforma de vagas para profissionais de saúde",
      color: "from-yellow-400 via-orange-500 to-pink-500",
      illustration: "👋"
    },
    {
      icon: Briefcase,
      title: "Encontre vagas perfeitas para você",
      description: "Nosso algoritmo encontra oportunidades que combinam com seu perfil",
      color: "from-blue-400 via-blue-500 to-blue-600",
      illustration: "🎯"
    },
    {
      icon: Zap,
      title: "Ative o New Jobs",
      description: "Receba alertas instantâneos de vagas com match perfeito",
      color: "from-yellow-400 via-yellow-500 to-orange-500",
      illustration: "⚡"
    },
    {
      icon: ShoppingBag,
      title: "Compre e venda equipamentos",
      description: "Marketplace exclusivo para profissionais de saúde",
      color: "from-green-400 via-green-500 to-green-600",
      illustration: "🛒"
    }
  ];

  const currentStepData = steps[currentStep];

  if (!user || !userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 relative overflow-hidden flex flex-col">
      {/* Botão Pular */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={handleSkip}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 font-bold transition-all hover:bg-white/50 rounded-full"
        >
          Pular
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Ilustração/Emoji Animado */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <div className="text-9xl mb-6 animate-bounce">
                  {currentStepData.illustration}
                </div>
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-2xl`}>
                  <currentStepData.icon className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
              >
                {currentStepData.title}
              </motion.h1>

              {/* Descrição */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8 max-w-lg mx-auto"
              >
                {currentStepData.description}
              </motion.p>

              {/* Indicadores de Progresso */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-3 rounded-full transition-all ${
                      index === currentStep
                        ? "w-12 bg-gradient-to-r " + currentStepData.color
                        : "w-3 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </motion.div>

              {/* Botões de Navegação */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4"
              >
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Voltar
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className={`px-8 py-4 bg-gradient-to-r ${currentStepData.color} text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2`}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Começar
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Elementos Decorativos */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "linear"
        }}
        className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-20"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 25,
          ease: "linear"
        }}
        className="absolute -bottom-24 -right-24 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"
      />
    </div>
  );
}
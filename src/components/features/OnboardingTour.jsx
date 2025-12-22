import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * Tour guiado para primeiro acesso
 */
export default function OnboardingTour({ steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar se já viu o tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setShow(false);
    onComplete?.();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    handleComplete();
  };

  if (!show) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
      >
        {/* Spotlight effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute bg-white/10 rounded-3xl"
            style={{
              top: step.targetPosition?.top || '50%',
              left: step.targetPosition?.left || '50%',
              width: step.targetPosition?.width || '200px',
              height: step.targetPosition?.height || '200px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold opacity-90">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <button
                onClick={skip}
                className="text-white/80 hover:text-white text-sm font-semibold"
              >
                Pular Tour
              </button>
            </div>
            <h3 className="text-2xl font-black">{step.title}</h3>
          </div>

          {/* Body */}
          <div className="p-6">
            {step.emoji && (
              <div className="text-6xl text-center mb-4">{step.emoji}</div>
            )}
            {step.icon && (
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <step.icon className="w-8 h-8 text-orange-500" />
              </div>
            )}
            <p className="text-gray-700 text-center mb-6">{step.description}</p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-orange-500'
                      : index < currentStep
                      ? 'w-2 bg-green-500'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
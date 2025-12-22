import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * Barra de progresso para perfis e cadastros
 */
export default function ProgressBar({ steps, currentStep }) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Progresso do Perfil</h3>
        <span className="text-2xl font-black text-orange-500">{Math.round(progress)}%</span>
      </div>

      {/* Barra */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCompleted ? 'bg-green-50' : isCurrent ? 'bg-orange-50' : 'bg-gray-50'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className={`w-6 h-6 flex-shrink-0 ${isCurrent ? 'text-orange-500' : 'text-gray-300'}`} />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${isCompleted ? 'text-green-700' : isCurrent ? 'text-orange-700' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
              {isCompleted && (
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ Completo
                </span>
              )}
            </div>
          );
        })}
      </div>

      {progress < 100 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>Complete 100%</strong> para receber 3x mais oportunidades!
          </p>
        </div>
      )}
    </div>
  );
}
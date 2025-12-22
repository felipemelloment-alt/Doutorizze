import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente Card padronizado
 */
export default function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  gradient = 'from-yellow-400 to-orange-500',
  onClick,
  className = '',
  noPadding = false,
  delay = 0
}) {
  const content = (
    <>
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          {title && (
            <div>
              <h2 className="text-xl font-black text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}
        </div>
      )}
      {children}
    </>
  );

  const baseClasses = `bg-white rounded-3xl shadow-xl ${noPadding ? '' : 'p-6'} ${onClick ? 'cursor-pointer hover:shadow-2xl' : ''} ${className}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={baseClasses}
    >
      {content}
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ 
  icon: Icon, 
  emoji,
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-xl p-12 text-center"
    >
      {emoji ? (
        <div className="text-7xl mb-6">{emoji}</div>
      ) : Icon ? (
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
          <Icon className="w-12 h-12 text-orange-500" />
        </div>
      ) : null}
      
      <h3 className="text-3xl font-black text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
          >
            {actionLabel}
          </button>
        )}
        
        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }) {
  const sizes = {
    sm: 'h-8 w-8 border-2',
    md: 'h-16 w-16 border-4',
    lg: 'h-24 w-24 border-4',
  };

  const spinner = (
    <div className="text-center">
      <div className={`animate-spin rounded-full ${sizes[size]} border-b-orange-500 mx-auto mb-4`}></div>
      {text && <p className="text-gray-600 font-semibold">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        {spinner}
      </div>
    );
  }

  return spinner;
}
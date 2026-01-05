/**
 * DESIGN SYSTEM - TOKENS
 * Valores consistentes para todo o app
 */

export const colors = {
  // Primárias
  primary: {
    yellow: '#F9B500',
    orange: '#FB923C',
    pink: '#E94560',
  },
  
  // Gradientes principais
  gradients: {
    primary: 'from-yellow-400 via-orange-500 to-pink-500',
    secondary: 'from-pink-500 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-indigo-600',
  },

  // Status
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
};

export const spacing = {
  cardPadding: 'p-6',
  sectionGap: 'space-y-6',
  containerMax: 'max-w-4xl',
};

export const typography = {
  h1: 'text-3xl md:text-4xl font-black',
  h2: 'text-xl md:text-2xl font-black',
  h3: 'text-lg font-bold',
  body: 'text-base',
  small: 'text-sm',
};

export const shadows = {
  card: 'shadow-xl',
  cardHover: 'hover:shadow-2xl',
  button: 'shadow-lg',
};

export const borders = {
  card: 'rounded-3xl',
  button: 'rounded-2xl',
  input: 'rounded-xl',
  badge: 'rounded-full',
};
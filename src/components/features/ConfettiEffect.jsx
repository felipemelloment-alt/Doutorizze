import confetti from 'canvas-confetti';

/**
 * Efeitos de confetti para celebrações
 */

export const confettiEffects = {
  // Sucesso padrão
  success: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F9B500', '#FB923C', '#E94560']
    });
  },

  // Match perfeito
  superMatch: () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F9B500', '#FB923C']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E94560', '#FB923C']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },

  // Primeira contratação
  firstHire: () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#F9B500', '#FB923C', '#E94560']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#F9B500', '#FB923C', '#E94560']
      });
    }, 250);
  },

  // Aprovação de cadastro
  approved: () => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });
  }
};
import React from "react";

export default function NeonLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FF00FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="neonGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF00FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Linhas diagonais */}
      <path
        d="M0 600 Q 300 400 600 500 T 1200 300"
        stroke="url(#neonGradient1)"
        strokeWidth="2"
        fill="none"
        filter="url(#glow)"
      />
      <path
        d="M0 200 Q 400 300 800 200 T 1200 400"
        stroke="url(#neonGradient2)"
        strokeWidth="1.5"
        fill="none"
        filter="url(#glow)"
      />
      <path
        d="M-100 700 Q 200 500 500 600 T 1300 400"
        stroke="#00FFFF"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        filter="url(#glow)"
      />
      <path
        d="M1200 100 Q 900 200 600 150 T 0 300"
        stroke="#FF00FF"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        filter="url(#glow)"
      />

      {/* Círculos decorativos */}
      <circle cx="150" cy="150" r="80" stroke="url(#neonGradient1)" strokeWidth="1" fill="none" opacity="0.2" />
      <circle cx="1050" cy="650" r="120" stroke="url(#neonGradient2)" strokeWidth="1" fill="none" opacity="0.15" />
      <circle cx="600" cy="400" r="200" stroke="#8B5CF6" strokeWidth="0.5" fill="none" opacity="0.1" />
    </svg>
  );
}
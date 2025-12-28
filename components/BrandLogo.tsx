
import React from 'react';

export const BrandLogo: React.FC<{ className?: string }> = ({ className = "h-8 w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background Square */}
      <rect width="100" height="100" fill="#7A2B83" />
      
      {/* Golden Sun */}
      <circle cx="50" cy="45" r="35" fill="#F9E219" />
      
      {/* Field Lines / Ground */}
      <path d="M0 65 Q 25 60, 50 65 T 100 65 L 100 100 L 0 100 Z" fill="#7A2B83" />
      <path d="M0 75 Q 25 70, 50 75 T 100 75" stroke="#F9E219" strokeWidth="3" />
      <path d="M0 85 Q 25 80, 50 85 T 100 85" stroke="#F9E219" strokeWidth="4" />
      <path d="M0 95 Q 25 90, 50 95 T 100 95" stroke="#F9E219" strokeWidth="5" />
      
      {/* Perspective field lines */}
      <line x1="20" y1="65" x2="5" y2="100" stroke="#F9E219" strokeWidth="2" opacity="0.6" />
      <line x1="40" y1="65" x2="35" y2="100" stroke="#F9E219" strokeWidth="2" opacity="0.6" />
      <line x1="60" y1="65" x2="65" y2="100" stroke="#F9E219" strokeWidth="2" opacity="0.6" />
      <line x1="80" y1="65" x2="95" y2="100" stroke="#F9E219" strokeWidth="2" opacity="0.6" />
    </svg>
  );
};

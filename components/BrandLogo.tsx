
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
      
      {/* Golden Sun - Sitting on the horizon */}
      <circle cx="50" cy="48" r="38" fill="#F9E219" />
      
      {/* Field Lines / Ground - Hand-drawn organic feel as per image */}
      <g>
        {/* Band 1 */}
        <path d="M0 52 L100 52 L100 56 L0 60 Z" fill="#7A2B83" />
        <path d="M0 60 L100 56 L100 62 L0 67 Z" fill="#F9E219" />
        
        {/* Band 2 */}
        <path d="M0 67 L100 62 L100 68 L0 74 Z" fill="#7A2B83" />
        <path d="M0 74 L100 68 L100 75 L0 82 Z" fill="#F9E219" />
        
        {/* Band 3 */}
        <path d="M0 82 L100 75 L100 82 L0 90 Z" fill="#7A2B83" />
        <path d="M0 90 L100 82 L100 90 L0 98 Z" fill="#F9E219" />
        
        {/* Band 4 */}
        <path d="M0 98 L100 90 L100 100 L0 100 Z" fill="#7A2B83" />
        <path d="M10 100 L100 98 L100 100 Z" fill="#F9E219" />
      </g>

      {/* TM Mark - Small detail from the original image */}
      <text 
        x="2" 
        y="98" 
        fill="#F9E219" 
        style={{ fontSize: '3px', fontWeight: 'bold', fontFamily: 'Arial' }}
        opacity="0.8"
      >
        TM
      </text>
    </svg>
  );
};

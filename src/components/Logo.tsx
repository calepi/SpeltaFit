import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizeClasses[size]} w-auto drop-shadow-lg`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Hexagon/Shield */}
        <path 
          d="M50 5L90 25V75L50 95L10 75V25L50 5Z" 
          className="fill-surface border-brand"
          stroke="currentColor" 
          strokeWidth="4"
          style={{ color: '#F27D26' }}
        />
        
        {/* Stylized 'S' and Lightning/Fitness element */}
        <path 
          d="M65 30L40 55H60L35 80L45 50H25L65 30Z" 
          fill="url(#brandGradient)" 
        />
        
        <defs>
          <linearGradient id="brandGradient" x1="25" y1="30" x2="65" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F27D26" />
            <stop offset="1" stopColor="#D96514" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col justify-center">
        <span className="font-black tracking-tighter leading-none" style={{ fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : size === 'lg' ? '2rem' : '3rem' }}>
          <span className="text-text-main">SPELTA</span>
          <span className="text-brand">FIT</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[0.65em] font-bold text-text-muted tracking-[0.2em] uppercase leading-none mt-1">
            Virtual Trainer
          </span>
        )}
      </div>
    </div>
  );
}

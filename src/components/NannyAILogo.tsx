import React from 'react';
import { cn } from '@/lib/utils';

interface NannyAILogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NannyAILogo: React.FC<NannyAILogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
    >
      <rect width="32" height="32" rx="6" className="fill-primary"/>
      <path 
        d="M8 12h16M8 16h12M8 20h8" 
        className="stroke-primary-foreground" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <circle cx="24" cy="20" r="3" className="fill-primary-foreground"/>
      <path 
        d="M22.5 18.5l3 3" 
        className="stroke-primary-foreground" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default NannyAILogo;

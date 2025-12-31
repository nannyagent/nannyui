import React from 'react';
import { cn } from '@/lib/utils';

interface NannyAILogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NannyAILogo: React.FC<NannyAILogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <img 
      src="https://avatars.githubusercontent.com/u/110624612" 
      alt="NannyAgent Logo" 
      className={cn(sizeClasses[size], "rounded-md object-cover", className)}
    />
  );
};

export default NannyAILogo;

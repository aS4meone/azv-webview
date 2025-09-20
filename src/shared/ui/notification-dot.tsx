import React from 'react';
import { cn } from '@/shared/utils/cn';

interface NotificationDotProps {
  show?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationDot: React.FC<NotificationDotProps> = ({ 
  show = true, 
  className,
  size = 'md'
}) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div
      className={cn(
        "absolute rounded-full bg-red-500 border-2 border-white shadow-sm",
        sizeClasses[size],
        className
      )}
    />
  );
};

import React from 'react';
import { cn } from '@/shared/utils/cn';

interface BadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export const Badge: React.FC<BadgeProps> = ({ 
  count, 
  className, 
  maxCount = 99 
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full",
        className
      )}
    >
      {displayCount}
    </div>
  );
};

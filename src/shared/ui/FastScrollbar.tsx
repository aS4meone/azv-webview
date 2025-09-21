"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/shared/utils/cn';

interface FastScrollbarProps {
  children: React.ReactNode;
  className?: string;
  scrollContainerClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
}

export const FastScrollbar: React.FC<FastScrollbarProps> = ({
  children,
  className = '',
  scrollContainerClassName = '',
  thumbClassName = '',
  trackClassName = '',
  scrollContainerRef: externalRef,
  onScroll: externalOnScroll
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = externalRef || internalRef;
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);

  const updateScrollbar = useCallback(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollable = scrollHeight > clientHeight;
    
    setShowScrollbar(scrollable);
    
    if (scrollable) {
      const thumbHeightRatio = clientHeight / scrollHeight;
      const thumbHeight = Math.max(20, clientHeight * thumbHeightRatio);
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);
      
      setThumbHeight(thumbHeight);
      setThumbTop(thumbTop);
    }
  }, [scrollContainerRef]);

  const handleScroll = useCallback(() => {
    updateScrollbar();
    if (externalOnScroll) {
      externalOnScroll();
    }
  }, [updateScrollbar, externalOnScroll]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !trackRef.current || !scrollContainerRef?.current) return;

    const track = trackRef.current;
    const container = scrollContainerRef.current;
    const trackRect = track.getBoundingClientRect();
    const trackHeight = trackRect.height;
    const mouseY = e.clientY - trackRect.top;
    
    const scrollRatio = mouseY / trackHeight;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const newScrollTop = scrollRatio * maxScroll;
    
    container.scrollTop = newScrollTop;
  }, [isDragging, scrollContainerRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current || !scrollContainerRef?.current) return;

    const track = trackRef.current;
    const container = scrollContainerRef.current;
    const trackRect = track.getBoundingClientRect();
    const trackHeight = trackRect.height;
    const mouseY = e.clientY - trackRect.top;
    
    const scrollRatio = mouseY / trackHeight;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const newScrollTop = scrollRatio * maxScroll;
    
    container.scrollTop = newScrollTop;
  }, [scrollContainerRef]);

  useEffect(() => {
    updateScrollbar();
    
    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateScrollbar);
      
      // Наблюдатель за изменениями содержимого
      const observer = new ResizeObserver(updateScrollbar);
      observer.observe(container);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateScrollbar);
        observer.disconnect();
      };
    }
  }, [handleScroll, updateScrollbar, scrollContainerRef]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={cn('relative flex w-full', className)}>
      {/* Контейнер с содержимым */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'overflow-auto scrollbar-none flex-1',
          scrollContainerClassName
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {children}
      </div>

      {/* Кастомный скроллбар */}
      {showScrollbar && (
        <div
          className={cn(
            'w-3 flex-shrink-0 transition-opacity duration-200',
            isHovered || isDragging ? 'opacity-100' : 'opacity-70'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Трек скроллбара */}
          <div
            ref={trackRef}
            className={cn(
              'w-full h-full bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors relative',
              trackClassName
            )}
            onClick={handleTrackClick}
          >
            {/* Ползунок скроллбара */}
            <div
              ref={thumbRef}
              className={cn(
                'absolute w-full bg-black rounded-full cursor-grab active:cursor-grabbing hover:bg-gray-800 transition-all duration-200 shadow-sm',
                isHovered || isDragging ? 'bg-gray-800 shadow-md' : '',
                thumbClassName
              )}
              style={{
                height: `${thumbHeight}px`,
                top: `${thumbTop}px`,
              }}
              onMouseDown={handleMouseDown}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/icons";
import React, { useState, useRef, useEffect } from "react";

interface CarControlsSliderProps {
  onLock?: () => void;
  onUnlock?: () => void;

  isLocked?: boolean;
}

const LockClosedIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    className={className}
  >
    <path
      d="M2.0625 17.875C2.06359 18.7863 2.42611 19.6601 3.07053 20.3045C3.71495 20.9489 4.58865 21.3114 5.5 21.3125H16.5C17.4113 21.3114 18.2851 20.9489 18.9295 20.3045C19.5739 19.6601 19.9364 18.7863 19.9375 17.875V11C19.9364 10.208 19.6623 9.4405 19.1614 8.82699C18.6604 8.21347 17.9633 7.79141 17.1875 7.63194V5.5C17.186 4.22411 16.6785 3.00092 15.7763 2.09874C14.8741 1.19655 13.6509 0.689028 12.375 0.6875H9.625C8.34911 0.689028 7.12592 1.19655 6.22374 2.09874C5.32155 3.00092 4.81403 4.22411 4.8125 5.5V7.63194C4.03668 7.79141 3.33955 8.21347 2.83862 8.82699C2.33769 9.4405 2.06358 10.208 2.0625 11V17.875ZM6.1875 5.5C6.18859 4.58865 6.55111 3.71495 7.19553 3.07053C7.83995 2.42611 8.71365 2.06359 9.625 2.0625H12.375C13.2863 2.06359 14.1601 2.42611 14.8045 3.07053C15.4489 3.71495 15.8114 4.58865 15.8125 5.5V7.5625H6.1875V5.5ZM3.4375 11C3.43812 10.4532 3.65562 9.92894 4.04228 9.54228C4.42894 9.15562 4.95318 8.93812 5.5 8.9375H16.5C17.0468 8.93812 17.5711 9.15562 17.9577 9.54228C18.3444 9.92894 18.5619 10.4532 18.5625 11V17.875C18.5619 18.4218 18.3444 18.9461 17.9577 19.3327C17.5711 19.7194 17.0468 19.9369 16.5 19.9375H5.5C4.95318 19.9369 4.42894 19.7194 4.04228 19.3327C3.65562 18.9461 3.43812 18.4218 3.4375 17.875V11Z"
      fill="black"
    />
    <path
      d="M11 16.5C11.1823 16.5 11.3572 16.4276 11.4861 16.2986C11.6151 16.1697 11.6875 15.9948 11.6875 15.8125V13.0625C11.6875 12.8802 11.6151 12.7053 11.4861 12.5764C11.3572 12.4474 11.1823 12.375 11 12.375C10.8177 12.375 10.6428 12.4474 10.5139 12.5764C10.3849 12.7053 10.3125 12.8802 10.3125 13.0625V15.8125C10.3125 15.9948 10.3849 16.1697 10.5139 16.2986C10.6428 16.4276 10.8177 16.5 11 16.5Z"
      fill="black"
    />
  </svg>
);

const LockOpenIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5 3.25C17.2563 3.25 15.4375 5.06884 15.4375 7.3125V10.5625C17.2324 10.5625 18.6875 12.0176 18.6875 13.8125V21.125C18.6875 22.9199 17.2324 24.375 15.4375 24.375H4.0625C2.26757 24.375 0.8125 22.9199 0.8125 21.125V13.8125C0.8125 12.0176 2.26757 10.5625 4.0625 10.5625H13.8125V7.3125C13.8125 4.17139 16.3589 1.625 19.5 1.625C22.6411 1.625 25.1875 4.17139 25.1875 7.3125V11.375C25.1875 11.8237 24.8237 12.1875 24.375 12.1875C23.9263 12.1875 23.5625 11.8237 23.5625 11.375V7.3125C23.5625 5.06884 21.7437 3.25 19.5 3.25ZM4.0625 12.1875C3.16505 12.1875 2.4375 12.9151 2.4375 13.8125V21.125C2.4375 22.0224 3.16505 22.75 4.0625 22.75H15.4375C16.3349 22.75 17.0625 22.0224 17.0625 21.125V13.8125C17.0625 12.9151 16.3349 12.1875 15.4375 12.1875H4.0625Z"
      fill="#191919"
    />
    <path
      d="M9.6875 19.125C9.86984 19.125 10.0447 19.0526 10.1736 18.9236C10.3026 18.7947 10.375 18.6198 10.375 18.4375V15.6875C10.375 15.5052 10.3026 15.3303 10.1736 15.2014C10.0447 15.0724 9.86984 15 9.6875 15C9.50516 15 9.3303 15.0724 9.20136 15.2014C9.07243 15.3303 9 15.5052 9 15.6875V18.4375C9 18.6198 9.07243 18.7947 9.20136 18.9236C9.3303 19.0526 9.50516 19.125 9.6875 19.125Z"
      fill="#191919"
    />
  </svg>
);

export const CarControlsSlider = ({
  onLock,
  onUnlock,

  isLocked = false,
}: CarControlsSliderProps) => {
  const [slidePosition, setSlidePosition] = useState(0); // Позиция для анимации
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const currentTouchX = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const minSwipeDistance = 40; // уменьшили для более отзывчивого свайпа

  // Вычисление максимально допустимого смещения
  const getMaxOffset = () => {
    if (!containerRef.current || !sliderRef.current) return 100;

    const containerWidth = containerRef.current.clientWidth;
    const sliderWidth = sliderRef.current.clientWidth;
    const leftIconWidth = 44; // примерная ширина левой иконки + отступы
    const rightIconWidth = 44; // примерная ширина правой иконки + отступы

    // Максимальное смещение = расстояние до края минус ширина иконок
    const availableSpace =
      containerWidth - leftIconWidth - rightIconWidth - sliderWidth;
    const maxOffset = Math.max(availableSpace / 2, containerWidth * 0.3); // минимум 30% от ширины контейнера

    return Math.min(maxOffset, containerWidth * 0.4); // максимум 40% от ширины контейнера
  };

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Функция easing для более естественного движения
  const easeOutQuart = (t: number) => {
    return 1 - Math.pow(1 - t, 4);
  };

  // Анимация возврата в исходную позицию с плавной интерполяцией
  const resetPosition = () => {
    setIsAnimating(true);
    setIsDragging(false);

    const startPosition = slidePosition;
    const targetPosition = 0;
    const duration = 400; // увеличили длительность
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentPosition = lerp(
        startPosition,
        targetPosition,
        easedProgress
      );
      setSlidePosition(currentPosition);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setSlidePosition(0);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Очистка анимации при размонтировании
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Touch событий для свайпов
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    currentTouchX.current = e.targetTouches[0].clientX;
    setIsDragging(true);

    // Останавливаем текущую анимацию если она есть
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      setIsAnimating(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    touchEndX.current = e.targetTouches[0].clientX;
    currentTouchX.current = e.targetTouches[0].clientX;

    // Вычисляем смещение для реального времени
    const rawOffset = currentTouchX.current - touchStartX.current;
    const maxOffset = getMaxOffset();

    // Жесткое ограничение - просто упираемся в границы
    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));

    setSlidePosition(limitedOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    if (!touchStartX.current || !touchEndX.current) {
      resetPosition();
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const maxOffset = getMaxOffset();

    if (isLeftSwipe) {
      // Свайп влево = разблокировать (unlock/close)
      onUnlock?.();
      // Плавная анимация завершения - до самого края
      setSlidePosition(-maxOffset);
      setTimeout(resetPosition, 150);
    } else if (isRightSwipe) {
      // Свайп вправо = заблокировать (lock)
      onLock?.();
      // Плавная анимация завершения - до самого края
      setSlidePosition(maxOffset);
      setTimeout(resetPosition, 150);
    } else {
      // Если свайп недостаточный, плавно возвращаемся в исходную позицию
      resetPosition();
    }

    // Сброс значений
    touchStartX.current = 0;
    touchEndX.current = 0;
    currentTouchX.current = 0;
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-100 rounded-full flex items-center justify-between overflow-hidden"
    >
      <div className="pl-5">
        <LockClosedIcon className=" text-gray-700" />
      </div>

      {/* Navigation Controls with Swipe Support */}
      <div
        ref={sliderRef}
        className={`flex items-center bg-gray-800 rounded-full px-6 py-3 touch-pan-x select-none flex-shrink-0 ${
          !isDragging && !isAnimating
            ? "transition-transform duration-200 ease-out"
            : ""
        }`}
        style={{
          transform: `translateX(${slidePosition}px)`,
          willChange: "transform", // оптимизация для GPU
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => onUnlock?.()}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 ease-out"
        >
          <ArrowLeftIcon color="white" className="w-6 h-6" />
        </button>

        <div className="mx-4 w-8 h-1 bg-gray-600 rounded-full" />

        <button
          onClick={() => onLock?.()}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 ease-out"
        >
          <ArrowRightIcon color="white" className="w-6 h-6" />
        </button>
      </div>

      <div className="pr-7">
        <LockOpenIcon className=" text-gray-700" />
      </div>
    </div>
  );
};

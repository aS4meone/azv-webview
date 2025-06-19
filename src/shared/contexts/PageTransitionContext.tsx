"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionContextType {
  isTransitioning: boolean;
  startTransition: () => void;
  endTransition: () => void;
  variant: "fade" | "slide" | "scale" | "flip" | "push";
  setVariant: (variant: "fade" | "slide" | "scale" | "flip" | "push") => void;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
  flip: {
    initial: { opacity: 0, rotateX: 45, perspective: 1000 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -45 },
  },
  push: {
    initial: { opacity: 0, x: "50%" },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: "-50%" },
  },
};

const PageTransitionContext = createContext<
  PageTransitionContextType | undefined
>(undefined);

export const PageTransitionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [variant, setVariant] = useState<
    "fade" | "slide" | "scale" | "flip" | "push"
  >("fade");
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Add loading class immediately
    document.documentElement.classList.add("loading");

    // Remove loading class and add ready class after a small delay
    const timer = setTimeout(() => {
      setIsMounted(true);
      document.documentElement.classList.remove("loading");
      document.documentElement.classList.add("ready");
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const startTransition = () => setIsTransitioning(true);
  const endTransition = () => setIsTransitioning(false);

  if (!isMounted) {
    return null;
  }

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        startTransition,
        endTransition,
        variant,
        setVariant,
      }}
    >
      <div className="w-full h-full bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            variants={variants[variant]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.2,
            }}
            className="page-transition-ready"
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider"
    );
  }
  return context;
};

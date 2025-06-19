"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { usePageTransition } from "@/shared/contexts/PageTransitionContext";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fade" | "slide" | "scale" | "flip" | "push";
}

const variants = {
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
    },
  },
  slide: {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
    },
  },
  scale: {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
    },
  },
  flip: {
    initial: {
      opacity: 0,
      rotateX: 45,
      perspective: 1000,
    },
    animate: {
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      rotateX: -45,
    },
  },
  push: {
    initial: {
      opacity: 0,
      x: "50%",
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      x: "-50%",
    },
  },
};

export const PageTransition = ({
  children,
  className = "",
  variant = "slide",
}: PageTransitionProps) => {
  const { setVariant } = usePageTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (variant) {
      setVariant(variant);
    }
    return () => {
      setIsMounted(false);
    };
  }, [variant, setVariant]);

  if (!isMounted) {
    return <div className={`${className} opacity-0`}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

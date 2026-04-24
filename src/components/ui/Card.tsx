import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  glowHover?: boolean;
}

export function Card({ children, className = '', glowHover = true, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={glowHover ? { 
        y: -4,
        boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
        borderColor: "rgba(139, 92, 246, 0.5)"
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-panel rounded-2xl p-6 transition-colors duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

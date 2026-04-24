import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GradientTextProps extends HTMLMotionProps<"span"> {
  children: React.ReactNode;
  variant?: 'purple-cyan' | 'matrix-green' | 'cyan-blue';
}

export function GradientText({ 
  children, 
  className = '', 
  variant = 'purple-cyan',
  ...props 
}: GradientTextProps) {
  
  const gradients = {
    'purple-cyan': 'from-purple-400 via-fuchsia-500 to-cyan-400',
    'matrix-green': 'from-emerald-400 to-cyan-400',
    'cyan-blue': 'from-cyan-400 to-blue-500'
  };

  return (
    <motion.span
      className={`bg-clip-text text-transparent bg-gradient-to-r ${gradients[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.span>
  );
}

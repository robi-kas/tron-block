import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] border border-white/10",
    secondary: "glass-panel text-white hover:bg-white/10",
    outline: "border-2 border-purple-500/50 text-purple-400 hover:border-cyan-400 hover:text-cyan-400 bg-transparent",
    ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg font-bold"
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shine effect overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

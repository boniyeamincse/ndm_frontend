import React from 'react';
import { motion } from 'framer-motion';

/**
 * Task 13: Reusable Button Component System
 * Supports primary, accent, gold, and outline variants with consistent hover animations.
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false,
  isLoading = false,
  ...props 
}) => {
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary-500/20 ring-1 ring-primary/20',
    accent: 'bg-accent text-white hover:bg-accent-dark shadow-lg shadow-accent-500/20 ring-1 ring-accent/20',
    gold: 'bg-gold text-primary-dark hover:brightness-110 shadow-lg shadow-gold-500/20 ring-1 ring-gold/20',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary/50 dark:text-primary-light',
    ghost: 'text-primary hover:bg-primary/10 dark:text-primary-light dark:hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-bold',
  };

  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed leading-none';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;

import React from 'react';
import { motion } from 'framer-motion';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  animate = false,
  onClick,
  padding = 'md',
  rounded = 'md',
}) => {
  // Base styles
  const baseStyles = 'overflow-hidden transition-all duration-200';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-gray-100 shadow-sm',
    elevated: 'bg-white border border-gray-100 shadow-md',
    outlined: 'bg-white border border-gray-200',
    flat: 'bg-gray-50'
  };
  
  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7'
  };
  
  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full'
  };
  
  // Interactive styles
  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md' : '';
  
  // Combine all styles
  const cardStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${roundedStyles[rounded]} ${interactiveStyles} ${className}`;
  
  // Animation props
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};
  
  return (
    <motion.div
      className={cardStyles}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : {}}
      {...animationProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;

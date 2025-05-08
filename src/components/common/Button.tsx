import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Define our own IconType interface
type IconType = React.ComponentType<{ className?: string; size?: number }>;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  to?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  leftIcon,
  rightIcon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  to,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Disabled styles
  const disabledStyles = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';

  // Combine all styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`;

  // Button content
  const content = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {leftIcon && !isLoading && (
        <span className="mr-2 -ml-1">{leftIcon}</span>
      )}

      {Icon && iconPosition === 'left' && !isLoading && (
        <Icon className="mr-2 -ml-1" size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />
      )}

      {children}

      {Icon && iconPosition === 'right' && (
        <Icon className="ml-2 -mr-1" size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />
      )}

      {rightIcon && (
        <span className="ml-2 -mr-1">{rightIcon}</span>
      )}
    </>
  );

  // If 'to' prop is provided, render as Link
  if (to) {
    return (
      <Link to={to}>
        <motion.button
          className={buttonStyles}
          disabled={disabled || isLoading}
          whileHover={!(disabled || isLoading) ? { scale: 1.02 } : {}}
          whileTap={!(disabled || isLoading) ? { scale: 0.98 } : {}}
          type="button"
          {...props}
        >
          {content}
        </motion.button>
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <motion.button
      className={buttonStyles}
      disabled={disabled || isLoading}
      whileHover={!(disabled || isLoading) ? { scale: 1.02 } : {}}
      whileTap={!(disabled || isLoading) ? { scale: 0.98 } : {}}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;
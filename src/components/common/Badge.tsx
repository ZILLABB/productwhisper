import React from 'react';
import { IconType } from 'react-icons';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconType;
  children: React.ReactNode;
  className?: string;
  rounded?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  rounded = false,
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800'
  };
  
  // Rounded styles
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';
  
  // Combine all styles
  const badgeStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${roundedStyles} ${className}`;
  
  return (
    <span className={badgeStyles}>
      {Icon && <Icon className="mr-1" size={size === 'lg' ? 16 : size === 'md' ? 14 : 12} />}
      {children}
    </span>
  );
};

export default Badge;

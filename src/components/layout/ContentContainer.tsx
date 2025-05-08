import React from 'react';

interface ContentContainerProps {
  /**
   * The content to be displayed in the container
   */
  children: React.ReactNode;
  
  /**
   * The maximum width of the container
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  
  /**
   * The padding of the container
   */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to center the container
   */
  center?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ContentContainer provides a consistent container for content with configurable width and padding
 */
const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = 'md',
  center = true,
  className = '',
}) => {
  // Map max width to Tailwind classes
  const maxWidthMap = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    none: '',
  };
  
  // Map padding to Tailwind classes
  const paddingMap = {
    none: 'p-0',
    xs: 'px-2 py-1',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
    xl: 'px-8 py-6',
  };
  
  return (
    <div 
      className={`
        ${maxWidthMap[maxWidth]} 
        ${paddingMap[padding]} 
        ${center ? 'mx-auto' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default ContentContainer;

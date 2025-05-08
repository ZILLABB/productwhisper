import React from 'react';

interface FlexLayoutProps {
  /**
   * The content to be displayed in the flex container
   */
  children: React.ReactNode;
  
  /**
   * The direction of the flex container
   */
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  
  /**
   * The wrap behavior of the flex container
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /**
   * The justify content property
   */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  
  /**
   * The align items property
   */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  
  /**
   * The gap between flex items
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to make the container responsive
   * If true, will switch to column on small screens
   */
  responsive?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * FlexLayout provides a flexible layout with configurable properties
 */
const FlexLayout: React.FC<FlexLayoutProps> = ({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'start',
  gap = 'md',
  responsive = false,
  className = '',
}) => {
  // Map gap sizes to Tailwind classes
  const gapSizeMap = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  // Generate flex direction classes
  const getFlexDirection = () => {
    if (!responsive) return `flex-${direction}`;
    
    // For responsive layouts, default to column on small screens
    if (direction === 'row') return 'flex-col sm:flex-row';
    if (direction === 'row-reverse') return 'flex-col-reverse sm:flex-row-reverse';
    if (direction === 'col') return 'flex-col';
    return 'flex-col-reverse';
  };
  
  return (
    <div 
      className={`
        flex 
        ${getFlexDirection()} 
        flex-${wrap} 
        justify-${justify} 
        items-${align} 
        ${gapSizeMap[gap]} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default FlexLayout;

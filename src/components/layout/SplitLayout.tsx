import React from 'react';

interface SplitLayoutProps {
  /**
   * The content to be displayed in the left/primary side
   */
  primary: React.ReactNode;
  
  /**
   * The content to be displayed in the right/secondary side
   */
  secondary: React.ReactNode;
  
  /**
   * The ratio of the split (primary:secondary)
   */
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '1:4' | '4:1';
  
  /**
   * The direction of the split
   */
  direction?: 'horizontal' | 'vertical';
  
  /**
   * Whether to reverse the order on small screens
   */
  reverseOnMobile?: boolean;
  
  /**
   * The gap between the two sides
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SplitLayout provides a two-column layout with configurable ratio and direction
 */
const SplitLayout: React.FC<SplitLayoutProps> = ({
  primary,
  secondary,
  ratio = '1:1',
  direction = 'horizontal',
  reverseOnMobile = false,
  gap = 'md',
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
  
  // Map ratio to Tailwind grid classes
  const getRatioClasses = () => {
    switch (ratio) {
      case '1:2':
        return 'grid-cols-1 lg:grid-cols-3 [&>*:first-child]:lg:col-span-1 [&>*:last-child]:lg:col-span-2';
      case '2:1':
        return 'grid-cols-1 lg:grid-cols-3 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-1';
      case '1:3':
        return 'grid-cols-1 lg:grid-cols-4 [&>*:first-child]:lg:col-span-1 [&>*:last-child]:lg:col-span-3';
      case '3:1':
        return 'grid-cols-1 lg:grid-cols-4 [&>*:first-child]:lg:col-span-3 [&>*:last-child]:lg:col-span-1';
      case '1:4':
        return 'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-1 [&>*:last-child]:lg:col-span-4';
      case '4:1':
        return 'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-4 [&>*:last-child]:lg:col-span-1';
      default: // 1:1
        return 'grid-cols-1 lg:grid-cols-2';
    }
  };
  
  // Get direction classes
  const getDirectionClasses = () => {
    if (direction === 'vertical') {
      return 'grid-rows-2 grid-cols-1';
    }
    return '';
  };
  
  // Get mobile order classes
  const getMobileOrderClasses = () => {
    if (reverseOnMobile) {
      return '[&>*:first-child]:order-2 [&>*:last-child]:order-1 lg:[&>*:first-child]:order-1 lg:[&>*:last-child]:order-2';
    }
    return '';
  };
  
  return (
    <div 
      className={`
        grid 
        ${getRatioClasses()} 
        ${getDirectionClasses()} 
        ${getMobileOrderClasses()} 
        ${gapSizeMap[gap]} 
        ${className}
      `}
    >
      <div>{primary}</div>
      <div>{secondary}</div>
    </div>
  );
};

export default SplitLayout;

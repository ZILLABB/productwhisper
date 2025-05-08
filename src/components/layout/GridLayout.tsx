import React from 'react';

interface GridLayoutProps {
  /**
   * The content to be displayed in the grid
   */
  children: React.ReactNode;
  
  /**
   * The number of columns for different screen sizes
   */
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * The gap between grid items
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to center the grid items
   */
  center?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * GridLayout provides a responsive grid layout with configurable columns and gaps
 */
const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  center = false,
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
  
  // Generate responsive grid columns
  const getGridCols = () => {
    const colClasses = [];
    
    if (cols.sm) colClasses.push(`grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    
    return colClasses.join(' ');
  };
  
  return (
    <div 
      className={`grid ${getGridCols()} ${gapSizeMap[gap]} ${center ? 'justify-items-center' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GridLayout;

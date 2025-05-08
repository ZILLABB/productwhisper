import React from 'react';
import { motion } from 'framer-motion';

interface ElementProps {
  type: 'circle' | 'square' | 'triangle' | 'hexagon';
  size: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  duration: number;
  delay: number;
  opacity: number;
}

const Element: React.FC<ElementProps> = ({
  type,
  size,
  color,
  x,
  y,
  rotation,
  duration,
  delay,
  opacity,
}) => {
  // Generate shape based on type
  const renderShape = () => {
    switch (type) {
      case 'circle':
        return <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />;
      case 'square':
        return <div className="w-full h-full rounded-md" style={{ backgroundColor: color }} />;
      case 'triangle':
        return (
          <div
            className="w-0 h-0"
            style={{
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
            }}
          />
        );
      case 'hexagon':
        return (
          <div className="relative w-full h-full">
            <svg viewBox="0 0 100 100" width={size} height={size}>
              <polygon
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                fill={color}
              />
            </svg>
          </div>
        );
      default:
        return <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />;
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size,
        top: `${y}%`,
        left: `${x}%`,
        opacity,
      }}
      initial={{
        opacity: 0,
        scale: 0.5,
        rotate: 0,
      }}
      animate={{
        opacity: [0, opacity, opacity * 0.7, 0],
        scale: [0.5, 1, 0.8, 0.5],
        rotate: [0, rotation, rotation * 0.5, 0],
        x: [0, 20, -20, 0],
        y: [0, -20, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {renderShape()}
    </motion.div>
  );
};

interface FloatingElementsProps {
  count?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'mixed';
  className?: string;
  shapes?: Array<'circle' | 'square' | 'triangle' | 'hexagon'>;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  count = 15,
  variant = 'primary',
  className = '',
  shapes = ['circle', 'square'],
}) => {
  // Define color schemes based on variant
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return ['#2D5589', '#4682B4', '#6495ED', '#1E3A8A'];
      case 'secondary':
        return ['#D4AF37', '#FFD700', '#FFC125', '#B8860B'];
      case 'accent':
        return ['#C77DAF', '#DB7093', '#FF69B4', '#8B3A62'];
      case 'mixed':
        return ['#4682B4', '#FFD700', '#DB7093', '#7B68EE', '#20B2AA', '#1E3A8A', '#B8860B'];
      default:
        return ['#2D5589', '#4682B4', '#6495ED', '#1E3A8A'];
    }
  };

  const colors = getColors();

  const generateElements = () => {
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      const type = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.random() * 80 + 20; // Random size between 20-100px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 100; // Random x position (0-100%)
      const y = Math.random() * 100; // Random y position (0-100%)
      const rotation = Math.random() * 360; // Random rotation (0-360 degrees)
      const duration = Math.random() * 15 + 10; // Random duration between 10-25s
      const delay = Math.random() * 5; // Random delay between 0-5s
      const opacity = Math.random() * 0.3 + 0.2; // Random opacity between 0.2-0.5
      
      elements.push(
        <Element
          key={i}
          type={type}
          size={size}
          color={color}
          x={x}
          y={y}
          rotation={rotation}
          duration={duration}
          delay={delay}
          opacity={opacity}
        />
      );
    }
    
    return elements;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {generateElements()}
    </div>
  );
};

export default FloatingElements;

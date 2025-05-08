import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCircleProps {
  size: number;
  color: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const FloatingCircle: React.FC<FloatingCircleProps> = ({ size, color, x, y, duration, delay }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        filter: 'blur(8px)',
      }}
      initial={{ 
        x: `${x}%`, 
        y: `${y}%`, 
        opacity: 0,
        scale: 0.5 
      }}
      animate={{ 
        x: [`${x}%`, `${x + 5}%`, `${x - 5}%`, `${x}%`],
        y: [`${y}%`, `${y - 5}%`, `${y + 5}%`, `${y}%`],
        opacity: [0, 0.7, 0.5, 0],
        scale: [0.5, 1.2, 0.8, 0.5]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    />
  );
};

interface FloatingCirclesProps {
  count?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'mixed';
  className?: string;
}

const FloatingCircles: React.FC<FloatingCirclesProps> = ({
  count = 15,
  variant = 'primary',
  className = '',
}) => {
  // Define color schemes based on variant
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return ['rgba(28, 52, 84, 0.2)', 'rgba(45, 85, 137, 0.15)'];
      case 'secondary':
        return ['rgba(184, 134, 11, 0.15)', 'rgba(212, 175, 55, 0.1)'];
      case 'accent':
        return ['rgba(142, 85, 114, 0.15)', 'rgba(28, 52, 84, 0.1)'];
      case 'mixed':
        return [
          'rgba(28, 52, 84, 0.15)',
          'rgba(45, 85, 137, 0.1)',
          'rgba(184, 134, 11, 0.1)',
          'rgba(212, 175, 55, 0.08)',
          'rgba(142, 85, 114, 0.1)',
        ];
      default:
        return ['rgba(28, 52, 84, 0.2)', 'rgba(45, 85, 137, 0.15)'];
    }
  };

  const colors = getColors();

  const generateCircles = () => {
    const circles = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 80 + 20; // Random size between 20-100px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 100; // Random x position (0-100%)
      const y = Math.random() * 100; // Random y position (0-100%)
      const duration = Math.random() * 15 + 10; // Random duration between 10-25s
      const delay = Math.random() * 5; // Random delay between 0-5s
      
      circles.push(
        <FloatingCircle
          key={i}
          size={size}
          color={color}
          x={x}
          y={y}
          duration={duration}
          delay={delay}
        />
      );
    }
    
    return circles;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {generateCircles()}
    </div>
  );
};

export default FloatingCircles;

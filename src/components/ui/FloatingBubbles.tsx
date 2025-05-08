import React from 'react';
import { motion } from 'framer-motion';

interface BubbleProps {
  size: number;
  color: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const Bubble: React.FC<BubbleProps> = ({ size, color, x, y, duration, delay }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: `${y}%`,
        left: `${x}%`,
        filter: 'blur(8px)',
      }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: [0, 0.7, 0.5, 0],
        y: [100, -100],
        x: [x, x + Math.random() * 50 - 25],
        scale: [0.8, 1.2, 1, 0.8],
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

interface FloatingBubblesProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'mixed';
  count?: number;
  className?: string;
}

const FloatingBubbles: React.FC<FloatingBubblesProps> = ({
  variant = 'primary',
  count = 20,
  className = '',
}) => {
  // Define color schemes based on variant with higher contrast
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return ['#2D5589', '#4682B4', '#6495ED']; // Brighter blues
      case 'secondary':
        return ['#D4AF37', '#FFD700', '#FFC125']; // Brighter golds
      case 'accent':
        return ['#C77DAF', '#DB7093', '#FF69B4']; // Brighter pinks/mauves
      case 'mixed':
        return ['#4682B4', '#FFD700', '#DB7093', '#7B68EE', '#20B2AA']; // Brighter mixed colors
      default:
        return ['#2D5589', '#4682B4', '#6495ED'];
    }
  };

  const colors = getColors();

  const generateBubbles = () => {
    const bubbles = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 80 + 20; // Random size between 20-100px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 100; // Random x position (0-100%)
      const y = Math.random() * 100; // Random y position (0-100%)
      const duration = Math.random() * 15 + 10; // Random duration between 10-25s
      const delay = Math.random() * 10; // Random delay between 0-10s
      
      bubbles.push(
        <Bubble
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
    
    return bubbles;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {generateBubbles()}
    </div>
  );
};

export default FloatingBubbles;

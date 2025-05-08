import React from 'react';
import { motion } from 'framer-motion';

interface CircleProps {
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
  opacity: number;
}

const Circle: React.FC<CircleProps> = ({ size, x, y, delay, duration, color, opacity }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: opacity,
        filter: 'blur(40px)',
        zIndex: 0,
      }}
      initial={{ x, y, scale: 0.8 }}
      animate={{
        x: [x, x + 20, x - 20, x],
        y: [y, y - 20, y + 20, y],
        scale: [0.8, 1.1, 0.9, 0.8],
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

interface AnimatedBackgroundProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'dark';
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'primary',
  density = 'medium',
  className = '',
}) => {
  // Define color schemes based on variant
  const colorSchemes = {
    primary: ['rgba(28, 52, 84, 0.3)', 'rgba(45, 85, 137, 0.2)'],
    secondary: ['rgba(184, 134, 11, 0.2)', 'rgba(212, 175, 55, 0.15)'],
    accent: ['rgba(142, 85, 114, 0.2)', 'rgba(28, 52, 84, 0.15)'],
    dark: ['rgba(16, 32, 52, 0.3)', 'rgba(28, 52, 84, 0.2)'],
  };

  // Define number of circles based on density
  const circleCount = {
    low: 3,
    medium: 5,
    high: 8,
  };

  // Generate random circles
  const generateCircles = () => {
    const colors = colorSchemes[variant];
    const count = circleCount[density];
    const circles = [];

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 200 + 100; // Random size between 100-300px
      const x = Math.random() * 100 - 50; // Random x position
      const y = Math.random() * 100 - 50; // Random y position
      const delay = Math.random() * 2; // Random delay
      const duration = Math.random() * 10 + 15; // Random duration between 15-25s
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.3 + 0.1; // Random opacity between 0.1-0.4

      circles.push(
        <Circle
          key={i}
          size={size}
          x={x}
          y={y}
          delay={delay}
          duration={duration}
          color={color}
          opacity={opacity}
        />
      );
    }

    return circles;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {generateCircles()}
    </div>
  );
};

export default AnimatedBackground;

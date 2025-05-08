import React from 'react';
import { motion } from 'framer-motion';

interface PulsatingCircleProps {
  size?: number;
  color?: string;
  duration?: number;
  delay?: number;
  className?: string;
  pulseScale?: number;
  pulseOpacity?: [number, number];
}

const PulsatingCircle: React.FC<PulsatingCircleProps> = ({
  size = 100,
  color = '#4682B4',
  duration = 2.5,
  delay = 0,
  className = '',
  pulseScale = 1.2,
  pulseOpacity = [0.7, 0.2],
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Base circle */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      
      {/* Pulsating overlay */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, pulseScale, 1],
          opacity: [pulseOpacity[0], pulseOpacity[1], pulseOpacity[0]],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default PulsatingCircle;

import React, { useEffect, useRef } from 'react';

interface ConnectedDotsProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'mixed';
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

const ConnectedDots: React.FC<ConnectedDotsProps> = ({
  variant = 'primary',
  density = 'medium',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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

  // Define number of particles based on density
  const getParticleCount = () => {
    switch (density) {
      case 'low':
        return 40;
      case 'medium':
        return 80;
      case 'high':
        return 120;
      default:
        return 80;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getColors();
    const particleCount = getParticleCount();
    
    // Set canvas size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = 0.2 * (1 - distance / 100);
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [variant, density]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
};

export default ConnectedDots;

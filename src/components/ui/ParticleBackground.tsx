import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

interface ParticleBackgroundProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'mixed';
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  variant = 'primary',
  density = 'medium',
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

  // Define number of particles based on density - increased for better visibility
  const getParticleCount = () => {
    switch (density) {
      case 'low':
        return 50;
      case 'medium':
        return 100;
      case 'high':
        return 150;
      default:
        return 100;
    }
  };

  const colors = getColors();
  const particleCount = getParticleCount();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Particles
        id={`tsparticles-${variant}-${density}`}
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          fpsLimit: 120,
          particles: {
            color: {
              value: colors,
            },
            links: {
              color: {
                value: colors,
              },
              distance: 150,
              enable: true,
              opacity: 0.7,
              width: 2,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200,
              },
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: particleCount,
            },
            opacity: {
              value: 0.8,
              random: true,
              anim: {
                enable: true,
                speed: 0.5,
                opacity_min: 0.3,
                sync: false,
              },
            },
            shape: {
              type: ["circle", "triangle", "polygon"],
              polygon: {
                sides: 6,
              },
            },
            size: {
              value: { min: 3, max: 10 },
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 2,
                sync: false,
              },
            },
            twinkle: {
              lines: {
                enable: true,
                frequency: 0.05,
                opacity: 0.5,
                color: {
                  value: colors,
                },
              },
              particles: {
                enable: true,
                frequency: 0.05,
                opacity: 0.5,
                color: {
                  value: colors,
                },
              },
            },
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          detectRetina: true,
          background: {
            color: "transparent",
          },
        }}
      />
    </div>
  );
};

export default ParticleBackground;

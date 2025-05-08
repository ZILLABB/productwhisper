import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

interface FloatingParticlesProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'mixed';
  density?: 'low' | 'medium' | 'high';
  className?: string;
  mode?: 'bubbles' | 'circles' | 'connect';
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  variant = 'primary',
  density = 'medium',
  className = '',
  mode = 'bubbles',
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
        return 40;
      case 'medium':
        return 80;
      case 'high':
        return 120;
      default:
        return 80;
    }
  };

  const colors = getColors();
  const particleCount = getParticleCount();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Different configuration based on mode
  const getOptions = () => {
    const baseOptions = {
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        color: {
          value: colors,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: true,
          speed: 1.5,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: particleCount,
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 0.5,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: { min: 5, max: 30 },
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 5,
            sync: false,
          },
        },
      },
      detectRetina: true,
    };

    switch (mode) {
      case 'bubbles':
        return {
          fullScreen: { enable: false },
          fpsLimit: 120,
          particles: {
            groups: {
              z5000: {
                number: {
                  value: 70,
                },
                zIndex: {
                  value: 5000,
                },
              },
              z7500: {
                number: {
                  value: 30,
                },
                zIndex: {
                  value: 75,
                },
              },
              z2500: {
                number: {
                  value: 50,
                },
                zIndex: {
                  value: 25,
                },
              },
              z1000: {
                number: {
                  value: 40,
                },
                zIndex: {
                  value: 10,
                },
              },
            },
            number: {
              value: particleCount,
            },
            color: {
              value: colors,
              animation: {
                enable: true,
                speed: 20,
                sync: true,
              },
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.8,
              random: {
                enable: true,
                minimumValue: 0.5,
              },
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.3,
                sync: false,
              },
            },
            size: {
              value: {
                min: 5,
                max: 50,
              },
              random: {
                enable: true,
                minimumValue: 3,
              },
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 3,
                sync: false,
              },
            },
            move: {
              angle: {
                value: 10,
                offset: 0,
              },
              enable: true,
              gravity: {
                enable: false,
              },
              speed: 1,
              direction: "right",
              random: false,
              straight: false,
              outModes: {
                default: "out",
              },
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
            zIndex: {
              value: 5,
              opacityRate: 0.5,
            },
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: {
                enable: true,
                mode: "bubble",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 40,
                size: 40,
                duration: 0.4,
                opacity: 0.8,
              },
            },
          },
          detectRetina: true,
          background: {
            color: "transparent",
          },
          emitters: {
            position: {
              x: 0,
              y: 30,
            },
            rate: {
              delay: 7,
              quantity: 1,
            },
            size: {
              width: 0,
              height: 0,
            },
          },
        };
      case 'connect':
        return {
          fullScreen: { enable: false },
          fpsLimit: 120,
          particles: {
            number: {
              value: particleCount,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: colors,
              animation: {
                enable: true,
                speed: 10,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.5,
              random: false,
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1,
                sync: false,
              },
            },
            size: {
              value: {
                min: 1,
                max: 3,
              },
              random: {
                enable: true,
                minimumValue: 1,
              },
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.1,
                sync: false,
              },
            },
            links: {
              enable: true,
              distance: 100,
              color: {
                value: colors,
              },
              opacity: 0.7,
              width: 2,
              triangles: {
                enable: true,
                opacity: 0.3,
              },
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: false,
              straight: false,
              outModes: {
                default: "out",
              },
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: {
                enable: true,
                mode: "grab",
              },
              onClick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 140,
                links: {
                  opacity: 1,
                },
              },
              push: {
                quantity: 4,
              },
            },
          },
          detectRetina: true,
          background: {
            color: "transparent",
          },
        };
      case 'circles':
      default:
        return {
          fullScreen: { enable: false },
          fpsLimit: 120,
          particles: {
            number: {
              value: particleCount,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: colors,
            },
            shape: {
              type: "circle",
            },
            stroke: {
              width: 0,
            },
            opacity: {
              value: {
                min: 0.3,
                max: 0.8,
              },
              random: true,
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.3,
                sync: false,
              },
            },
            size: {
              value: {
                min: 5,
                max: 40,
              },
              random: true,
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 5,
                sync: false,
              },
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              outModes: {
                default: "out",
              },
              trail: {
                enable: true,
                length: 30,
                fillColor: "transparent",
              },
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: {
                enable: true,
                mode: "bubble",
              },
              onClick: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 250,
                size: 0,
                duration: 2,
                opacity: 0,
              },
              repulse: {
                distance: 400,
                duration: 0.4,
              },
            },
          },
          detectRetina: true,
          background: {
            color: "transparent",
          },
        };
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Particles
        id={`floating-particles-${variant}-${mode}`}
        init={particlesInit}
        options={getOptions()}
      />
    </div>
  );
};

export default FloatingParticles;

import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import type { CelestialZone } from '../../types/hardware';

interface PlanetaryGlobeProps {
  activeZone: CelestialZone | 'All';
  className?: string;
}

const ZONE_THEMES: Record<
  CelestialZone | 'All',
  {
    baseColor: [number, number, number];
    markerColor: [number, number, number];
    glowColor: [number, number, number];
    markers: Array<{ location: [number, number]; size: number }>;
  }
> = {
  All: {
    baseColor: [0.42, 0.39, 0.35],
    markerColor: [0.98, 0.24, 0.13],
    glowColor: [0.85, 0.68, 0.38],
    markers: [
      { location: [0.674, 23.472], size: 0.09 },    // Apollo 11 Tranquility
      { location: [20.131, 30.777], size: 0.08 },   // Apollo 17 Taurus-Littrow
      { location: [-3.015, -23.418], size: 0.07 },  // Surveyor 3
      { location: [18.444, 77.45], size: 0.09 },    // Ingenuity Jezero
      { location: [-2.348, -5.326], size: 0.08 },   // Opportunity Meridiani
      { location: [-14.568, 175.472], size: 0.08 }, // Spirit Gusev
      { location: [4.502, 135.623], size: 0.08 },   // InSight Elysium
      { location: [68.218, -125.749], size: 0.08 }, // Phoenix Arctic
      { location: [19.33, -33.55], size: 0.08 },    // Sojourner Ares Vallis
    ],
  },
  Moon: {
    baseColor: [0.58, 0.57, 0.54],
    markerColor: [0.98, 0.24, 0.13],
    glowColor: [0.88, 0.85, 0.78],
    markers: [
      { location: [0.674, 23.472], size: 0.11 },   // Apollo 11 Eagle & LRRR
      { location: [20.131, 30.777], size: 0.1 },   // Apollo 17 LRV-3
      { location: [-3.015, -23.418], size: 0.1 },  // Surveyor 3 & Apollo 12
    ],
  },
  Mars: {
    baseColor: [0.68, 0.31, 0.18],
    markerColor: [1.0, 0.82, 0.28],
    glowColor: [0.88, 0.42, 0.22],
    markers: [
      { location: [18.444, 77.45], size: 0.1 },     // Ingenuity
      { location: [-2.348, -5.326], size: 0.1 },    // Opportunity
      { location: [-14.568, 175.472], size: 0.1 },  // Spirit
      { location: [4.502, 135.623], size: 0.1 },    // InSight
      { location: [68.218, -125.749], size: 0.1 },  // Phoenix
      { location: [19.33, -33.55], size: 0.1 },     // Sojourner & Viking 1
    ],
  },
  'Asteroids & Dwarf Planets': {
    baseColor: [0.35, 0.36, 0.4],
    markerColor: [0.9, 0.66, 0.24],
    glowColor: [0.55, 0.58, 0.65],
    markers: [
      { location: [-43.0, -81.0], size: 0.12 },     // 433 Eros Himeros
      { location: [19.5, 239.0], size: 0.12 },      // Ceres Occator Crater
    ],
  },
  'Deep Space': {
    baseColor: [0.22, 0.26, 0.36],
    markerColor: [0.2, 1.0, 0.4],
    glowColor: [0.35, 0.5, 0.8],
    markers: [
      { location: [21.0, 68.9], size: 0.12 },       // Aldebaran Escape Vector
      { location: [44.5, -70.0], size: 0.12 },      // Cygnus-Lyra Kepler Field
    ],
  },
};

export const PlanetaryGlobe: React.FC<PlanetaryGlobeProps> = ({ activeZone, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);

  useEffect(() => {
    let phi = 0.4;
    let width = 0;
    let rafId: number;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth || 400;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const theme = ZONE_THEMES[activeZone] || ZONE_THEMES.All;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0.4,
      theta: 0.22,
      dark: 1,
      diffuse: 1.8,
      mapSamples: 14000,
      mapBrightness: 5.5,
      baseColor: theme.baseColor,
      markerColor: theme.markerColor,
      glowColor: theme.glowColor,
      markers: theme.markers,
    });

    const animate = () => {
      if (!pointerInteracting.current) {
        phi += 0.004;
      }
      globe.update({
        phi: phi + pointerInteractionMovement.current,
        width: width * 2,
        height: width * 2,
      });
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [activeZone]);

  return (
    <div className={`relative aspect-square w-full max-w-[460px] mx-auto select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta / 180;
          }
        }}
        className="h-full w-full cursor-grab transition-opacity duration-500"
      />
    </div>
  );
};

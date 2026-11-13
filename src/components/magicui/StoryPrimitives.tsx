import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* 1. Magic UI Particles Background (Interactive Deep Space Starfield) */
export const Particles: React.FC<{ quantity?: number; className?: string }> = ({
  quantity = 75,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: quantity }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.15,
      vy: -(Math.random() * 0.15 + 0.03),
      twinkleSpeed: Math.random() * 0.015 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.y += s.vy;
        if (s.y < 0) s.y = height;
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.9 || s.alpha < 0.15) s.twinkleSpeed = -s.twinkleSpeed;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 242, 235, ${s.alpha})`;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [quantity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none fixed inset-0 z-0', className)}
    />
  );
};

/* 2. Magic UI Meteors (Shooting Stars in Hero Prologue) */
export const Meteors: React.FC<{ number?: number }> = ({ number = 8 }) => {
  const meteors = Array.from({ length: number });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {meteors.map((_, idx) => {
        const left = `${Math.floor(Math.random() * 90) + 5}%`;
        const delay = `${(idx * 1.3).toFixed(1)}s`;
        const duration = `${Math.floor(Math.random() * 5) + 5}s`;
        return (
          <span
            key={idx}
            style={{
              top: '0px',
              left,
              animationDelay: delay,
              animationDuration: duration,
            }}
            className="animate-meteor absolute h-0.5 w-0.5 rotate-[215deg] rounded-full bg-amber-200/80 shadow-[0_0_0_1px_#ffffff10]"
          >
            <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[70px] -translate-y-1/2 bg-gradient-to-r from-amber-200/70 to-transparent" />
          </span>
        );
      })}
    </div>
  );
};

/* 3. Magic UI BlurFade (Smooth Editorial Scroll Reveal) */
export const BlurFade: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* 4. Magic UI TextReveal (Word-by-Word First-Person Story Quote) */
export const StoryQuoteReveal: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className }) => {
  const words = text.split(' ');
  return (
    <p className={cn('leading-relaxed', className)}>
      &ldquo;
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.15, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.018, 1.1) }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
      &rdquo;
    </p>
  );
};

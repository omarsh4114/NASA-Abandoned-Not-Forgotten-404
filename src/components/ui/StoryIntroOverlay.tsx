import React, { useState, useEffect, useRef } from 'react';
import { Orbit, Compass, Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';

export type MacroExperienceMode = 'solar-system' | 'museum-platform';

interface StoryIntroOverlayProps {
  isOpen: boolean;
  onSelectMode: (mode: MacroExperienceMode) => void;
}

const INTRO_NARRATIVE =
  'Across our solar system, dozens of robotic pioneers rest in eternal silence. They touched alien soil, braved Martian dust storms, and sailed into the interstellar dark. Their batteries have faded and their transmitters have gone quiet—but they are not forgotten. Step into the void to explore their monuments.';

export const StoryIntroOverlay: React.FC<StoryIntroOverlayProps> = ({
  isOpen,
  onSelectMode,
}) => {
  const [droneActive, setDroneActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const toggleAmbientDrone = () => {
    if (droneActive) {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setDroneActive(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.0);
      masterGain.connect(ctx.destination);

      // Deep warm cosmic fifth chord (C2, G2, D3, E3)
      const freqs = [65.41, 98.0, 146.83, 164.81];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;

        filter.type = 'lowpass';
        filter.frequency.value = 280;

        osc.connect(filter);
        filter.connect(masterGain);
        osc.start();
      });

      setDroneActive(true);
    } catch {
      setDroneActive(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950/90 p-6 sm:p-10 backdrop-blur-md select-none">
      {/* Top Bar: Brand & Ambient Audio Toggle */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">
            NASA Space Heritage Exhibition · Echoes of Silence
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleAmbientDrone}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-xl transition cursor-pointer ${
              droneActive
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                : 'border-white/15 bg-slate-900/70 text-slate-300 hover:border-white/35 hover:text-white'
            }`}
          >
            {droneActive ? (
              <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>{droneActive ? 'Ambient Space Drone: ON' : 'Ambient Space Drone'}</span>
          </button>
        </div>
      </div>

      {/* Center Narrative Sequence & 2-Mode Launch Portals */}
      <div className="mx-auto my-auto w-full max-w-5xl py-8 text-center space-y-10">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>13 Silent Pioneers · True 1:1 Metric Scale &amp; WebXR</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Echoes of Silence
          </h1>

          <blockquote className="mx-auto max-w-3xl text-base sm:text-xl leading-relaxed text-slate-200 font-normal italic">
            &ldquo;{INTRO_NARRATIVE}&rdquo;
          </blockquote>
        </div>

        {/* Two Glassmorphic Launch Portal Cards */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Choose Your Exploration Mode
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Portal 1: Solar System Explorer Mode */}
            <button
              type="button"
              onClick={() => onSelectMode('solar-system')}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-slate-900/65 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/70 hover:bg-slate-900/85 hover:shadow-[0_20px_60px_rgba(34,211,238,0.2)] cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
                    <Orbit className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-cyan-300">
                    MODE 01 · HELIOCENTRIC
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition">
                  Solar System Explorer Mode
                </h2>

                <p className="text-sm leading-relaxed text-slate-300">
                  Trace the real flight paths of each mission from Earth across the 3D solar system to their resting places—complete with a 3D cruise spacecraft flying along each trajectory before landing on the surface at 1:1 scale.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <span>Launch Solar System Explorer</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </button>

            {/* Portal 2: Orbital Museum Platform Mode */}
            <button
              type="button"
              onClick={() => onSelectMode('museum-platform')}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-slate-900/65 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/70 hover:bg-slate-900/85 hover:shadow-[0_20px_60px_rgba(251,191,36,0.2)] cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 text-amber-300">
                    <Compass className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-amber-300">
                    MODE 02 · CIS-LUNAR DECK
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition">
                  Orbital Museum Platform Mode
                </h2>

                <p className="text-sm leading-relaxed text-slate-300">
                  Walk a futuristic observation deck suspended in space where all 13 artifacts stand side-by-side at true 1:1 metric scale across Moon, Mars, and Deep Space wings, surrounded by the planets.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <span>Enter Orbital Museum Deck</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mx-auto w-full max-w-6xl text-center text-xs text-slate-400">
        Click any spacecraft inside to enter its horizon-to-horizon 1:1 Planetary Environment or live 1:1 AR Room View.
      </div>
    </div>
  );
};

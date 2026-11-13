import React from 'react';
import { Volume2, VolumeX, Award, BookOpen, ArrowDownRight, Hand } from 'lucide-react';
import type { CelestialZone, OperationalStatus } from '../types/hardware';
import { Meteors, BlurFade } from './magicui/StoryPrimitives';
import { PlanetaryGlobe } from './magicui/PlanetaryGlobe';

interface TelemetryReceiverHeroProps {
  selectedZone: CelestialZone | 'All';
  onSelectZone: (zone: CelestialZone | 'All') => void;
  selectedStatus: OperationalStatus | 'All';
  onSelectStatus: (status: OperationalStatus | 'All') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  discoveredCount: number;
  totalCount: number;
  onOpenPassport: () => void;
  onOpenCitations: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const CHAPTERS: Array<{
  zone: CelestialZone | 'All';
  num: string;
  title: string;
  coords: string;
}> = [
  { zone: 'All', num: '00', title: 'Complete Anthology', coords: '13 Sites · Solar System' },
  { zone: 'Moon', num: '01', title: 'Luna (The Moon)', coords: '4 Sites · 1.28 Light-Sec' },
  { zone: 'Mars', num: '02', title: 'Mars (Red Plains)', coords: '6 Sites · 1.52 AU' },
  { zone: 'Asteroids & Dwarf Planets', num: '03', title: 'Eros & Ceres', coords: '2 Sites · 2.77 AU' },
  { zone: 'Deep Space', num: '04', title: 'Interstellar Drift', coords: '130+ AU · Escape Vector' },
];

export const TelemetryReceiverHero: React.FC<TelemetryReceiverHeroProps> = ({
  selectedZone,
  onSelectZone,
  discoveredCount,
  totalCount,
  onOpenPassport,
  onOpenCitations,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="relative min-h-screen flex flex-col justify-between overflow-hidden px-6 sm:px-14 pt-7 pb-12 border-b border-white/10">
      <Meteors number={7} />

      {/* Editorial Publication Masthead */}
      <nav className="relative z-20 mx-auto w-full max-w-7xl flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#E5A93C]">
            ISSUE NO. 2026 · CAIRO SPACE APPS
          </span>
          <span className="hidden sm:inline text-white/20">/</span>
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
            SPAGHETTI CODERS ARCHIVE
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
          <button
            type="button"
            onClick={onToggleSound}
            className="flex items-center gap-1.5 text-stone-300 hover:text-[#E5A93C] transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-[#E5A93C]" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-stone-500" />
            )}
            <span>{soundEnabled ? 'SOUND: ON' : 'SOUND: OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPassport}
            className="flex items-center gap-1.5 text-[#F5F2EB] hover:text-[#E5A93C] transition cursor-pointer"
          >
            <Award className="h-3.5 w-3.5 text-[#E5A93C]" />
            <span>
              FIELD PASSPORT [{discoveredCount}/{totalCount}]
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCitations}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#FC3D21]" />
            <span>NASA SOURCES &amp; AI</span>
          </button>
        </div>
      </nav>

      {/* Split Editorial Exhibition Layout: Left Typography + Right Interactive 3D WebGL Globe */}
      <div className="relative z-10 mx-auto w-full max-w-7xl my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Editorial Exhibition Title & Narrative */}
        <div className="lg:col-span-7 text-left space-y-7">
          <BlurFade delay={0.05}>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FC3D21]">
              AN INTERACTIVE DOCUMENTARY FOR AGES 10–14
            </div>
          </BlurFade>

          <BlurFade delay={0.12}>
            <h1 className="font-serif-story text-6xl sm:text-8xl lg:text-[6.2rem] font-normal tracking-tight text-[#F5F2EB] leading-[0.94]">
              Echoes of <br />
              <span className="italic text-[#E5A93C]">Silence.</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.22}>
            <p className="max-w-xl text-base sm:text-xl text-stone-300 leading-relaxed font-normal">
              When NASA spacecraft run out of fuel or freeze in the Martian night, their metal bodies stay behind as eternal monuments. Spin the 3D planetary globe or scroll down to hear 13 silent machines tell their stories in their own words.
            </p>
          </BlurFade>

          <BlurFade delay={0.32}>
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <a
                href="#anthology-chapters"
                className="group inline-flex items-center gap-3 border-b-2 border-[#E5A93C] pb-2 font-mono text-xs uppercase tracking-[0.25em] text-[#F5F2EB] hover:text-[#E5A93C] transition"
              >
                <span>ENTER THE 13 STORIES</span>
                <ArrowDownRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </BlurFade>
        </div>

        {/* Right: Interactive 3D WebGL Planetary Globe (Cobe) */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
          <PlanetaryGlobe activeZone={selectedZone} />
          <div className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
            <Hand className="h-3.5 w-3.5 text-[#E5A93C]" />
            <span>Drag to Spin 3D Landing Coordinates · {selectedZone === 'All' ? 'Solar System' : selectedZone}</span>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Chapter Index Strip (Zero AI Pill Buttons — Pure Magazine Index) */}
      <div className="relative z-20 mx-auto w-full max-w-7xl border-t border-white/15 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {CHAPTERS.map((chap) => {
            const active = selectedZone === chap.zone;
            return (
              <button
                key={chap.zone}
                type="button"
                onClick={() => onSelectZone(chap.zone)}
                className={`group text-left border-t-2 pt-3 transition-all cursor-pointer ${
                  active
                    ? 'border-[#FC3D21] text-[#F5F2EB]'
                    : 'border-transparent text-stone-500 hover:border-white/30 hover:text-stone-200'
                }`}
              >
                <div className="flex items-baseline justify-between font-mono text-[11px]">
                  <span className={active ? 'text-[#FC3D21] font-bold' : 'text-stone-500'}>
                    CHAPTER {chap.num}
                  </span>
                  <span className="text-[10px] opacity-75">{chap.coords.split(' · ')[0]}</span>
                </div>
                <div className="font-serif-story text-xl sm:text-2xl italic mt-0.5">
                  {chap.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

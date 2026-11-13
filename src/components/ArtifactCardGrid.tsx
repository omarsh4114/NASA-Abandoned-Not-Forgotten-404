import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, Cpu, Check, MapPin, Calendar } from 'lucide-react';
import type { NasaArtifact, CelestialZone } from '../types/hardware';

interface ArtifactCardGridProps {
  artifacts: NasaArtifact[];
  discoveredIds: string[];
  onSelectArtifact: (artifact: NasaArtifact) => void;
}

const CHAPTER_CONFIG: Record<
  CelestialZone,
  {
    act: string;
    name: string;
    tagline: string;
    distance: string;
    accentColor: string;
    ambientGlow: string;
  }
> = {
  Moon: {
    act: 'ACT I · LUNA',
    name: 'The Sea of Tranquility',
    tagline: 'Four silent machines resting in untouched grey lunar regolith.',
    distance: '384,400 KM FROM EARTH',
    accentColor: '#E5A93C',
    ambientGlow: 'rgba(229, 169, 60, 0.14)',
  },
  Mars: {
    act: 'ACT II · MARS',
    name: 'The Rust-Red Plains',
    tagline: 'Six tireless explorers that braved global dust storms and arctic frost.',
    distance: '225,000,000 KM FROM EARTH',
    accentColor: '#FC3D21',
    ambientGlow: 'rgba(252, 61, 33, 0.14)',
  },
  'Asteroids & Dwarf Planets': {
    act: 'ACT III · THE BELT',
    name: 'Riders of Ancient Rubble',
    tagline: 'Two bold pioneers resting on Asteroid 433 Eros and orbiting icy Ceres.',
    distance: '414,000,000 KM FROM EARTH',
    accentColor: '#FFB000',
    ambientGlow: 'rgba(255, 176, 0, 0.14)',
  },
  'Deep Space': {
    act: 'ACT IV · INFINITY',
    name: 'Messengers to the Stars',
    tagline: 'Drifting past the planets with golden maps of Earth and 2,662 exoplanet memories.',
    distance: '130+ ASTRONOMICAL UNITS',
    accentColor: '#33FF66',
    ambientGlow: 'rgba(51, 255, 102, 0.12)',
  },
};

const ZONE_ORDER: CelestialZone[] = [
  'Moon',
  'Mars',
  'Asteroids & Dwarf Planets',
  'Deep Space',
];

/* Interactive 3D Perspective Tilt + Cursor Spotlight Card */
const SpotlightExhibitStage: React.FC<{
  artifact: NasaArtifact;
  indexNumber: string;
  isDiscovered: boolean;
  accentColor: string;
  onSelect: () => void;
}> = ({ artifact, indexNumber, isDiscovered, accentColor, onSelect }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activePinIndex, setActivePinIndex] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const activePin = artifact.hotspots[activePinIndex] || artifact.hotspots[0];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-[#090A0F]/90 p-6 sm:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      style={{
        backgroundImage: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(229, 169, 60, 0.09), transparent 45%)`,
      }}
    >
      {/* Top Exhibition Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-8">
        <div className="flex items-center gap-4">
          <span
            className="font-serif-story text-4xl sm:text-5xl italic leading-none"
            style={{ color: accentColor }}
          >
            {indexNumber}
          </span>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
              <span>{artifact.zone}</span>
              <span>·</span>
              <span className="text-[#F5F2EB]">
                {artifact.launchYear} — {artifact.endYear}
              </span>
            </div>
            <h3 className="font-serif-story text-2xl sm:text-4xl font-normal text-[#F5F2EB] mt-0.5">
              {artifact.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] text-[#E5A93C]">
            {artifact.statusCategory}
          </span>
          {isDiscovered && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              Logged
            </span>
          )}
        </div>
      </div>

      {/* Main Split Scrollytelling Stage: Left Interactive NASA Visual with Live Pins + Right First-Person Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left: Interactive NASA Visual Canvas with Live Glowing Anatomy Pins */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
            <img
              src={artifact.missionImageUrl}
              alt={artifact.name}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg';
              }}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

            {/* Live Interactive Engineering Pins Right on the Stage */}
            {artifact.hotspots.map((spot, idx) => {
              const active = idx === activePinIndex;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePinIndex(idx);
                  }}
                  style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'scale-125 bg-[#E5A93C] text-[#050508] shadow-[0_0_20px_#E5A93C] ring-4 ring-[#E5A93C]/30'
                      : 'border border-white/60 bg-black/80 text-white hover:scale-110'
                  }`}
                  title={spot.label}
                >
                  {idx + 1}
                </button>
              );
            })}

            {/* Bottom Coordinate & Pin Readout Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/75 px-3.5 py-2 backdrop-blur-md text-left">
              <div className="text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#E5A93C] block">
                  PIN 0{activePinIndex + 1} · {activePin?.label}
                </span>
                <span className="text-stone-300 text-[11px] line-clamp-1">
                  {activePin?.functionDescription}
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-400 shrink-0 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#FC3D21]" />
                {artifact.coordinates}
              </span>
            </div>
          </div>
        </div>

        {/* Right: First-Person Machine Voice & Interactive Triggers */}
        <div className="lg:col-span-5 text-left flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E5A93C]">
              <span className="h-2 w-2 rounded-full bg-[#E5A93C] animate-ping" />
              First-Person Memory Transmission
            </div>

            <blockquote className="font-serif-story text-xl sm:text-2xl italic leading-relaxed text-[#F5F2EB]">
              &ldquo;{artifact.kidFriendlyStory}&rdquo;
            </blockquote>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Discovery Unlocked for Humanity
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {artifact.scienceUnlocked}
              </p>
            </div>
          </div>

          {/* Interactive Action Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onSelect}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#F5F2EB] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#050508] hover:bg-[#E5A93C] transition cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Story &amp; Engineering Hotspots</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Archival Source Footnote */}
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-stone-400" />
          SITE: {artifact.locationName.toUpperCase()}
        </span>
        <span className="flex items-center gap-1.5 truncate max-w-md">
          <Cpu className="h-3.5 w-3.5 text-[#E5A93C]" />
          SOURCE: {artifact.nasaDataSource}
        </span>
      </div>
    </motion.div>
  );
};

export const ArtifactCardGrid: React.FC<ArtifactCardGridProps> = ({
  artifacts,
  discoveredIds,
  onSelectArtifact,
}) => {
  let globalCounter = 0;

  return (
    <div id="anthology-chapters" className="mx-auto max-w-7xl px-4 sm:px-10 py-16 space-y-28">
      {ZONE_ORDER.map((zone) => {
        const zoneArtifacts = artifacts.filter((a) => a.zone === zone);
        if (zoneArtifacts.length === 0) return null;
        const cfg = CHAPTER_CONFIG[zone];

        return (
          <section key={zone} className="relative">
            {/* Sticky Left Chapter Spine + Right Scrolling Interactive Stages */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Sticky Chapter Column */}
              <div className="lg:col-span-4 lg:sticky lg:top-12 text-left space-y-4 p-2">
                <div
                  className="inline-block font-mono text-xs font-bold uppercase tracking-[0.28em]"
                  style={{ color: cfg.accentColor }}
                >
                  {cfg.act}
                </div>
                <h2 className="font-serif-story text-5xl sm:text-6xl font-normal italic text-[#F5F2EB] leading-[0.96]">
                  {cfg.name}
                </h2>
                <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
                  {cfg.tagline}
                </p>
                <div className="pt-2 font-mono text-xs text-stone-500 border-t border-white/10">
                  {cfg.distance} · {zoneArtifacts.length} MONUMENTS
                </div>
              </div>

              {/* Right Column: Interactive Spotlight Exhibit Stages */}
              <div className="lg:col-span-8 space-y-12">
                {zoneArtifacts.map((artifact) => {
                  globalCounter += 1;
                  const numStr = String(globalCounter).padStart(2, '0');
                  return (
                    <SpotlightExhibitStage
                      key={artifact.id}
                      artifact={artifact}
                      indexNumber={numStr}
                      isDiscovered={discoveredIds.includes(artifact.id)}
                      accentColor={cfg.accentColor}
                      onSelect={() => onSelectArtifact(artifact)}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

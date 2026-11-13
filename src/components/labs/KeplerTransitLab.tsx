import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Telescope, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExoplanetSystem {
  id: string;
  name: string;
  planetRadiusEarth: number;
  orbitalPeriodDays: number;
  dipDepthPpm: number;
  habitableZone: boolean;
  summary: string;
}

const SYSTEMS: ExoplanetSystem[] = [
  {
    id: 'kepler-186f',
    name: 'KEPLER-186F // HABITABLE ZONE ROCKY WORLD',
    planetRadiusEarth: 1.17,
    orbitalPeriodDays: 129.9,
    dipDepthPpm: 520,
    habitableZone: true,
    summary: 'Orbits a cool red-dwarf star 580 light-years away where liquid water could pool on the surface!',
  },
  {
    id: 'kepler-452b',
    name: 'KEPLER-452B // EARTH’S OLDER COUSIN',
    planetRadiusEarth: 1.63,
    orbitalPeriodDays: 384.8,
    dipDepthPpm: 210,
    habitableZone: true,
    summary: 'Circles a Sun-like G2 star every 385 days—discovered before Kepler ran out of hydrazine fuel!',
  },
  {
    id: 'kepler-16b',
    name: 'KEPLER-16B // BINARY STAR CIRCBINARY GIANT',
    planetRadiusEarth: 8.45,
    orbitalPeriodDays: 228.8,
    dipDepthPpm: 14500,
    habitableZone: false,
    summary: 'A Saturn-sized gas giant orbiting TWO stars at once—creating double eclipses in Kepler’s light curve!',
  },
];

export const KeplerTransitLab: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<ExoplanetSystem>(SYSTEMS[0]);
  const [phase, setPhase] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [capturedTransits, setCapturedTransits] = useState<string[]>([]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 2) % 100);
    }, 90);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const isTransiting = phase >= 42 && phase <= 58;
  const currentBrightness = isTransiting
    ? +(100 - selectedSystem.planetRadiusEarth * 0.18).toFixed(3)
    : 100.0;

  const handleCaptureTransit = () => {
    if (isTransiting && !capturedTransits.includes(selectedSystem.id)) {
      setCapturedTransits((prev) => [...prev, selectedSystem.id]);
      confetti({ particleCount: 55, spread: 70, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="border-2 border-[#33FF66] bg-[#0A0B0E] p-5 text-left space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#282C37] pb-3">
        <div>
          <span className="bg-[#33FF66] px-2 py-0.5 font-mono text-[10px] font-bold text-[#0A0B0E] uppercase">
            INSTRUMENT CONSOLE 03 // KEPLER CCD PHOTOMETER TRANSIT DETECTOR
          </span>
          <h4 className="mt-1 font-display text-lg font-bold uppercase text-[#F4F1EA]">
            Catch the Starlight Flux Dip as an Exoplanet Crosses Its Sun
          </h4>
        </div>
        <div className="font-mono text-xs text-[#FFB000] bg-[#111318] px-3 py-1.5 border border-[#282C37]">
          CONFIRMED DETECTIONS: {capturedTransits.length} / {SYSTEMS.length}
        </div>
      </div>

      {/* Kid-Friendly Intro Box */}
      <div className="border-l-4 border-[#33FF66] bg-[#111318] p-3 text-xs text-stone-300">
        <strong className="text-[#33FF66] font-mono uppercase">MISSION INSTRUCTIONS (AGES 10–14):</strong>{' '}
        Kepler discovered 2,662 exoplanets by staring at stars and watching for a tiny wink when a planet passes in front! Watch the green oscilloscope curve below and click <strong>[LOG EXOPLANET TRANSIT]</strong> right when the planet crosses the yellow star disk (Phase 42%–58%).
      </div>

      {/* Star System Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
        {SYSTEMS.map((sys) => {
          const isCaptured = capturedTransits.includes(sys.id);
          return (
            <button
              key={sys.id}
              type="button"
              onClick={() => setSelectedSystem(sys)}
              className={`border-2 p-3 text-left transition cursor-pointer ${
                selectedSystem.id === sys.id
                  ? 'border-[#FFB000] bg-[#FFB000]/10 text-[#F4F1EA]'
                  : 'border-[#282C37] bg-[#111318] text-stone-400 hover:border-[#E5A93C]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate">{sys.name.split(' //')[0]}</span>
                {isCaptured && <CheckCircle2 className="h-3.5 w-3.5 text-[#33FF66] shrink-0" />}
              </div>
              <div className="mt-1 text-[11px] text-[#33FF66]">
                RADIUS: {sys.planetRadiusEarth} R⊕ // DIP: {sys.dipDepthPpm} PPM
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Star + Orbiting Planet + Real-Time Photometry Light Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center border-2 border-[#282C37] bg-[#050608] p-4 font-mono">
        <div className="lg:col-span-5 relative h-36 flex items-center justify-center overflow-hidden border border-[#282C37] bg-[#0A0B0E]">
          {/* Host Star Disk */}
          <div className="h-20 w-20 rounded-full bg-[#FFB000] shadow-[0_0_40px_#FFB000]" />

          {/* Moving Exoplanet Silhouette */}
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-[#0A0B0E] border-2 border-[#FC3D21] transition-all duration-75"
            style={{
              left: `${phase}%`,
              width: `${Math.max(12, Math.min(26, selectedSystem.planetRadiusEarth * 8))}px`,
              height: `${Math.max(12, Math.min(26, selectedSystem.planetRadiusEarth * 8))}px`,
            }}
          />

          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px]">
            <span className="text-stone-400">FLUX: {currentBrightness}%</span>
            <span className={isTransiting ? 'text-[#33FF66] font-bold animate-pulse' : 'text-stone-500'}>
              {isTransiting ? '[★ TRANSIT WINDOW ACTIVE]' : '[ORBITING]'}
            </span>
          </div>
        </div>

        {/* Right: Oscilloscope Light Curve Graph */}
        <div className="lg:col-span-7 space-y-2">
          <svg viewBox="0 0 500 105" className="w-full h-28 bg-[#0A0B0E] border border-[#282C37] p-2">
            <path
              d="M 10 25 L 195 25 L 215 78 L 285 78 L 305 25 L 490 25"
              fill="none"
              stroke="#33FF66"
              strokeWidth="2.5"
            />
            <circle
              cx={10 + (phase / 100) * 480}
              cy={isTransiting ? 78 : 25}
              r="6"
              fill={isTransiting ? '#FC3D21' : '#FFB000'}
            />
            <text x="250" y="96" textAnchor="middle" fill="#E5A93C" fontSize="10">
              TRANSIT PHOTOMETRY WINDOW [PHASE 42% – 58%]
            </text>
          </svg>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center gap-1 border border-[#282C37] bg-[#111318] px-2.5 py-1.5 text-xs text-stone-200 hover:border-[#FFB000] cursor-pointer"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? 'HOLD' : 'RUN'}
              </button>

              <button
                type="button"
                onClick={handleCaptureTransit}
                className={`flex items-center gap-1.5 border-2 px-3.5 py-1.5 text-xs font-bold uppercase transition cursor-pointer ${
                  isTransiting
                    ? 'border-[#33FF66] bg-[#33FF66] text-[#0A0B0E]'
                    : 'border-[#282C37] bg-[#111318] text-stone-300 hover:border-[#FFB000]'
                }`}
              >
                <Telescope className="h-3.5 w-3.5" />
                {isTransiting ? '[LOG EXOPLANET TRANSIT NOW!]' : '[WAIT FOR DIP OR SCRUB SLIDER]'}
              </button>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={phase}
              aria-label="Manual Orbital Phase Scrubber"
              onChange={(e) => {
                setIsPlaying(false);
                setPhase(Number(e.target.value));
              }}
              className="w-36 accent-[#33FF66] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-300 flex items-center gap-2 bg-[#111318] p-3 border border-[#282C37]">
        <Sparkles className="h-4 w-4 text-[#FFB000] shrink-0" />
        <span>
          <strong className="font-mono text-[#E5A93C]">{selectedSystem.name}:</strong> {selectedSystem.summary}
        </span>
      </p>
    </div>
  );
};

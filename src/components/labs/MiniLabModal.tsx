import React, { useState } from 'react';
import { Zap, Wind, Activity, Telescope, X, CheckCircle2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SpatialArtifact } from '../../data/artifacts';

interface MiniLabModalProps {
  artifact: SpatialArtifact | null;
  onClose: () => void;
}

export const MiniLabModal: React.FC<MiniLabModalProps> = ({ artifact, onClose }) => {
  const [showMathDetails, setShowMathDetails] = useState(false);

  // 1. Lunar Laser State
  const [laserPhase, setLaserPhase] = useState<'idle' | 'outbound' | 'inbound' | 'locked'>('idle');
  const [lunarYears, setLunarYears] = useState<number>(57);

  // 2. Mars Interactive Dust Scrubbing & Quake State
  const [dustCoverage, setDustCoverage] = useState<number>(85);
  const stormStrength = 5;
  const [quakeWavePicked, setQuakeWavePicked] = useState<'none' | 'P' | 'S'>('none');

  // 3. Kepler Exoplanet Transit State
  const [orbitPos, setOrbitPos] = useState<number>(50);
  const [transitLogged, setTransitLogged] = useState<boolean>(false);

  if (!artifact) return null;

  const handleFireLunarLaser = () => {
    if (laserPhase === 'outbound' || laserPhase === 'inbound') return;
    setLaserPhase('outbound');
    setTimeout(() => setLaserPhase('inbound'), 550);
    setTimeout(() => {
      setLaserPhase('locked');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 1150);
  };

  const handleScrubMarsDust = () => {
    setDustCoverage((prev) => {
      const next = Math.max(0, prev - 8);
      if (next === 0 && prev > 0) {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const batteryPercent = Math.max(
    5,
    Math.min(100, Math.round((100 - dustCoverage * 0.85) * (1 - stormStrength * 0.06)))
  );
  const isTransiting = orbitPos >= 42 && orbitPos <= 58;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-xl select-none">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950/95 p-6 sm:p-8 shadow-2xl text-left space-y-6">
        {/* Clean Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-medium text-sky-400">
              Interactive Science Experiment · {artifact.name}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {artifact.labType === 'lunar-laser' && 'Bounce a Laser Beam Off the Moon'}
              {artifact.labType === 'mars-dust-quake' && 'Clean the Solar Panels & Listen to a Marsquake'}
              {artifact.labType === 'kepler-transit' && 'Discover an Alien Planet Around a Distant Star'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* LAB 1: LUNAR LASER */}
        {artifact.labType === 'lunar-laser' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-300 leading-relaxed">
              Astronauts left special mirrors on the Moon that need zero batteries. Press{' '}
              <strong className="text-white">Fire Laser Beam</strong> to shoot a pulse of green light from Earth to the Moon and time how fast it bounces back!
            </p>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-center w-24">
                  <div className="text-3xl">🌍</div>
                  <div className="text-xs font-medium text-slate-300 mt-1">Earth</div>
                </div>

                <div className="flex-1 mx-4 relative h-10 flex items-center">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                    {laserPhase === 'outbound' && (
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-400 animate-pulse" />
                    )}
                    {laserPhase === 'inbound' && (
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-sky-400 animate-pulse" />
                    )}
                    {laserPhase === 'locked' && (
                      <div className="w-full h-full bg-emerald-400 shadow-[0_0_15px_#34d399]" />
                    )}
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-emerald-300 whitespace-nowrap">
                    {laserPhase === 'idle' && 'Ready to fire light beam'}
                    {laserPhase === 'outbound' && '⚡ Traveling to the Moon...'}
                    {laserPhase === 'inbound' && '↩ Bouncing back to Earth...'}
                    {laserPhase === 'locked' && '✓ Round trip took 2.56 seconds!'}
                  </div>
                </div>

                <div className="text-center w-24">
                  <div className="text-3xl">🪞</div>
                  <div className="text-xs font-medium text-slate-300 mt-1">Moon Mirror</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={handleFireLunarLaser}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 transition cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>Fire Laser Beam</span>
                </button>

                <div className="text-sm text-slate-200">
                  Distance to the Moon:{' '}
                  <strong className="text-emerald-300">384,402 kilometers</strong>
                </div>
              </div>
            </div>

            {/* Simple Time Slider */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">
                  Did you know? The Moon slowly drifts away by 3.8 cm every year:
                </span>
                <span className="text-sky-300 font-semibold">
                  In {lunarYears} years → {(lunarYears * 3.8).toFixed(1)} cm farther
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={200}
                value={lunarYears}
                onChange={(e) => setLunarYears(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* LAB 2: MARS DUST & QUAKE */}
        {artifact.labType === 'mars-dust-quake' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-300 leading-relaxed">
              Red Martian dust covers solar panels and blocks sunlight.{' '}
              <strong className="text-white">Rub your mouse across the solar panel below</strong> (or click it) to wipe away the dust and recharge the rover!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div
                onMouseMove={handleScrubMarsDust}
                onClick={handleScrubMarsDust}
                className="md:col-span-7 relative h-44 w-full overflow-hidden rounded-2xl border border-sky-400/40 bg-slate-900 cursor-pointer flex items-center justify-center p-4 text-center"
              >
                <div className="relative z-10 pointer-events-none">
                  <div className="text-base font-bold text-white">
                    {dustCoverage === 0
                      ? '✨ Solar Panel Sparkling Clean!'
                      : `Wipe Here to Clean Dust (${dustCoverage}% Dusty)`}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Move your cursor back and forth or click Summon Wind
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-200"
                  style={{
                    opacity: dustCoverage / 100,
                    background: 'radial-gradient(circle, #b44622, #7c2d12)',
                  }}
                />
              </div>

              <div className="md:col-span-5 rounded-2xl border border-white/10 bg-slate-900/90 p-5 space-y-3">
                <div className="text-xs text-slate-400">Solar Battery Charge</div>
                <div className="text-3xl font-bold text-white">{batteryPercent}%</div>
                <div className="text-xs">
                  {batteryPercent < 25 ? (
                    <span className="text-amber-400">Too dark &amp; cold — Rover is falling asleep!</span>
                  ) : (
                    <span className="text-emerald-400">Plenty of power to explore Mars!</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDustCoverage(0)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-400 py-2 text-xs font-bold text-slate-950 hover:bg-sky-300 transition cursor-pointer"
                >
                  <Wind className="h-3.5 w-3.5" />
                  <span>Summon Helpful Martian Wind</span>
                </button>
              </div>
            </div>

            {/* Simple Marsquake Listener */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <Activity className="h-4 w-4 text-sky-400 shrink-0" />
                <span>
                  <strong>Listen to a Marsquake:</strong> Click the two rumbles to find out how far away the quake happened!
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setQuakeWavePicked('P')}
                  className={`rounded-full px-3.5 py-1.5 cursor-pointer ${
                    quakeWavePicked === 'P'
                      ? 'bg-sky-400 text-slate-950 font-bold'
                      : 'border border-white/15 text-slate-300'
                  }`}
                >
                  1st Rumble (Fast Wave)
                </button>
                <button
                  type="button"
                  onClick={() => setQuakeWavePicked('S')}
                  className={`rounded-full px-3.5 py-1.5 cursor-pointer ${
                    quakeWavePicked === 'S'
                      ? 'bg-emerald-400 text-slate-950 font-bold'
                      : 'border border-white/15 text-slate-300'
                  }`}
                >
                  2nd Rumble → 1,079 km away!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAB 3: KEPLER PLANET HUNTER */}
        {artifact.labType === 'kepler-transit' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-300 leading-relaxed">
              How do we find planets around distant stars? Drag the slider below so the dark planet moves right in front of the glowing yellow star. When the starlight dims slightly, click{' '}
              <strong className="text-white"> Log New Planet</strong>!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl border border-white/10 bg-slate-900/80 p-6">
              <div className="md:col-span-5 relative h-36 flex items-center justify-center overflow-hidden rounded-xl bg-black">
                <div className="h-20 w-20 rounded-full bg-amber-300 shadow-[0_0_45px_#fbbf24]" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-950 border-2 border-sky-300 transition-all duration-75"
                  style={{ left: `${orbitPos}%` }}
                />
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Star Brightness:</span>
                  <span className={isTransiting ? 'text-emerald-400 font-bold' : 'text-white'}>
                    {isTransiting ? '99.5% — A Planet is Crossing the Star!' : '100% — Full Starlight'}
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={95}
                  value={orbitPos}
                  onChange={(e) => setOrbitPos(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrbitPos(50);
                      setTransitLogged(true);
                      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-sky-300 transition cursor-pointer"
                  >
                    <Telescope className="h-4 w-4" />
                    <span>Log New Planet</span>
                  </button>

                  {transitLogged && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Earth-sized Planet Kepler-186f Found!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progressive Disclosure: Optional "How the Real NASA Math Works" Button */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowMathDetails((p) => !p)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-300 transition cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
            <span>
              {showMathDetails
                ? 'Hide NASA Physics Formula'
                : 'Curious how NASA calculates this? Click to see the math'}
            </span>
          </button>

          {showMathDetails && (
            <div className="mt-2 rounded-xl bg-white/5 p-3 text-xs text-slate-300 font-mono">
              {artifact.labType === 'lunar-laser' &&
                'Formula: Distance d = (Speed of Light c × Round-Trip Time t) / 2 = (299,792.458 km/s × 2.56445s) / 2 = 384,402 km.'}
              {artifact.labType === 'mars-dust-quake' &&
                'Beer-Lambert Law: Solar power drops exponentially with atmospheric optical depth Tau (τ), while P-wave and S-wave arrival delay Δt measures Marsquake distance.'}
              {artifact.labType === 'kepler-transit' &&
                'Transit Photometry: Transit Depth ΔF = (R_planet / R_star)² — an Earth-sized world dims a Sun-like star by ~100 parts per million.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Zap, Wind, Activity, Telescope, X, CheckCircle2, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { NasaArtifact } from '../types/hardware';

interface CinemaInteractiveOverlayProps {
  artifact: NasaArtifact;
  onClose: () => void;
}

export const CinemaInteractiveOverlay: React.FC<CinemaInteractiveOverlayProps> = ({
  artifact,
  onClose,
}) => {
  // 1. Lunar Laser State
  const [laserPhase, setLaserPhase] = useState<'idle' | 'outbound' | 'inbound' | 'locked'>('idle');
  const [lunarYears, setLunarYears] = useState<number>(57);

  // 2. Mars Interactive Dust Scrubbing & Quake State
  const [dustCoverage, setDustCoverage] = useState<number>(88);
  const [tau, setTau] = useState<number>(6.4);
  const [quakeWavePicked, setQuakeWavePicked] = useState<'none' | 'P' | 'S'>('none');

  // 3. Kepler Exoplanet Transit State
  const [orbitPos, setOrbitPos] = useState<number>(50);
  const [transitLogged, setTransitLogged] = useState<boolean>(false);

  const handleFireLunarLaser = () => {
    if (laserPhase === 'outbound' || laserPhase === 'inbound') return;
    setLaserPhase('outbound');
    setTimeout(() => setLaserPhase('inbound'), 600);
    setTimeout(() => {
      setLaserPhase('locked');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 1250);
  };

  const handleScrubMarsDust = () => {
    setDustCoverage((prev) => {
      const next = Math.max(0, prev - 7);
      if (next === 0 && prev > 0) {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const solarPowerWh = Math.round(900 * Math.exp(-tau * 0.25) * (1 - dustCoverage / 108));
  const isTransiting = orbitPos >= 42 && orbitPos <= 58;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-[#070B14]/90 p-6 sm:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.9)] text-left backdrop-blur-2xl">
        {/* Top AR Module Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-500/10 text-sky-300">
              <Crosshair className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-400">
                NASA SPATIAL AR SIMULATION MODULE // {artifact.id.toUpperCase()}
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight mt-0.5">
                {artifact.labType === 'lunar-laser' && 'Lunar Laser Ranging (LLR) Optical Telemetry'}
                {artifact.labType === 'mars-dust-quake' && 'Martian Solar Array Dust Remediation & SEIS Vibrometry'}
                {artifact.labType === 'kepler-transit' && 'Exoplanet Transit Photometry Light-Curve Sensor'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* LAB 1: LUNAR LASER BOUNCE */}
        {artifact.labType === 'lunar-laser' && (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Passive fused-silica corner-cube prisms reflect incoming laser photons along their exact incident vector without onboard electrical power. Trigger the <strong className="text-sky-300">532nm Nd:YAG Laser</strong> to compute Earth-Moon range via <code className="text-white">d = (c × t) / 2</code>:
            </p>

            <div className="relative rounded-xl border border-white/15 bg-[#04070E] p-6 overflow-hidden">
              <div className="flex items-center justify-between relative z-10 font-mono">
                <div className="text-center w-32">
                  <div className="h-12 w-12 mx-auto rounded-lg border border-sky-400/50 bg-sky-500/10 flex items-center justify-center text-xs font-bold text-sky-300">
                    APO-3.5M
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5">EARTH OBSERVATORY</div>
                </div>

                {/* Animated Laser Vector */}
                <div className="flex-1 mx-6 relative h-10 flex items-center">
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden relative">
                    {laserPhase === 'outbound' && (
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-pulse" />
                    )}
                    {laserPhase === 'inbound' && (
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-sky-400 shadow-[0_0_20px_#38bdf8] animate-pulse" />
                    )}
                    {laserPhase === 'locked' && (
                      <div className="w-full h-full bg-emerald-400 shadow-[0_0_20px_#34d399]" />
                    )}
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] text-sky-300 whitespace-nowrap">
                    {laserPhase === 'idle' && 'VECTOR STANDBY // c = 299,792.458 KM/S'}
                    {laserPhase === 'outbound' && '>>> OUTBOUND 532NM PHOTON PULSE >>>'}
                    {laserPhase === 'inbound' && '<<< RETRO-REFLECTED PHOTON RETURN <<<'}
                    {laserPhase === 'locked' && '✓ TOF LOCKED: t = 2.564455 SEC'}
                  </div>
                </div>

                <div className="text-center w-32">
                  <div
                    className={`h-12 w-12 mx-auto rounded-lg border flex items-center justify-center text-xs font-bold transition ${
                      laserPhase === 'locked'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.4)]'
                        : 'border-white/20 bg-white/5 text-slate-400'
                    }`}
                  >
                    LRRR-100
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5">LUNAR PRISM ARRAY</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 font-mono">
                <button
                  type="button"
                  onClick={handleFireLunarLaser}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-5 py-2.5 text-xs font-bold uppercase text-slate-950 hover:bg-sky-300 transition cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>Transmit 532nm Laser Pulse</span>
                </button>

                <div className="text-xs text-slate-300">
                  COMPUTED RANGE: <span className="text-sky-300">d = (c × t) / 2</span> ={' '}
                  <strong className="text-white">
                    {(384402.15 + (lunarYears * 3.8) / 100000).toFixed(3)} km
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">RECESSIONAL DRIFT PROJECTION (+3.8 CM/YR):</span>
                <span className="text-sky-300 font-bold">
                  +{lunarYears} YRS → +{(lunarYears * 3.8).toFixed(1)} CM OFFSET
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={300}
                value={lunarYears}
                onChange={(e) => setLunarYears(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* LAB 2: MARS INTERACTIVE DUST WIPER & QUAKE */}
        {artifact.labType === 'mars-dust-quake' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-sky-300 flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5" />
                    SWIPE CURSOR ACROSS ARRAY TO CLEAR IRON-OXIDE DUST
                  </span>
                  <span className="text-white font-bold">{dustCoverage}% OBSCURED</span>
                </div>

                <div
                  onMouseMove={handleScrubMarsDust}
                  onClick={handleScrubMarsDust}
                  className="relative h-48 w-full overflow-hidden rounded-xl border border-sky-400/40 bg-[#081326] cursor-crosshair select-none flex items-center justify-center"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(56,189,248,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.2) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="relative z-10 text-center pointer-events-none px-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-300">
                      TRIPLE-JUNCTION GaAs PHOTOVOLTAIC DECK
                    </div>
                    <div className="font-display text-lg font-semibold text-white mt-1">
                      {dustCoverage === 0
                        ? 'ARRAY OPTICALLY CLEAN — PEAK IRRADIANCE RESTORED'
                        : 'MOVE CURSOR OR CLICK TO SIMULATE AEOLIAN DUST REMOVAL'}
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-200"
                    style={{
                      opacity: dustCoverage / 100,
                      background:
                        'radial-gradient(circle at 30% 40%, #b44622, #7c2d12 70%, #3b1506)',
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-5 rounded-xl border border-white/15 bg-[#04070E] p-5 space-y-4 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    ENERGY HARVEST TELEMETRY
                  </div>
                  <div className="text-3xl font-bold text-white mt-1">
                    {solarPowerWh} <span className="text-xs text-sky-400">Wh / Sol</span>
                  </div>
                  <div className="mt-1 text-[11px]">
                    {solarPowerWh < 150 ? (
                      <span className="text-[#FC3D21]">
                        ⚠ LOW-POWER FAULT: SURVIVAL HEATERS OFFLINE
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        ✓ BUS VOLTAGE NOMINAL // HEATERS ONLINE
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">ATMOSPHERIC TAU (τ):</span>
                    <span className="text-sky-300">τ = {tau.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={10.8}
                    step={0.1}
                    value={tau}
                    onChange={(e) => setTau(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setDustCoverage(0)}
                  className="w-full rounded-lg border border-sky-400/50 bg-sky-500/15 py-2 text-xs font-bold uppercase text-sky-300 hover:bg-sky-400 hover:text-slate-950 transition cursor-pointer"
                >
                  Trigger Dust Devil Cleaning Event
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-sky-400 shrink-0" />
                <div className="text-xs text-slate-300 font-sans">
                  <strong className="text-white font-mono block">INSIGHT SEIS SEISMOMETER (CERBERUS FOSSAE Mw 3.7):</strong>
                  Mark the P-Wave (18s) and S-Wave (44s) arrivals to triangulate distance to the quake epicenter.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setQuakeWavePicked('P')}
                  className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                    quakeWavePicked === 'P'
                      ? 'bg-sky-400 text-slate-950 font-bold'
                      : 'border border-white/20 text-slate-300'
                  }`}
                >
                  P-Wave (18s)
                </button>
                <button
                  type="button"
                  onClick={() => setQuakeWavePicked('S')}
                  className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                    quakeWavePicked === 'S'
                      ? 'bg-emerald-400 text-slate-950 font-bold'
                      : 'border border-white/20 text-slate-300'
                  }`}
                >
                  S-Wave (44s) → 1,079 km
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LAB 3: KEPLER EXOPLANET TRANSIT */}
        {artifact.labType === 'kepler-transit' && (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Scrub the <strong className="text-sky-300">Orbital Phase Vector</strong> below to align the exoplanet across its host star disk and measure the photometric flux drop on Kepler&apos;s CCD focal plane:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl border border-white/15 bg-[#04070E] p-6 font-mono">
              <div className="md:col-span-5 relative h-40 flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#020408]">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500 shadow-[0_0_50px_rgba(251,191,36,0.6)]" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-950 border-2 border-sky-300 shadow-lg transition-all duration-75"
                  style={{ left: `${orbitPos}%` }}
                />
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">NORMALIZED STELLAR FLUX:</span>
                  <span className={isTransiting ? 'text-emerald-400 font-bold' : 'text-white'}>
                    {isTransiting ? '0.99480 (-520 PPM TRANSIT DIP)' : '1.00000 (BASELINE)'}
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
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-5 py-2.5 text-xs font-bold uppercase text-slate-950 hover:bg-sky-300 transition cursor-pointer"
                  >
                    <Telescope className="h-4 w-4" />
                    <span>Lock Transit Photometry</span>
                  </button>

                  {transitLogged && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      KEPLER-186f CONFIRMED (1.17 R⊕)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

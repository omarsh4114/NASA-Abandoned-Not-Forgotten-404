import React, { useState } from 'react';
import { Zap, Timer, Compass, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const SPEED_OF_LIGHT_KM_S = 299792.458;

const SITES = [
  {
    name: 'APOLLO 11 // TRANQUILITY BASE',
    trueDistanceKm: 384402.15,
    roundTripSec: (2 * 384402.15) / SPEED_OF_LIGHT_KM_S,
    prisms: 100,
    year: 1969,
  },
  {
    name: 'APOLLO 14 // FRA MAURO HIGHLANDS',
    trueDistanceKm: 384467.8,
    roundTripSec: (2 * 384467.8) / SPEED_OF_LIGHT_KM_S,
    prisms: 100,
    year: 1971,
  },
  {
    name: 'APOLLO 15 // HADLEY RILLE (300 PRISMS)',
    trueDistanceKm: 384339.4,
    roundTripSec: (2 * 384339.4) / SPEED_OF_LIGHT_KM_S,
    prisms: 300,
    year: 1971,
  },
];

export const LaserRetroreflectorLab: React.FC = () => {
  const [selectedSiteIdx, setSelectedSiteIdx] = useState<number>(0);
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [pulsePhase, setPulsePhase] = useState<'idle' | 'outbound' | 'inbound' | 'complete'>('idle');
  const [yearsAhead, setYearsAhead] = useState<number>(57);

  const site = SITES[selectedSiteIdx];
  const driftCm = +(yearsAhead * 3.8).toFixed(1);
  const driftMeters = +(driftCm / 100).toFixed(2);
  const calculatedDistanceKm = +((SPEED_OF_LIGHT_KM_S * site.roundTripSec) / 2 + driftMeters / 1000).toFixed(3);

  const fireLaserPulse = () => {
    if (isFiring) return;
    setIsFiring(true);
    setPulsePhase('outbound');

    setTimeout(() => {
      setPulsePhase('inbound');
    }, 650);

    setTimeout(() => {
      setPulsePhase('complete');
      setIsFiring(false);
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }, 1300);
  };

  return (
    <div className="border-2 border-[#E5A93C] bg-[#0A0B0E] p-5 text-left space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#282C37] pb-3">
        <div>
          <span className="bg-[#E5A93C] px-2 py-0.5 font-mono text-[10px] font-bold text-[#0A0B0E] uppercase">
            INSTRUMENT CONSOLE 01 // APOLLO LUNAR LASER RANGING (LLR)
          </span>
          <h4 className="mt-1 font-display text-lg font-bold uppercase text-[#F4F1EA]">
            Bounce a 532nm Laser Off Passive Apollo Quartz Prisms
          </h4>
        </div>
        <div className="font-mono text-xs text-[#33FF66] bg-[#111318] px-3 py-1.5 border border-[#282C37]">
          EQUATION: d = (c × t) / 2
        </div>
      </div>

      {/* Kid-Friendly Intro Box (Omar Narrative Integration) */}
      <div className="border-l-4 border-[#FFB000] bg-[#111318] p-3 text-xs text-stone-300">
        <strong className="text-[#FFB000] font-mono uppercase">MISSION INSTRUCTIONS (AGES 10–14):</strong>{' '}
        Step 1: Pick an Apollo mirror array below. Step 2: Press <strong>[FIRE 532NM LASER PULSE]</strong> to shoot a beam of light from Earth to the Moon and measure the exact 2.56-second round-trip echo! Step 3: Drag the Time Slider to see how the Moon drifts 3.8 cm farther away every year.
      </div>

      {/* Site Selector Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
        {SITES.map((s, idx) => (
          <button
            key={s.name}
            type="button"
            onClick={() => {
              setSelectedSiteIdx(idx);
              setPulsePhase('idle');
            }}
            className={`border-2 p-3 text-left transition cursor-pointer ${
              selectedSiteIdx === idx
                ? 'border-[#33FF66] bg-[#33FF66]/10 text-[#F4F1EA]'
                : 'border-[#282C37] bg-[#111318] text-stone-400 hover:border-[#E5A93C]'
            }`}
          >
            <div className="text-xs font-bold">{s.name}</div>
            <div className="mt-1 text-[11px] text-[#FFB000]">
              {s.prisms} CORNER CUBES // DEPLOYED {s.year}
            </div>
          </button>
        ))}
      </div>

      {/* Oscilloscope Optical Path Display */}
      <div className="border-2 border-[#282C37] bg-[#050608] p-5">
        <div className="flex items-center justify-between relative z-10 font-mono">
          <div className="flex flex-col items-center text-center w-32 border border-[#282C37] bg-[#0A0B0E] p-2">
            <span className="text-xs font-bold text-[#33FF66]">EARTH STATION</span>
            <span className="text-[10px] text-stone-400">APACHE POINT 3.5M</span>
          </div>

          {/* Laser Beam Oscilloscope Line */}
          <div className="flex-1 mx-4 relative h-12 flex items-center">
            <div className="w-full h-1 bg-[#282C37] overflow-hidden relative">
              {pulsePhase === 'outbound' && (
                <div className="absolute inset-y-0 left-0 w-1/2 bg-[#33FF66] animate-pulse" />
              )}
              {pulsePhase === 'inbound' && (
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[#FFB000] animate-pulse" />
              )}
              {pulsePhase === 'complete' && (
                <div className="w-full h-full bg-[#33FF66] shadow-[0_0_12px_#33FF66]" />
              )}
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[11px] text-[#33FF66] whitespace-nowrap">
              {pulsePhase === 'idle' && '[READY TO FIRE PHOTON BURST]'}
              {pulsePhase === 'outbound' && '>>> OUTBOUND AT 299,792.458 KM/S >>>'}
              {pulsePhase === 'inbound' && '<<< CORNER-CUBE REFLECTION RETURNING <<<'}
              {pulsePhase === 'complete' && `[ECHO LOCKED: t = ${site.roundTripSec.toFixed(6)} SEC]`}
            </div>
          </div>

          <div
            className={`flex flex-col items-center text-center w-32 border p-2 transition ${
              pulsePhase === 'inbound' || pulsePhase === 'complete'
                ? 'border-[#33FF66] bg-[#33FF66]/15'
                : 'border-[#282C37] bg-[#0A0B0E]'
            }`}
          >
            <span className="text-xs font-bold text-[#E5A93C]">LUNAR LRRR</span>
            <span className="text-[10px] text-stone-400">ZERO BATTERY</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#282C37] pt-4 font-mono">
          <button
            type="button"
            onClick={fireLaserPulse}
            disabled={isFiring}
            className="flex items-center gap-2 border-2 border-[#33FF66] bg-[#33FF66] px-4 py-2 text-xs font-bold uppercase text-[#0A0B0E] hover:bg-[#5cff85] disabled:opacity-50 transition cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            {isFiring ? 'TIMING PHOTON FLIGHT...' : '[FIRE 532NM LASER PULSE]'}
          </button>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-stone-300">
              <Timer className="h-4 w-4 text-[#FFB000]" />
              TIME (t): <strong className="text-[#FFB000]">{site.roundTripSec.toFixed(6)} s</strong>
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Compass className="h-4 w-4 text-[#33FF66]" />
              RANGE (d): <strong className="text-[#33FF66]">{calculatedDistanceKm.toLocaleString()} km</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Lunar Drift Time Machine Slider */}
      <div className="border-2 border-[#282C37] bg-[#111318] p-4 space-y-2 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label htmlFor="lunar-drift-slider" className="font-bold text-[#F4F1EA] uppercase">
            LUNAR RECESSIONAL DRIFT COUNTER (3.8 CM/YR):
          </label>
          <span className="text-[#FFB000] font-bold">
            +{yearsAhead} YRS → +{driftCm} CM (+{driftMeters} M)
          </span>
        </div>
        <input
          id="lunar-drift-slider"
          type="range"
          min={1}
          max={500}
          value={yearsAhead}
          onChange={(e) => setYearsAhead(Number(e.target.value))}
          className="w-full accent-[#FC3D21] cursor-pointer"
        />
        <p className="font-sans text-xs text-stone-300 flex items-center gap-2 pt-1">
          <CheckCircle2 className="h-4 w-4 text-[#33FF66] shrink-0" />
          Because Apollo’s quartz prisms need zero electricity, they revealed that tidal forces push the Moon 3.8 cm farther from Earth every year!
        </p>
      </div>
    </div>
  );
};

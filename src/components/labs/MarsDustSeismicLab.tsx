import React, { useState } from 'react';
import { Sun, Wind, Activity, AlertTriangle, Sparkles } from 'lucide-react';

interface QuakeEvent {
  id: string;
  sol: string;
  magnitude: string;
  pWaveSec: number;
  sWaveSec: number;
  depthNote: string;
}

const QUAKES: QuakeEvent[] = [
  {
    id: 'S0173a',
    sol: 'SOL 173 // CERBERUS FOSSAE',
    magnitude: 'Mw 3.7',
    pWaveSec: 18,
    sWaveSec: 44,
    depthNote: 'Confirmed active tectonic fault fissures 1,600 km from InSight!',
  },
  {
    id: 'S1000a',
    sol: 'SOL 1000 // FAR-SIDE METEOROID IMPACT',
    magnitude: 'Mw 4.1',
    pWaveSec: 25,
    sWaveSec: 68,
    depthNote: 'Seismic waves diffracted around Mars’ 1,830-km liquid iron-sulfur core!',
  },
  {
    id: 'S1222a',
    sol: 'SOL 1222 // RECORD MARSQUAKE',
    magnitude: 'Mw 4.7',
    pWaveSec: 12,
    sWaveSec: 36,
    depthNote: 'Strongest Marsquake ever recorded—vibrated the planet for 10 hours!',
  },
];

export const MarsDustSeismicLab: React.FC = () => {
  const [tau, setTau] = useState<number>(1.2);
  const [dustCoatPercent, setDustCoatPercent] = useState<number>(35);
  const [selectedQuake, setSelectedQuake] = useState<QuakeEvent>(QUAKES[0]);
  const [markedWave, setMarkedWave] = useState<'none' | 'P' | 'S'>('none');

  const skyTransmission = Math.exp(-tau * 0.48);
  const panelCleanFactor = 1 - dustCoatPercent / 115;
  const wattHours = Math.max(8, Math.round(900 * skyTransmission * panelCleanFactor));

  const triggerDustDevil = () => {
    setDustCoatPercent((prev) => Math.max(5, prev - 40));
  };

  const distanceKm = Math.round((selectedQuake.sWaveSec - selectedQuake.pWaveSec) * 41.5);

  return (
    <div className="border-2 border-[#FC3D21] bg-[#0A0B0E] p-5 text-left space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#282C37] pb-3">
        <div>
          <span className="bg-[#FC3D21] px-2 py-0.5 font-mono text-[10px] font-bold text-[#0A0B0E] uppercase">
            INSTRUMENT CONSOLE 02 // MARS SOLAR OPACITY (TAU) &amp; SEISMIC RECORDER
          </span>
          <h4 className="mt-1 font-display text-lg font-bold uppercase text-[#F4F1EA]">
            Simulate Martian Dust Storms &amp; Triangulate InSight Marsquakes
          </h4>
        </div>
        <button
          type="button"
          onClick={triggerDustDevil}
          className="flex items-center gap-1.5 border-2 border-[#FFB000] bg-[#FFB000]/15 px-3 py-1.5 font-mono text-xs font-bold uppercase text-[#FFB000] hover:bg-[#FFB000] hover:text-[#0A0B0E] transition cursor-pointer"
        >
          <Wind className="h-3.5 w-3.5" />
          [SUMMON CLEANING DUST DEVIL]
        </button>
      </div>

      {/* Kid-Friendly Intro Box */}
      <div className="border-l-4 border-[#FC3D21] bg-[#111318] p-3 text-xs text-stone-300">
        <strong className="text-[#FFB000] font-mono uppercase">MISSION INSTRUCTIONS (AGES 10–14):</strong>{' '}
        Step 1: Slide the <strong>Dust Optical Depth (Tau)</strong> up to 10.8 to see how the 2018 global dust storm blocked sunlight and drained Opportunity’s batteries. Step 2: Click the <strong>P-Wave</strong> and <strong>S-Wave</strong> spikes on InSight’s seismogram below to calculate how far away the Marsquake struck!
      </div>

      {/* Part A: Solar Optical Depth (Tau) & Panel Dust Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch font-mono">
        <div className="lg:col-span-7 space-y-4 border-2 border-[#282C37] bg-[#111318] p-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[#F4F1EA] flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-[#FFB000]" />
                ATMOSPHERIC OPTICAL DEPTH (TAU τ):
              </span>
              <span className="font-bold text-[#FFB000]">
                τ = {tau.toFixed(1)} {tau >= 8 ? '[GLOBAL STORM!]' : tau <= 1 ? '[CLEAR SKY]' : '[HAZY]'}
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={10.8}
              step={0.1}
              value={tau}
              aria-label="Atmospheric Dust Optical Depth Tau"
              onChange={(e) => setTau(Number(e.target.value))}
              className="w-full accent-[#FC3D21] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[#F4F1EA]">SOLAR ARRAY DUST COVERAGE:</span>
              <span className="font-bold text-[#FC3D21]">{dustCoatPercent}% OBSCURED</span>
            </div>
            <input
              type="range"
              min={5}
              max={95}
              step={1}
              value={dustCoatPercent}
              aria-label="Solar Panel Dust Coverage Percentage"
              onChange={(e) => setDustCoatPercent(Number(e.target.value))}
              className="w-full accent-[#E5A93C] cursor-pointer"
            />
          </div>
        </div>

        {/* Live Rover Survival Telemetry Readout */}
        <div className="lg:col-span-5 border-2 border-[#282C37] bg-[#050608] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#282C37] pb-2">
            <span className="text-[11px] text-stone-400">ARRAY OUTPUT</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold border ${
                wattHours > 300
                  ? 'border-[#33FF66] text-[#33FF66]'
                  : wattHours > 120
                  ? 'border-[#FFB000] text-[#FFB000]'
                  : 'border-[#FC3D21] bg-[#FC3D21] text-[#0A0B0E]'
              }`}
            >
              {wattHours > 300
                ? 'NOMINAL OPS'
                : wattHours > 120
                ? 'LOW-POWER SAFE MODE'
                : 'CRITICAL BATTERY FREEZE'}
            </span>
          </div>

          <div className="my-2 text-3xl font-bold text-[#FFB000]">
            {wattHours} <span className="text-xs font-normal text-stone-400">WH / SOL</span>
          </div>

          <p className="font-sans text-[11px] text-stone-300 leading-relaxed flex items-start gap-1.5">
            {wattHours <= 120 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-[#FC3D21] shrink-0 mt-0.5" />
                <span>
                  Below 120 Wh/sol, Survival Heaters fail during the -90°C Martian night—silencing Opportunity (τ=10.8) and InSight!
                </span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#33FF66] shrink-0 mt-0.5" />
                <span>
                  Sufficient solar power to heat survival electronics and operate robotic arms.
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Part B: Interactive InSight SEIS Seismogram Clicker */}
      <div className="border-2 border-[#282C37] bg-[#111318] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FC3D21]" />
            <span className="text-xs font-bold uppercase text-[#F4F1EA]">
              INSIGHT SEIS SEISMOGRAM OSCILLOSCOPE — CLICK P-WAVE &amp; S-WAVE PEAKS:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUAKES.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setSelectedQuake(q);
                  setMarkedWave('none');
                }}
                className={`border px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
                  selectedQuake.id === q.id
                    ? 'border-[#FC3D21] bg-[#FC3D21] text-[#0A0B0E]'
                    : 'border-[#282C37] bg-[#0A0B0E] text-stone-400 hover:text-[#F4F1EA]'
                }`}
              >
                {q.id} [{q.magnitude}]
              </button>
            ))}
          </div>
        </div>

        {/* Interactive SVG Seismogram Waveform */}
        <div className="border-2 border-[#282C37] bg-[#050608] p-3 font-mono">
          <svg viewBox="0 0 600 110" className="w-full h-24 overflow-visible">
            <path
              d="M 0 55 L 110 55 L 120 40 L 128 70 L 136 32 L 145 75 L 155 48 L 280 55 L 292 18 L 302 92 L 312 12 L 324 98 L 336 24 L 350 84 L 365 40 L 385 65 L 600 55"
              fill="none"
              stroke="#FFB000"
              strokeWidth="2.2"
            />
            <g onClick={() => setMarkedWave('P')} className="cursor-pointer">
              <line x1="130" y1="8" x2="130" y2="102" stroke="#33FF66" strokeDasharray="4 3" strokeWidth="2" />
              <rect x="78" y="6" width="104" height="20" fill="#0A0B0E" stroke="#33FF66" />
              <text x="130" y="19" textAnchor="middle" fill="#33FF66" fontSize="10" fontWeight="bold">
                [P-WAVE: {selectedQuake.pWaveSec}s]
              </text>
            </g>

            <g onClick={() => setMarkedWave('S')} className="cursor-pointer">
              <line x1="312" y1="8" x2="312" y2="102" stroke="#FC3D21" strokeDasharray="4 3" strokeWidth="2" />
              <rect x="260" y="6" width="104" height="20" fill="#0A0B0E" stroke="#FC3D21" />
              <text x="312" y="19" textAnchor="middle" fill="#FC3D21" fontSize="10" fontWeight="bold">
                [S-WAVE: {selectedQuake.sWaveSec}s]
              </text>
            </g>
          </svg>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-[#282C37] pt-2">
            <span className="font-sans text-stone-300">
              <strong className="font-mono text-[#E5A93C]">{selectedQuake.sol}:</strong> {selectedQuake.depthNote}
            </span>
            <span className="text-[#33FF66] font-bold">
              {markedWave === 'none'
                ? '>> CLICK P-WAVE OR S-WAVE MARKER ABOVE TO TRIANGULATE <<'
                : `Δt = ${selectedQuake.sWaveSec - selectedQuake.pWaveSec}s → EPICENTER RANGE: ~${distanceKm} KM`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

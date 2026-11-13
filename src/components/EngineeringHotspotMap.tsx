import React, { useState } from 'react';
import { Wrench, ShieldAlert, Crosshair } from 'lucide-react';
import type { EngineeringHotspot } from '../types/hardware';

interface EngineeringHotspotMapProps {
  artifactName: string;
  missionImageUrl: string;
  hotspots: EngineeringHotspot[];
}

export const EngineeringHotspotMap: React.FC<EngineeringHotspotMapProps> = ({
  artifactName,
  missionImageUrl,
  hotspots,
}) => {
  const [activeHotspotId, setActiveHotspotId] = useState<string>(hotspots[0]?.id || '');
  const selectedHotspot = hotspots.find((h) => h.id === activeHotspotId) || hotspots[0];
  const selectedIdx = hotspots.findIndex((h) => h.id === selectedHotspot?.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#282C37] pb-3">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase text-[#E5A93C]">
            STRUCTURAL &amp; SUBSYSTEM TELEMETRY // 3 LOCKED CALLOUT PINS
          </div>
          <h4 className="font-display text-lg font-bold uppercase text-[#F4F1EA]">
            Interactive Hardware Schematic: {artifactName}
          </h4>
        </div>
        <div className="font-mono text-xs text-[#33FF66] border border-[#282C37] bg-[#0A0B0E] px-3 py-1">
          ACTIVE CALLOUT: 0{selectedIdx + 1} OF 0{hotspots.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Schematic Diagram with SVG Leader Lines & Callout Targets */}
        <div className="lg:col-span-7 relative h-80 sm:h-96 overflow-hidden border-2 border-[#282C37] bg-[#050608]">
          <img
            src={missionImageUrl}
            alt={`${artifactName} Engineering Blueprint`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg';
            }}
            className="h-full w-full object-cover object-center opacity-80 contrast-115"
          />

          {/* Blueprint Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(229,169,60,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,169,60,0.12) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* SVG Leader Line from Active Hotspot to Top-Right Telemetry Tag */}
          {selectedHotspot && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <line
                x1={`${selectedHotspot.xPercent}%`}
                y1={`${selectedHotspot.yPercent}%`}
                x2="88%"
                y2="14%"
                stroke="#FC3D21"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <circle
                cx={`${selectedHotspot.xPercent}%`}
                cy={`${selectedHotspot.yPercent}%`}
                r="22"
                fill="none"
                stroke="#FFB000"
                strokeWidth="1.5"
              />
            </svg>
          )}

          {/* Top-Right HUD Callout Stamp */}
          {selectedHotspot && (
            <div className="pointer-events-none absolute top-3 right-3 border border-[#FC3D21] bg-[#0A0B0E]/95 px-2.5 py-1 font-mono text-[10px] text-[#FFB000]">
              TARGET 0{selectedIdx + 1} // X:{selectedHotspot.xPercent}% Y:{selectedHotspot.yPercent}%
            </div>
          )}

          {hotspots.map((spot, idx) => {
            const isSelected = spot.id === selectedHotspot?.id;
            const numLabel = `0${idx + 1}`;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => setActiveHotspotId(spot.id)}
                style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'scale-125 border-2 border-[#0A0B0E] bg-[#FC3D21] text-[#F4F1EA] shadow-[0_0_16px_#FC3D21]'
                    : 'border-2 border-[#FFB000] bg-[#0A0B0E]/95 text-[#FFB000] hover:bg-[#FFB000] hover:text-[#0A0B0E]'
                }`}
                title={spot.label}
              >
                {numLabel}
              </button>
            );
          })}

          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-stone-400 bg-[#0A0B0E]/85 px-2 py-0.5 border border-[#282C37]">
            + CLICK NUMBERED CALLOUT TARGETS [01–03] TO INSPECT HARDWARE
          </div>
        </div>

        {/* Right Blueprint Inspection Dossier */}
        <div className="lg:col-span-5 flex flex-col justify-between border-2 border-[#282C37] bg-[#111318] p-5 text-left">
          {selectedHotspot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#282C37] pb-3 font-mono text-xs">
                <span className="bg-[#FC3D21] px-2 py-0.5 font-bold text-[#0A0B0E]">
                  CALLOUT PIN 0{selectedIdx + 1}
                </span>
                <span className="text-[#E5A93C] flex items-center gap-1">
                  <Crosshair className="h-3.5 w-3.5" />
                  COORDS: [{selectedHotspot.xPercent}%, {selectedHotspot.yPercent}%]
                </span>
              </div>

              <h5 className="font-display text-lg font-bold uppercase text-[#F4F1EA]">
                {selectedHotspot.label}
              </h5>

              <div className="space-y-3">
                <div className="border-l-4 border-[#E5A93C] bg-[#0A0B0E] p-3.5">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#E5A93C] flex items-center gap-1.5 mb-1">
                    <Wrench className="h-3.5 w-3.5" />
                    PRIMARY MISSION FUNCTION
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {selectedHotspot.functionDescription}
                  </p>
                </div>

                <div className="border-l-4 border-[#FC3D21] bg-[#0A0B0E] p-3.5">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#FFB000] flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#FC3D21]" />
                    CURRENT FORENSIC CONDITION TODAY
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {selectedHotspot.statusNote}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Bottom Switcher Buttons */}
          <div className="mt-4 pt-3 border-t border-[#282C37] grid grid-cols-3 gap-2">
            {hotspots.map((spot, idx) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => setActiveHotspotId(spot.id)}
                className={`border px-2 py-1.5 font-mono text-[11px] font-bold uppercase truncate transition cursor-pointer ${
                  spot.id === selectedHotspot?.id
                    ? 'border-[#FC3D21] bg-[#FC3D21] text-[#0A0B0E]'
                    : 'border-[#282C37] bg-[#0A0B0E] text-stone-400 hover:border-[#E5A93C] hover:text-[#F4F1EA]'
                }`}
              >
                0{idx + 1}: {spot.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

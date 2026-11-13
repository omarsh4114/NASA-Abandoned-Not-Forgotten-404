import React, { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface OrbitalComparisonSliderProps {
  artifactName: string;
  missionImageUrl: string;
  orbitalImageUrl: string;
  launchYear: number;
  locationName: string;
}

export const OrbitalComparisonSlider: React.FC<OrbitalComparisonSliderProps> = ({
  artifactName,
  missionImageUrl,
  orbitalImageUrl,
  launchYear,
  locationName,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(52);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <div className="font-mono text-[11px] font-medium uppercase text-[#38BDF8]">
            LROC &amp; MRO HiRISE Optical Reconnaissance
          </div>
          <h4 className="text-base font-semibold text-white mt-0.5">
            Surface Touchdown ({launchYear}) vs. Orbital View Today
          </h4>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-[#090B0E] px-3 py-1 font-mono text-xs text-slate-300">
          Split: {sliderPos}% / {100 - sliderPos}%
        </div>
      </div>

      {/* Clean Exhibition Frame */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#090B0E]">
        {/* Interactive Split View Container */}
        <div className="relative h-80 sm:h-[400px] w-full select-none overflow-hidden bg-[#090B0E]">
          {/* Background Layer: Orbital Today Image */}
          <img
            src={orbitalImageUrl}
            alt={`${artifactName} Orbital View`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = missionImageUrl;
            }}
            className="h-full w-full object-cover object-center"
          />

          <div className="pointer-events-none absolute top-3 right-3 rounded-md border border-white/[0.08] bg-[#11141A]/90 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-200 backdrop-blur-md">
            Orbital Reconnaissance Today
          </div>

          {/* Foreground Clipped Layer: Historic Mission Surface Image */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={missionImageUrl}
              alt={`${artifactName} Mission Close-Up`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images-assets.nasa.gov/image/as11-40-5922/as11-40-5922~large.jpg';
              }}
              className="h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute top-3 left-3 rounded-md border border-white/[0.08] bg-[#11141A]/90 px-2.5 py-1 font-mono text-[11px] font-medium text-[#38BDF8] backdrop-blur-md">
              Surface Photo ({launchYear})
            </div>
          </div>

          {/* Clean Vertical Divider Line + Handle */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-[1.5px] bg-white/80"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#11141A]/95 text-white shadow-lg backdrop-blur-md">
              <MoveHorizontal className="h-4 w-4" />
            </div>
          </div>

          {/* Invisible Range Input Overlay */}
          <input
            type="range"
            min={5}
            max={95}
            value={sliderPos}
            aria-label="Comparison slider between historic mission photo and modern orbital photo"
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>

        {/* Bottom Caption */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] bg-[#11141A] px-3.5 py-2 font-mono text-[11px] text-slate-400">
          <span>Location: {locationName}</span>
          <span>Source: NASA / JPL-Caltech / GSFC / LROC / HiRISE</span>
        </div>
      </div>
    </div>
  );
};

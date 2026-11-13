import React from 'react';
import { Orbit, Compass, ArrowRight } from 'lucide-react';

export type MacroExperienceMode = 'solar-system' | 'museum-platform';

interface StoryIntroOverlayProps {
  isOpen: boolean;
  onSelectMode: (mode: MacroExperienceMode) => void;
}

export const StoryIntroOverlay: React.FC<StoryIntroOverlayProps> = ({
  isOpen,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col justify-center overflow-y-auto bg-[#07090D]/80 px-4 py-8 sm:p-10 backdrop-blur-md select-none"
    >
      <div className="mx-auto my-auto w-full max-w-4xl space-y-8 sm:space-y-10 text-center">
        {/* Top Eyebrow Tag, Title & Single Crisp Subtitle */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#38BDF8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
            <span>NASA OPEN DATA EXHIBITION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Echoes of Silence
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-lg leading-relaxed text-slate-300 font-normal">
            Explore 13 historic NASA spacecraft resting across the Moon, Mars, and deep space at true 1:1 scale.
          </p>
        </div>

        {/* Two Clean Glass Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left">
          <button
            type="button"
            onClick={() => onSelectMode('solar-system')}
            className="group flex flex-col justify-between rounded-2xl border border-white/15 bg-[#11141A]/80 p-6 sm:p-7 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/70 hover:bg-[#11141A]/95 hover:shadow-[0_18px_50px_rgba(56,189,248,0.16)] cursor-pointer min-h-[168px]"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/12 text-[#38BDF8]">
                <Orbit className="h-5 w-5" />
              </div>

              <h2 className="text-xl font-semibold text-white group-hover:text-[#38BDF8] transition">
                Solar System Explorer
              </h2>

              <p className="text-sm leading-relaxed text-slate-300">
                Trace mission trajectories and inspect spacecraft at their real planetary landing sites.
              </p>
            </div>

            <div className="mt-5 inline-flex min-h-[42px] items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
              <span>Launch Explorer</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('museum-platform')}
            className="group flex flex-col justify-between rounded-2xl border border-white/15 bg-[#11141A]/80 p-6 sm:p-7 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E5A93C]/70 hover:bg-[#11141A]/95 hover:shadow-[0_18px_50px_rgba(229,169,60,0.16)] cursor-pointer min-h-[168px]"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5A93C]/30 bg-[#E5A93C]/12 text-[#E5A93C]">
                <Compass className="h-5 w-5" />
              </div>

              <h2 className="text-xl font-semibold text-white group-hover:text-[#E5A93C] transition">
                Orbital Museum
              </h2>

              <p className="text-sm leading-relaxed text-slate-300">
                Compare all 13 spacecraft side-by-side on an architectural exhibition deck.
              </p>
            </div>

            <div className="mt-5 inline-flex min-h-[42px] items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5A93C]">
              <span>Enter Museum</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

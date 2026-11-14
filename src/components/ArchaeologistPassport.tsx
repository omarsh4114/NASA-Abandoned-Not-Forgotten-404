import React from 'react';
import {
  Award,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { SpatialArtifact } from '../data/artifacts';

interface ArchaeologistPassportProps {
  isOpen: boolean;
  onClose: () => void;
  artifacts: SpatialArtifact[];
  discoveredIds: string[];
  onUnlockAllDemo: () => void;
  onResetProgress: () => void;
}

export const ArchaeologistPassport: React.FC<ArchaeologistPassportProps> = ({
  isOpen,
  onClose,
  artifacts,
  discoveredIds,
  onUnlockAllDemo,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const count = discoveredIds.length;
  const total = artifacts.length;
  const rankTitle =
    count >= total
      ? 'Master Planetary Archaeologist'
      : count >= 7
      ? 'Deep-Space Telemetry Specialist'
      : 'Junior Space Archaeologist';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0B0E14] text-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F97316]/40 bg-[#F97316]/15 text-[#F97316]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#F97316]">
                {rankTitle}
              </div>
              <h2 className="text-lg font-bold text-white">
                Space Archaeologist Passport ({count}/{total} Logged)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onUnlockAllDemo}
              className="flex items-center gap-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-3 py-1.5 text-xs font-semibold text-[#38BDF8] hover:bg-[#38BDF8]/25 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Unlock All (Demo)</span>
            </button>
            <button
              type="button"
              onClick={onResetProgress}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Passport"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.12] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 13 Artifact Stamps Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {artifacts.map((art) => {
              const isDiscovered = discoveredIds.includes(art.id);
              return (
                <div
                  key={art.id}
                  className={`rounded-xl border p-3.5 transition ${
                    isDiscovered
                      ? 'border-[#38BDF8]/40 bg-[#38BDF8]/[0.07]'
                      : 'border-white/[0.07] bg-white/[0.02] opacity-65'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-[#38BDF8]">
                      {art.zone}
                    </span>
                    {isDiscovered ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        LOGGED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500">
                        <Lock className="h-3 w-3" />
                        UNVISITED
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-xs sm:text-sm font-semibold text-white leading-snug">
                    {art.name.split(' (')[0]}
                  </h4>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    {art.locationName} · {art.launchYear}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
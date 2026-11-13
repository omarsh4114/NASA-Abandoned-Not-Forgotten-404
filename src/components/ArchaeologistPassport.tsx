import React, { useState } from 'react';
import { X, Award, CheckCircle2, Lock, Printer, Sparkles, RotateCcw } from 'lucide-react';
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
  const [studentName, setStudentName] = useState<string>('Future Space Explorer');

  if (!isOpen) return null;

  const progressPercent = Math.round((discoveredIds.length / artifacts.length) * 100);

  const moonDone = artifacts.filter((a) => a.zone === 'Moon').every((a) => discoveredIds.includes(a.id));
  const marsDone = artifacts.filter((a) => a.zone === 'Mars').every((a) => discoveredIds.includes(a.id));
  const deepDone = artifacts
    .filter((a) => a.zone === 'Asteroids & Dwarf Planets' || a.zone === 'Deep Space')
    .every((a) => discoveredIds.includes(a.id));

  const badges = [
    {
      title: 'Moon Explorer',
      desc: 'Visited all 4 Moon spacecraft',
      unlocked: moonDone,
    },
    {
      title: 'Mars Pioneer',
      desc: 'Visited all 6 Mars rovers & landers',
      unlocked: marsDone,
    },
    {
      title: 'Deep Space Voyager',
      desc: 'Visited all 3 asteroid & deep-space probes',
      unlocked: deepDone,
    },
    {
      title: 'Master Space Historian',
      desc: 'Completed all 13 spacecraft exhibits',
      unlocked: discoveredIds.length === artifacts.length,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl overflow-y-auto">
      <div className="relative my-auto w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl text-left overflow-hidden">
        {/* Clean Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-amber-300">
                Explorer Passport
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Your Space Exhibition Progress ({discoveredIds.length} of {artifacts.length})
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[78vh] overflow-y-auto p-6 space-y-6">
          {/* Friendly Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div
                key={b.title}
                className={`rounded-2xl border p-4 transition ${
                  b.unlocked
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-white'
                    : 'border-white/10 bg-white/[0.02] text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{b.title}</span>
                  {b.unlocked ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-600 shrink-0" />
                  )}
                </div>
                <div className="mt-1.5 text-xs text-slate-300">{b.desc}</div>
              </div>
            ))}
          </div>

          {/* 13 Spacecraft Checklist */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                13 Exhibition Spacecraft
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onUnlockAllDemo}
                  className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Unlock All (Demo)
                </button>
                <button
                  type="button"
                  onClick={onResetProgress}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {artifacts.map((art) => {
                const unlocked = discoveredIds.includes(art.id);
                return (
                  <div
                    key={art.id}
                    className={`rounded-xl border p-3 text-xs flex items-center gap-2.5 ${
                      unlocked
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-500'
                    }`}
                  >
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-600 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="font-semibold truncate text-white">{art.name.split(' (')[0]}</div>
                      <div className="text-[11px] text-slate-400">{art.zone}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Printable Certificate */}
          <div
            id="printable-certificate"
            className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 p-6 text-center space-y-4"
          >
            <div className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              Official NASA Space Apps Exhibition Certificate
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Certificate of Space Exploration
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              This certifies that the explorer named below has visited the Cis-Lunar Spatial Exhibition and discovered the stories of NASA&apos;s historic spacecraft:
            </p>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                aria-label="Your Name for Certificate"
                className="w-full border-b border-amber-400/50 bg-transparent px-4 py-1.5 text-center text-base font-bold text-amber-300 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-1">
              <span>Spacecraft Visited: {discoveredIds.length} / 13 ({progressPercent}%)</span>
              <span>Team: Spaghetti Coders</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

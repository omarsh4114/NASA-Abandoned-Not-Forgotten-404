import React, { useState } from 'react';
import {
  Award,
  X,
  CheckCircle2,
  Lock,
  Download,
  Sparkles,
  RotateCcw,
  Printer,
  ShieldCheck,
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

function computeVerificationHash(name: string, ids: string[]): string {
  const seed = `${name.trim().toUpperCase()}|${[...ids].sort().join(',')}|1420MHZ`;
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const partA = (h1 >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  const partB = (h2 >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  const countHex = ids.length.toString(16).toUpperCase().padStart(2, '0');
  return `EOS-${partA}-1420-${partB}-${countHex}`;
}

export const ArchaeologistPassport: React.FC<ArchaeologistPassportProps> = ({
  isOpen,
  onClose,
  artifacts,
  discoveredIds,
  onUnlockAllDemo,
  onResetProgress,
}) => {
  const [explorerName, setExplorerName] = useState('');
  const [usedDemoUnlock, setUsedDemoUnlock] = useState(false);

  if (!isOpen) return null;

  const count = discoveredIds.length;
  const total = artifacts.length;
  const rankTitle =
    count >= total
      ? 'Master Planetary Archaeologist'
      : count >= 7
      ? 'Deep-Space Telemetry Specialist'
      : 'Junior Space Archaeologist';

  const verificationId = computeVerificationHash(
    explorerName || 'SPACE ARCHAEOLOGIST',
    discoveredIds
  );

  const renderCertificateDataUrl = (): string | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Deep space radial/linear backdrop
    const bg = ctx.createLinearGradient(0, 0, 2400, 1700);
    bg.addColorStop(0, '#060910');
    bg.addColorStop(0.5, '#0C1322');
    bg.addColorStop(1, '#060910');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 2400, 1700);

    // Architectural telemetry grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.055)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= 2400; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1700);
      ctx.stroke();
    }
    for (let y = 0; y <= 1700; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2400, y);
      ctx.stroke();
    }

    // Outer & inner precision frames
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 6;
    ctx.strokeRect(72, 72, 2256, 1556);

    ctx.strokeStyle = 'rgba(229, 169, 60, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(98, 98, 2204, 1504);

    // Corner calibration ticks
    const corners = [
      [98, 98],
      [2302, 98],
      [98, 1602],
      [2302, 1602],
    ];
    ctx.fillStyle = '#E5A93C';
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top telemetry header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('NASA SPACE APPS CHALLENGE · ECHOES OF SILENCE', 1200, 210);

    ctx.fillStyle = '#E5A93C';
    ctx.font = 'bold 76px sans-serif';
    ctx.fillText('CERTIFICATE OF PLANETARY ARCHAEOLOGY', 1200, 325);

    // Telemetry verification pill
    const statusLabel = usedDemoUnlock
      ? 'MODE: ARCHIVAL DEMO PREVIEW'
      : 'MODE: VERIFIED FIELD TELEMETRY';
    ctx.fillStyle = usedDemoUnlock ? 'rgba(249, 115, 22, 0.16)' : 'rgba(16, 185, 129, 0.16)';
    ctx.fillRect(880, 365, 640, 48);
    ctx.strokeStyle = usedDemoUnlock ? '#F97316' : '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(880, 365, 640, 48);
    ctx.fillStyle = usedDemoUnlock ? '#FDBA74' : '#6EE7B7';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(statusLabel, 1200, 397);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '34px sans-serif';
    ctx.fillText('This official archival credential certifies that', 1200, 495);

    // Explorer Name
    const displayName = explorerName.trim() || 'Space Archaeologist';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 94px sans-serif';
    ctx.fillText(displayName, 1200, 625);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(560, 662);
    ctx.lineTo(1840, 662);
    ctx.stroke();

    // Mission scope text
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '38px sans-serif';
    ctx.fillText(
      `has inspected ${count} of ${total} historic NASA spacecraft across the Moon, Mars,`,
      1200,
      760
    );
    ctx.fillText(
      '433 Eros, 1 Ceres, and Interstellar Space in 1:1 Metric Scale & Web AR.',
      1200,
      818
    );

    // Rank Ribbon
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.fillRect(680, 885, 1040, 88);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.strokeRect(680, 885, 1040, 88);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`RANK: ${rankTitle.toUpperCase()}`, 1200, 941);

    // 13-Spacecraft Visual Stamp Strip
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('13-ARTIFACT TELEMETRY LOG MATRIX', 1200, 1055);

    const startX = 270;
    const gapX = 155;
    artifacts.forEach((art, idx) => {
      const cx = startX + idx * gapX;
      const cy = 1135;
      const logged = discoveredIds.includes(art.id);

      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.fillStyle = logged ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = logged ? '#38BDF8' : 'rgba(148, 163, 184, 0.35)';
      ctx.stroke();

      ctx.fillStyle = logged ? '#FFFFFF' : '#64748B';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(String(idx + 1).padStart(2, '0'), cx, cy + 8);

      ctx.fillStyle = logged ? '#94A3B8' : '#475569';
      ctx.font = '16px monospace';
      ctx.fillText(art.targetBody.slice(0, 6).toUpperCase(), cx, cy + 56);
    });

    // Footer metadata & checksum
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '26px monospace';
    ctx.fillText(`DATE ISSUED: ${dateStr}`, 170, 1380);
    ctx.fillText(`CHECKSUM: ${verificationId}`, 170, 1430);
    ctx.fillText('DATASETS: NASA PDS · LROC · MRO HIRISE · JPL HORIZONS', 170, 1480);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#E5A93C';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('TEAM SPAGHETTI CODERS', 2230, 1380);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '26px monospace';
    ctx.fillText('1420 MHZ BLACK-BOX ARCHIVE', 2230, 1430);
    ctx.fillText('NASA SPACE APPS GLOBAL SUBMISSION', 2230, 1480);

    return canvas.toDataURL('image/png');
  };

  const handleDownloadPng = () => {
    const dataUrl = renderCertificateDataUrl();
    if (!dataUrl) return;
    const displayName = (explorerName.trim() || 'Space_Archaeologist').replace(/\s+/g, '_');
    const link = document.createElement('a');
    link.download = `NASA_Space_Archaeologist_Certificate_${displayName}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrintPdf = () => {
    const dataUrl = renderCertificateDataUrl();
    if (!dataUrl) return;
    const printWin = window.open('', '_blank', 'width=1100,height=800');
    if (!printWin) return;
    printWin.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Space Archaeologist Certificate - ${verificationId}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; background: #060910; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWin.document.close();
  };

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
              onClick={() => {
                setUsedDemoUnlock(true);
                onUnlockAllDemo();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-3 py-1.5 text-xs font-semibold text-[#38BDF8] hover:bg-[#38BDF8]/25 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Unlock All (Demo)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUsedDemoUnlock(false);
                onResetProgress();
              }}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Print-Resolution Certificate Generator Card */}
          <div className="rounded-xl border border-[#E5A93C]/35 bg-gradient-to-r from-[#E5A93C]/[0.1] via-[#38BDF8]/[0.06] to-transparent p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#E5A93C]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Print-Resolution STEM Credential (2400×1700)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Checksum: <strong className="text-slate-200">{verificationId}</strong>
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <p className="text-xs text-slate-300 max-w-md">
                Enter an explorer or student name to export a tamper-stamped mission credential
                encoding your rank (<span className="text-white font-medium">{rankTitle}</span>)
                and 13-mission stamp matrix.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={explorerName}
                  onChange={(e) => setExplorerName(e.target.value)}
                  placeholder="Enter Explorer Name..."
                  className="rounded-lg border border-white/15 bg-slate-950/90 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#E5A93C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#E5A93C] px-3.5 py-2 text-xs font-bold text-[#090B0E] hover:brightness-110 transition cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Hi-Res PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.12] transition cursor-pointer whitespace-nowrap"
                >
                  <Printer className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* 13 Artifact Stamps Grid */}
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
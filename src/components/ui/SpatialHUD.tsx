import React, { useState, useMemo } from 'react';
import {
  Orbit,
  Compass,
  Box,
  ChevronLeft,
  ChevronRight,
  Tag,
  UserCheck,
  Maximize2,
  Minimize2,
  Camera,
  Award,
  BookOpen,
  Film,
  Info,
  X,
  RotateCcw,
  Cpu,
  Database,
  ImageOff,
  Volume2,
  VolumeX,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  MapPin,
} from 'lucide-react';
import type {
  SpatialArtifact,
  SpatialTier,
  TargetCelestialBody,
  MechanicalHotspot,
} from '../../data/artifacts';
import { NASA_HARDWARE_DATA, OMAR_STORIES } from '../../data/nasaHardware';
import type { MacroExperienceMode } from './StoryIntroOverlay';
import { OnScreenArrowPad } from '../ArrowCameraController';
import {
  ArtifactCommsCharacter,
  playArtifactVoice,
  stopArtifactVoice,
  useArtifactVoiceState,
} from '../inspector/ArtifactCommsCharacter';
import { generateQrMatrix } from '../../utils/qrCodeSvg';
import { getNasaOrbitalProfile } from '../../utils/nasaOrbitalLinks';

interface SpatialHUDProps {
  artifacts: SpatialArtifact[];
  activeArtifact: SpatialArtifact | null;
  macroMode: MacroExperienceMode;
  tier: SpatialTier;
  selectedBody: TargetCelestialBody | null;
  zoneFilter: 'All' | 'Moon' | 'Mars' | 'Asteroids & Dwarf Planets' | 'Deep Space';
  normalizedScale: boolean;
  showHotspots: boolean;
  showAstronautScale: boolean;
  activeHotspot: MechanicalHotspot | null;
  arPassthrough: boolean;
  discoveredCount: number;
  onSelectMacroMode: (mode: MacroExperienceMode) => void;
  onSelectTier: (tier: SpatialTier) => void;
  onSelectZoneFilter: (
    zone: 'All' | 'Moon' | 'Mars' | 'Asteroids & Dwarf Planets' | 'Deep Space'
  ) => void;
  onSelectArtifact: (artifact: SpatialArtifact) => void;
  onStepArtifact: (dir: 'prev' | 'next') => void;
  onToggleNormalizedScale: () => void;
  onToggleHotspots: () => void;
  onToggleAstronautScale: () => void;
  onSelectHotspot: (hotspot: MechanicalHotspot | null) => void;
  onToggleArPassthrough: () => void;
  onResetCameraView: () => void;
  onOpenIntro: () => void;
  onOpenPassport: () => void;
  onOpenCitations: () => void;
}

type DrawerTab = 'story' | 'hotspots';

export const SpatialHUD: React.FC<SpatialHUDProps> = ({
  artifacts,
  activeArtifact,
  macroMode,
  tier,
  zoneFilter,
  normalizedScale,
  showHotspots,
  showAstronautScale,
  activeHotspot,
  arPassthrough,
  discoveredCount,
  onSelectMacroMode,
  onSelectTier,
  onSelectZoneFilter,
  onSelectArtifact,
  onStepArtifact,
  onToggleNormalizedScale,
  onToggleHotspots,
  onToggleAstronautScale,
  onSelectHotspot,
  onToggleArPassthrough,
  onResetCameraView,
  onOpenIntro,
  onOpenPassport,
  onOpenCitations,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>('story');
  const [photoStage, setPhotoStage] = useState<0 | 1 | 2>(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [prevArtifactId, setPrevArtifactId] = useState<string | undefined>(activeArtifact?.id);
  const [prevHotspotId, setPrevHotspotId] = useState<string | undefined>(activeHotspot?.id);

  const { isSpeaking } = useArtifactVoiceState();

  if (activeArtifact?.id !== prevArtifactId) {
    setPrevArtifactId(activeArtifact?.id);
    setActiveTab('story');
    setPhotoStage(0);
  }

  if (activeHotspot?.id !== prevHotspotId) {
    setPrevHotspotId(activeHotspot?.id);
    if (activeHotspot) {
      setIsDrawerOpen(true);
      setActiveTab('hotspots');
    }
  }

  const filteredArtifacts =
    zoneFilter === 'All'
      ? artifacts
      : artifacts.filter((a) => a.zone === zoneFilter);

  const nasaHardware = activeArtifact
    ? NASA_HARDWARE_DATA.find((h) => h.id === activeArtifact.id) ?? NASA_HARDWARE_DATA[0]
    : null;

  const orbitalProfile = activeArtifact ? getNasaOrbitalProfile(activeArtifact) : null;

  const isLandedSurfaceArtifact =
    activeArtifact !== null &&
    activeArtifact.zone !== 'Deep Space' &&
    activeArtifact.statusCategory !== 'Drifting' &&
    activeArtifact.targetBody !== 'Ceres' &&
    activeArtifact.targetBody !== 'Interstellar' &&
    (activeArtifact.zone === 'Moon' ||
      activeArtifact.zone === 'Mars' ||
      activeArtifact.id === 'near-shoemaker');

  const canShowAstronautToggle = isLandedSurfaceArtifact && tier === 'inspector';

  const activePhotoSrc =
    nasaHardware && photoStage === 0
      ? nasaHardware.missionImageUrl
      : nasaHardware && photoStage === 1
      ? nasaHardware.orbitalImageUrl
      : null;

  const mobileArShareUrl =
    typeof window !== 'undefined' && activeArtifact
      ? `${window.location.origin}/?a=${encodeURIComponent(activeArtifact.id)}&ar=1`
      : '';

  const qrMatrix = useMemo(
    () => (isQrModalOpen && mobileArShareUrl ? generateQrMatrix(mobileArShareUrl) : null),
    [isQrModalOpen, mobileArShareUrl]
  );

  const handleCopyQrUrl = () => {
    if (!mobileArShareUrl) return;
    navigator.clipboard?.writeText(mobileArShareUrl);
    setCopiedQrLink(true);
    setTimeout(() => setCopiedQrLink(false), 2000);
  };

  const handleCopyCoords = () => {
    if (!orbitalProfile) return;
    navigator.clipboard?.writeText(`${orbitalProfile.formattedCoords} (${orbitalProfile.iauDatum})`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div
      style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
      className="pointer-events-none fixed inset-0 z-30 flex h-[100dvh] flex-col justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:p-5 select-none"
    >
      {/* ==================== TOP MINIMAL NAVIGATION BAR + STACKED CONTEXT PILLS ==================== */}
      <div className="flex flex-col items-start gap-1.5 sm:gap-2 w-full">
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-1.5 md:gap-2.5 w-full">
          {/* Left: Brand + Mode Switcher */}
          <div className="pointer-events-auto flex flex-nowrap md:flex-wrap items-center gap-1 max-w-full overflow-x-auto no-scrollbar rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-2 py-1 md:px-2.5 md:py-1.5 backdrop-blur-md shadow-xl">
            <button
              type="button"
              onClick={onOpenIntro}
              className="flex shrink-0 items-center gap-2 pr-2.5 border-r border-white/[0.08] hover:text-[#38BDF8] transition cursor-pointer min-h-[36px] md:min-h-0"
              title="Replay Story Intro"
            >
              <span className="h-2 w-2 rounded-full bg-[#38BDF8] shrink-0" />
              <span
                style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
                className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap"
              >
                Echoes of Silence
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMacroMode('solar-system')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 md:py-1 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                macroMode === 'solar-system' && tier !== 'inspector'
                  ? 'bg-[#38BDF8] text-[#090B0E] font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Orbit className="h-3.5 w-3.5 shrink-0" />
              <span>Solar System</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMacroMode('museum-platform')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 md:py-1 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                macroMode === 'museum-platform' && tier !== 'inspector'
                  ? 'bg-[#38BDF8] text-[#090B0E] font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span>Orbital Museum</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!activeArtifact) onSelectArtifact(artifacts[0]);
                onSelectTier('inspector');
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 md:py-1 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                tier === 'inspector'
                  ? 'bg-[#38BDF8] text-[#090B0E] font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Box className="h-3.5 w-3.5 shrink-0" />
              <span>1:1 Surface Stage</span>
            </button>
          </div>

          {/* Center: Zone Filter Pills */}
          <div className="pointer-events-auto hidden xl:flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#11141A]/90 p-1 backdrop-blur-md">
            {(
              [
                { label: 'All (13)', value: 'All' },
                { label: 'Moon (4)', value: 'Moon' },
                { label: 'Mars (6)', value: 'Mars' },
                { label: 'Asteroids (2)', value: 'Asteroids & Dwarf Planets' },
                { label: 'Deep Space (1)', value: 'Deep Space' },
              ] as const
            ).map((z) => (
              <button
                key={z.value}
                type="button"
                onClick={() => onSelectZoneFilter(z.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                  zoneFilter === z.value
                    ? 'bg-white/[0.12] text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Right: Reset View (R), Scoped 1:1 AR Button, Offline QR, Passport & Sources */}
          <div className="pointer-events-auto flex flex-nowrap md:flex-wrap items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={onResetCameraView}
              title="Reset Camera View (Shortcut: R)"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-slate-300 hover:bg-white/[0.06] hover:text-white backdrop-blur-md transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
              <span className="hidden sm:inline">Reset View</span>
              <kbd className="hidden md:inline-block rounded bg-white/[0.06] px-1 font-mono text-[10px] text-slate-400">
                R
              </kbd>
            </button>

            {tier === 'inspector' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (normalizedScale) {
                      onToggleNormalizedScale();
                    }
                    onToggleArPassthrough();
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap backdrop-blur-md transition cursor-pointer ${
                    arPassthrough
                      ? 'border-[#38BDF8] bg-[#38BDF8] text-[#090B0E]'
                      : 'border-white/[0.08] bg-[#11141A]/90 text-slate-200 hover:border-white/25'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 shrink-0" />
                  <span>{arPassthrough ? 'Exit AR Camera' : '1:1 AR Mode'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  title="Zero-dependency SVG QR code to launch 1:1 Web AR on mobile"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-slate-200 hover:border-[#38BDF8]/50 hover:text-white backdrop-blur-md transition cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                  <span className="hidden sm:inline">Phone AR QR</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onOpenIntro}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-2.5 sm:px-3 py-1.5 text-xs font-medium whitespace-nowrap text-slate-300 hover:bg-white/[0.06] hover:text-white backdrop-blur-md transition cursor-pointer"
            >
              <Film className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
              <span>Intro</span>
            </button>

            <button
              type="button"
              onClick={onOpenPassport}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-2.5 sm:px-3 py-1.5 text-xs font-medium whitespace-nowrap text-slate-200 hover:bg-white/[0.06] backdrop-blur-md transition cursor-pointer"
            >
              <Award className="h-3.5 w-3.5 text-[#F97316] shrink-0" />
              <span>Passport ({discoveredCount}/13)</span>
            </button>

            <button
              type="button"
              onClick={onOpenCitations}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-2.5 sm:px-3 py-1.5 text-xs font-medium whitespace-nowrap text-slate-300 hover:bg-white/[0.06] hover:text-white backdrop-blur-md transition cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>Sources</span>
            </button>
          </div>
        </div>

        {/* DOCKED 28PX TRAJECTORY TELEMETRY STRIP (Solar System Mode) */}
        {macroMode === 'solar-system' && tier !== 'inspector' && activeArtifact && (
          <div
            style={{ height: '28px', wordSpacing: 'normal', letterSpacing: 'normal' }}
            className="pointer-events-none hidden sm:inline-flex items-center gap-2.5 rounded-md border border-white/[0.08] bg-[#11141A]/85 px-3 font-mono text-[11px] text-slate-300 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
            <span className="font-semibold text-white">
              EARTH → {activeArtifact.targetBody.toUpperCase()}
            </span>
            <span className="text-slate-600">·</span>
            <span>{activeArtifact.distanceFromEarth}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{activeArtifact.transferDuration}</span>
          </div>
        )}

        {/* 1:1 STAGE SCALE & ASTRONAUT CONTROLS */}
        {tier === 'inspector' && activeArtifact && (
          <div
            style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
            className="pointer-events-auto flex flex-nowrap md:flex-wrap items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar"
          >
            <button
              type="button"
              disabled={arPassthrough}
              onClick={onToggleNormalizedScale}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap backdrop-blur-md transition ${
                arPassthrough
                  ? 'border-white/[0.08] bg-[#11141A]/60 text-slate-500 cursor-not-allowed'
                  : normalizedScale
                  ? 'border-[#F97316]/50 bg-[#11141A]/90 text-[#F97316] cursor-pointer'
                  : 'border-white/[0.08] bg-[#11141A]/90 text-slate-200 hover:border-white/25 cursor-pointer'
              }`}
            >
              {normalizedScale && !arPassthrough ? (
                <Minimize2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
              )}
              <span>{normalizedScale ? 'Normalized Scale' : '1:1 True Metric Scale'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleHotspots}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap backdrop-blur-md transition cursor-pointer ${
                showHotspots
                  ? 'border-[#38BDF8]/50 bg-[#11141A]/90 text-[#38BDF8]'
                  : 'border-white/[0.08] bg-[#11141A]/90 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <span>3D Pins: {showHotspots ? 'ON' : 'OFF'}</span>
            </button>

            {canShowAstronautToggle && (
              <button
                type="button"
                onClick={onToggleAstronautScale}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap backdrop-blur-md transition cursor-pointer ${
                  showAstronautScale
                    ? 'border-[#38BDF8]/50 bg-[#11141A]/90 text-[#38BDF8]'
                    : 'border-white/[0.08] bg-[#11141A]/90 text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                <span>1.75m Astronaut: {showAstronautScale ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ==================== ZERO-DEPENDENCY SVG PHONE AR QR MODAL ==================== */}
      {isQrModalOpen && activeArtifact && qrMatrix && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0D1117] p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">
                  Direct 1:1 WebRTC AR Handshake
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Anchor {activeArtifact.name.split(' (')[0]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.1] hover:text-white cursor-pointer"
                aria-label="Close QR Modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white p-4">
              <svg
                viewBox={`-4 -4 ${qrMatrix.size + 8} ${qrMatrix.size + 8}`}
                className="h-48 w-48"
                shapeRendering="crispEdges"
                aria-label="Scannable 1:1 Web AR QR Code"
              >
                <rect
                  x={-4}
                  y={-4}
                  width={qrMatrix.size + 8}
                  height={qrMatrix.size + 8}
                  fill="#FFFFFF"
                />
                {qrMatrix.modules.map((row, r) =>
                  row.map((isDark, c) =>
                    isDark ? (
                      <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#090B0E" />
                    ) : null
                  )
                )}
              </svg>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              Scan with any iOS or Android camera to open{' '}
              <span className="font-semibold text-white">
                {activeArtifact.name.split(' (')[0]}
              </span>{' '}
              at <span className="font-mono text-[#38BDF8]">{activeArtifact.dimensions.label.split(' (')[0]}</span>{' '}
              directly in live floor AR mode.
            </p>

            <button
              type="button"
              onClick={handleCopyQrUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] py-2 text-xs font-semibold text-white transition cursor-pointer"
            >
              {copiedQrLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Direct AR Deep-Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Copy Direct 1:1 AR URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================== RIGHT-SIDE GLASS OVERLAY DRAWER ==================== */}
      {activeArtifact && nasaHardware && isDrawerOpen && (
        <aside className="pointer-events-auto fixed top-0 right-0 bottom-0 z-40 flex h-[100dvh] w-full max-w-[440px] flex-col border-l border-white/10 bg-[#0B0E14]/92 backdrop-blur-xl shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          {/* Drawer Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 pt-5 pb-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">
                  {activeArtifact.zone}
                </span>
                <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  {activeArtifact.statusCategory}
                </span>
              </div>
              <h2 className="mt-2 text-base sm:text-lg font-semibold text-white leading-snug">
                {activeArtifact.name}
              </h2>
            </div>

            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close drawer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.12] hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 2 Tabs: Story | Hotspots */}
          <div className="grid grid-cols-2 gap-1.5 border-b border-white/10 bg-white/[0.02] px-4 py-2">
            {(
              [
                { id: 'story', label: 'Story & Voice', icon: BookOpen },
                { id: 'hotspots', label: 'Hotspots', icon: Cpu },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#38BDF8] text-[#090B0E] font-semibold'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'story' && (
              <div style={{ wordSpacing: 'normal', letterSpacing: 'normal' }} className="space-y-4">
                {/* Top Archival NASA Mission / Orbital Photograph */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#07090D]">
                  {activePhotoSrc ? (
                    <img
                      key={`${activeArtifact.id}-${photoStage}`}
                      src={activePhotoSrc}
                      alt={`${activeArtifact.name} NASA archive`}
                      onError={() => {
                        setPhotoStage((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : 2));
                      }}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0F172A] via-[#0B0E14] to-[#090B0E] p-4 text-center">
                      <ImageOff className="h-5 w-5 text-slate-500" />
                      <div className="font-mono text-[11px] font-semibold text-slate-300">
                        {activeArtifact.name.split(' (')[0]}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {activeArtifact.locationName}
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090D]/95 via-[#07090D]/55 to-transparent px-3 pt-6 pb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded border border-[#E5A93C]/35 bg-[#07090D]/80 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#E5A93C]">
                      NASA ARCHIVE PHOTO
                    </span>
                    <span className="truncate font-mono text-[10px] text-slate-300">
                      {photoStage === 1 ? 'Orbital Reconnaissance' : activeArtifact.targetBody} · {activeArtifact.launchYear}
                    </span>
                  </div>
                </div>

                {/* Black-Box Talking Character + Live Transcript + Q&A Engine */}
                <ArtifactCommsCharacter
                  artifactId={activeArtifact.id}
                  artifactName={activeArtifact.name.split(' (')[0]}
                  story={OMAR_STORIES[activeArtifact.id] || activeArtifact.kidFriendlyStory}
                />

                {/* IAU Planetocentric GIS & NASA Orbital Map Bridge */}
                {orbitalProfile && (
                  <div className="rounded-xl border border-[#E5A93C]/35 bg-[#E5A93C]/[0.07] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#E5A93C]">
                        <MapPin className="h-3 w-3" />
                        <span>{orbitalProfile.instrumentBadge}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCoords}
                        className="inline-flex items-center gap-1 rounded border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-slate-300 hover:text-white cursor-pointer"
                        title="Copy IAU Planetocentric Coordinates"
                      >
                        {copiedCoords ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-2.5 w-2.5" />
                            <span>{orbitalProfile.formattedCoords}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="font-mono text-[10px] text-slate-400">
                      Datum: {orbitalProfile.iauDatum}
                    </div>

                    <a
                      href={orbitalProfile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#E5A93C]/40 bg-[#E5A93C]/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#E5A93C]/25"
                    >
                      <span className="truncate">{orbitalProfile.portalName}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#E5A93C]" />
                    </a>
                  </div>
                )}

                {/* 2x2 Telemetry Grid: Location, Active Years, Why It Stopped, Science Unlocked */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </div>
                    <div className="mt-1 text-xs font-medium text-white leading-snug">
                      {activeArtifact.locationName}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-[#38BDF8]">
                      {activeArtifact.coordinates}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Active Years
                    </div>
                    <div className="mt-1 font-mono text-xs font-semibold text-white">
                      {activeArtifact.launchYear} – {activeArtifact.endYear}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-400 leading-snug">
                      {activeArtifact.dimensions.label.split(' (')[0]}
                    </div>
                  </div>

                  <div className="col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#F97316]">
                      Why It Stopped
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {nasaHardware.whyItStopped}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8]">
                      Science Unlocked
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {nasaHardware.scienceUnlocked}
                    </p>
                  </div>
                </div>

                {/* Highlighted NASA DATA SOURCE Citation Pill */}
                <div className="rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/[0.07] p-3.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#38BDF8]/35 bg-[#38BDF8]/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8]">
                    <Database className="h-3 w-3" />
                    <span>NASA DATA SOURCE</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-200">
                    {nasaHardware.nasaDataSource}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: HOTSPOTS */}
            {activeTab === 'hotspots' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Select an engineering subsystem below to highlight its 3D pin directly on the spacecraft:
                </p>
                {activeArtifact.hotspots.map((hs, idx) => {
                  const isSelected = activeHotspot?.id === hs.id;
                  return (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => {
                        onSelectHotspot(isSelected ? null : hs);
                        if (tier !== 'inspector') {
                          onSelectTier('inspector');
                        }
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#38BDF8] bg-[#38BDF8]/12 text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-200 hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">
                          {idx + 1}. {hs.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#38BDF8]">
                          {isSelected ? 'Active Pin' : 'Highlight 3D Pin →'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {hs.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ==================== BOTTOM COMPACT ACTION BAR + ARTIFACT SELECTOR DOCK ==================== */}
      <div className="mt-auto mb-4 md:mb-0 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-0 flex flex-col items-center gap-2 w-full">
        {activeArtifact && (
          <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 rounded-xl border border-white/[0.08] bg-[#11141A]/90 px-3 py-2 sm:px-3.5 backdrop-blur-md shadow-xl max-w-3xl w-full">
            {/* Left: Prev/Next + Artifact Name & Celestial Zone Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onStepArtifact('prev')}
                  className="flex min-h-[42px] min-w-[42px] md:min-h-[30px] md:min-w-[30px] md:h-7 md:w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white cursor-pointer"
                  title="Previous Artifact"
                  aria-label="Previous Artifact"
                >
                  <ChevronLeft className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onStepArtifact('next')}
                  className="flex min-h-[42px] min-w-[42px] md:min-h-[30px] md:min-w-[30px] md:h-7 md:w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white cursor-pointer"
                  title="Next Artifact"
                  aria-label="Next Artifact"
                >
                  <ChevronRight className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
              </div>

              <div style={{ wordSpacing: 'normal', letterSpacing: 'normal' }} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
                    className="truncate text-xs sm:text-sm font-semibold text-white"
                  >
                    {activeArtifact.name.split(' (')[0]}
                  </span>
                  <span className="shrink-0 rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-[#38BDF8]">
                    {activeArtifact.zone}
                  </span>
                </div>
                <div
                  style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
                  className="hidden sm:block font-mono text-[10px] text-slate-400 truncate"
                >
                  {activeArtifact.locationName} · {activeArtifact.dimensions.width}m ×{' '}
                  {activeArtifact.dimensions.height}m
                </div>
              </div>
            </div>

            {/* Right: Voice Toggle + 1:1 Surface Switch + More Info Drawer Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() =>
                  isSpeaking
                    ? stopArtifactVoice()
                    : playArtifactVoice(
                        activeArtifact.id,
                        OMAR_STORIES[activeArtifact.id] || activeArtifact.kidFriendlyStory,
                        { forceRestart: true }
                      )
                }
                className={`flex flex-1 sm:flex-initial min-h-[42px] md:min-h-[32px] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isSpeaking
                    ? 'border-[#38BDF8]/60 bg-[#38BDF8]/15 text-[#38BDF8]'
                    : 'border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.1] hover:text-white'
                }`}
                title={isSpeaking ? 'Stop Voice Transmission' : 'Play Spacecraft Voice Log'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 animate-pulse shrink-0" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {tier !== 'inspector' ? (
                <button
                  type="button"
                  onClick={() => onSelectTier('inspector')}
                  className="flex flex-1 sm:flex-initial min-h-[42px] md:min-h-[32px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/[0.1] hover:text-white transition cursor-pointer whitespace-nowrap"
                >
                  <Box className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                  <span>1:1 Surface</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onSelectTier(macroMode === 'solar-system' ? 'trajectory' : 'orrery')
                  }
                  className="flex flex-1 sm:flex-initial min-h-[42px] md:min-h-[32px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/[0.1] hover:text-white transition cursor-pointer whitespace-nowrap"
                >
                  <Orbit className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                  <span>{macroMode === 'solar-system' ? 'Solar Map' : 'Museum Deck'}</span>
                </button>
              )}

              {/* More Info Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={`flex flex-1 sm:flex-initial min-h-[42px] md:min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isDrawerOpen
                    ? 'bg-white text-[#090B0E]'
                    : 'bg-[#38BDF8] text-[#090B0E] hover:brightness-110'
                }`}
              >
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>{isDrawerOpen ? 'Close Info' : 'More Info'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Artifact Selector Strip */}
        <div className="pointer-events-auto mx-auto w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-[#11141A]/90 p-1.5 sm:p-2 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filteredArtifacts.map((art) => {
              const isSelected = activeArtifact?.id === art.id;
              return (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => onSelectArtifact(art)}
                  className={`group flex min-h-[42px] md:min-h-[34px] shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      art.zone === 'Moon'
                        ? 'bg-[#38BDF8]'
                        : art.zone === 'Mars'
                        ? 'bg-[#F97316]'
                        : art.zone === 'Asteroids & Dwarf Planets'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}>
                    <div
                      style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
                      className="text-xs font-medium leading-tight whitespace-nowrap"
                    >
                      {art.name.split(' (')[0]}
                    </div>
                    <div
                      style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
                      className="font-mono text-[10px] text-slate-400 leading-tight"
                    >
                      {art.targetBody} · {art.launchYear}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minimal On-Screen Arrow D-Pad */}
      <OnScreenArrowPad />
    </div>
  );
};
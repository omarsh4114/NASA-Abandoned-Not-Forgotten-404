import React from 'react';
import { X, BookOpen, Database, Bot, ShieldCheck, ExternalLink, FileText, Video, Radio } from 'lucide-react';
import { NASA_HARDWARE_DATA } from '../data/nasaHardware';
import { SPATIAL_ARTIFACTS } from '../data/artifacts';

interface CitationsAndAIDisclosureProps {
  isOpen: boolean;
  onClose: () => void;
}

const NASA_CITATIONS = [
  {
    name: 'NASA 3D Resources & Official Spacecraft Models',
    url: 'https://nasa3d.arc.nasa.gov/',
    usage: 'Reference 3D spacecraft glTF/GLB geometry and engineering subsystem proportions for Apollo, Ingenuity, InSight, Viking, Dawn, and Pioneer.',
  },
  {
    name: 'Lunar Reconnaissance Orbiter Camera (LROC)',
    url: 'https://www.lroc.asu.edu/',
    usage: 'Lunar landing site coordinates and orbital reconnaissance NAC imagery for Apollo 11 Eagle, LRRR, Apollo 17 LRV-3, and Surveyor 3.',
  },
  {
    name: 'Mars Reconnaissance Orbiter HiRISE',
    url: 'https://www.uahirise.org/',
    usage: 'Martian surface coordinates and high-resolution orbital imagery for Ingenuity, Opportunity, Spirit, InSight, Phoenix, and Sojourner / Viking 1.',
  },
  {
    name: 'NASA Planetary Data System (PDS)',
    url: 'https://pds.nasa.gov/',
    usage: 'Geotechnical, seismological (SEIS), and Small Bodies Node (433 Eros & Ceres) telemetry archives.',
  },
  {
    name: 'NASA Space Science Data Coordinated Archive (NSSDCA)',
    url: 'https://nssdc.gsfc.nasa.gov/',
    usage: 'Master spacecraft catalog IDs, launch/end dates, metric dimensions, and orbital parameters across all 13 missions.',
  },
  {
    name: 'NASA Image and Video Library & Exoplanet Archive',
    url: 'https://images.nasa.gov/',
    usage: 'Public-domain archival mission photography, Kepler transit photometry records, and Deep Space Network trajectory logs.',
  },
];

export const CitationsAndAIDisclosure: React.FC<CitationsAndAIDisclosureProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-4xl rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl text-left overflow-hidden">
        {/* Clean Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-cyan-300">
                NASA Open Data Exhibition &amp; Compliance
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Project Summary, Verified NASA Data Sources &amp; AI-Use Disclosure
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
        <div className="max-h-[78vh] overflow-y-auto p-6 space-y-5">
          {/* Official 150-Word Project Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Project Summary (NASA Space Apps Challenge — Abandoned but Not Forgotten)
              </span>
              <span className="text-slate-400">Team: Spaghetti Coders</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Decades of planetary exploration have left dozens of silent NASA landers, rovers, and probes resting across our Solar System. To students aged 10–14, these inactive machines can seem like forgotten &ldquo;space junk&rdquo; rather than priceless scientific monuments. <strong>Echoes of Silence</strong> transforms 13 real NASA spacecraft across the Moon, Mars, Asteroid 433 Eros, Dwarf Planet Ceres, and Deep Space into a three-tier 3D exhibition. Visitors trace real interplanetary transfer trajectories in the <strong>Solar System Explorer</strong>, compare all 13 spacecraft side-by-side on the <strong>Orbital Museum</strong> deck, and step onto the <strong>1:1 Surface Stage</strong> to inspect hardware beside a true-scale 1.75m astronaut or in live WebXR AR camera passthrough. Inside each exhibit, students switch between historic surface photos and modern LROC/HiRISE orbital reconnaissance, inspect 3D engineering hotspots, view real-time radio light-delay telemetry, and interview the spacecraft in first person.
            </p>
          </div>

          {/* Mandatory AI Disclosure Box */}
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/[0.07] p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Bot className="h-4 w-4" />
              Mandatory AI-Use Disclosure (NASA Space Apps Rule Compliance)
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              In full compliance with the <strong>NASA Space Apps Judging Guidelines</strong>, Team{' '}
              <strong className="text-white">Spaghetti Coders</strong> (Omar, Bashar, and Youssef) transparently discloses that{' '}
              <strong className="text-amber-300">Google Antigravity</strong> and <strong className="text-amber-300">Google Gemini</strong> were used for 3D Three.js / React Three Fiber code scaffolding, procedural planetary shader tuning, and age-appropriate (10–14) narrative editing. All scientific telemetry, landing and orbital coordinates, mission years, metric dimensions, and archival imagery originate from official NASA public-domain datasets and were human-verified against NASA NSSDCA, PDS, LROC, and HiRISE records.
            </p>
          </div>

          {/* Official NASA Open Data Repositories */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Database className="h-4 w-4 text-cyan-400" />
              Official NASA Open Data Repositories
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {NASA_CITATIONS.map((cite) => (
                <div
                  key={cite.name}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{cite.name}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{cite.usage}</div>
                  </div>
                  <div>
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
                    >
                      <span>Open NASA Repository</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Artifact Verified Telemetry & Official NASA Citation Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Radio className="h-4 w-4 text-amber-400" />
                Verified 13-Spacecraft Telemetry &amp; NSSDCA / NASA Citations
              </span>
              <span className="font-mono text-[11px] text-slate-400">13 / 13 Verified</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {NASA_HARDWARE_DATA.map((hw) => {
                const spatial = SPATIAL_ARTIFACTS.find((s) => s.id === hw.id);
                return (
                  <div
                    key={hw.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-white">{hw.name}</span>
                        <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                          {hw.launchYear}–{hw.endYear}
                        </span>
                        <span className="font-mono text-[10px] text-amber-300">
                          {hw.radioLightDelay}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {hw.locationName} · <span className="text-slate-300">{hw.coordinates}</span>
                        {spatial ? ` · ${spatial.dimensions.label.split(' (')[0]}` : ''}
                      </div>
                    </div>

                    <a
                      href={hw.nasaSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-cyan-300 hover:bg-white/10 shrink-0 self-start sm:self-center"
                    >
                      <span>NSSDCA / NASA Record</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety & Demo Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3.5 flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-300 block mb-0.5">Privacy &amp; Youth Safety</strong>
                No login walls or personal data collection. Progress saves locally on your device.
              </div>
            </div>

            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3.5 flex items-start gap-3">
              <Video className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-cyan-300 block mb-0.5">Spatial WebXR &amp; AR Ready</strong>
                Works on desktop browsers, mobile devices, and 1:1 AR camera passthrough mode.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

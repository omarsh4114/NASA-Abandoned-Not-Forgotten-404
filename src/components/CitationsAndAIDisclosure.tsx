import React from 'react';
import { X, BookOpen, Database, Bot, ShieldCheck, ExternalLink, FileText, Video } from 'lucide-react';

interface CitationsAndAIDisclosureProps {
  isOpen: boolean;
  onClose: () => void;
}

const NASA_CITATIONS = [
  {
    name: 'NASA Image and Video Library',
    url: 'https://images.nasa.gov/',
    usage: 'Official archival photography for Apollo, Mars rovers, NEAR Shoemaker, Dawn, and Kepler.',
  },
  {
    name: 'Lunar Reconnaissance Orbiter Camera (LROC)',
    url: 'https://www.lroc.asu.edu/',
    usage: 'Lunar landing site coordinates and orbital reconnaissance data for Apollo 11, 12, and 17.',
  },
  {
    name: 'Mars Reconnaissance Orbiter HiRISE',
    url: 'https://www.uahirise.org/',
    usage: 'Martian surface coordinates and landing site records for Ingenuity, Opportunity, Spirit, InSight, Phoenix, and Sojourner.',
  },
  {
    name: 'NASA Planetary Data System (PDS) Small Bodies Node',
    url: 'https://pds-smallbodies.astro.umd.edu/',
    usage: '433 Eros surface touchdown data (NEAR Shoemaker) and Ceres orbital data (Dawn).',
  },
  {
    name: 'NASA Exoplanet Archive & Deep Space Network',
    url: 'https://exoplanetarchive.ipac.caltech.edu/',
    usage: 'Kepler transit light curves and Pioneer 10/11 deep-space trajectory records.',
  },
];

export const CitationsAndAIDisclosure: React.FC<CitationsAndAIDisclosureProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl overflow-y-auto">
      <div className="relative my-auto w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl text-left overflow-hidden">
        {/* Clean Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-cyan-300">
                About This Exhibition
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Project Summary, NASA Data Sources &amp; Credits
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
                Project Summary (NASA Space Apps Cairo 2026)
              </span>
              <span className="text-slate-400">Team: Spaghetti Coders</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Decades of planetary exploration have left dozens of silent NASA landers, rovers, and probes across our Solar System. To young explorers, these inactive machines can seem like forgotten &ldquo;space junk&rdquo; rather than historic scientific monuments. <strong>Echoes of Silence</strong> brings 13 real NASA spacecraft across the Moon, Mars, the Asteroid Belt, and Deep Space together onto a 3D Cis-Lunar Observation Deck. Visitors can walk or orbit around accurate 1:1 scale 3D spacecraft models, read each machine&apos;s first-person story in plain language, compare their real-world size against an astronaut, and launch three hands-on interactive experiments—bouncing lasers off Moon mirrors, clearing Martian dust off solar panels, and spotting exoplanet transits. Technical details and math formulas stay tucked away until clicked, keeping the experience welcoming for everyone.
            </p>
          </div>

          {/* Mandatory AI Disclosure Box */}
          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Bot className="h-4 w-4" />
              AI Tool Disclosure (Space Apps Rule Compliance)
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In compliance with the <strong>NASA Space Apps Cairo 2026 Guidelines</strong>, Team{' '}
              <strong className="text-white">Spaghetti Coders</strong> (Omar, Bashar, and Youssef) discloses that AI tools—specifically{' '}
              <strong className="text-amber-300">Google Antigravity</strong>—were used to assist with React Three Fiber 3D WebXR engineering, procedural spacecraft geometry, and age-appropriate storytelling. All mission coordinates, dates, dimensions, and science facts were verified against official NASA archives.
            </p>
          </div>

          {/* Official NASA Open Data Repositories */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Database className="h-4 w-4 text-cyan-400" />
              Official NASA Data Sources
            </div>
            <div className="space-y-2">
              {NASA_CITATIONS.map((cite) => (
                <div
                  key={cite.name}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{cite.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{cite.usage}</div>
                  </div>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-cyan-300 hover:bg-white/10 shrink-0"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
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
                Works on desktop browsers, mobile devices, and AR camera passthrough mode.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

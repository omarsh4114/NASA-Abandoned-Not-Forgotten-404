import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  BookOpen,
  Cpu,
} from 'lucide-react';
import type { NasaArtifact } from '../types/hardware';
import { EngineeringHotspotMap } from './EngineeringHotspotMap';
import { fetchNasaGalleryForArtifact } from '../services/nasaApi';
import type { NasaMediaItem } from '../services/nasaApi';

interface ArtifactStoryModalProps {
  artifact: NasaArtifact | null;
  onClose: () => void;
}

export const ArtifactStoryModal: React.FC<ArtifactStoryModalProps> = ({
  artifact,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'story' | 'hotspots'>('story');
  const [prevArtifactId, setPrevArtifactId] = useState<string | undefined>(artifact?.id);
  const [nasaGallery, setNasaGallery] = useState<NasaMediaItem[]>([]);

  if (artifact?.id !== prevArtifactId) {
    setPrevArtifactId(artifact?.id);
    setActiveTab('story');
  }

  useEffect(() => {
    if (!artifact) return;

    let cancelled = false;
    fetchNasaGalleryForArtifact(artifact.id, artifact.missionImageUrl, artifact.name).then(
      (items) => {
        if (!cancelled) {
          setNasaGallery(items);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [artifact]);

  if (!artifact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto">
      <div className="relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#0A0B10] shadow-[0_30px_100px_rgba(0,0,0,0.9)] text-left">
        {/* Clean Editorial Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 sm:px-8 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-[#E5A93C]">
              <span>{artifact.zone}</span>
              <span>·</span>
              <span>
                {artifact.launchYear} — {artifact.endYear}
              </span>
              <span>·</span>
              <span className="text-stone-400">{artifact.statusCategory}</span>
            </div>
            <h2 className="font-serif-story text-2xl sm:text-3xl font-bold text-[#F5F2EB] mt-1">
              {artifact.name}
            </h2>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dossier"
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-stone-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Two Evenly Spaced Tabs: Story & Hotspots */}
        <div className="grid grid-cols-2 gap-2 border-b border-white/10 bg-white/[0.02] px-6 sm:px-8 py-3">
          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'story'
                ? 'bg-[#F5F2EB] text-[#050508]'
                : 'text-stone-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Story
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotspots')}
            className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'hotspots'
                ? 'bg-[#F5F2EB] text-[#050508]'
                : 'text-stone-300 hover:bg-white/10'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            Hotspots
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 sm:p-8 space-y-8">
          {activeTab === 'hotspots' && (
            <EngineeringHotspotMap
              artifactName={artifact.name}
              missionImageUrl={artifact.missionImageUrl}
              hotspots={artifact.hotspots}
            />
          )}

          {activeTab === 'story' && (
            <div className="space-y-8">
              <div className="rounded-3xl bg-[#F5F2EB] text-[#141619] p-7 sm:p-10 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4 font-mono text-xs text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FC3D21]" />
                    {artifact.locationName} ({artifact.coordinates})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-stone-700" />
                    Launched {artifact.launchYear}
                  </span>
                </div>

                <blockquote className="font-serif-story text-xl sm:text-2xl italic leading-relaxed text-[#141619]">
                  &ldquo;{artifact.kidFriendlyStory}&rdquo;
                </blockquote>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/10 text-sm">
                  <div>
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FC3D21] mb-1">
                      Why My Mission Ended
                    </h4>
                    <p className="text-stone-700 leading-relaxed">{artifact.whyItStopped}</p>
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      What I Discovered for Earth
                    </h4>
                    <p className="text-stone-700 leading-relaxed">{artifact.scienceUnlocked}</p>
                  </div>
                </div>
              </div>

              {nasaGallery.length > 0 && (
                <div className="space-y-3">
                  <div className="font-mono text-xs uppercase tracking-wider text-stone-400">
                    Official NASA Archival Frames ({artifact.nasaDataSource})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {nasaGallery.map((item) => (
                      <div
                        key={item.nasaId}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = artifact.missionImageUrl;
                          }}
                          className="h-36 w-full object-cover"
                        />
                        <div className="p-3 text-xs">
                          <div className="font-medium text-[#F5F2EB] line-clamp-1">{item.title}</div>
                          <div className="font-mono text-[10px] text-[#E5A93C] mt-0.5">
                            NASA ID: {item.nasaId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

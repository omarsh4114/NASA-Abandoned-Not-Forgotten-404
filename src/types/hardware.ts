import type React from 'react';

export type CelestialZone = 'Moon' | 'Mars' | 'Asteroids & Dwarf Planets' | 'Deep Space';
export type OperationalStatus =
  | 'Still Active Passively'
  | 'Silent Surface Monument'
  | 'Perpetual Orbit & Deep Space Drifter';
export type LabType = 'lunar-laser' | 'mars-dust-quake' | 'kepler-transit';

export interface EngineeringHotspot {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  functionDescription: string;
  statusNote: string;
}

export interface SpacecraftQAItem {
  id: string;
  question: string;
  answer: string;
  telemetryTag: string;
}

export interface NasaArtifact {
  id: string;
  name: string;
  zone: CelestialZone;
  statusCategory: OperationalStatus;
  launchYear: number;
  endYear: string;
  coordinates: string;
  locationName: string;
  radioLightDelay: string;
  surfaceEnvironment: string;
  kidFriendlyStory: string;
  whyItStopped: string;
  scienceUnlocked: string;
  nasaDataSource: string;
  nasaSourceUrl: string;
  missionImageUrl: string;
  orbitalImageUrl: string;
  model3dUrl: string;
  glbUrl?: string;
  labType: LabType;
  hotspots: EngineeringHotspot[];
  askSpacecraftQA: SpacecraftQAItem[];
}

export interface ModelViewerProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  src?: string;
  alt?: string;
  'camera-controls'?: boolean | string;
  'auto-rotate'?: boolean | string;
  'shadow-intensity'?: string;
  exposure?: string;
  'environment-image'?: string;
  poster?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  ar?: boolean | string;
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

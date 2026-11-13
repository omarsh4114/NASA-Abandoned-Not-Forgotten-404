export type PlanetModelKey =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'eros'
  | 'ceres';

export const PLANET_GLB_PATHS: Record<PlanetModelKey, string> = {
  sun: '/models/planets/sun.glb',
  mercury: '/models/planets/mercury.glb',
  venus: '/models/planets/venus.glb',
  earth: '/models/planets/earth.glb',
  moon: '/models/planets/moon.glb',
  mars: '/models/planets/mars.glb',
  jupiter: '/models/planets/jupiter.glb',
  saturn: '/models/planets/saturn.glb',
  uranus: '/models/planets/uranus.glb',
  neptune: '/models/planets/neptune.glb',
  eros: '/models/planets/eros.glb',
  ceres: '/models/planets/ceres.glb',
};

export const ARTIFACT_GLB_PATHS: Record<string, string> = {
  'apollo-11-eagle': '/models/artifacts/apollo-11-eagle.glb',
  'alsep-retroreflector': '/models/artifacts/alsep-retroreflector.glb',
  'apollo-lrv': '/models/artifacts/apollo-lrv.glb',
  'surveyor-3': '/models/artifacts/surveyor-3.glb',
  'ingenuity-helicopter': '/models/artifacts/ingenuity-helicopter.glb',
  'opportunity-rover': '/models/artifacts/opportunity-rover.glb',
  'spirit-rover': '/models/artifacts/spirit-rover.glb',
  'insight-lander': '/models/artifacts/insight-lander.glb',
  'phoenix-lander': '/models/artifacts/phoenix-lander.glb',
  'sojourner-viking': '/models/artifacts/sojourner-viking.glb',
  'near-shoemaker': '/models/artifacts/near-shoemaker.glb',
  'dawn-spacecraft': '/models/artifacts/dawn-spacecraft.glb',
  'pioneer-kepler': '/models/artifacts/pioneer-kepler.glb',
};

export const CRUISE_STAGE_GLB_PATH = '/models/spacecraft/cruise-stage.glb';

export interface ExactMetricSpec {
  width: number;  // X in meters (1 unit = 1.0 meter)
  depth: number;  // Z in meters
  height: number; // Y in meters
  maxSpan: number;
  label: string;
}

export const ARTIFACT_METRIC_SPECS: Record<string, ExactMetricSpec> = {
  'apollo-11-eagle': {
    width: 4.2,
    depth: 4.2,
    height: 3.2,
    maxSpan: 9.4,
    label: '4.20m W × 4.20m D × 3.20m H (9.40m diagonal leg span)',
  },
  'alsep-retroreflector': {
    width: 0.46,
    depth: 0.46,
    height: 0.3,
    maxSpan: 0.46,
    label: '0.46m W × 0.46m D × 0.30m H',
  },
  'apollo-lrv': {
    width: 1.83,
    depth: 3.1,
    height: 1.14,
    maxSpan: 3.1,
    label: '3.10m L × 1.83m W × 1.14m H',
  },
  'surveyor-3': {
    width: 4.27,
    depth: 4.27,
    height: 3.0,
    maxSpan: 4.27,
    label: '3.00m H × 4.27m footpad span',
  },
  'ingenuity-helicopter': {
    width: 1.2,
    depth: 1.2,
    height: 0.49,
    maxSpan: 1.2,
    label: '1.20m rotor span × 0.49m H',
  },
  'opportunity-rover': {
    width: 2.3,
    depth: 1.6,
    height: 1.5,
    maxSpan: 2.3,
    label: '1.60m L × 2.30m W × 1.50m H',
  },
  'spirit-rover': {
    width: 2.3,
    depth: 1.6,
    height: 1.5,
    maxSpan: 2.3,
    label: '1.60m L × 2.30m W × 1.50m H',
  },
  'insight-lander': {
    width: 6.0,
    depth: 1.56,
    height: 1.08,
    maxSpan: 6.0,
    label: '6.00m solar span × 1.56m deck × 1.08m H',
  },
  'phoenix-lander': {
    width: 5.5,
    depth: 1.5,
    height: 2.2,
    maxSpan: 5.5,
    label: '5.50m solar span × 1.50m deck × 2.20m H',
  },
  'sojourner-viking': {
    width: 3.0,
    depth: 2.2,
    height: 2.1,
    maxSpan: 3.0,
    label: 'Viking 1 (3.00m × 2.20m × 2.10m) + Sojourner (0.65m × 0.48m × 0.30m)',
  },
  'near-shoemaker': {
    width: 3.8,
    depth: 1.7,
    height: 2.75,
    maxSpan: 3.8,
    label: '1.70m body × 2.75m H × 3.80m solar span',
  },
  'dawn-spacecraft': {
    width: 19.7,
    depth: 1.77,
    height: 1.77,
    maxSpan: 19.7,
    label: '1.77m bus, 19.70m total solar wingspan',
  },
  'pioneer-kepler': {
    width: 2.74,
    depth: 2.9,
    height: 4.7,
    maxSpan: 4.7,
    label: 'Pioneer (2.74m dish × 2.90m) + Kepler (4.70m H × 2.70m diameter)',
  },
};

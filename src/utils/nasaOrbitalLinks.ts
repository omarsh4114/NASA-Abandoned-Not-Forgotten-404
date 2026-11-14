import type { SpatialArtifact } from '../data/artifacts';

export interface NasaOrbitalProfile {
  portalName: string;
  instrumentBadge: string;
  iauDatum: string;
  formattedCoords: string;
  url: string;
}

const ORBITAL_GIS_REGISTRY: Record<string, NasaOrbitalProfile> = {
  'apollo-11-eagle': {
    portalName: 'NASA LROC QuickMap (Tranquility Base)',
    instrumentBadge: 'LROC NAC · 0.50 m/px',
    iauDatum: 'IAU Moon 2000 Planetocentric',
    formattedCoords: '0.67416° N, 23.47314° E',
    url: 'https://quickmap.lroc.asu.edu/?extent=23.42,0.63,23.52,0.72&proj=10',
  },
  'alsep-retroreflector': {
    portalName: 'NASA LROC QuickMap (ALSEP Array)',
    instrumentBadge: 'LROC NAC · 0.50 m/px',
    iauDatum: 'IAU Moon 2000 Planetocentric',
    formattedCoords: '0.67337° N, 23.47293° E',
    url: 'https://quickmap.lroc.asu.edu/?extent=23.43,0.64,23.51,0.71&proj=10',
  },
  'apollo-lrv': {
    portalName: 'NASA LROC QuickMap (Hadley-Apennine)',
    instrumentBadge: 'LROC NAC · 0.50 m/px',
    iauDatum: 'IAU Moon 2000 Planetocentric',
    formattedCoords: '26.1322° N, 3.6339° E',
    url: 'https://quickmap.lroc.asu.edu/?extent=3.55,26.05,3.72,26.21&proj=10',
  },
  'surveyor-3': {
    portalName: 'NASA LROC QuickMap (Oceanus Procellarum)',
    instrumentBadge: 'LROC NAC · 0.50 m/px',
    iauDatum: 'IAU Moon 2000 Planetocentric',
    formattedCoords: '3.0124° S, 23.4216° W',
    url: 'https://quickmap.lroc.asu.edu/?extent=-23.48,-3.06,-23.36,-2.96&proj=10',
  },
  'ingenuity-helicopter': {
    portalName: 'NASA Mars Trek (Airfield Sigma, Jezero)',
    instrumentBadge: 'MRO HiRISE · 0.25 m/px',
    iauDatum: 'IAU Mars 2000 Areocentric',
    formattedCoords: '18.4447° N, 77.4508° E',
    url: 'https://trek.nasa.gov/mars/#v=0.1&x=77.4508&y=18.4447&z=11&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
  },
  'opportunity-rover': {
    portalName: 'NASA Mars Trek (Meridiani Planum)',
    instrumentBadge: 'MRO HiRISE · 0.25 m/px',
    iauDatum: 'IAU Mars 2000 Areocentric',
    formattedCoords: '1.9462° S, 354.4734° E',
    url: 'https://trek.nasa.gov/mars/#v=0.1&x=-5.5266&y=-1.9462&z=9&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
  },
  'spirit-rover': {
    portalName: 'NASA Mars Trek (Columbia Hills, Gusev)',
    instrumentBadge: 'MRO HiRISE · 0.25 m/px',
    iauDatum: 'IAU Mars 2000 Areocentric',
    formattedCoords: '14.5684° S, 175.4726° E',
    url: 'https://trek.nasa.gov/mars/#v=0.1&x=175.4726&y=-14.5684&z=9&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
  },
  'insight-lander': {
    portalName: 'NASA Mars Trek (Elysium Planitia)',
    instrumentBadge: 'MRO HiRISE · 0.25 m/px',
    iauDatum: 'IAU Mars 2000 Areocentric',
    formattedCoords: '4.5024° N, 135.6234° E',
    url: 'https://trek.nasa.gov/mars/#v=0.1&x=135.6234&y=4.5024&z=9&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
  },
  'phoenix-lander': {
    portalName: 'NASA Mars Trek (Vastitas Borealis)',
    instrumentBadge: 'MRO HiRISE · 0.25 m/px',
    iauDatum: 'IAU Mars 2000 Areocentric',
    formattedCoords: '68.2188° N, 234.2508° E',
    url: 'https://trek.nasa.gov/mars/#v=0.1&x=-125.7492&y=68.2188&z=9&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
  },
  'sojourner-viking': {
    portalName: 'NASA Mars Trek (Ares Vallis)',
    instrumentBadge: 'MRO HiRISE · 0.25 m/px',
    iauDatum: 'IAU Mars 2000 Areocentric',
    formattedCoords: '19.1300° N, 33.2200° W',
    url: 'https://trek.nasa.gov/mars/#v=0.1&x=-33.2200&y=19.1300&z=9&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
  },
  'near-shoemaker': {
    portalName: 'NASA JPL Small-Body Database (433 Eros)',
    instrumentBadge: 'NEAR MSI · 1.2 m/px',
    iauDatum: '433 Eros Body-Fixed',
    formattedCoords: '36.0° S, 81.0° W (Himeros)',
    url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=433',
  },
  'dawn-spacecraft': {
    portalName: 'NASA Ceres Trek (Occator Crater Orbit)',
    instrumentBadge: 'Dawn Framing Camera · 35 m/px',
    iauDatum: '1 Ceres Kait Prime Meridian',
    formattedCoords: '19.8° N, 239.3° E (Quarantine)',
    url: 'https://trek.nasa.gov/ceres/#v=0.1&x=239.3&y=19.8&z=5',
  },
  'pioneer-kepler': {
    portalName: 'NASA Eyes on the Solar System (Live Ephemeris)',
    instrumentBadge: 'JPL Horizons Telemetry',
    iauDatum: 'ICRF / J2000 Heliocentric',
    formattedCoords: '136+ AU Interstellar Trajectory',
    url: 'https://eyes.nasa.gov/apps/solar-system/#/sc_pioneer_10',
  },
};

export function getNasaOrbitalProfile(artifact: SpatialArtifact): NasaOrbitalProfile {
  return (
    ORBITAL_GIS_REGISTRY[artifact.id] ?? {
      portalName: 'NASA Planetary Data System (PDS)',
      instrumentBadge: 'NASA PDS Archive',
      iauDatum: 'IAU Planetary Reference',
      formattedCoords: artifact.coordinates,
      url: 'https://pds.nasa.gov/',
    }
  );
}
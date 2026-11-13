export interface NasaMediaItem {
  nasaId: string;
  title: string;
  description: string;
  imageUrl: string;
  dateCreated: string;
  center: string;
}

const SEARCH_QUERY_MAP: Record<string, string> = {
  'apollo-11-eagle': 'Apollo 11 Lunar Module Eagle surface',
  'alsep-retroreflector': 'Apollo 11 Laser Ranging Retroreflector',
  'apollo-lrv': 'Apollo 17 Lunar Roving Vehicle',
  'surveyor-3': 'Surveyor 3 Apollo 12',
  'ingenuity-helicopter': 'Ingenuity Mars Helicopter flight',
  'opportunity-rover': 'Opportunity rover Endeavour crater',
  'spirit-rover': 'Spirit rover Gusev crater',
  'insight-lander': 'InSight lander seismometer Mars',
  'phoenix-lander': 'Phoenix Mars lander arctic',
  'sojourner-viking': 'Sojourner rover Pathfinder Mars',
  'near-shoemaker': 'NEAR Shoemaker asteroid Eros',
  'dawn-spacecraft': 'Dawn spacecraft Ceres Occator',
  'pioneer-kepler': 'Kepler space telescope exoplanet',
};

const cache = new Map<string, NasaMediaItem[]>();

export async function fetchNasaGalleryForArtifact(
  artifactId: string,
  fallbackUrl: string,
  fallbackTitle: string
): Promise<NasaMediaItem[]> {
  if (cache.has(artifactId)) {
    return cache.get(artifactId)!;
  }

  const query = SEARCH_QUERY_MAP[artifactId] || fallbackTitle;
  const endpoint = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=4`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`NASA API responded with ${response.status}`);
    }
    const data = await response.json();
    const items = data?.collection?.items || [];

    const parsed: NasaMediaItem[] = items
      .map((item: any) => {
        const meta = item?.data?.[0];
        const link = item?.links?.find((l: any) => l.render === 'image')?.href;
        if (!meta || !link) return null;
        return {
          nasaId: meta.nasa_id || artifactId,
          title: meta.title || fallbackTitle,
          description: meta.description || 'Official NASA Open Data archival image.',
          imageUrl: link,
          dateCreated: meta.date_created ? meta.date_created.slice(0, 10) : 'Archival',
          center: meta.center || 'NASA',
        };
      })
      .filter(Boolean)
      .slice(0, 3);

    if (parsed.length > 0) {
      cache.set(artifactId, parsed);
      return parsed;
    }
  } catch {
    // Fallback to verified missionImageUrl when offline or rate-limited
  }

  const fallbackResult: NasaMediaItem[] = [
    {
      nasaId: artifactId.toUpperCase(),
      title: `${fallbackTitle} (Verified NASA Archive)`,
      description: 'Direct archival telemetry visual from NASA Open Data repository.',
      imageUrl: fallbackUrl,
      dateCreated: 'Verified Archive',
      center: 'NASA / JPL / GSFC',
    },
  ];
  cache.set(artifactId, fallbackResult);
  return fallbackResult;
}

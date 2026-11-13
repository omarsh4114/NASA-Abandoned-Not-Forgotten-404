import React from 'react';
import { MODEL_URLS, SPATIAL_ARTIFACTS } from '../../data/artifacts';
import { NormalizedGlbModel } from '../NormalizedGlbModel';
import { ProceduralSpacecraft } from '../ProceduralSpacecraft';

interface ArtifactDetailedMeshProps {
  artifactId: string;
}

export const ArtifactDetailedMesh: React.FC<ArtifactDetailedMeshProps> = ({
  artifactId,
}) => {
  const artifactMeta = SPATIAL_ARTIFACTS.find((a) => a.id === artifactId);
  const glbUrl = artifactMeta?.glbUrl ?? MODEL_URLS[artifactId];

  const rawTarget = artifactMeta
    ? Math.max(
        artifactMeta.dimensions.width,
        artifactMeta.dimensions.height,
        artifactMeta.dimensions.depth
      )
    : 2.8;
  const targetSpan = Math.min(3.6, Math.max(2.0, rawTarget));

  const proceduralFallback = <ProceduralSpacecraft artifactId={artifactId} />;

  return (
    <group>
      {glbUrl ? (
        <NormalizedGlbModel
          url={glbUrl}
          targetSize={targetSpan}
          fallback={proceduralFallback}
        />
      ) : (
        proceduralFallback
      )}
    </group>
  );
};

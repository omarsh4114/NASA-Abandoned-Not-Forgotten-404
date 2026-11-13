import React, { useState } from 'react';
import { ContactShadows, Html } from '@react-three/drei';
import type { SpatialArtifact } from '../data/artifacts';
import { ProceduralSpacecraft } from './ProceduralSpacecraft';
import { NormalizedGlbModel } from './NormalizedGlbModel';

interface ArtifactPedestalProps {
  artifact: SpatialArtifact;
  isSelected: boolean;
  normalizedHologramMode: boolean;
  onSelect: (artifact: SpatialArtifact) => void;
}

const ZONE_ACCENT_HEX: Record<SpatialArtifact['zone'], string> = {
  Moon: '#38BDF8',
  Mars: '#F97316',
  'Asteroids & Dwarf Planets': '#EAB308',
  'Deep Space': '#34D399',
};

export const ArtifactPedestal: React.FC<ArtifactPedestalProps> = ({
  artifact,
  isSelected,
  normalizedHologramMode,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);
  const accentColor = ZONE_ACCENT_HEX[artifact.zone];

  const meshScale =
    isSelected && normalizedHologramMode
      ? artifact.dimensions.normalizedScaleFactor
      : 1.0;

  const rawMaxDim = Math.max(
    artifact.dimensions.width,
    artifact.dimensions.height,
    artifact.dimensions.depth
  );
  const museumStageScale =
    isSelected && normalizedHologramMode
      ? 2.2
      : Math.min(3.2, Math.max(1.8, rawMaxDim));

  return (
    <group position={artifact.pedestalPosition}>
      {/* Localized Pedestal Spotlight */}
      <pointLight
        position={[0, 4.5, 0]}
        intensity={isSelected ? 4.2 : hovered ? 2.4 : 1.1}
        distance={11}
        color={accentColor}
      />

      {/* Sleek Architectural Aerospace Museum Pedestal Base (Height = 0.24m) */}
      <mesh
        position={[0, 0.12, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(artifact);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <cylinderGeometry args={[1.65, 1.78, 0.24, 128]} />
        <meshStandardMaterial
          color="#141820"
          metalness={0.65}
          roughness={0.38}
        />
      </mesh>

      {/* Matte Obsidian Inner Deck Inlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2405, 0]} receiveShadow>
        <circleGeometry args={[1.52, 128]} />
        <meshStandardMaterial color="#0D1016" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Thin Recessed Warm-Amber / Active Perimeter Accent Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.242, 0]}>
        <ringGeometry args={[1.53, 1.59, 128]} />
        <meshStandardMaterial
          color={isSelected ? '#E5A93C' : accentColor}
          emissive={isSelected ? '#E5A93C' : accentColor}
          emissiveIntensity={isSelected ? 0.55 : hovered ? 0.35 : 0.18}
          toneMapped={false}
          roughness={0.4}
        />
      </mesh>

      {/* Soft Contact Shadows on Active Pedestal Top */}
      {isSelected && (
        <ContactShadows
          position={[0, 0.246, 0]}
          opacity={0.45}
          scale={3.6}
          blur={2.0}
          far={4}
          resolution={256}
          color="#000000"
        />
      )}

      {/* 3D Spacecraft Mesh on Museum Pedestal */}
      <group
        position={[0, 0.24, 0]}
        rotation={[0, artifact.pedestalRotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(artifact);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {artifact.glbUrl ? (
          <NormalizedGlbModel
            url={artifact.glbUrl}
            targetSize={museumStageScale}
            fallback={
              <group scale={[meshScale, meshScale, meshScale]}>
                <ProceduralSpacecraft artifactId={artifact.id} />
              </group>
            }
          />
        ) : (
          <group scale={[meshScale, meshScale, meshScale]}>
            <ProceduralSpacecraft artifactId={artifact.id} />
          </group>
        )}
      </group>

      {/* Minimalist Floating 3D Placard */}
      <Html
        position={[
          0,
          artifact.id === 'dawn-spacecraft'
            ? 2.1
            : Math.min(3.3, artifact.dimensions.height + 0.95),
          0,
        ]}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[10, 0]}
      >
        <button
          type="button"
          onClick={() => onSelect(artifact)}
          style={{
            pointerEvents: 'auto',
            maxWidth: '195px',
            padding: '4px 10px',
            wordSpacing: 'normal',
            letterSpacing: 'normal',
          }}
          className={`spatial-html-label flex flex-col items-center rounded-md border text-center backdrop-blur-md transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
            isSelected
              ? 'border-[#38BDF8] bg-[#11141A]/95 text-white shadow-md'
              : 'border-white/10 bg-[#11141A]/75 text-slate-200 hover:border-white/30 hover:bg-[#11141A]/95'
          }`}
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#38BDF8]">
            {artifact.zone} · {artifact.launchYear}
          </span>
          <span className="text-[11px] font-medium text-white truncate max-w-[175px]">
            {artifact.name.split(' (')[0]}
          </span>
        </button>
      </Html>
    </group>
  );
};

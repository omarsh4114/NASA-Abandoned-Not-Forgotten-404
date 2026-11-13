import React from 'react';
import { ContactShadows } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface ObservationPlatformProps {
  arPassthrough?: boolean;
  onFloorClick?: (point: [number, number, number]) => void;
}

export const ObservationPlatform: React.FC<ObservationPlatformProps> = ({
  arPassthrough = false,
  onFloorClick,
}) => {
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (onFloorClick) {
      onFloorClick([e.point.x, 0, e.point.z]);
    }
  };

  if (arPassthrough) {
    return (
      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.01, 0]}
          onPointerDown={handlePointerDown}
          receiveShadow
        >
          <circleGeometry args={[32, 128]} />
          <shadowMaterial opacity={0.35} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* Tier 1 (Bottom Foundation Step): Dark Brushed Anodized Titanium Sub-Plinth */}
      <mesh position={[0, -0.34, 0]} receiveShadow>
        <cylinderGeometry args={[29.8, 30.8, 0.34, 128]} />
        <meshStandardMaterial color="#141820" metalness={0.65} roughness={0.38} />
      </mesh>

      {/* Tier 2 (Middle Chamfered Promenade Step): Dark Brushed Anodized Titanium */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[27.6, 29.0, 0.16, 128]} />
        <meshStandardMaterial color="#141820" metalness={0.65} roughness={0.38} />
      </mesh>

      {/* Tier 3 (Main Gallery Inner Deck, Top Flush at y = 0): Matte Obsidian Deck */}
      <mesh
        position={[0, -0.04, 0]}
        receiveShadow
        onPointerDown={handlePointerDown}
      >
        <cylinderGeometry args={[26.8, 27.3, 0.08, 128]} />
        <meshStandardMaterial color="#0D1016" roughness={0.85} metalness={0.12} />
      </mesh>

      {/* Outer Chamfered Anodized Titanium Perimeter Shoulder Framing the Obsidian Deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <ringGeometry args={[25.4, 26.8, 128]} />
        <meshStandardMaterial color="#141820" metalness={0.65} roughness={0.38} />
      </mesh>

      {/* Recessed Shadow Channel Along Inner Perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0018, 0]}>
        <ringGeometry args={[25.64, 25.8, 128]} />
        <meshStandardMaterial color="#07090D" roughness={0.92} metalness={0.1} />
      </mesh>

      {/* Thin, Subtle Warm-Amber Architectural Perimeter Light Strip (Inlaid Flush) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0025, 0]}>
        <ringGeometry args={[25.68, 25.76, 128]} />
        <meshStandardMaterial
          color="#E5A93C"
          emissive="#E5A93C"
          emissiveIntensity={0.35}
          toneMapped={false}
          roughness={0.4}
          metalness={0.35}
        />
      </mesh>

      {/* Center Visitor Atrium Architectural Titanium Ring Inlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0018, 0]} receiveShadow>
        <ringGeometry args={[2.18, 2.34, 128]} />
        <meshStandardMaterial color="#1E2430" metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0022, 0]}>
        <ringGeometry args={[2.22, 2.26, 128]} />
        <meshStandardMaterial
          color="#E5A93C"
          emissive="#E5A93C"
          emissiveIntensity={0.25}
          toneMapped={false}
          roughness={0.45}
        />
      </mesh>

      {/* Mid-Gallery Concentric Walkline Inlay Framing the Artifact Arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]} receiveShadow>
        <ringGeometry args={[14.8, 14.92, 128]} />
        <meshStandardMaterial color="#141820" metalness={0.65} roughness={0.38} />
      </mesh>

      {/* Soft Ground Contact Shadows Across the Gallery Stage */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={48}
        blur={2.0}
        far={5}
        resolution={512}
        color="#000000"
      />
    </group>
  );
};

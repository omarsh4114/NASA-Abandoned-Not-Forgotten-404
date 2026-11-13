import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Box, RotateCw } from 'lucide-react';
import type { NasaArtifact } from '../types/hardware';
import { NormalizedGlbModel } from './NormalizedGlbModel';
import { ProceduralSpacecraft } from './ProceduralSpacecraft';

interface Artifact3DViewerProps {
  artifact: NasaArtifact;
}

export const Artifact3DViewer: React.FC<Artifact3DViewerProps> = ({ artifact }) => {
  const glbSource = artifact.glbUrl || (artifact.model3dUrl ? artifact.model3dUrl : undefined);

  const fallbackScale = artifact.id === 'alsep-retroreflector' ? 1.85 : 0.75;
  const proceduralFallback = (
    <group position={[0, -0.9, 0]} scale={fallbackScale}>
      <ProceduralSpacecraft artifactId={artifact.id} />
    </group>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Box className="h-4 w-4 text-cyan-400" />
          <div>
            <div className="text-xs font-bold text-white">
              3D Spacecraft Inspector — {artifact.name}
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              {artifact.locationName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
          <RotateCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Drag to rotate 360° • Scroll to zoom</span>
        </div>
      </div>

      <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-white/15 bg-[#050814]">
        <Canvas
          shadows
          camera={{ position: [0, 1.6, 4.2], fov: 42 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#050814']} />
          <hemisphereLight args={['#E2E8F0', '#262932', 0.85]} />
          <directionalLight
            position={[8, 12, 10]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
            color="#FFF7ED"
          />
          <directionalLight position={[-8, 6, 9]} intensity={0.95} color="#DCE8FF" />
          <directionalLight position={[-6, 4, -8]} intensity={0.75} color="#38BDF8" />

          {glbSource ? (
            <group position={[0, -0.9, 0]}>
              <NormalizedGlbModel
                url={glbSource}
                targetSize={2.4}
                fallback={proceduralFallback}
              />
            </group>
          ) : (
            proceduralFallback
          )}

          <ContactShadows
            position={[0, -0.92, 0]}
            opacity={0.45}
            scale={8}
            blur={2.2}
            far={4}
          />

          <OrbitControls
            makeDefault
            autoRotate
            autoRotateSpeed={1.2}
            enablePan={false}
            minDistance={1.6}
            maxDistance={8.5}
          />
        </Canvas>
      </div>
    </div>
  );
};

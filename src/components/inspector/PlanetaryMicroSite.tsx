import React, { useEffect, useMemo, useRef } from 'react';
import { ContactShadows, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  ASTRONAUT_GLB_URL,
  type SpatialArtifact,
  type MechanicalHotspot,
  type TargetCelestialBody,
} from '../../data/artifacts';
import { ArtifactDetailedMesh } from '../models/ArtifactDetailedMesh';
import { NormalizedGlbModel } from '../NormalizedGlbModel';

interface PlanetaryMicroSiteProps {
  artifact: SpatialArtifact;
  normalizedScale: boolean;
  showHotspots: boolean;
  showAstronautScale: boolean;
  activeHotspot: MechanicalHotspot | null;
  onSelectHotspot: (hotspot: MechanicalHotspot | null) => void;
  arPassthrough: boolean;
}

/**
 * Deterministic terrain elevation helper so both the 128-segment mesh and the 36 instanced
 * rocks/pebbles sit at the exact same surface height, while keeping the central landing zone
 * strictly flat at y = 0 out to `exclusionRadius`.
 */
function sampleTerrainElevation(
  x: number,
  z: number,
  targetBody: TargetCelestialBody,
  exclusionRadius = 5.5
): number {
  const r = Math.hypot(x, z);
  if (r <= exclusionRadius) return 0;

  const undulationBlend = THREE.MathUtils.smoothstep(r, exclusionRadius, exclusionRadius + 4.7);
  const rimTaper = 1.0 - THREE.MathUtils.smoothstep(r, 20.0, 26.0) * 0.6;

  // Multi-scale crater & ridge displacement
  const crater1Dist = Math.hypot(x - 8.5, z + 6.2);
  const crater1 =
    (Math.exp(-Math.pow(crater1Dist - 2.6, 2) / 1.2) * 0.42 -
      Math.exp(-(crater1Dist * crater1Dist) / 3.8) * 0.35);

  const crater2Dist = Math.hypot(x + 9.4, z - 5.8);
  const crater2 =
    (Math.exp(-Math.pow(crater2Dist - 3.2, 2) / 1.6) * 0.48 -
      Math.exp(-(crater2Dist * crater2Dist) / 5.2) * 0.38);

  let displacement = 0;
  if (targetBody === 'Moon') {
    const wave1 = Math.sin(x * 0.28 + 0.4) * Math.cos(z * 0.26 - 0.2) * 0.52;
    const wave2 = Math.sin(x * 0.65 - z * 0.58) * 0.18;
    const outerRim = Math.exp(-Math.pow(r - 14.0, 2) / 14.0) * 0.72;
    displacement = (wave1 + wave2 + outerRim + crater1 + crater2) * undulationBlend * rimTaper;
  } else if (targetBody === 'Mars') {
    const dune1 = Math.sin(x * 0.25 + z * 0.14) * Math.cos(z * 0.22) * 0.62;
    const ripples = Math.sin(x * 0.88 + z * 0.35) * 0.15;
    const ridge = Math.exp(-Math.pow(r - 14.5, 2) / 16.0) * 0.88;
    displacement = (dune1 + ripples + ridge + crater1 * 0.7) * undulationBlend * rimTaper;
  } else {
    const basaltWave =
      Math.sin(x * 0.32) * Math.cos(z * 0.32) * 0.56 +
      Math.cos(x * 0.72 + z * 0.6) * 0.22;
    displacement = (basaltWave + crater1 + crater2) * undulationBlend * rimTaper;
  }

  return displacement;
}

/**
 * Builds a high-resolution circular 3D terrain plinth (128 radial segments × 72 concentric rings)
 * that stays strictly flat at y = 0 inside the central landing zone (radius < 4.5m)
 * while sculpting craters, crater rims, and ridges toward the outer rim.
 */
function buildSculpturalTerrainPlinthGeometry(
  targetBody: TargetCelestialBody,
  exclusionRadius = 5.5
): THREE.BufferGeometry {
  const geom = new THREE.RingGeometry(0, 26, 128, 72);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, sampleTerrainElevation(x, z, targetBody, exclusionRadius));
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Generates procedural HTML5 Canvas bump and roughness textures with multi-scale impact craters,
 * raised crater rims, ridge lines, and fine regolith grain (roughness: 0.92, bumpScale: 0.08).
 */
function buildDetailedTerrainTextures(targetBody: TargetCelestialBody): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d')!;

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 1024, 1024);

  rCtx.fillStyle = '#ebecee';
  rCtx.fillRect(0, 0, 512, 512);

  // 1. Ridge lines / wind-carved ripples
  for (let i = 0; i < 45; i++) {
    const y = (i * 23) % 1024;
    bCtx.strokeStyle =
      targetBody === 'Mars' ? 'rgba(215, 215, 215, 0.16)' : 'rgba(200, 200, 200, 0.1)';
    bCtx.lineWidth = 2 + (i % 3);
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.bezierCurveTo(340, y + 18, 680, y - 18, 1024, y);
    bCtx.stroke();
  }

  // 2. Multi-scale impact craters (raised bright rims + recessed dark bowls)
  for (let i = 0; i < 220; i++) {
    const cx = (i * 193 + (i % 7) * 41) % 1024;
    const cy = (i * 271 + (i % 5) * 29) % 1024;
    const r = i < 25 ? 18 + (i % 6) * 6 : i < 95 ? 7 + (i % 5) * 3.5 : 2.5 + (i % 4) * 1.5;

    // Bright raised crater rim
    bCtx.strokeStyle = 'rgba(245, 245, 245, 0.55)';
    bCtx.lineWidth = r > 12 ? 3.0 : 1.6;
    bCtx.beginPath();
    bCtx.arc(cx, cy, r, 0, Math.PI * 2);
    bCtx.stroke();

    // Recessed crater floor
    bCtx.fillStyle = 'rgba(38, 38, 38, 0.55)';
    bCtx.beginPath();
    bCtx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
    bCtx.fill();

    // Roughness variation inside craters
    rCtx.fillStyle = 'rgba(180, 180, 180, 0.35)';
    rCtx.beginPath();
    rCtx.arc(cx * 0.5, cy * 0.5, r * 0.45, 0, Math.PI * 2);
    rCtx.fill();
  }

  // 3. Fine regolith micro-grain
  for (let i = 0; i < 6500; i++) {
    const x = (i * 173) % 1024;
    const y = (i * 311) % 1024;
    const rad = 0.8 + (i % 3) * 0.65;
    bCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
    bCtx.beginPath();
    bCtx.arc(x, y, rad, 0, Math.PI * 2);
    bCtx.fill();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(8, 8);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 8);

  return { bumpMap, roughnessMap };
}

/**
 * Subtle Fresnel atmospheric rim shader for Mars 1:1 horizon dome
 */
function createMarsAtmosphericFresnelMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#ea580c') },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.6);
        gl_FragColor = vec4(uColor, rim * 0.28);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

const WORLD_STAGE_PALETTE: Record<TargetCelestialBody, string> = {
  Moon: '#252830',        // Lunar graphite
  Mars: '#46241B',        // Martian iron-oxide
  Eros: '#232226',        // Asteroid basalt
  Ceres: '#232226',
  Interstellar: '#11141A',
};

const WORLD_ROCK_PALETTE: Record<TargetCelestialBody, string> = {
  Moon: '#383C47',
  Mars: '#5C2F22',
  Eros: '#343238',
  Ceres: '#343238',
  Interstellar: '#1E293B',
};

const ROCK_COUNT = 36;

export const PlanetaryMicroSite: React.FC<PlanetaryMicroSiteProps> = ({
  artifact,
  normalizedScale,
  showHotspots,
  showAstronautScale,
  activeHotspot,
  onSelectHotspot,
  arPassthrough,
}) => {
  const rocksInstancedRef = useRef<THREE.InstancedMesh>(null);

  // NormalizedGlbModel already scales .glb assets to a uniform ~3.2m stage span;
  // only apply normalizedScaleFactor to procedural meshes whose raw geometry spans >5m.
  const scaleFactor = artifact.glbUrl
    ? normalizedScale && !arPassthrough
      ? 1.15
      : 1.0
    : arPassthrough || !normalizedScale
    ? 1.0
    : artifact.dimensions.normalizedScaleFactor;

  // Floating orbital / deep-space artifacts: Dawn (Ceres orbit) & Pioneer 10 / Kepler (Deep Space)
  const isFloatingOrbital =
    artifact.zone === 'Deep Space' ||
    artifact.statusCategory === 'Drifting' ||
    artifact.targetBody === 'Ceres' ||
    artifact.targetBody === 'Interstellar';

  // STRICT VISIBILITY RULE: Only landed surface artifacts in 1:1 inspection view show the 1.75m astronaut
  const isLandedSurfaceArtifact =
    !isFloatingOrbital &&
    (artifact.zone === 'Moon' ||
      artifact.zone === 'Mars' ||
      artifact.id === 'near-shoemaker');

  // Strict central rock-free & flat-terrain exclusion radius (>= 5.5m or artifactBoundingRadius + 2.8m)
  const artifactBoundingRadius = useMemo(() => {
    const rawHalfDiag = 0.5 * Math.hypot(artifact.dimensions.width, artifact.dimensions.depth);
    if (artifact.glbUrl) {
      const rawSpan = Math.max(
        artifact.dimensions.width,
        artifact.dimensions.height,
        artifact.dimensions.depth
      );
      const glbTargetSpan = Math.min(3.6, Math.max(2.0, rawSpan));
      return Math.max(glbTargetSpan * 0.5, rawHalfDiag) * scaleFactor;
    }
    return rawHalfDiag * scaleFactor;
  }, [
    artifact.dimensions.width,
    artifact.dimensions.height,
    artifact.dimensions.depth,
    artifact.glbUrl,
    scaleFactor,
  ]);

  const landingExclusionRadius = useMemo(
    () => Math.max(5.5, artifactBoundingRadius + 2.8),
    [artifactBoundingRadius]
  );

  const plinthGeometry = useMemo(
    () => buildSculpturalTerrainPlinthGeometry(artifact.targetBody, landingExclusionRadius),
    [artifact.targetBody, landingExclusionRadius]
  );

  const { bumpMap, roughnessMap } = useMemo(
    () => buildDetailedTerrainTextures(artifact.targetBody),
    [artifact.targetBody]
  );

  const marsFresnelMat = useMemo(() => createMarsAtmosphericFresnelMaterial(), []);

  // Scatter 36 instanced low-poly angular rocks & pebbles strictly outside landingExclusionRadius
  // so zero rocks or boulders spawn near any artifact or the 1.75m astronaut.
  const rockMatrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    const minRockRadius = landingExclusionRadius + 0.65;
    const radialSpan = Math.max(8.5, 20.5 - minRockRadius);

    for (let i = 0; i < ROCK_COUNT; i++) {
      const s1 = Math.sin(i * 12.9898 + 1.7) * 43758.5453;
      const r1 = s1 - Math.floor(s1);
      const s2 = Math.sin(i * 78.233 + 3.1) * 43758.5453;
      const r2 = s2 - Math.floor(s2);
      const s3 = Math.sin(i * 45.164 + 5.3) * 43758.5453;
      const r3 = s3 - Math.floor(s3);

      const angle = (i / ROCK_COUNT) * Math.PI * 2 + (r1 - 0.5) * 0.22;
      const radius = minRockRadius + r2 * radialSpan;
      if (radius <= landingExclusionRadius + 0.45) continue;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const groundY = sampleTerrainElevation(x, z, artifact.targetBody, landingExclusionRadius);

      const baseScale = i % 4 === 0 ? 0.24 + r1 * 0.22 : 0.09 + r1 * 0.13;
      const sy = baseScale * (0.55 + r2 * 0.35);

      dummy.position.set(x, groundY + sy * 0.42, z);
      dummy.rotation.set(r1 * Math.PI, r2 * Math.PI * 2, r3 * Math.PI);
      dummy.scale.set(
        baseScale * (0.9 + r3 * 0.45),
        sy,
        baseScale * (0.85 + r1 * 0.4)
      );
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, [artifact.targetBody, landingExclusionRadius]);

  useEffect(() => {
    const inst = rocksInstancedRef.current;
    if (!inst) return;
    rockMatrices.forEach((mat, idx) => {
      inst.setMatrixAt(idx, mat);
    });
    inst.instanceMatrix.needsUpdate = true;
  }, [rockMatrices]);

  const surfaceColor = WORLD_STAGE_PALETTE[artifact.targetBody] ?? '#252830';
  const rockColor = WORLD_ROCK_PALETTE[artifact.targetBody] ?? '#383C47';

  return (
    <group position={[0, 0, 0]}>
      {/* Deep #090B0E Museum Background & Radial Edge Fog (when not in live camera AR) */}
      {!arPassthrough && (
        <>
          <color attach="background" args={['#090B0E']} />
          <fog attach="fog" args={['#090B0E', 14, 31]} />
          <Stars
            radius={180}
            depth={70}
            count={4500}
            factor={3.2}
            saturation={0.1}
            fade
          />
        </>
      )}

      {/* Subtle Martian Fresnel Atmospheric Rim Glow */}
      {!arPassthrough && artifact.targetBody === 'Mars' && (
        <mesh material={marsFresnelMat}>
          <sphereGeometry args={[27, 48, 32]} />
        </mesh>
      )}

      {/* ==================== 3-POINT FRONT-3/4 STUDIO EXHIBITION LIGHTING RIG ==================== */}
      {/* 1. Front-Right-Top Primary Directional Key Light */}
      <directionalLight
        position={[8, 12, 10]}
        intensity={2.2}
        color="#FFF7ED"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      {/* 2. Soft Front-Left Studio Fill Light so shadow sides keep crisp detail */}
      <directionalLight
        position={[-8, 6, 9]}
        intensity={0.95}
        color="#DCE8FF"
      />

      {/* 3. Cool Rim Light for sculptural silhouette separation */}
      <directionalLight
        position={[-10, 8, -12]}
        intensity={0.85}
        color="#38BDF8"
      />

      {/* 4. Soft Hemisphere Lift */}
      <hemisphereLight args={['#E2E8F0', '#262932', 0.85]} />

      {/* 5. Dedicated Front-Angled Astronaut Fill Light so suit, visor, and details read crisply */}
      {showAstronautScale && isLandedSurfaceArtifact && (
        <pointLight
          position={[3.45, 1.9, 2.9]}
          intensity={1.5}
          distance={5.5}
          decay={2}
          color="#F8FAFC"
        />
      )}

      {/* ==================== SCULPTURAL 3D TERRAIN PLINTH + INSTANCED ROCKS (Landed Hardware Only) ==================== */}
      {!arPassthrough && !isFloatingOrbital && (
        <group>
          {/* High-Resolution 128-Segment Sculptural Terrain Stage (Flat at y=0 within r < 4.5m) */}
          <mesh geometry={plinthGeometry} receiveShadow>
            <meshStandardMaterial
              color={surfaceColor}
              bumpMap={bumpMap}
              bumpScale={0.08}
              roughnessMap={roughnessMap}
              roughness={0.92}
              metalness={0.02}
            />
          </mesh>

          {/* Ground Contact Shadows for Natural Footpad & Boot Occlusion */}
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.45}
            scale={16}
            blur={2.0}
            far={5}
            resolution={512}
            color="#000000"
          />

          {/* 36 Instanced Low-Poly Angular Rocks & Pebbles Outside the 4.5m Landing Zone */}
          <instancedMesh
            ref={rocksInstancedRef}
            args={[undefined, undefined, ROCK_COUNT]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={rockColor}
              bumpMap={bumpMap}
              bumpScale={0.05}
              roughness={0.92}
              metalness={0.04}
            />
          </instancedMesh>

          {/* Subtle Flat Landing Zone Calibration Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <ringGeometry args={[landingExclusionRadius - 0.04, landingExclusionRadius, 128]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* ==================== LIVE 1:1 AR GROUND SHADOW CATCHER ==================== */}
      {arPassthrough && (
        <group>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.005, 0]}
            receiveShadow
          >
            <planeGeometry args={[28, 28]} />
            <shadowMaterial opacity={0.45} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <ringGeometry args={[2.35, 2.4, 96]} />
            <meshBasicMaterial
              color="#38BDF8"
              side={THREE.DoubleSide}
              transparent
              opacity={0.55}
            />
          </mesh>
        </group>
      )}

      {/* ==================== INTACT 1:1 SPACECRAFT MODEL + 3 ENGINEERING PINS ==================== */}
      <group scale={scaleFactor}>
        <ArtifactDetailedMesh artifactId={artifact.id} />

        {showHotspots &&
          artifact.hotspots.map((hs, index) => {
            const isSelected = activeHotspot?.id === hs.id;
            return (
              <Html
                key={hs.id}
                position={hs.position}
                center
                style={{ pointerEvents: 'none' }}
                zIndexRange={[30, 0]}
              >
                <div className="relative flex flex-col items-center pointer-events-none select-none">
                    <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHotspot(isSelected ? null : hs);
                    }}
                    style={{ pointerEvents: 'auto', wordSpacing: 'normal', letterSpacing: 'normal' }}
                    className={`spatial-html-label flex items-center gap-1.5 rounded-md border px-1.5 sm:px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-medium max-w-[205px] sm:max-w-none shadow-md backdrop-blur-md transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'border-[#38BDF8] bg-[#38BDF8] text-[#090B0E] font-semibold scale-105'
                        : 'border-white/15 bg-[#11141A]/90 text-slate-100 hover:border-[#38BDF8]/60'
                    }`}
                  >
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm bg-white/10 text-[9px] font-bold">
                      {index + 1}
                    </span>
                    <span className="truncate">{hs.title}</span>
                  </button>
                </div>
              </Html>
            );
          })}
      </group>

      {/* ==================== FIX #4: 1.75m ASTRONAUT GLB FACING FORWARD (Landed Surface Only) ==================== */}
      {showAstronautScale && isLandedSurfaceArtifact && (
        <>
          <ContactShadows
            position={[2.45, 0.015, 0.5]}
            opacity={0.65}
            scale={3.2}
            blur={1.4}
            far={2.5}
            resolution={256}
            color="#000000"
          />
          <group position={[2.45, 0, 0.5]}>
            <NormalizedGlbModel
              url={ASTRONAUT_GLB_URL}
              targetSize={1.75}
              fitByHeight
              receiveShadow={false}
              innerRotation={[0, Math.PI, 0]}
            />
            <Html position={[0, 1.92, 0]} center style={{ pointerEvents: 'none' }}>
              <div
                style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}
                className="spatial-html-label pointer-events-none whitespace-nowrap rounded-md border border-white/10 bg-[#11141A]/90 px-2 py-0.5 font-mono text-[10px] text-slate-200 backdrop-blur-md"
              >
                Astronaut Scale · 1.75 m
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
};

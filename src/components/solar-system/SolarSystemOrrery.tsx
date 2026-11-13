import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  SPATIAL_ARTIFACTS,
  type SpatialArtifact,
  type TargetCelestialBody,
  type SpatialTier,
} from '../../data/artifacts';
import { NormalizedGlbModel } from '../NormalizedGlbModel';
import { ProceduralSpacecraft } from '../ProceduralSpacecraft';
import {
  createBackSideAtmosphereMaterial,
  createDisplacedErosGeometry,
  getCachedPlanetaryPBRTextures,
} from '../../utils/planetaryTextures';

export const CELESTIAL_ANCHORS: Record<
  TargetCelestialBody | 'Sun' | 'Earth' | 'Jupiter' | 'Saturn',
  [number, number, number]
> = {
  Sun: [0, 0, 0],
  Earth: [18, 0, 6],
  Moon: [21.4, 0.9, 8.2],
  Mars: [-24, 0.5, -17],
  Eros: [33, 2.4, -21],
  Ceres: [-36, -1.6, 24],
  Jupiter: [52, 0, 22],
  Saturn: [-62, 1.5, -36],
  Interstellar: [-78, 11, -64],
};

export const PLANET_RADII: Record<TargetCelestialBody, number> = {
  Moon: 0.64,
  Mars: 1.2,
  Eros: 0.78,
  Ceres: 0.98,
  Interstellar: 1.15,
};

/**
 * Computes the horizontal sun-lit camera approach direction for each target celestial body
 * so both CameraStateMachine and planetary surface pins stay view-synchronized.
 */
export function getPlanetBaseViewDir(body: TargetCelestialBody): THREE.Vector3 {
  const destPos = CELESTIAL_ANCHORS[body];
  const toOrigin = new THREE.Vector3(-destPos[0], 0, -destPos[2]);
  if (toOrigin.lengthSq() < 0.01) {
    toOrigin.set(0, 0, 1);
  } else {
    toOrigin.normalize();
  }
  return toOrigin.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.55).normalize();
}

/**
 * Per-artifact surface pin angular offsets (relative to the body's camera-facing meridian)
 * arranged to keep all Mars (6) and Moon (4) <Html> labels cleanly separated with zero overlap.
 */
const ARTIFACT_SURFACE_SLOTS: Record<string, { yaw: number; phi: number }> = {
  // Moon (4 artifacts in 4 clean quadrants)
  'apollo-11-eagle': { yaw: -0.95, phi: 0.48 },
  'alsep-retroreflector': { yaw: 0.95, phi: 0.48 },
  'apollo-lrv': { yaw: -0.92, phi: -0.54 },
  'surveyor-3': { yaw: 0.92, phi: -0.54 },

  // Mars (6 artifacts arranged across upper/lower left, top/bottom center, upper/lower right)
  'ingenuity-helicopter': { yaw: -1.12, phi: 0.44 },
  'opportunity-rover': { yaw: -1.04, phi: -0.58 },
  'spirit-rover': { yaw: -0.04, phi: 0.92 },
  'insight-lander': { yaw: 0.02, phi: -0.88 },
  'phoenix-lander': { yaw: 1.08, phi: 0.46 },
  'sojourner-viking': { yaw: 1.06, phi: -0.44 },

  // Asteroids, Dwarf Planets & Interstellar
  'near-shoemaker': { yaw: 0.35, phi: 0.42 },
  'dawn-spacecraft': { yaw: 0.45, phi: 0.35 },
  'pioneer-kepler': { yaw: 0.0, phi: 0.25 },
};

export function getArtifactSurfaceYawBias(artifactId?: string | null): number {
  if (!artifactId) return 0;
  return ARTIFACT_SURFACE_SLOTS[artifactId]?.yaw ?? 0;
}

interface SolarSystemOrreryProps {
  tier: SpatialTier;
  selectedBody: TargetCelestialBody | null;
  activeArtifact?: SpatialArtifact | null;
  onSelectBody: (body: TargetCelestialBody) => void;
  onSelectArtifact?: (artifact: SpatialArtifact) => void;
}

function createOrbitPoints(
  radius: number,
  tiltX = 0,
  tiltZ = 0,
  segments = 128
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = Math.sin(theta) * tiltX + Math.cos(theta) * tiltZ;
    pts.push([x, y, z]);
  }
  return pts;
}

function createFresnelAtmosphereMaterial(
  hexColor: string,
  power = 3.2,
  intensity = 1.15
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hexColor) },
      uPower: { value: power },
      uIntensity: { value: intensity },
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
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float fresnel = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), uPower);
        gl_FragColor = vec4(uColor * uIntensity, fresnel * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

function createBoilingSunMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vPos;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vPos = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vPos;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      float solarNoise(vec3 p) {
        return sin(p.x * 3.1 + uTime * 1.4) * cos(p.y * 3.3 - uTime * 1.1) * sin(p.z * 2.9 + uTime * 1.3)
             + 0.5 * sin(p.x * 7.2 - uTime * 2.3) * cos(p.z * 6.8 + uTime * 1.9);
      }

      void main() {
        float n = solarNoise(vPos * 0.85) * 0.5 + 0.5;
        vec3 coreColor = mix(vec3(0.95, 0.32, 0.04), vec3(1.0, 0.88, 0.35), clamp(n, 0.0, 1.0));
        float limb = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 1.8);
        vec3 finalColor = mix(coreColor, vec3(1.0, 0.96, 0.78), limb * 0.65);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}

/**
 * FIX #1 & #2: Off-Center Leader-Line Planet Tag with Strict Scale Clamping & Proximity Fade-Out
 * - Anchored at [planetRadius * 1.15, planetRadius * 0.95, 0] (upper-right rim, NEVER over planet center)
 * - Uses NO distanceFactor so it never blows up on zoom
 * - Clamps scale strictly in useFrame: scale = Math.min(1.0, Math.max(0.65, refDist / camDist))
 * - Fades to opacity: 0 and pointer-events: none when camera zooms close (camDist < fadeThreshold)
 */
interface OffCenterPlanetBadgeProps {
  body: TargetCelestialBody;
  title: string;
  count: number;
  color: string;
  planetPosition: [number, number, number];
  planetRadius: number;
  isSelected: boolean;
  onSelect: () => void;
}

const OffCenterPlanetBadge: React.FC<OffCenterPlanetBadgeProps> = ({
  title,
  count,
  color,
  planetPosition,
  planetRadius,
  isSelected,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const worldVec = useMemo(() => new THREE.Vector3(...planetPosition), [planetPosition]);

  // Off-center upper-right rim anchor: [planetRadius * 1.15, planetRadius * 0.95, 0]
  const anchorPos: [number, number, number] = [
    planetPosition[0] + planetRadius * 1.15,
    planetPosition[1] + planetRadius * 0.95,
    planetPosition[2],
  ];

  useFrame(({ camera }) => {
    const el = containerRef.current;
    const btn = buttonRef.current;
    if (!el || !btn) return;

    const camDist = camera.position.distanceTo(worldVec);
    // Strict scale clamping: never exceeds 1.0x, never shrinks below 0.65x
    const referenceDistance = 42;
    const scale = Math.min(1.0, Math.max(0.65, referenceDistance / Math.max(1, camDist)));

    // Close-zoom proximity fade-out: fade out when camera approaches closer than max(planetRadius * 3.2, 13)
    const fadeStart = Math.max(planetRadius * 6.5, 16);
    const fadeEnd = Math.max(planetRadius * 3.2, 8.5);
    const opacity = THREE.MathUtils.clamp(
      (camDist - fadeEnd) / (fadeStart - fadeEnd),
      0,
      1
    );

    el.style.transform = `scale(${scale.toFixed(3)})`;
    el.style.opacity = opacity.toFixed(2);
    btn.style.pointerEvents = opacity < 0.15 ? 'none' : 'auto';
  });

  return (
    <Html
      position={anchorPos}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[20, 0]}
    >
      {/* Wrapper has pointer-events: none; positioned so bottom-left touches the 5px rim dot */}
      <div
        ref={containerRef}
        style={{
          transformOrigin: 'bottom left',
          transition: 'opacity 120ms ease-out',
          pointerEvents: 'none',
        }}
        className="relative flex items-end select-none"
      >
        {/* 5px Glowing Rim Dot + 1px Diagonal SVG Leader Line */}
        <div className="relative flex items-end pointer-events-none">
          <span
            className="block h-[5px] w-[5px] rounded-full shrink-0"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
          <svg
            width="22"
            height="18"
            viewBox="0 0 22 18"
            className="overflow-visible shrink-0 -ml-[1px] -mb-[1px]"
          >
            <line
              x1="0"
              y1="18"
              x2="16"
              y2="2"
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.75"
            />
            <line
              x1="16"
              y1="2"
              x2="22"
              y2="2"
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.75"
            />
          </svg>
        </div>

        {/* Compact Telemetry Tag (max-width: 175px, padding: 4px 10px, font-size: 12px, border-radius: 6px) */}
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            maxWidth: '185px',
            padding: '4px 10px',
            fontSize: '12px',
            borderRadius: '6px',
            pointerEvents: 'auto',
            wordSpacing: 'normal',
            letterSpacing: 'normal',
          }}
          className={`spatial-html-label -mb-[9px] flex items-center gap-1.5 border backdrop-blur-md transition cursor-pointer whitespace-nowrap shadow-md ${
            isSelected
              ? 'border-white/80 bg-slate-900/90 text-white'
              : 'border-white/20 bg-slate-950/75 text-slate-200 hover:border-white/50 hover:bg-slate-900/90'
          }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium truncate">{title}</span>
          <span className="font-mono text-[11px] font-bold opacity-80"> · {count}</span>
        </button>
      </div>
    </Html>
  );
};

/**
 * FIX #4: Zoom-Based Level of Detail (LOD) Surface Artifact Pins
 * Hidden at far overview zoom; smoothly revealed when the planet is selected or zoomed in close.
 * Renders a 6px glowing beacon dot + 11px monospace title tag offset 12px above the dot.
 */
interface SurfaceArtifactPinProps {
  artifact: SpatialArtifact;
  planetPosition: [number, number, number];
  surfaceOffset: [number, number, number];
  color: string;
  isPlanetSelected: boolean;
  isArtifactActive: boolean;
  onSelectArtifact: (artifact: SpatialArtifact) => void;
}

const SurfaceArtifactPin: React.FC<SurfaceArtifactPinProps> = ({
  artifact,
  planetPosition,
  surfaceOffset,
  color,
  isPlanetSelected,
  isArtifactActive,
  onSelectArtifact,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const planetVec = useMemo(() => new THREE.Vector3(...planetPosition), [planetPosition]);

  const worldPinPos: [number, number, number] = [
    planetPosition[0] + surfaceOffset[0],
    planetPosition[1] + surfaceOffset[1],
    planetPosition[2] + surfaceOffset[2],
  ];

  // Orient 3D surface spacecraft upright relative to the planet's outward surface normal
  const uprightQuaternion = useMemo(() => {
    const normal = new THREE.Vector3(...surfaceOffset);
    if (normal.lengthSq() < 0.0001) {
      normal.set(0, 1, 0);
    } else {
      normal.normalize();
    }
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  }, [surfaceOffset]);

  const planetSurfaceScale = useMemo(() => {
    const baseRadius = PLANET_RADII[artifact.targetBody] ?? 0.9;
    return Math.max(0.22, Math.min(0.36, baseRadius * 0.28));
  }, [artifact.targetBody]);

  useFrame(({ camera }) => {
    const el = wrapperRef.current;
    const btn = btnRef.current;
    if (!el || !btn) return;

    const camDist = camera.position.distanceTo(planetVec);
    // Show surface pins only when zoomed close (< 28 units) or when this planet is actively inspected at medium-close range (< 42 units)
    const maxVisibleDist = isPlanetSelected ? 36 : 20;
    const visible = camDist < maxVisibleDist;

    const opacity = visible
      ? THREE.MathUtils.clamp((maxVisibleDist - camDist) / 8, 0, 1)
      : 0;
    const scale = Math.min(1.0, Math.max(0.7, 18 / Math.max(1, camDist)));

    el.style.opacity = opacity.toFixed(2);
    el.style.transform = `translate(-50%, -100%) scale(${scale.toFixed(3)})`;
    btn.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
  });

  const shortTitle = artifact.name.split(' (')[0];

  const proceduralSurfaceFallback = (
    <group scale={planetSurfaceScale * 0.14}>
      <ProceduralSpacecraft artifactId={artifact.id} />
    </group>
  );

  return (
    <group position={worldPinPos}>
      {/* 3D Surface Model oriented upright along the planetary surface normal */}
      <group
        quaternion={uprightQuaternion}
        onClick={(e) => {
          e.stopPropagation();
          onSelectArtifact(artifact);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {artifact.glbUrl ? (
          <NormalizedGlbModel
            url={artifact.glbUrl}
            targetSize={planetSurfaceScale}
            fallback={proceduralSurfaceFallback}
          />
        ) : (
          proceduralSurfaceFallback
        )}
      </group>

      <Html position={[0, 0, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[25, 0]}>
        <div
          ref={wrapperRef}
          style={{
            opacity: 0,
            transformOrigin: 'bottom center',
            pointerEvents: 'none',
            transition: 'opacity 150ms ease-out',
          }}
          className="flex flex-col items-center select-none"
        >
          {/* 11px Monospace Title Tag offset 12px above the 6px dot */}
          <button
            ref={btnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectArtifact(artifact);
            }}
            style={{
              fontSize: '11px',
              marginBottom: '12px',
              pointerEvents: 'none',
              wordSpacing: 'normal',
              letterSpacing: 'normal',
            }}
            className={`spatial-html-label rounded px-2 py-0.5 font-mono whitespace-nowrap border backdrop-blur-md transition cursor-pointer ${
              isArtifactActive
                ? 'border-cyan-300 bg-slate-900/95 text-cyan-200 font-semibold shadow-sm'
                : 'border-white/20 bg-slate-950/80 text-slate-200 hover:border-white/50'
            }`}
          >
            {shortTitle}
          </button>

          {/* 6px Glowing Surface Beacon Dot */}
          <span
            className="block h-[6px] w-[6px] rounded-full"
            style={{
              backgroundColor: isArtifactActive ? '#22d3ee' : color,
              boxShadow: `0 0 8px ${isArtifactActive ? '#22d3ee' : color}`,
            }}
          />
        </div>
      </Html>
    </group>
  );
};

export const SolarSystemOrrery: React.FC<SolarSystemOrreryProps> = ({
  tier,
  selectedBody,
  activeArtifact,
  onSelectBody,
  onSelectArtifact,
}) => {
  const sunCoronaRef = useRef<THREE.Mesh>(null);
  const sunOuterRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const earthCloudsRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const earthLabelRef = useRef<HTMLDivElement>(null);
  const marsRef = useRef<THREE.Mesh>(null);
  const erosRef = useRef<THREE.Mesh>(null);
  const ceresRef = useRef<THREE.Mesh>(null);
  const jupiterRef = useRef<THREE.Mesh>(null);
  const saturnRef = useRef<THREE.Mesh>(null);
  const mercuryGroupRef = useRef<THREE.Group>(null);
  const venusGroupRef = useRef<THREE.Group>(null);
  const uranusGroupRef = useRef<THREE.Group>(null);
  const neptuneGroupRef = useRef<THREE.Group>(null);
  const asteroidInstancedRef = useRef<THREE.InstancedMesh>(null);

  const earthWorldVec = useMemo(
    () => new THREE.Vector3(...CELESTIAL_ANCHORS.Earth),
    []
  );

  const pbr = useMemo(() => getCachedPlanetaryPBRTextures(), []);
  const erosGeometry = useMemo(() => createDisplacedErosGeometry(PLANET_RADII.Eros), []);
  const sunShaderMat = useMemo(() => createBoilingSunMaterial(), []);
  const earthAtmoMat = useMemo(
    () => createBackSideAtmosphereMaterial('#4AA8FF', 2.2, 1.05),
    []
  );
  const marsAtmoMat = useMemo(
    () => createBackSideAtmosphereMaterial('#E87D42', 2.35, 0.9),
    []
  );
  const venusAtmoMat = useMemo(
    () => createFresnelAtmosphereMaterial('#fde047', 2.8, 1.0),
    []
  );
  const jupiterAtmoMat = useMemo(
    () => createFresnelAtmosphereMaterial('#fdba74', 3.5, 0.85),
    []
  );
  const saturnAtmoMat = useMemo(
    () => createFresnelAtmosphereMaterial('#fef08a', 3.5, 0.8),
    []
  );
  const uranusAtmoMat = useMemo(
    () => createFresnelAtmosphereMaterial('#67e8f9', 3.0, 1.0),
    []
  );
  const neptuneAtmoMat = useMemo(
    () => createFresnelAtmosphereMaterial('#3b82f6', 3.0, 1.1),
    []
  );

  const asteroidCount = 3200;
  const asteroidMatrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    for (let i = 0; i < asteroidCount; i++) {
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = seed1 - Math.floor(seed1);
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const r2 = seed2 - Math.floor(seed2);
      const seed3 = Math.sin(i * 45.164) * 43758.5453;
      const r3 = seed3 - Math.floor(seed3);

      const angle = (i / asteroidCount) * Math.PI * 2 + r1 * 0.5;
      const radius = 36.5 + r2 * 11.0;
      const y = (r3 - 0.5) * 3.2;

      dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dummy.rotation.set(r1 * Math.PI, r2 * Math.PI, r3 * Math.PI);
      const scale = 0.06 + r1 * 0.19;
      dummy.scale.set(scale * (1 + r2 * 0.4), scale, scale * (1 + r3 * 0.3));
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, []);

  React.useEffect(() => {
    if (!asteroidInstancedRef.current) return;
    asteroidMatrices.forEach((mat, idx) => {
      asteroidInstancedRef.current!.setMatrixAt(idx, mat);
    });
    asteroidInstancedRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroidMatrices]);

  const orbits = useMemo(() => {
    const earthRadius = Math.hypot(
      CELESTIAL_ANCHORS.Earth[0],
      CELESTIAL_ANCHORS.Earth[2]
    );
    const marsRadius = Math.hypot(
      CELESTIAL_ANCHORS.Mars[0],
      CELESTIAL_ANCHORS.Mars[2]
    );
    const erosRadius = Math.hypot(
      CELESTIAL_ANCHORS.Eros[0],
      CELESTIAL_ANCHORS.Eros[2]
    );
    const ceresRadius = Math.hypot(
      CELESTIAL_ANCHORS.Ceres[0],
      CELESTIAL_ANCHORS.Ceres[2]
    );
    const jupiterRadius = Math.hypot(
      CELESTIAL_ANCHORS.Jupiter[0],
      CELESTIAL_ANCHORS.Jupiter[2]
    );
    const saturnRadius = Math.hypot(
      CELESTIAL_ANCHORS.Saturn[0],
      CELESTIAL_ANCHORS.Saturn[2]
    );

    return {
      mercury: createOrbitPoints(8.2, 0.3, 0.1),
      venus: createOrbitPoints(12.8, -0.2, 0.2),
      earth: createOrbitPoints(earthRadius, 0, 0),
      mars: createOrbitPoints(marsRadius, 0.4, -0.3),
      eros: createOrbitPoints(erosRadius, 2.1, -1.2),
      ceres: createOrbitPoints(ceresRadius, -1.5, 0.9),
      jupiter: createOrbitPoints(jupiterRadius, 0, 0),
      saturn: createOrbitPoints(saturnRadius, 1.2, -0.8),
      uranus: createOrbitPoints(86, -0.6, 0.5),
      neptune: createOrbitPoints(98, 0.5, -0.6),
    };
  }, []);

  const moonLocalOrbit = useMemo(() => createOrbitPoints(3.9, 0.6, 0.4, 64), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    sunShaderMat.uniforms.uTime.value = t;

    if (sunCoronaRef.current) {
      sunCoronaRef.current.rotation.y += delta * 0.12;
      sunCoronaRef.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.025);
    }
    if (sunOuterRef.current) {
      sunOuterRef.current.rotation.z -= delta * 0.08;
      sunOuterRef.current.scale.setScalar(1.12 + Math.cos(t * 1.6) * 0.035);
    }
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.28;
    if (earthCloudsRef.current) earthCloudsRef.current.rotation.y += delta * 0.42;
    if (moonRef.current) moonRef.current.rotation.y += delta * 0.045;
    if (marsRef.current) marsRef.current.rotation.y += delta * 0.24;
    if (erosRef.current) {
      erosRef.current.rotation.x += delta * 0.25;
      erosRef.current.rotation.y += delta * 0.42;
    }
    if (ceresRef.current) ceresRef.current.rotation.y += delta * 0.22;
    if (jupiterRef.current) jupiterRef.current.rotation.y += delta * 0.5;
    if (saturnRef.current) saturnRef.current.rotation.y += delta * 0.42;

    if (mercuryGroupRef.current) mercuryGroupRef.current.rotation.y = t * 0.25;
    if (venusGroupRef.current) venusGroupRef.current.rotation.y = t * 0.14 + 1.4;
    if (uranusGroupRef.current) uranusGroupRef.current.rotation.y = t * 0.03 + 2.2;
    if (neptuneGroupRef.current) neptuneGroupRef.current.rotation.y = t * 0.02 + 4.1;

    if (asteroidInstancedRef.current) {
      asteroidInstancedRef.current.rotation.y += delta * 0.012;
    }

    // Clamp & fade Earth origin micro-label on close zoom
    if (earthLabelRef.current) {
      const d = state.camera.position.distanceTo(earthWorldVec);
      const s = Math.min(1.0, Math.max(0.65, 40 / Math.max(1, d)));
      const op = THREE.MathUtils.clamp((d - 7) / 8, 0, 0.85);
      earthLabelRef.current.style.transform = `scale(${s.toFixed(3)})`;
      earthLabelRef.current.style.opacity = op.toFixed(2);
    }
  });

  const showNodeBadges = tier !== 'inspector';

  const nodeDestinations: Array<{
    body: TargetCelestialBody;
    title: string;
    count: number;
    color: string;
    position: [number, number, number];
    radius: number;
  }> = [
    {
      body: 'Moon',
      title: 'The Moon',
      count: 4,
      color: '#38bdf8',
      position: CELESTIAL_ANCHORS.Moon,
      radius: PLANET_RADII.Moon,
    },
    {
      body: 'Mars',
      title: 'Mars',
      count: 6,
      color: '#f97316',
      position: CELESTIAL_ANCHORS.Mars,
      radius: PLANET_RADII.Mars,
    },
    {
      body: 'Eros',
      title: '433 Eros',
      count: 1,
      color: '#eab308',
      position: CELESTIAL_ANCHORS.Eros,
      radius: PLANET_RADII.Eros,
    },
    {
      body: 'Ceres',
      title: 'Ceres',
      count: 1,
      color: '#a855f7',
      position: CELESTIAL_ANCHORS.Ceres,
      radius: PLANET_RADII.Ceres,
    },
    {
      body: 'Interstellar',
      title: 'Deep Space',
      count: 1,
      color: '#34d399',
      position: CELESTIAL_ANCHORS.Interstellar,
      radius: PLANET_RADII.Interstellar,
    },
  ];

  // Compute deterministic spherical surface offsets for each artifact on its host planet
  const surfacePinItems = useMemo(() => {
    const grouped: Record<TargetCelestialBody, SpatialArtifact[]> = {
      Moon: [],
      Mars: [],
      Eros: [],
      Ceres: [],
      Interstellar: [],
    };
    SPATIAL_ARTIFACTS.forEach((a) => {
      grouped[a.targetBody].push(a);
    });

    const pins: Array<{
      artifact: SpatialArtifact;
      planetPosition: [number, number, number];
      surfaceOffset: [number, number, number];
      color: string;
    }> = [];

    const colorMap: Record<TargetCelestialBody, string> = {
      Moon: '#38bdf8',
      Mars: '#f97316',
      Eros: '#eab308',
      Ceres: '#a855f7',
      Interstellar: '#34d399',
    };

    (Object.keys(grouped) as TargetCelestialBody[]).forEach((body) => {
      const list = grouped[body];
      const r = PLANET_RADII[body] * 1.1;
      const baseDir = getPlanetBaseViewDir(body);
      const baseAzimuth = Math.atan2(baseDir.x, baseDir.z);

      list.forEach((art, idx) => {
        const slot = ARTIFACT_SURFACE_SLOTS[art.id];
        const fallbackYaw = ((idx + 0.5) / Math.max(1, list.length) - 0.5) * 1.8;
        const fallbackPhi = (idx % 2 === 0 ? 1 : -1) * 0.45;
        const theta = baseAzimuth + (slot ? slot.yaw : fallbackYaw);
        const phi = slot ? slot.phi : fallbackPhi;
        const sx = Math.cos(phi) * Math.sin(theta) * r;
        const sy = Math.sin(phi) * r;
        const sz = Math.cos(phi) * Math.cos(theta) * r;
        pins.push({
          artifact: art,
          planetPosition: CELESTIAL_ANCHORS[body],
          surfaceOffset: [sx, sy, sz],
          color: colorMap[body],
        });
      });
    });

    return pins;
  }, []);

  return (
    <group visible={tier !== 'inspector'}>
      {/* Deep-Space High-Density Starfield */}
      <Stars
        radius={320}
        depth={120}
        count={10000}
        factor={4.8}
        saturation={0.2}
        fade
        speed={0.3}
      />

      {/* Heliocentric Point Light from the Sun + Ambient Deep Space Fill */}
      <pointLight
        position={[0, 0, 0]}
        intensity={6.2}
        distance={280}
        decay={0.4}
        color="#fff7ed"
      />
      <ambientLight intensity={0.48} color="#94a3b8" />
      <hemisphereLight args={['#38bdf8', '#090d16', 0.48]} />

      {/* ==================== THE SUN [0, 0, 0] ==================== */}
      <group position={CELESTIAL_ANCHORS.Sun}>
        <mesh material={sunShaderMat}>
          <sphereGeometry args={[4.2, 64, 64]} />
        </mesh>
        <mesh ref={sunCoronaRef}>
          <sphereGeometry args={[4.6, 48, 48]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={0.48}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={sunOuterRef}>
          <sphereGeometry args={[5.55, 48, 48]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ==================== ORBITAL RINGS (Thin 1px Low-Opacity Guides) ==================== */}
      <Line points={orbits.mercury} color="#64748b" lineWidth={1} transparent opacity={0.22} />
      <Line points={orbits.venus} color="#fbbf24" lineWidth={1} transparent opacity={0.22} />
      <Line points={orbits.earth} color="#38bdf8" lineWidth={1} transparent opacity={0.22} />
      <Line points={orbits.mars} color="#f97316" lineWidth={1} transparent opacity={0.22} />
      <Line
        points={orbits.eros}
        color="#eab308"
        lineWidth={1}
        dashed
        dashSize={1.2}
        gapSize={0.8}
        transparent
        opacity={0.22}
      />
      <Line
        points={orbits.ceres}
        color="#a855f7"
        lineWidth={1}
        dashed
        dashSize={1.4}
        gapSize={0.9}
        transparent
        opacity={0.22}
      />
      <Line points={orbits.jupiter} color="#cbd5e1" lineWidth={1} transparent opacity={0.22} />
      <Line points={orbits.saturn} color="#fde68a" lineWidth={1} transparent opacity={0.22} />
      <Line points={orbits.uranus} color="#67e8f9" lineWidth={1} transparent opacity={0.22} />
      <Line points={orbits.neptune} color="#60a5fa" lineWidth={1} transparent opacity={0.22} />

      {/* ==================== 1. MERCURY & 2. VENUS ==================== */}
      <group ref={mercuryGroupRef}>
        <mesh position={[8.2, 0.1, 0]}>
          <sphereGeometry args={[0.44, 36, 36]} />
          <meshStandardMaterial
            map={pbr.moonMap}
            bumpMap={pbr.moonBump}
            bumpScale={0.05}
            roughness={0.92}
            metalness={0.08}
          />
        </mesh>
      </group>

      <group ref={venusGroupRef}>
        <group position={[12.8, -0.1, 0]}>
          <mesh>
            <sphereGeometry args={[0.88, 36, 36]} />
            <meshStandardMaterial
              map={pbr.jupiterMap}
              color="#fde68a"
              bumpMap={pbr.earthClouds}
              bumpScale={0.02}
              roughness={0.65}
            />
          </mesh>
          <mesh material={venusAtmoMat}>
            <sphereGeometry args={[0.98, 32, 32]} />
          </mesh>
        </group>
      </group>

      {/* ==================== 3. PHOTOREALISTIC EARTH & CRATERED MOON ==================== */}
      <group position={CELESTIAL_ANCHORS.Earth}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1.38, 64, 64]} />
          <meshStandardMaterial
            map={pbr.earthMap}
            roughnessMap={pbr.earthRoughness}
            roughness={1.0}
            bumpMap={pbr.earthBump}
            bumpScale={0.055}
            metalness={0.08}
          />
        </mesh>
        <mesh ref={earthCloudsRef}>
          <sphereGeometry args={[1.408, 48, 48]} />
          <meshStandardMaterial
            map={pbr.earthClouds}
            transparent
            opacity={0.78}
            roughness={0.9}
            depthWrite={false}
          />
        </mesh>
        <mesh material={earthAtmoMat}>
          <sphereGeometry args={[1.56, 48, 48]} />
        </mesh>

        <Line points={moonLocalOrbit} color="#38bdf8" lineWidth={1} transparent opacity={0.22} />

        {/* Off-center Clamped Origin Label for Earth (no distanceFactor blow-up) */}
        {showNodeBadges && (
          <Html
            position={[-1.6, -1.55, 0]}
            style={{ pointerEvents: 'none' }}
            zIndexRange={[10, 0]}
          >
            <div
              ref={earthLabelRef}
              style={{
                transformOrigin: 'top right',
                pointerEvents: 'none',
                wordSpacing: 'normal',
                letterSpacing: 'normal',
              }}
              className="spatial-html-label whitespace-nowrap rounded border border-sky-400/25 bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] text-sky-200/85 backdrop-blur-md"
            >
              Earth · Launch Origin
            </div>
          </Html>
        )}
      </group>

      {/* THE MOON (4 Artifacts) */}
      <group position={CELESTIAL_ANCHORS.Moon}>
        <mesh
          ref={moonRef}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelectBody('Moon');
          }}
        >
          <sphereGeometry args={[PLANET_RADII.Moon, 64, 64]} />
          <meshStandardMaterial
            map={pbr.moonMap}
            bumpMap={pbr.moonBump}
            bumpScale={0.06}
            roughnessMap={pbr.moonRoughness}
            roughness={0.94}
            metalness={0.03}
          />
        </mesh>
        {selectedBody === 'Moon' && (
          <mesh>
            <sphereGeometry args={[0.72, 32, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.14}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* ==================== 4. PHOTOREALISTIC MARS (6 Artifacts) ==================== */}
      <group position={CELESTIAL_ANCHORS.Mars}>
        <mesh
          ref={marsRef}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelectBody('Mars');
          }}
        >
          <sphereGeometry args={[PLANET_RADII.Mars, 64, 64]} />
          <meshStandardMaterial
            map={pbr.marsMap}
            bumpMap={pbr.marsBump}
            bumpScale={0.07}
            roughnessMap={pbr.marsRoughness}
            roughness={0.92}
            metalness={0.03}
          />
        </mesh>
        {/* Dusty-Amber BackSide Atmospheric Limb Halo */}
        <mesh material={marsAtmoMat}>
          <sphereGeometry args={[PLANET_RADII.Mars * 1.13, 48, 48]} />
        </mesh>
      </group>

      {/* ==================== MAIN ASTEROID BELT ==================== */}
      <instancedMesh ref={asteroidInstancedRef} args={[undefined, undefined, asteroidCount]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          map={pbr.erosMap}
          bumpMap={pbr.erosBump}
          bumpScale={0.05}
          color="#a8a29e"
          roughness={0.92}
          metalness={0.1}
        />
      </instancedMesh>

      {/* ASTEROID 433 EROS (Displaced Cratering Icosahedron Geometry) */}
      <group position={CELESTIAL_ANCHORS.Eros}>
        <mesh
          ref={erosRef}
          geometry={erosGeometry}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelectBody('Eros');
          }}
        >
          <meshStandardMaterial
            map={pbr.erosMap}
            bumpMap={pbr.erosBump}
            bumpScale={0.06}
            roughness={0.92}
            metalness={0.06}
          />
        </mesh>
      </group>

      {/* DWARF PLANET CERES (Dark Carbonaceous Crust + Occator Bright Salt Spots) */}
      <group position={CELESTIAL_ANCHORS.Ceres}>
        <mesh
          ref={ceresRef}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelectBody('Ceres');
          }}
        >
          <sphereGeometry args={[PLANET_RADII.Ceres, 64, 64]} />
          <meshStandardMaterial
            map={pbr.ceresMap}
            bumpMap={pbr.ceresBump}
            bumpScale={0.065}
            roughness={0.92}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* ==================== 5. JUPITER & 6. SATURN ==================== */}
      <group position={CELESTIAL_ANCHORS.Jupiter}>
        <mesh ref={jupiterRef}>
          <sphereGeometry args={[2.85, 64, 64]} />
          <meshStandardMaterial
            map={pbr.jupiterMap}
            bumpMap={pbr.earthClouds}
            bumpScale={0.02}
            roughness={0.68}
            metalness={0.05}
          />
        </mesh>
        <mesh material={jupiterAtmoMat}>
          <sphereGeometry args={[3.05, 48, 48]} />
        </mesh>
      </group>

      <group position={CELESTIAL_ANCHORS.Saturn}>
        <mesh ref={saturnRef}>
          <sphereGeometry args={[2.35, 64, 64]} />
          <meshStandardMaterial
            map={pbr.jupiterMap}
            color="#fde68a"
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
        <mesh material={saturnAtmoMat}>
          <sphereGeometry args={[2.52, 40, 40]} />
        </mesh>
        <mesh rotation={[Math.PI / 2.35, 0.25, 0]}>
          <planeGeometry args={[11.2, 11.2]} />
          <meshStandardMaterial
            map={pbr.saturnRingMap}
            side={THREE.DoubleSide}
            transparent
            depthWrite={false}
            roughness={0.75}
          />
        </mesh>
      </group>

      {/* ==================== 7. URANUS & 8. NEPTUNE ==================== */}
      <group ref={uranusGroupRef}>
        <group position={[86, -0.5, 0]}>
          <mesh>
            <sphereGeometry args={[1.55, 40, 40]} />
            <meshStandardMaterial
              map={pbr.jupiterMap}
              color="#67e8f9"
              roughness={0.58}
            />
          </mesh>
          <mesh material={uranusAtmoMat}>
            <sphereGeometry args={[1.7, 32, 32]} />
          </mesh>
        </group>
      </group>

      <group ref={neptuneGroupRef}>
        <group position={[98, 0.5, 0]}>
          <mesh>
            <sphereGeometry args={[1.5, 40, 40]} />
            <meshStandardMaterial
              map={pbr.jupiterMap}
              color="#3b82f6"
              roughness={0.55}
            />
          </mesh>
          <mesh material={neptuneAtmoMat}>
            <sphereGeometry args={[1.65, 32, 32]} />
          </mesh>
        </group>
      </group>

      {/* ==================== HELIOPAUSE / INTERSTELLAR BOUNDARY NODE ==================== */}
      <group position={CELESTIAL_ANCHORS.Interstellar}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectBody('Interstellar');
          }}
        >
          <octahedronGeometry args={[PLANET_RADII.Interstellar, 2]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.65}
            wireframe
          />
        </mesh>
      </group>

      {/* ==================== FIX #1 & #2: OFF-CENTER CLAMPED PLANET LEADER TAGS ==================== */}
      {showNodeBadges &&
        nodeDestinations.map((dest) => (
          <OffCenterPlanetBadge
            key={dest.body}
            body={dest.body}
            title={dest.title}
            count={dest.count}
            color={dest.color}
            planetPosition={dest.position}
            planetRadius={dest.radius}
            isSelected={selectedBody === dest.body}
            onSelect={() => onSelectBody(dest.body)}
          />
        ))}

      {/* ==================== FIX #4: CLOSE-ZOOM SURFACE ARTIFACT BEACON PINS ==================== */}
      {showNodeBadges &&
        onSelectArtifact &&
        surfacePinItems.map((pin) => (
          <SurfaceArtifactPin
            key={pin.artifact.id}
            artifact={pin.artifact}
            planetPosition={pin.planetPosition}
            surfaceOffset={pin.surfaceOffset}
            color={pin.color}
            isPlanetSelected={selectedBody === pin.artifact.targetBody}
            isArtifactActive={activeArtifact?.id === pin.artifact.id}
            onSelectArtifact={onSelectArtifact}
          />
        ))}
    </group>
  );
};

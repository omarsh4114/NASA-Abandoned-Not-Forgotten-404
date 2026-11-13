import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { SpatialArtifact, TargetCelestialBody, SpatialTier } from '../../data/artifacts';
import { CELESTIAL_ANCHORS } from './SolarSystemOrrery';

interface TrajectoryTrailProps {
  artifact: SpatialArtifact | null;
  targetBody: TargetCelestialBody | null;
  tier: SpatialTier;
  visible: boolean;
}

const BODY_COLORS: Record<TargetCelestialBody, string> = {
  Moon: '#38bdf8',
  Mars: '#f97316',
  Eros: '#eab308',
  Ceres: '#a855f7',
  Interstellar: '#34d399',
};

export const CRUISE_SPEED_KMS: Record<TargetCelestialBody, number> = {
  Moon: 10.8,
  Mars: 24.6,
  Eros: 19.4,
  Ceres: 17.8,
  Interstellar: 36.2,
};

export const TrajectoryTrail: React.FC<TrajectoryTrailProps> = ({
  artifact,
  targetBody,
  tier,
  visible,
}) => {
  const craftGroupRef = useRef<THREE.Group>(null);
  const plumeRef = useRef<THREE.Mesh>(null);
  const microTagRef = useRef<HTMLDivElement>(null);

  const activeBody: TargetCelestialBody | null = artifact?.targetBody ?? targetBody;

  const { curve, points, keplerSecondaryPoints, color, midPointVec, destVec } = useMemo(() => {
    if (!activeBody) {
      return {
        curve: null,
        points: [] as [number, number, number][],
        keplerSecondaryPoints: [] as [number, number, number][],
        color: '#38bdf8',
        midPointVec: new THREE.Vector3(),
        destVec: new THREE.Vector3(),
      };
    }

    const start = new THREE.Vector3(...CELESTIAL_ANCHORS.Earth);
    const end = new THREE.Vector3(...CELESTIAL_ANCHORS[activeBody]);
    let controlPoints: THREE.Vector3[] = [];

    if (activeBody === 'Moon') {
      controlPoints = [
        start,
        new THREE.Vector3(19.1, 1.15, 7.6),
        new THREE.Vector3(20.4, 1.35, 8.1),
        end,
      ];
    } else if (activeBody === 'Mars') {
      controlPoints = [
        start,
        new THREE.Vector3(12, 2.2, 20),
        new THREE.Vector3(-6, 3.4, 23),
        new THREE.Vector3(-21, 2.1, 6),
        end,
      ];
    } else if (activeBody === 'Eros') {
      controlPoints = [
        start,
        new THREE.Vector3(24, 1.5, 16),
        new THREE.Vector3(31, 2.8, 2),
        new THREE.Vector3(35, 2.9, -10),
        end,
      ];
    } else if (activeBody === 'Ceres') {
      controlPoints = [
        start,
        new THREE.Vector3(8, 1.2, 23),
        new THREE.Vector3(-14, 1.8, 28),
        new THREE.Vector3(-29, 0.2, 29),
        end,
      ];
    } else {
      controlPoints = [
        start,
        new THREE.Vector3(36, 1.5, 16),
        new THREE.Vector3(...CELESTIAL_ANCHORS.Jupiter),
        new THREE.Vector3(4, 5.5, -18),
        new THREE.Vector3(...CELESTIAL_ANCHORS.Saturn),
        end,
      ];
    }

    const spline = new THREE.CatmullRomCurve3(controlPoints, false, 'catmullrom', 0.5);
    const sampled = spline.getPoints(120).map((p) => [p.x, p.y, p.z] as [number, number, number]);

    const keplerPts: [number, number, number][] = [];
    if (activeBody === 'Interstellar') {
      const r = Math.hypot(CELESTIAL_ANCHORS.Earth[0], CELESTIAL_ANCHORS.Earth[2]) + 1.1;
      for (let i = 0; i <= 40; i++) {
        const angle = 0.32 - (i / 40) * 1.45;
        keplerPts.push([Math.cos(angle) * r, 0.35, Math.sin(angle) * r]);
      }
    }

    return {
      curve: spline,
      points: sampled,
      keplerSecondaryPoints: keplerPts,
      color: BODY_COLORS[activeBody],
      midPointVec: spline.getPointAt(0.48),
      destVec: end,
    };
  }, [activeBody]);

  useFrame((state) => {
    if (!curve || !craftGroupRef.current) return;
    const t = (state.clock.elapsedTime * 0.14) % 1;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    craftGroupRef.current.position.copy(pos);
    const targetLook = pos.clone().add(tangent);
    craftGroupRef.current.lookAt(targetLook);

    if (plumeRef.current) {
      plumeRef.current.scale.setScalar(0.9 + Math.sin(state.clock.elapsedTime * 24) * 0.18);
    }

    // FIX #3: Strictly clamp trajectory micro-tag & hide when zoomed close to destination planet
    if (microTagRef.current) {
      const distToMid = state.camera.position.distanceTo(midPointVec);
      const distToDest = state.camera.position.distanceTo(destVec);
      const scale = Math.min(0.92, Math.max(0.65, 38 / Math.max(1, distToMid)));
      // Fade out automatically when zoomed in on the planet (< 18 units)
      const fade = THREE.MathUtils.clamp((distToDest - 15) / 8, 0, 0.65);
      microTagRef.current.style.transform = `translate(-50%, -100%) scale(${scale.toFixed(3)})`;
      microTagRef.current.style.opacity = fade.toFixed(2);
    }
  });

  if (!visible || !activeBody || !curve || tier === 'inspector') return null;

  const baseSpeed = CRUISE_SPEED_KMS[activeBody];

  return (
    <group>
      {/* Primary Solid Glowing Trajectory Arc */}
      <Line points={points} color={color} lineWidth={2.5} transparent opacity={0.85} />

      {/* Outer Dashed Telemetry Guide */}
      <Line
        points={points}
        color="#ffffff"
        lineWidth={1.0}
        dashed
        dashSize={1.0}
        gapSize={0.7}
        transparent
        opacity={0.4}
      />

      {/* Kepler Earth-Trailing Solar Orbit Arc */}
      {keplerSecondaryPoints.length > 0 && (
        <Line
          points={keplerSecondaryPoints}
          color="#38bdf8"
          lineWidth={1.8}
          dashed
          dashSize={0.8}
          gapSize={0.5}
          transparent
          opacity={0.7}
        />
      )}

      {/* FIX #3: Tiny Low-Profile 10px Monospace Micro-Tag Pinned Along Trajectory (No distanceFactor) */}
      <Html
        position={[midPointVec.x, midPointVec.y + 0.45, midPointVec.z]}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[10, 0]}
      >
        <div
          ref={microTagRef}
          style={{
            fontSize: '10px',
            opacity: 0.65,
            pointerEvents: 'none',
            transformOrigin: 'bottom center',
          }}
          className="whitespace-nowrap rounded border border-white/15 bg-slate-950/75 px-2 py-0.5 font-mono text-cyan-200 backdrop-blur-sm select-none"
        >
          EARTH → {activeBody.toUpperCase()} · {baseSpeed.toFixed(1)} km/s
        </div>
      </Html>

      {/* ==================== 3D CRUISE SPACECRAFT ORIENTED ALONG TANGENT ==================== */}
      <group ref={craftGroupRef} scale={0.55}>
        {/* Gold Kapton Octagonal Cruise Bus */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.65, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Forward High-Gain Dish Antenna */}
        <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.1, 0.18, 24]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.35} roughness={0.4} />
        </mesh>

        {/* Twin Photovoltaic Cruise Solar Wings */}
        <mesh position={[1.15, 0, 0]}>
          <boxGeometry args={[1.65, 0.04, 0.48]} />
          <meshStandardMaterial
            color="#1d4ed8"
            emissive="#0284c7"
            emissiveIntensity={0.35}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[-1.15, 0, 0]}>
          <boxGeometry args={[1.65, 0.04, 0.48]} />
          <meshStandardMaterial
            color="#1d4ed8"
            emissive="#0284c7"
            emissiveIntensity={0.35}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Aft Thruster Nozzle & Glowing Engine Plume */}
        <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 0.25, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh ref={plumeRef} position={[0, 0, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.26, 0.95, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

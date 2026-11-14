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

/**
 * Generates a crisp photovoltaic cell grid texture (#0B192C base with silver/gold busbars)
 * and a soft feather-faded alpha gradient for the subtle ion thruster plume.
 */
function createCruiseSpacecraftAssets(): {
  solarMap: THREE.CanvasTexture;
  plumeAlphaMap: THREE.CanvasTexture;
  dishGeometry: THREE.LatheGeometry;
} {
  // 1. Photovoltaic cell texture
  const cellCanvas = document.createElement('canvas');
  cellCanvas.width = 256;
  cellCanvas.height = 128;
  const ctx = cellCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0B192C';
    ctx.fillRect(0, 0, 256, 128);

    // Subtle cell sheen gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 128);
    grad.addColorStop(0, 'rgba(30, 64, 175, 0.18)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.05)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.14)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);

    // Fine silver sub-cell lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.42)';
    ctx.lineWidth = 1;
    for (let x = 16; x < 256; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 128);
      ctx.stroke();
    }
    for (let y = 16; y < 128; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Gold/silver main collector busbars
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.72)';
    ctx.lineWidth = 2;
    for (const x of [64, 128, 192]) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 128);
      ctx.stroke();
    }
  }
  const solarMap = new THREE.CanvasTexture(cellCanvas);
  solarMap.colorSpace = THREE.SRGBColorSpace;
  solarMap.wrapS = THREE.RepeatWrapping;
  solarMap.wrapT = THREE.RepeatWrapping;
  solarMap.needsUpdate = true;

  // 2. Soft-edged ion plume alpha map (zero hard cone edges)
  const plumeCanvas = document.createElement('canvas');
  plumeCanvas.width = 128;
  plumeCanvas.height = 256;
  const pCtx = plumeCanvas.getContext('2d');
  if (pCtx) {
    pCtx.clearRect(0, 0, 128, 256);
    // In Cylinder/Cone UV, v=1 is top (at nozzle throat) and v=0 is bottom (plume tail)
    const vGrad = pCtx.createLinearGradient(0, 0, 0, 256);
    vGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    vGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.45)');
    vGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.12)');
    vGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    pCtx.fillStyle = vGrad;
    pCtx.fillRect(0, 0, 128, 256);
  }
  const plumeAlphaMap = new THREE.CanvasTexture(plumeCanvas);
  plumeAlphaMap.needsUpdate = true;

  // 3. Concave parabolic High-Gain Dish geometry
  const dishPoints: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = t * 0.46;
    const y = (t * t) * 0.16;
    dishPoints.push(new THREE.Vector2(r, y));
  }
  const dishGeometry = new THREE.LatheGeometry(dishPoints, 32);
  dishGeometry.computeVertexNormals();

  return { solarMap, plumeAlphaMap, dishGeometry };
}

export const TrajectoryTrail: React.FC<TrajectoryTrailProps> = ({
  artifact,
  targetBody,
  tier,
  visible,
}) => {
  const craftGroupRef = useRef<THREE.Group>(null);
  const plumeRef = useRef<THREE.Group>(null);
  const microTagRef = useRef<HTMLDivElement>(null);

  const { solarMap, plumeAlphaMap, dishGeometry } = useMemo(
    () => createCruiseSpacecraftAssets(),
    []
  );

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
      const pulse = 0.94 + Math.sin(state.clock.elapsedTime * 18) * 0.08;
      plumeRef.current.scale.set(pulse, pulse, 0.92 + Math.sin(state.clock.elapsedTime * 24) * 0.1);
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

      {/* ==================== 3D JPL-STYLE CRUISE SPACECRAFT ORIENTED ALONG TANGENT ==================== */}
      <group ref={craftGroupRef} scale={0.275}>
        {/* 1. OCTAGONAL SPACECRAFT BUS (Kapton Gold Foil + Titanium Rings + White Thermal Band) */}
        <group>
          {/* 8-Sided Kapton Gold Foil Core */}
          <mesh rotation={[Math.PI / 2, Math.PI / 8, 0]}>
            <cylinderGeometry args={[0.34, 0.38, 0.68, 8]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.28} />
          </mesh>

          {/* Matte White Thermal Radiator Band (Midsection) */}
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, Math.PI / 8, 0]}>
            <cylinderGeometry args={[0.365, 0.375, 0.22, 8]} />
            <meshStandardMaterial color="#F1F5F9" metalness={0.08} roughness={0.65} />
          </mesh>

          {/* Forward Dark Titanium Structural Ring */}
          <mesh position={[0, 0, 0.33]} rotation={[Math.PI / 2, Math.PI / 8, 0]}>
            <cylinderGeometry args={[0.355, 0.355, 0.07, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>

          {/* Aft Dark Titanium Structural Ring & Propulsion Adapter */}
          <mesh position={[0, 0, -0.33]} rotation={[Math.PI / 2, Math.PI / 8, 0]}>
            <cylinderGeometry args={[0.39, 0.33, 0.09, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>
        </group>

        {/* 2. PARABOLIC HIGH-GAIN DISH ANTENNA (Front +Z, Concave Dish + Feed Horn + 3 Tripod Struts) */}
        <group position={[0, 0, 0.38]}>
          {/* Dish Mounting Collar */}
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.08, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>

          {/* Concave White Parabolic Dish */}
          <mesh geometry={dishGeometry} position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color="#F1F5F9"
              metalness={0.12}
              roughness={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Dark Titanium Outer Dish Rim Ring */}
          <mesh position={[0, 0, 0.2]}>
            <torusGeometry args={[0.46, 0.016, 12, 32]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>

          {/* Central Feed Horn & Sub-Reflector Assembly */}
          <mesh position={[0, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.055, 0.28, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.04, 0.035, 16]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* 3 Thin Tripod Feed Horn Struts */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => {
            const midR = 0.22;
            const mx = Math.cos(angle) * midR;
            const my = Math.sin(angle) * midR;
            return (
              <group key={idx} position={[mx, my, 0.25]} rotation={[0, 0, angle]}>
                <mesh rotation={[0, -0.68, Math.PI / 2]}>
                  <cylinderGeometry args={[0.009, 0.009, 0.42, 8]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* 3. SEGMENTED DUAL-PANEL SOLAR ARRAY WINGS (+X and -X) */}
        {([-1, 1] as const).map((side) => (
          <group key={side} position={[side * 0.36, 0, 0]} scale={[side, 1, 1]}>
            {/* Dark Titanium Deployment Yoke Arms */}
            <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.028, 0.32, 8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
            </mesh>
            <mesh position={[0.16, 0, 0.09]} rotation={[0.42, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.34, 8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
            </mesh>
            <mesh position={[0.16, 0, -0.09]} rotation={[-0.42, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.34, 8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
            </mesh>

            {/* Dual Segmented Solar Panels with Metallic Frames & Photovoltaic Grid */}
            {[0, 1].map((segIdx) => {
              const segX = 0.78 + segIdx * 0.92;
              return (
                <group key={segIdx} position={[segX, 0, 0]}>
                  {/* Thin Metallic Outer Frame */}
                  <mesh>
                    <boxGeometry args={[0.88, 0.026, 0.44]} />
                    <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
                  </mesh>
                  {/* Silver Perimeter Trim Rail */}
                  <mesh position={[0, 0, 0.22]}>
                    <boxGeometry args={[0.88, 0.03, 0.014]} />
                    <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0, -0.22]}>
                    <boxGeometry args={[0.88, 0.03, 0.014]} />
                    <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
                  </mesh>
                  {/* Deep Midnight-Blue Photovoltaic Cell Surface (Top & Bottom) */}
                  <mesh position={[0, 0.015, 0]}>
                    <boxGeometry args={[0.83, 0.006, 0.39]} />
                    <meshStandardMaterial
                      color="#0B192C"
                      map={solarMap}
                      metalness={0.6}
                      roughness={0.25}
                    />
                  </mesh>
                  <mesh position={[0, -0.015, 0]}>
                    <boxGeometry args={[0.83, 0.006, 0.39]} />
                    <meshStandardMaterial
                      color="#0B192C"
                      map={solarMap}
                      metalness={0.6}
                      roughness={0.25}
                    />
                  </mesh>
                  {/* Inter-Segment Hinge Coupler */}
                  {segIdx === 0 && (
                    <mesh position={[0.46, 0, 0]}>
                      <boxGeometry args={[0.05, 0.038, 0.32]} />
                      <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.3} />
                    </mesh>
                  )}
                </group>
              );
            })}
          </group>
        ))}

        {/* 4. SCIENTIFIC INSTRUMENT DETAIL: Sleek Magnetometer Boom & Sensor Canister */}
        <group position={[-0.22, 0.24, -0.08]} rotation={[0.25, 0, 0.85]}>
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.012, 0.02, 1.04, 8]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.06, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.05, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>
          {/* Gold-Foil Fluxgate Magnetometer Sensor Head */}
          <mesh position={[0, 1.06, 0]}>
            <cylinderGeometry args={[0.036, 0.032, 0.11, 12]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.28} />
          </mesh>
        </group>

        {/* 5. REAR TITANIUM ROCKET NOZZLE BELL & SUBTLE ION THRUSTER GLOW */}
        <group position={[0, 0, -0.38]}>
          {/* Dark Titanium Gimbal Collar */}
          <mesh position={[0, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.18, 0.08, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.35} />
          </mesh>

          {/* Dark Titanium Open Rocket Nozzle Bell */}
          <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.2, 0.2, 24, 1, true]} />
            <meshStandardMaterial
              color="#1E293B"
              metalness={0.85}
              roughness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Glowing Blue-White Ion Engine Core Inside Nozzle */}
          <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.095, 0.115, 0.04, 20]} />
            <meshStandardMaterial
              color="#E0F2FE"
              emissive="#38BDF8"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, -0.18]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshBasicMaterial
              color="#BAE6FD"
              transparent
              opacity={0.75}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          {/* Short, Soft-Edged Translucent Ion Exhaust Plume */}
          <group ref={plumeRef} position={[0, 0, -0.22]}>
            <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.02, 0.38, 20, 1, true]} />
              <meshBasicMaterial
                color="#38BDF8"
                alphaMap={plumeAlphaMap}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.008, 0.24, 16, 1, true]} />
              <meshBasicMaterial
                color="#E0F2FE"
                alphaMap={plumeAlphaMap}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

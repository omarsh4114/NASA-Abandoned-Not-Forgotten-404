import { useLayoutEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  accentCopper,
  ensureSmoothNormals,
  instrumentSilver,
  kaptonGold,
  opticalSilica,
  solarCellBlue,
  thermalWhite,
  titaniumDark,
  wovenMeshTire,
} from '../utils/spacecraftMaterials';

export interface ProceduralSpacecraftProps {
  artifactId: string;
}

const UP_VEC = new THREE.Vector3(0, 1, 0);

/**
 * Exact cylinder strut connecting two 3D points cleanly without Euler angle guesswork.
 */
const Strut: FC<{
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  material: THREE.Material;
  radialSegments?: number;
}> = ({ from, to, radius, material, radialSegments = 12 }) => {
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = to;
  const { mid, length, quaternion } = useMemo(() => {
    const a = new THREE.Vector3(fx, fy, fz);
    const b = new THREE.Vector3(tx, ty, tz);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion();
    if (len > 1e-5) {
      quat.setFromUnitVectors(UP_VEC, dir.normalize());
    }
    return {
      mid: [midpoint.x, midpoint.y, midpoint.z] as [number, number, number],
      length: len,
      quaternion: quat,
    };
  }, [fx, fy, fz, tx, ty, tz]);

  return (
    <mesh position={mid} quaternion={quaternion} material={material} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, radialSegments]} />
    </mesh>
  );
};

/**
 * Shared smooth parabolic reflector dish geometry (1 unit radius, curving upward to y = 0.36).
 */
function createParabolicDishGeometry(radius = 0.75, depth = 0.32): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = t * radius;
    const y = t * t * depth;
    points.push(new THREE.Vector2(r, y));
  }
  // Small outer lip rim & return thickness underside so shadow volumes are waterproof
  points.push(new THREE.Vector2(radius, depth - 0.025));
  for (let i = steps - 1; i >= 0; i--) {
    const t = i / steps;
    const r = t * radius;
    const y = t * t * depth - 0.025;
    points.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(points, 36);
  return ensureSmoothNormals(geo);
}

/**
 * Creates a smooth curved arched fender shell via ExtrudeGeometry.
 */
function createFenderGeometry(
  innerR = 0.44,
  outerR = 0.465,
  width = 0.26,
  startAngle = Math.PI * 0.16,
  endAngle = Math.PI * 0.88
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const segs = 18;
  for (let i = 0; i <= segs; i++) {
    const a = startAngle + (i / segs) * (endAngle - startAngle);
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startAngle + (i / segs) * (endAngle - startAngle);
    shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
    curveSegments: 16,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(Math.PI / 2);
  return ensureSmoothNormals(geo);
}

/**
 * Tapered triangular Warm Electronics Box body for Mars Exploration Rovers (Opportunity & Spirit).
 */
function createRoverWebGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.46, -0.54);
  shape.lineTo(0.46, -0.54);
  shape.lineTo(0.56, 0.12);
  shape.lineTo(0.32, 0.54);
  shape.lineTo(-0.32, 0.54);
  shape.lineTo(-0.56, 0.12);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2);
  return ensureSmoothNormals(geo);
}

/**
 * MER Rover butterfly / arrowhead delta-wing deck base plate.
 */
function createRoverSolarWingDeckGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.34, 0.72);
  shape.lineTo(0.34, 0.72);
  shape.lineTo(1.12, 0.14);
  shape.lineTo(1.12, -0.22);
  shape.lineTo(0.58, -0.78);
  shape.lineTo(-0.58, -0.78);
  shape.lineTo(-1.12, -0.22);
  shape.lineTo(-1.12, 0.14);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  return ensureSmoothNormals(geo);
}

const SHARED_GEOS = {
  nearDish: createParabolicDishGeometry(0.76, 0.31),
  hgaSmallDish: createParabolicDishGeometry(0.45, 0.2),
  lrvFender: createFenderGeometry(),
  merWeb: createRoverWebGeometry(),
  merDeck: createRoverSolarWingDeckGeometry(),
  prismCup: ensureSmoothNormals(new THREE.CylinderGeometry(0.0155, 0.0115, 0.016, 16)),
};

/**
 * 1. ALSEP Lunar Laser Ranging Retroreflector (LRRR)
 * Angled Kapton-gold & silver optical pallet, recessed 10x10 (100) silica corner-cube prism grid,
 * 4 leveling legs, sun-compass dial, and braided white ALSEP power cable grounded at y = 0.
 */
const AlsepRetroreflectorMesh: FC = () => {
  const prismsRef = useRef<THREE.InstancedMesh>(null);

  const cableGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.16, -0.18),
      new THREE.Vector3(-0.29, 0.06, -0.25),
      new THREE.Vector3(-0.42, 0.015, -0.32),
      new THREE.Vector3(-0.62, 0.015, -0.28),
      new THREE.Vector3(-0.82, 0.016, -0.44),
    ]);
    return ensureSmoothNormals(new THREE.TubeGeometry(curve, 28, 0.014, 10, false));
  }, []);

  useLayoutEffect(() => {
    const inst = prismsRef.current;
    if (!inst) return;
    const dummy = new THREE.Object3D();
    const cols = 10;
    const rows = 10;
    const pitch = 0.036;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * pitch;
        const z = (r - (rows - 1) / 2) * pitch;
        dummy.position.set(x, 0.025, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
  }, []);

  const legOffsets: [number, number][] = [
    [-0.25, -0.21],
    [0.25, -0.21],
    [-0.25, 0.21],
    [0.25, 0.21],
  ];

  return (
    <group>
      {/* 4 Articulated Leveling Legs & Circular Pads Flush at y = 0 */}
      {legOffsets.map(([lx, lz], i) => (
        <group key={i}>
          <mesh position={[lx, 0.01, lz]} material={instrumentSilver} castShadow receiveShadow>
            <cylinderGeometry args={[0.052, 0.062, 0.02, 20]} />
          </mesh>
          <Strut
            from={[lx, 0.018, lz]}
            to={[lx * 0.78, 0.145, lz * 0.78]}
            radius={0.016}
            material={titaniumDark}
          />
        </group>
      ))}

      {/* Lower Gimbal Cradle & Kapton Gold Thermal Blanket */}
      <mesh position={[0, 0.165, 0]} material={instrumentSilver} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.045, 0.42]} />
      </mesh>
      <mesh position={[0, 0.135, 0]} material={kaptonGold} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.05, 0.38]} />
      </mesh>

      {/* Side Carry Handles & Elevation Hinge Trunnions */}
      {[-0.245, 0.245].map((hx, i) => (
        <group key={i} position={[hx, 0.22, 0]}>
          <mesh material={accentCopper} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.055, 16]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[hx > 0 ? 0.025 : -0.025, 0, 0]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.22, 10]} />
          </mesh>
        </group>
      ))}

      {/* Sun-Compass Azimuth Dial, Bracket Flange & Bubble Level Assembly */}
      <Strut from={[0.16, 0.165, 0.17]} to={[0.21, 0.175, 0.24]} radius={0.016} material={instrumentSilver} />
      <group position={[0.21, 0.18, 0.24]}>
        <mesh material={instrumentSilver} castShadow receiveShadow>
          <cylinderGeometry args={[0.062, 0.068, 0.024, 24]} />
        </mesh>
        <mesh position={[0, 0.014, 0]} material={kaptonGold} castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.006, 24]} />
        </mesh>
        <mesh position={[0, 0.055, 0]} material={titaniumDark} castShadow>
          <cylinderGeometry args={[0.004, 0.007, 0.082, 10]} />
        </mesh>
        <mesh position={[0, 0.098, 0]} material={accentCopper} castShadow>
          <sphereGeometry args={[0.009, 12, 12]} />
        </mesh>
      </group>

      {/* Braided White Power/Telemetry Cable Snake + ALSEP Bayonet Plug */}
      <mesh position={[-0.22, 0.16, -0.18]} material={accentCopper} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 0.04, 14]} />
      </mesh>
      <mesh geometry={cableGeo} material={thermalWhite} castShadow receiveShadow />
      <mesh position={[-0.82, 0.016, -0.44]} rotation={[0, -0.6, Math.PI / 2]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 0.065, 14]} />
      </mesh>

      {/* Angled Silver & Kapton-Gold Optical Pallet + Recessed 10x10 Corner-Cube Prism Grid */}
      <group position={[0, 0.29, 0]} rotation={[0.44, 0, 0]}>
        {/* Aluminum Honeycomb Carrier Frame */}
        <mesh material={instrumentSilver} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.048, 0.44]} />
        </mesh>
        {/* Kapton Gold Thermal Underside Jacket */}
        <mesh position={[0, -0.028, 0]} material={kaptonGold} castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.022, 0.4]} />
        </mesh>

        {/* Protective Raised Aluminum Sunshade Frame Rails Around Prism Cavity */}
        <mesh position={[0, 0.032, -0.205]} material={instrumentSilver} castShadow>
          <boxGeometry args={[0.48, 0.036, 0.03]} />
        </mesh>
        <mesh position={[0, 0.032, 0.205]} material={instrumentSilver} castShadow>
          <boxGeometry args={[0.48, 0.036, 0.03]} />
        </mesh>
        <mesh position={[-0.225, 0.032, 0]} material={instrumentSilver} castShadow>
          <boxGeometry args={[0.03, 0.036, 0.44]} />
        </mesh>
        <mesh position={[0.225, 0.032, 0]} material={instrumentSilver} castShadow>
          <boxGeometry args={[0.03, 0.036, 0.44]} />
        </mesh>

        {/* Dark Recessed Cavity Matrix Floor */}
        <mesh position={[0, 0.018, 0]} material={titaniumDark} receiveShadow>
          <boxGeometry args={[0.41, 0.015, 0.37]} />
        </mesh>

        {/* 100 Precision Fused-Silica Corner-Cube Reflector Prisms (10x10 Instanced Grid) */}
        <instancedMesh
          ref={prismsRef}
          args={[SHARED_GEOS.prismCup, opticalSilica, 100]}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  );
};

/**
 * 2. Apollo Lunar Roving Vehicle (LRV-3)
 * Tubular white chassis, 4 woven-mesh wheels with arched fenders (plus A17 orange Chronoflex map flap),
 * gold-foil front console, dual seats, T-bar joystick, and umbrella-shaped gold mesh high-gain dish.
 */
const ApolloLrvMesh: FC = () => {
  const wheels: { pos: [number, number, number]; rightSide: boolean; rearRight: boolean }[] = [
    { pos: [-0.86, 0.405, 1.08], rightSide: false, rearRight: false },
    { pos: [0.86, 0.405, 1.08], rightSide: true, rearRight: false },
    { pos: [-0.86, 0.405, -1.08], rightSide: false, rearRight: false },
    { pos: [0.86, 0.405, -1.08], rightSide: true, rearRight: true },
  ];

  return (
    <group>
      {/* Aluminum Floorpan Deck & Side Tubular Chassis Rails */}
      <mesh position={[0, 0.36, 0]} material={instrumentSilver} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.045, 2.28]} />
      </mesh>
      {[-0.6, 0.6].map((rx, idx) => (
        <mesh
          key={idx}
          position={[rx, 0.37, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={thermalWhite}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.032, 0.032, 2.52, 16]} />
        </mesh>
      ))}
      {[-1.12, 0, 1.12].map((rz, idx) => (
        <mesh
          key={idx}
          position={[0, 0.37, rz]}
          rotation={[0, 0, Math.PI / 2]}
          material={thermalWhite}
          castShadow
        >
          <cylinderGeometry args={[0.028, 0.028, 1.24, 14]} />
        </mesh>
      ))}

      {/* Forward Dual-Battery Box & Aft Electronics LCRU Bay wrapped in Kapton Gold */}
      <mesh position={[0, 0.49, 1.02]} material={kaptonGold} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.24, 0.42]} />
      </mesh>
      <mesh position={[0, 0.5, 1.02]} material={titaniumDark} castShadow>
        <boxGeometry args={[0.84, 0.03, 0.34]} />
      </mesh>
      <mesh position={[0, 0.48, -0.96]} material={kaptonGold} castShadow receiveShadow>
        <boxGeometry args={[1.02, 0.22, 0.5]} />
      </mesh>
      <mesh position={[0, 0.61, -0.96]} material={instrumentSilver} castShadow>
        <boxGeometry args={[0.86, 0.04, 0.42]} />
      </mesh>

      {/* Dual Astronaut Tubular Bucket Seats */}
      {[-0.33, 0.33].map((sx, idx) => (
        <group key={idx} position={[sx, 0.46, -0.22]}>
          {/* Cushion Pan */}
          <mesh material={thermalWhite} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.06, 0.44]} />
          </mesh>
          {/* Backrest Sling */}
          <mesh position={[0, 0.27, -0.2]} rotation={[-0.18, 0, 0]} material={thermalWhite} castShadow>
            <boxGeometry args={[0.42, 0.5, 0.055]} />
          </mesh>
          {/* Side Frame Rails & Grab Handrail */}
          {[-0.22, 0.22].map((ax, j) => (
            <mesh key={j} position={[ax, 0.24, -0.1]} material={titaniumDark} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.5, 10]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Center Console Pedestal + T-Bar Hand Controller Joystick */}
      <mesh position={[0, 0.58, -0.02]} material={instrumentSilver} castShadow>
        <boxGeometry args={[0.14, 0.4, 0.34]} />
      </mesh>
      <mesh position={[0, 0.85, 0.08]} rotation={[0.25, 0, 0]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.016, 0.018, 0.22, 12]} />
      </mesh>
      <mesh position={[0, 0.95, 0.11]} rotation={[0, 0, Math.PI / 2]} material={titaniumDark} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.16, 12]} />
      </mesh>

      {/* Slanted Kapton-Gold Forward Navigation & Drive Console */}
      <mesh position={[0, 0.72, 0.52]} rotation={[0.2, 0, 0]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.025, 0.032, 0.72, 14]} />
      </mesh>
      <group position={[0, 1.0, 0.48]} rotation={[-0.52, 0, 0]}>
        <mesh material={kaptonGold} castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.14, 0.28]} />
        </mesh>
        <mesh position={[0, 0.072, 0]} material={titaniumDark} castShadow>
          <boxGeometry args={[0.38, 0.015, 0.22]} />
        </mesh>
        <mesh position={[-0.09, 0.082, -0.02]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.012, 18]} />
        </mesh>
        <mesh position={[0.09, 0.082, 0.02]} material={instrumentSilver} castShadow>
          <boxGeometry args={[0.12, 0.012, 0.1]} />
        </mesh>
      </group>

      {/* Forward Umbrella-Shaped Gold Mesh High-Gain Dish */}
      <group position={[-0.24, 0.62, 1.02]}>
        <mesh position={[0, 0.34, 0]} material={instrumentSilver} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.68, 12]} />
        </mesh>
        <group position={[0, 0.72, 0]} rotation={[0.42, 0, -0.15]}>
          {/* Central Feed Boom */}
          <mesh position={[0, 0.18, 0]} material={titaniumDark} castShadow>
            <cylinderGeometry args={[0.012, 0.015, 0.36, 10]} />
          </mesh>
          <mesh position={[0, 0.36, 0]} material={accentCopper} castShadow>
            <cylinderGeometry args={[0.024, 0.032, 0.055, 14]} />
          </mesh>
          {/* Open Umbrella Spoke Ribs + Gold Reflective Dish Membrane */}
          <mesh position={[0, 0.09, 0]} geometry={SHARED_GEOS.hgaSmallDish} material={kaptonGold} castShadow />
          {Array.from({ length: 10 }).map((_, ribIdx) => {
            const ang = (ribIdx / 10) * Math.PI * 2;
            return (
              <Strut
                key={ribIdx}
                from={[0, 0.09, 0]}
                to={[Math.cos(ang) * 0.45, 0.28, Math.sin(ang) * 0.45]}
                radius={0.007}
                material={titaniumDark}
                radialSegments={8}
              />
            );
          })}
        </group>
      </group>

      {/* Forward Ground-Commanded RCA Color TV Camera */}
      <group position={[0.26, 0.62, 1.1]}>
        <mesh position={[0, 0.22, 0]} material={instrumentSilver} castShadow>
          <cylinderGeometry args={[0.016, 0.02, 0.44, 12]} />
        </mesh>
        <mesh position={[0, 0.48, 0.04]} rotation={[Math.PI / 2 - 0.15, 0, 0]} material={kaptonGold} castShadow>
          <boxGeometry args={[0.14, 0.26, 0.14]} />
        </mesh>
        <mesh position={[0, 0.5, 0.19]} rotation={[Math.PI / 2 - 0.15, 0, 0]} material={opticalSilica} castShadow>
          <cylinderGeometry args={[0.042, 0.042, 0.04, 16]} />
        </mesh>
      </group>

      {/* Aft Low-Gain Whip Antenna */}
      <mesh position={[0.38, 1.05, -1.04]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.007, 0.012, 0.9, 10]} />
      </mesh>

      {/* 4 Woven Wire-Mesh Wheels + Wishbone Suspension + Arched Fenders */}
      {wheels.map(({ pos: [wx, wy, wz], rightSide, rearRight }, idx) => (
        <group key={idx}>
          {/* Upper & Lower A-Arm Suspension Struts */}
          <mesh
            position={[wx * 0.68, 0.43, wz]}
            rotation={[0, 0, rightSide ? -0.12 : 0.12]}
            material={titaniumDark}
            castShadow
          >
            <boxGeometry args={[0.42, 0.028, 0.14]} />
          </mesh>
          {/* Woven-Mesh Tire Wheel Resting at y = 0 (center y = 0.405, radius = 0.405) */}
          <group position={[wx, wy, wz]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={wovenMeshTire} castShadow receiveShadow>
              <cylinderGeometry args={[0.405, 0.405, 0.225, 32]} />
            </mesh>
            {/* Spun Inner Hub & Traction Motor */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={kaptonGold} castShadow>
              <cylinderGeometry args={[0.21, 0.21, 0.238, 24]} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} material={titaniumDark} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.25, 16]} />
            </mesh>
            {/* Arched Fiberglass Fender */}
            <mesh geometry={SHARED_GEOS.lrvFender} material={thermalWhite} castShadow receiveShadow />
            {/* Apollo 17 Improvised Chronoflex Map Fender Extension on Rear-Right */}
            {rearRight && (
              <mesh
                position={[0, 0.2, -0.45]}
                rotation={[0.45, 0, 0]}
                material={accentCopper}
                castShadow
              >
                <boxGeometry args={[0.25, 0.018, 0.24]} />
              </mesh>
            )}
          </group>
        </group>
      ))}
    </group>
  );
};

/**
 * 3. Surveyor 3 Robotic Lander
 * Solid 3-legged white tubular tripod frame with gold crush pads, twin thermal compartments,
 * vertical solar panel + planar antenna mast, Vidicon TV turret, and extended pantograph soil-scoop arm.
 */
const Surveyor3Mesh: FC = () => {
  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

  const tripodVertices: [number, number][] = legAngles.map((a) => [
    Math.cos(a) * 0.72,
    Math.sin(a) * 0.72,
  ]);

  return (
    <group>
      {/* 3 Articulated Tubular Legs + Shock Absorbers + Honeycomb Gold Crush Pads at y = 0 */}
      {legAngles.map((ang, i) => {
        const fx = Math.cos(ang) * 2.02;
        const fz = Math.sin(ang) * 2.02;
        const hx = Math.cos(ang) * 0.72;
        const hz = Math.sin(ang) * 0.72;
        const shoulderX = Math.cos(ang) * 0.48;
        const shoulderZ = Math.sin(ang) * 0.48;
        return (
          <group key={i}>
            {/* Footpad Flush at y = 0 */}
            <mesh position={[fx, 0.055, fz]} material={kaptonGold} castShadow receiveShadow>
              <cylinderGeometry args={[0.25, 0.31, 0.11, 24]} />
            </mesh>
            <mesh position={[fx, 0.015, fz]} material={instrumentSilver} receiveShadow>
              <cylinderGeometry args={[0.315, 0.33, 0.03, 24]} />
            </mesh>

            {/* Primary Outrigger Leg Beam from Lower Frame to Footpad */}
            <Strut from={[hx, 0.62, hz]} to={[fx, 0.08, fz]} radius={0.044} material={thermalWhite} radialSegments={14} />

            {/* Upper Hydraulic Shock Strut from Pyramid Shoulder to Footpad */}
            <Strut
              from={[shoulderX, 1.32, shoulderZ]}
              to={[fx * 0.9, 0.12, fz * 0.9]}
              radius={0.026}
              material={instrumentSilver}
            />
          </group>
        );
      })}

      {/* Solid Tubular Triangular Spaceframe Truss */}
      {tripodVertices.map(([vx, vz], i) => {
        const [nx, nz] = tripodVertices[(i + 1) % 3];
        return (
          <group key={i}>
            <Strut from={[vx, 0.62, vz]} to={[nx, 0.62, nz]} radius={0.036} material={thermalWhite} />
            <Strut
              from={[vx * 0.56, 1.48, vz * 0.56]}
              to={[nx * 0.56, 1.48, nz * 0.56]}
              radius={0.028}
              material={thermalWhite}
            />
            <Strut from={[vx, 0.62, vz]} to={[vx * 0.56, 1.48, vz * 0.56]} radius={0.034} material={thermalWhite} />
            <Strut
              from={[vx, 0.62, vz]}
              to={[nx * 0.56, 1.48, nz * 0.56]}
              radius={0.022}
              material={instrumentSilver}
            />
          </group>
        );
      })}

      {/* Central Retro-Rocket Engine Nozzle & Three Spherical Helium / Propellant Tanks */}
      <mesh position={[0, 0.52, 0]} material={titaniumDark} castShadow>
        <cylinderGeometry args={[0.24, 0.34, 0.38, 24]} />
      </mesh>
      <mesh position={[0, 0.88, 0]} material={thermalWhite} castShadow>
        <sphereGeometry args={[0.42, 24, 20]} />
      </mesh>
      {[0.4, 2.5, 4.6].map((ang, i) => (
        <mesh
          key={i}
          position={[Math.cos(ang) * 0.48, 0.74, Math.sin(ang) * 0.48]}
          material={instrumentSilver}
          castShadow
        >
          <sphereGeometry args={[0.17, 18, 18]} />
        </mesh>
      ))}

      {/* Twin Insulated Thermal Compartments (Compartment A & B) */}
      {[
        { pos: [-0.46, 0.88, -0.26] as [number, number, number], rot: 0.48 },
        { pos: [0.44, 0.88, -0.3] as [number, number, number], rot: -0.52 },
      ].map((comp, idx) => (
        <group key={idx} position={comp.pos} rotation={[0, comp.rot, 0]}>
          <mesh material={kaptonGold} castShadow receiveShadow>
            <boxGeometry args={[0.44, 0.42, 0.32]} />
          </mesh>
          <mesh position={[0, 0.225, 0]} material={thermalWhite} castShadow>
            <boxGeometry args={[0.46, 0.04, 0.34]} />
          </mesh>
          <mesh position={[0, 0, 0.165]} material={instrumentSilver} castShadow>
            <boxGeometry args={[0.28, 0.22, 0.025]} />
          </mesh>
        </group>
      ))}

      {/* Vidicon Television Camera Turret & Swivel Mirror Hood */}
      <group position={[0.28, 1.32, 0.44]}>
        <mesh material={instrumentSilver} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.56, 20]} />
        </mesh>
        <mesh position={[0, 0.32, 0.03]} rotation={[0.4, 0, 0]} material={kaptonGold} castShadow>
          <boxGeometry args={[0.2, 0.18, 0.22]} />
        </mesh>
        <mesh position={[0, 0.32, 0.13]} material={opticalSilica} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 16]} />
        </mesh>
      </group>

      {/* Vertical Antenna/Solar Mast + Planar Slot Antenna + Gridded Blue Solar Array */}
      <mesh position={[0, 2.08, 0]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.042, 0.056, 1.48, 18]} />
      </mesh>
      {/* Slotted Planar High-Gain Antenna */}
      <group position={[0, 2.34, 0.14]} rotation={[-0.38, 0, 0]}>
        <mesh material={thermalWhite} castShadow>
          <boxGeometry args={[0.92, 0.92, 0.045]} />
        </mesh>
        <mesh position={[0, 0, -0.025]} material={titaniumDark} castShadow>
          <boxGeometry args={[0.82, 0.82, 0.02]} />
        </mesh>
        {[-0.26, 0, 0.26].map((sy, j) => (
          <mesh key={j} position={[0, sy, 0.026]} material={instrumentSilver}>
            <boxGeometry args={[0.72, 0.03, 0.012]} />
          </mesh>
        ))}
      </group>
      {/* Top Articulated Solar Panel */}
      <group position={[0, 2.86, -0.04]} rotation={[0.35, 0, 0]}>
        <mesh material={titaniumDark} castShadow>
          <boxGeometry args={[1.05, 0.04, 0.85]} />
        </mesh>
        <mesh position={[0, 0.025, 0]} material={solarCellBlue} castShadow>
          <boxGeometry args={[0.98, 0.015, 0.78]} />
        </mesh>
      </group>

      {/* Extended Pantograph Soil Mechanics Surface Sampler (SMSS) Arm + Bucket Scoop */}
      <group position={[-0.36, 0.68, 0.42]} rotation={[0, -0.42, 0]}>
        {/* Shoulder Turret Box */}
        <mesh material={instrumentSilver} castShadow>
          <boxGeometry args={[0.16, 0.16, 0.18]} />
        </mesh>
        {/* 4 Scissors Pantograph X-Linkage Bays extending out +Z */}
        {[0.24, 0.52, 0.8, 1.08].map((sz, bayIdx) => (
          <group key={bayIdx} position={[0, -bayIdx * 0.075, sz]}>
            <mesh rotation={[0.62, 0, 0]} position={[-0.045, 0, 0]} material={instrumentSilver} castShadow>
              <boxGeometry args={[0.016, 0.024, 0.34]} />
            </mesh>
            <mesh rotation={[-0.62, 0, 0]} position={[-0.045, 0, 0]} material={instrumentSilver} castShadow>
              <boxGeometry args={[0.016, 0.024, 0.34]} />
            </mesh>
            <mesh rotation={[0.62, 0, 0]} position={[0.045, 0, 0]} material={instrumentSilver} castShadow>
              <boxGeometry args={[0.016, 0.024, 0.34]} />
            </mesh>
            <mesh rotation={[-0.62, 0, 0]} position={[0.045, 0, 0]} material={instrumentSilver} castShadow>
              <boxGeometry args={[0.016, 0.024, 0.34]} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} material={titaniumDark} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 10]} />
            </mesh>
          </group>
        ))}
        {/* Terminal Claw Soil Scoop Hanging Over Surface */}
        <group position={[0, -0.32, 1.32]} rotation={[0.35, 0, 0]}>
          <mesh material={titaniumDark} castShadow>
            <boxGeometry args={[0.09, 0.07, 0.18]} />
          </mesh>
          <mesh position={[0, -0.04, 0.05]} material={accentCopper} castShadow>
            <boxGeometry args={[0.08, 0.03, 0.09]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * 4 & 5. Opportunity & Spirit Mars Exploration Rovers (MER-B / MER-A)
 * Triangular gold/white warm electronics box, 6-wheel rocker-bogie titanium suspension,
 * folded butterfly-wing solar arrays with gridded blue cells, and tall Pancam stereo mast + IDD arm.
 */
const MerRoverMesh: FC<{ isSpirit: boolean }> = ({ isSpirit }) => {
  const wheelCoords: [number, number, number][] = [
    [-0.75, 0.165, -0.62],
    [0.75, 0.165, -0.62],
    [-0.79, 0.165, 0],
    [0.79, 0.165, 0],
    [-0.75, 0.165, 0.62],
    [0.75, 0.165, 0.62],
  ];

  return (
    <group>
      {/* Triangular Kapton-Gold Warm Electronics Box (WEB) */}
      <mesh position={[0, 0.42, 0]} geometry={SHARED_GEOS.merWeb} material={kaptonGold} castShadow receiveShadow />
      {/* Protective White Upper Chassis Frame Lip */}
      <mesh position={[0, 0.75, -0.02]} material={thermalWhite} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.055, 1.14]} />
      </mesh>

      {/* Folded Butterfly-Wing Solar Array Deck with Gridded Blue Cells */}
      <mesh position={[0, 0.77, 0]} geometry={SHARED_GEOS.merDeck} material={titaniumDark} castShadow receiveShadow />
      {/* Center Photovoltaic Panel */}
      <mesh position={[0, 0.812, -0.06]} material={solarCellBlue} castShadow receiveShadow>
        <boxGeometry args={[0.64, 0.016, 1.38]} />
      </mesh>
      {/* Left Wing Hinge & Solar Panel */}
      <mesh position={[-0.4, 0.815, -0.08]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.75, 10]} />
      </mesh>
      <mesh position={[-0.74, 0.812, -0.06]} rotation={[0, 0, 0.04]} material={solarCellBlue} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.016, 0.78]} />
      </mesh>
      {/* Right Wing Hinge & Solar Panel */}
      <mesh position={[0.4, 0.815, -0.08]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.75, 10]} />
      </mesh>
      <mesh position={[0.74, 0.812, -0.06]} rotation={[0, 0, -0.04]} material={solarCellBlue} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.016, 0.78]} />
      </mesh>

      {/* Tall Pancam Stereo Camera Mast (PMA) at Front-Right */}
      <group position={[0.2, 0.81, 0.46]}>
        <mesh position={[0, 0.34, 0]} material={thermalWhite} castShadow>
          <cylinderGeometry args={[0.042, 0.052, 0.68, 16]} />
        </mesh>
        <mesh position={[0, 0.64, 0]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.06, 16]} />
        </mesh>
        {/* Hammerhead Pancam / Navcam Stereo Bar */}
        <group position={[0, 0.72, 0]} rotation={[0.08, isSpirit ? -0.18 : 0.08, 0]}>
          <mesh material={thermalWhite} castShadow>
            <boxGeometry args={[0.38, 0.11, 0.13]} />
          </mesh>
          <mesh position={[0, 0, -0.068]} material={kaptonGold} castShadow>
            <boxGeometry args={[0.32, 0.085, 0.018]} />
          </mesh>
          {/* Twin Pancam + Navcam Lenses */}
          {[-0.13, -0.06, 0.06, 0.13].map((lx, i) => (
            <mesh key={i} position={[lx, 0, 0.068]} rotation={[Math.PI / 2, 0, 0]} material={opticalSilica} castShadow>
              <cylinderGeometry args={[0.018, 0.02, 0.02, 14]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* High-Gain Dish Antenna & UHF Whip on Aft Deck */}
      <group position={[-0.24, 0.83, -0.45]}>
        <mesh position={[0, 0.1, 0]} material={titaniumDark} castShadow>
          <cylinderGeometry args={[0.02, 0.024, 0.2, 12]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[0.52, -0.2, 0]} geometry={SHARED_GEOS.hgaSmallDish} scale={0.62} material={thermalWhite} castShadow />
      </group>
      <mesh position={[0.26, 0.98, -0.58]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.01, 0.014, 0.36, 10]} />
      </mesh>

      {/* Deployed 5-DOF Robotic IDD Arm + RAT / APXS Turret at Front */}
      <group position={[-0.12, 0.56, 0.68]}>
        <mesh rotation={[0.45, 0, 0]} material={titaniumDark} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.36]} />
        </mesh>
        <mesh position={[0.04, -0.08, 0.22]} material={instrumentSilver} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.1, 18]} />
        </mesh>
        <mesh position={[0.04, -0.08, 0.28]} rotation={[Math.PI / 2, 0, 0]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.032, 0.036, 0.045, 14]} />
        </mesh>
      </group>

      {/* 6-Wheel Rocker-Bogie Titanium Suspension Tubes (Left & Right Sides) */}
      {[-0.64, 0.64].map((sx, sIdx) => (
        <group key={sIdx}>
          {/* Main Rocker Strut from Center Axle Pivot to Rear Bogie */}
          <mesh position={[sx, 0.36, -0.3]} rotation={[0.42, 0, 0]} material={titaniumDark} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.72, 12]} />
          </mesh>
          <mesh position={[sx, 0.42, 0.22]} rotation={[-0.68, 0, 0]} material={titaniumDark} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.52, 12]} />
          </mesh>
          {/* Bogie Link Between Mid and Front Wheel */}
          <mesh position={[sx, 0.26, 0.32]} rotation={[Math.PI / 2 - 0.12, 0, 0]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.64, 12]} />
          </mesh>
          {/* Vertical Steering Forks */}
          {[-0.62, 0, 0.62].map((wz, fIdx) => (
            <mesh key={fIdx} position={[sx * 1.12, 0.26, wz]} material={titaniumDark} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.22, 10]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Rear Differential Averaging Linkage Rod */}
      <mesh position={[0, 0.62, -0.58]} rotation={[0, 0, Math.PI / 2]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.96, 12]} />
      </mesh>

      {/* 6 Cleated Aluminum Wheels (Bottom at y = 0) */}
      {wheelCoords.map(([wx, wy, wz], idx) => (
        <group
          key={idx}
          position={[wx, wy, wz]}
          rotation={[0, isSpirit && idx === 5 ? 0.38 : 0, 0]}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} material={titaniumDark} castShadow receiveShadow>
            <cylinderGeometry args={[0.165, 0.165, 0.145, 24]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.105, 0.105, 0.155, 18]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={isSpirit ? accentCopper : kaptonGold} castShadow>
            <cylinderGeometry args={[0.048, 0.048, 0.168, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/**
 * 6. Phoenix Mars Polar Lander
 * 3-legged lander deck grounded at y = 0, twin decagonal gridded blue solar panels,
 * white octagonal science body, MET/LIDAR meteorology mast, and articulated digging arm.
 */
const PhoenixLanderMesh: FC = () => {
  const legAngles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];

  return (
    <group>
      {/* 3 Splayed Landing Legs & Circular Polar Footpads Flush at y = 0 */}
      {legAngles.map((ang, i) => {
        const fx = Math.cos(ang) * 1.44;
        const fz = Math.sin(ang) * 1.44;
        const hx = Math.cos(ang) * 0.64;
        const hz = Math.sin(ang) * 0.64;
        return (
          <group key={i}>
            <mesh position={[fx, 0.03, fz]} material={titaniumDark} castShadow receiveShadow>
              <cylinderGeometry args={[0.19, 0.24, 0.06, 20]} />
            </mesh>
            <Strut from={[hx, 0.58, hz]} to={[fx, 0.04, fz]} radius={0.036} material={instrumentSilver} />
            <Strut
              from={[hx * 1.15, 0.56, hz * 1.15]}
              to={[hx * 1.55, 0.34, hz * 1.55]}
              radius={0.044}
              material={kaptonGold}
            />
          </group>
        );
      })}

      {/* White Octagonal Science Body & Kapton-Gold Lower Avionics Bay */}
      <mesh position={[0, 0.62, 0]} rotation={[0, Math.PI / 8, 0]} material={kaptonGold} castShadow receiveShadow>
        <cylinderGeometry args={[0.74, 0.68, 0.24, 8]} />
      </mesh>
      <mesh position={[0, 0.82, 0]} rotation={[0, Math.PI / 8, 0]} material={thermalWhite} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.76, 0.2, 8]} />
      </mesh>

      {/* TEGA Thermal Ovens, MECA Chemistry Lab & UHF Telemetry Hardware on Deck */}
      <mesh position={[-0.24, 0.98, 0.24]} material={instrumentSilver} castShadow>
        <boxGeometry args={[0.32, 0.14, 0.28]} />
      </mesh>
      <mesh position={[0.28, 0.96, 0.14]} material={instrumentSilver} castShadow>
        <boxGeometry args={[0.26, 0.12, 0.32]} />
      </mesh>
      <mesh position={[0.04, 1.0, -0.34]} material={thermalWhite} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.14, 16]} />
      </mesh>
      <mesh position={[0.34, 1.04, -0.32]} material={accentCopper} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.2, 16]} />
      </mesh>

      {/* Twin Decagonal UltraFlex Solar Array Wings (Left & Right) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.72, 0.81, 0]}>
          {/* Cantilever Outrigger Strut */}
          <mesh position={[-side * 0.66, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={titaniumDark} castShadow>
            <cylinderGeometry args={[0.028, 0.032, 0.72, 12]} />
          </mesh>
          {/* Decagonal Honeycomb Structural Backing */}
          <mesh material={titaniumDark} castShadow receiveShadow>
            <cylinderGeometry args={[0.98, 0.98, 0.028, 10]} />
          </mesh>
          {/* Gridded Blue Photovoltaic Top Sheet */}
          <mesh position={[0, 0.018, 0]} material={solarCellBlue} castShadow receiveShadow>
            <cylinderGeometry args={[0.94, 0.94, 0.012, 10]} />
          </mesh>
          {/* Central Deployment Hub & Radial Titanium Fan Ribs */}
          <mesh position={[0, 0.03, 0]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.03, 12]} />
          </mesh>
          {Array.from({ length: 10 }).map((_, rib) => {
            const ra = (rib / 10) * Math.PI * 2;
            return (
              <Strut
                key={rib}
                from={[0, 0.028, 0]}
                to={[Math.cos(ra) * 0.94, 0.028, Math.sin(ra) * 0.94]}
                radius={0.009}
                material={titaniumDark}
                radialSegments={6}
              />
            );
          })}
        </group>
      ))}

      {/* Meteorology & Canadian LIDAR Mast Rising to 2.20m */}
      <group position={[-0.28, 0.92, -0.24]}>
        <mesh position={[0, 0.64, 0]} material={thermalWhite} castShadow>
          <cylinderGeometry args={[0.028, 0.036, 1.28, 16]} />
        </mesh>
        {/* Cross Thermocouple Weather Booms & Telltale Vane */}
        {[0.38, 0.78, 1.14].map((my, idx) => (
          <mesh key={idx} position={[0.08, my, 0]} rotation={[0, 0, Math.PI / 2]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.22, 8]} />
          </mesh>
        ))}
        <mesh position={[0, 1.26, 0]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        </mesh>
      </group>

      {/* Articulated 4-DOF Robotic Trenching Arm Reaching Forward */}
      <group position={[0.14, 0.84, 0.66]}>
        <mesh material={kaptonGold} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
        </mesh>
        {/* Upper Boom */}
        <Strut from={[0, 0.02, 0]} to={[0, 0.24, 0.68]} radius={0.038} material={instrumentSilver} radialSegments={14} />
        {/* Elbow Motor Cylinder */}
        <mesh position={[0, 0.24, 0.68]} rotation={[0, 0, Math.PI / 2]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.14, 16]} />
        </mesh>
        {/* Forearm Reaching Down Toward Permafrost Surface */}
        <Strut
          from={[0, 0.24, 0.68]}
          to={[0, -0.52, 1.32]}
          radius={0.032}
          material={instrumentSilver}
          radialSegments={14}
        />
        {/* Excavator Scoop + Motorized Ice Rasp Blade */}
        <group position={[0, -0.52, 1.32]} rotation={[0.45, 0, 0]}>
          <mesh material={titaniumDark} castShadow>
            <boxGeometry args={[0.12, 0.09, 0.22]} />
          </mesh>
          <mesh position={[0, -0.02, 0.11]} material={instrumentSilver} castShadow>
            <boxGeometry args={[0.13, 0.03, 0.06]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * 7. NEAR Shoemaker (433 Eros Asteroid Orbiter / Lander)
 * Grounded adapter base, octagonal Kapton-gold spacecraft bus, 4 fixed gridded blue solar paddles,
 * spun white parabolic high-gain dish, and cantilevered fluxgate magnetometer boom.
 */
const NearShoemakerMesh: FC = () => {
  const paddleAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  return (
    <group>
      {/* Lower Propulsion & XGRS Instrument Adapter Ring Flush at y = 0 */}
      <mesh position={[0, 0.08, 0]} material={titaniumDark} castShadow receiveShadow>
        <cylinderGeometry args={[0.68, 0.76, 0.16, 16]} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 0.76, 0.06, Math.sin(a) * 0.76]}
          material={instrumentSilver}
          castShadow
        >
          <cylinderGeometry args={[0.055, 0.085, 0.12, 14]} />
        </mesh>
      ))}

      {/* Octagonal Kapton-Gold Spacecraft Bus + Aluminum Structural End Rings */}
      <mesh position={[0, 0.94, 0]} rotation={[0, Math.PI / 8, 0]} material={kaptonGold} castShadow receiveShadow>
        <cylinderGeometry args={[0.84, 0.84, 1.56, 8]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 8, 0]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.86, 0.86, 0.08, 8]} />
      </mesh>
      <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 8, 0]} material={instrumentSilver} castShadow>
        <cylinderGeometry args={[0.86, 0.86, 0.08, 8]} />
      </mesh>

      {/* Recessed Side Instrument & Thermal Louver Bays (MSI / NIS / XGRS) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
        <group key={i} rotation={[0, ang, 0]}>
          <mesh position={[0, 0.92, 0.82]} material={titaniumDark} castShadow>
            <boxGeometry args={[0.48, 0.92, 0.05]} />
          </mesh>
          <mesh position={[0, 1.12, 0.86]} rotation={[Math.PI / 2, 0, 0]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.11, 0.12, 0.12, 18]} />
          </mesh>
          <mesh position={[0, 1.12, 0.925]} rotation={[Math.PI / 2, 0, 0]} material={opticalSilica}>
            <cylinderGeometry args={[0.08, 0.08, 0.015, 16]} />
          </mesh>
        </group>
      ))}

      {/* 4 Large Rectangular Gridded Blue Solar Paddles + Hinge Brackets */}
      {paddleAngles.map((ang, i) => (
        <group key={i} rotation={[0, ang + Math.PI / 4, 0]}>
          <mesh position={[0.92, 1.56, 0]} material={instrumentSilver} castShadow>
            <boxGeometry args={[0.24, 0.07, 0.22]} />
          </mesh>
          <group position={[1.48, 1.62, 0]} rotation={[0.28, 0, 0.14]}>
            <mesh material={titaniumDark} castShadow receiveShadow>
              <boxGeometry args={[1.18, 0.036, 0.86]} />
            </mesh>
            <mesh position={[0, 0.022, 0]} material={solarCellBlue} castShadow receiveShadow>
              <boxGeometry args={[1.1, 0.012, 0.78]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Top White Spun Parabolic High-Gain Dish + Tripod Feed Horn */}
      <group position={[0, 1.76, 0]}>
        <mesh position={[0, 0.09, 0]} material={titaniumDark} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 0.18, 20]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} geometry={SHARED_GEOS.nearDish} material={thermalWhite} castShadow receiveShadow />
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ta, idx) => (
          <Strut
            key={idx}
            from={[Math.cos(ta) * 0.48, 0.3, Math.sin(ta) * 0.48]}
            to={[0, 0.68, 0]}
            radius={0.015}
            material={instrumentSilver}
          />
        ))}
        <mesh position={[0, 0.68, 0]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.065, 0.09, 0.12, 18]} />
        </mesh>
      </group>

      {/* Cantilevered Fluxgate Magnetometer Boom */}
      <group position={[0, 1.48, 0]} rotation={[0, 0.32, 0.28]}>
        <mesh position={[1.45, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={instrumentSilver} castShadow>
          <cylinderGeometry args={[0.022, 0.028, 1.42, 12]} />
        </mesh>
        <mesh position={[2.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={kaptonGold} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.16, 16]} />
        </mesh>
        <mesh position={[2.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={accentCopper} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 16]} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * GLB Fallback Assemblies (Apollo 11, Ingenuity, InSight, Sojourner/Viking, Dawn, Pioneer/Kepler)
 * Unified onto spacecraftMaterials with zero raw wireframes or flat shading.
 */
const ProceduralSpacecraftInner: FC<ProceduralSpacecraftProps> = ({ artifactId }) => {
  const rotorRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotorRef.current && artifactId === 'ingenuity-helicopter') {
      rotorRef.current.rotation.y += delta * 20;
    }
    if (dishRef.current && artifactId === 'pioneer-kepler') {
      dishRef.current.rotation.z += delta * 0.4;
    }
  });

  switch (artifactId) {
    case 'alsep-retroreflector':
      return <AlsepRetroreflectorMesh />;
    case 'apollo-lrv':
      return <ApolloLrvMesh />;
    case 'surveyor-3':
      return <Surveyor3Mesh />;
    case 'opportunity-rover':
      return <MerRoverMesh isSpirit={false} />;
    case 'spirit-rover':
      return <MerRoverMesh isSpirit={true} />;
    case 'phoenix-lander':
      return <PhoenixLanderMesh />;
    case 'near-shoemaker':
      return <NearShoemakerMesh />;

    case 'apollo-11-eagle':
      return (
        <group>
          <mesh position={[0, 1.65, 0]} material={kaptonGold} castShadow receiveShadow>
            <cylinderGeometry args={[2.1, 2.1, 1.5, 8]} />
          </mesh>
          <mesh position={[0, 0.75, 0]} material={titaniumDark} castShadow>
            <coneGeometry args={[0.75, 1.1, 24, 1, true]} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <group key={i} rotation={[0, angle + Math.PI / 4, 0]}>
              <mesh position={[2.8, 1.1, 0]} rotation={[0, 0, -0.58]} material={instrumentSilver} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 3.2, 12]} />
              </mesh>
              <mesh position={[4.1, 0.07, 0]} material={kaptonGold} castShadow receiveShadow>
                <cylinderGeometry args={[0.46, 0.52, 0.14, 24]} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case 'ingenuity-helicopter':
      return (
        <group>
          <mesh position={[0, 0.24, 0]} material={kaptonGold} castShadow>
            <boxGeometry args={[0.19, 0.16, 0.14]} />
          </mesh>
          <group ref={rotorRef} position={[0, 0.42, 0]}>
            <mesh material={titaniumDark} castShadow>
              <boxGeometry args={[1.2, 0.012, 0.09]} />
            </mesh>
            <mesh position={[0, 0.04, 0]} rotation={[0, 0.9, 0]} material={titaniumDark} castShadow>
              <boxGeometry args={[1.2, 0.012, 0.09]} />
            </mesh>
          </group>
          <mesh position={[0, 0.49, 0]} material={solarCellBlue} castShadow>
            <boxGeometry args={[0.42, 0.015, 0.16]} />
          </mesh>
          {[
            [-0.25, 0.12, -0.25],
            [0.25, 0.12, -0.25],
            [-0.25, 0.12, 0.25],
            [0.25, 0.12, 0.25],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} material={titaniumDark} castShadow>
              <cylinderGeometry args={[0.01, 0.012, 0.24, 10]} />
            </mesh>
          ))}
        </group>
      );

    case 'insight-lander':
      return (
        <group>
          <mesh position={[0, 0.56, 0]} material={thermalWhite} castShadow receiveShadow>
            <cylinderGeometry args={[0.78, 0.78, 0.34, 16]} />
          </mesh>
          {[-1.92, 1.92].map((sx, idx) => (
            <mesh key={idx} position={[sx, 0.68, 0]} material={solarCellBlue} castShadow receiveShadow>
              <cylinderGeometry args={[1.08, 1.08, 0.03, 24]} />
            </mesh>
          ))}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ang, i) => (
            <mesh key={i} position={[Math.cos(ang) * 0.96, 0.22, Math.sin(ang) * 0.96]} material={titaniumDark} castShadow>
              <cylinderGeometry args={[0.04, 0.14, 0.44, 12]} />
            </mesh>
          ))}
          <mesh position={[0, 0.01, 1.35]} material={accentCopper} castShadow>
            <sphereGeometry args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
      );

    case 'sojourner-viking':
      return (
        <group>
          <group position={[-0.45, 0, 0]}>
            <mesh position={[0, 0.65, 0]} material={thermalWhite} castShadow receiveShadow>
              <cylinderGeometry args={[1.25, 1.35, 0.55, 6]} />
            </mesh>
            {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ang, i) => (
              <mesh key={i} position={[Math.cos(ang) * 1.18, 0.22, Math.sin(ang) * 1.18]} material={titaniumDark} castShadow>
                <cylinderGeometry args={[0.05, 0.16, 0.44, 12]} />
              </mesh>
            ))}
            <mesh position={[0, 1.48, 0]} rotation={[0.3, 0, 0]} geometry={SHARED_GEOS.hgaSmallDish} material={thermalWhite} castShadow />
          </group>
          <group position={[1.35, 0, 0.45]}>
            <mesh position={[0, 0.22, 0]} material={solarCellBlue} castShadow>
              <boxGeometry args={[0.48, 0.06, 0.65]} />
            </mesh>
            <mesh position={[0, 0.12, 0]} material={kaptonGold} castShadow>
              <boxGeometry args={[0.38, 0.14, 0.52]} />
            </mesh>
          </group>
        </group>
      );

    case 'dawn-spacecraft':
      return (
        <group position={[0, 1.6, 0]} rotation={[0.18, 0.25, -0.12]}>
          <mesh material={titaniumDark} castShadow>
            <boxGeometry args={[1.64, 1.77, 1.64]} />
          </mesh>
          <mesh position={[0, 0.92, 0]} geometry={SHARED_GEOS.hgaSmallDish} material={thermalWhite} castShadow />
          <mesh position={[-5.1, 0, 0]} material={solarCellBlue} castShadow>
            <boxGeometry args={[8.3, 0.06, 2.3]} />
          </mesh>
          <mesh position={[5.1, 0, 0]} material={solarCellBlue} castShadow>
            <boxGeometry args={[8.3, 0.06, 2.3]} />
          </mesh>
          <mesh position={[0, -0.95, 0]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.26, 0.34, 0.25, 18]} />
          </mesh>
        </group>
      );

    case 'pioneer-kepler':
    default:
      return (
        <group>
          <group position={[0, 1.45, 0]} ref={dishRef}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={SHARED_GEOS.nearDish} scale={1.15} material={thermalWhite} castShadow />
            <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]} material={kaptonGold} castShadow>
              <cylinderGeometry args={[0.58, 0.58, 0.36, 6]} />
            </mesh>
          </group>
          <mesh position={[0, 0.72, -0.35]} material={titaniumDark} castShadow>
            <cylinderGeometry args={[0.06, 0.18, 1.44, 12]} />
          </mesh>
          <mesh position={[1.35, 1.45, -0.25]} rotation={[0, 0, Math.PI / 2]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.1, 10]} />
          </mesh>
          <mesh position={[-1.35, 1.45, -0.25]} rotation={[0, 0, Math.PI / 2]} material={instrumentSilver} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.1, 10]} />
          </mesh>
        </group>
      );
  }
};

export const ProceduralSpacecraft: FC<ProceduralSpacecraftProps> = ({ artifactId }) => {
  const rootRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const group = rootRef.current;
    if (!group) return;
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.InstancedMesh).isInstancedMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [artifactId]);

  return (
    <group ref={rootRef}>
      <ProceduralSpacecraftInner artifactId={artifactId} />
    </group>
  );
};

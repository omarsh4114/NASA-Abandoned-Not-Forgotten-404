import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import {
  createBackSideAtmosphereMaterial,
  getCachedPlanetaryPBRTextures,
} from '../utils/planetaryTextures';
import type * as THREE from 'three';

export const SpaceEnvironment: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  const pbr = useMemo(() => getCachedPlanetaryPBRTextures(), []);
  const earthHalo = useMemo(
    () => createBackSideAtmosphereMaterial('#4AA8FF', 2.2, 1.05),
    []
  );

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.03;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.042;
    if (moonRef.current) moonRef.current.rotation.y += delta * 0.01;
  });

  return (
    <group>
      {/* 1. Deep-Space High-Density Starfield */}
      <Stars
        radius={260}
        depth={90}
        count={9000}
        factor={4.5}
        saturation={0.15}
        fade
        speed={0.4}
      />

      {/* 2. Balanced Front-3/4 Studio Exhibition Lighting Rig */}
      {/* Primary Shadow-Casting Key Light along [8, 12, 10] vector, framed for full gallery dais */}
      <directionalLight
        position={[16, 24, 20]}
        intensity={2.2}
        color="#FFF7ED"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={95}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />
      {/* Soft Front-Left Fill Light */}
      <directionalLight position={[-8, 6, 9]} intensity={0.95} color="#DCE8FF" />
      {/* Cool Back Rim Light */}
      <directionalLight position={[-12, 10, -18]} intensity={0.75} color="#38BDF8" />
      {/* Soft Studio Hemisphere Fill */}
      <hemisphereLight args={['#E2E8F0', '#262932', 0.85]} />

      {/* 3. Photorealistic Rotating Earth at [0, 40, -180], R = 35 */}
      <group position={[0, 40, -180]}>
        {/* Core Ocean & Continents Sphere */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[35, 64, 64]} />
          <meshStandardMaterial
            map={pbr.earthMap}
            roughnessMap={pbr.earthRoughness}
            roughness={1.0}
            bumpMap={pbr.earthBump}
            bumpScale={0.45}
            metalness={0.08}
          />
        </mesh>

        {/* Atmospheric Cloud Layer */}
        <mesh ref={cloudsRef} scale={1.015}>
          <sphereGeometry args={[35, 48, 48]} />
          <meshStandardMaterial
            map={pbr.earthClouds}
            transparent
            opacity={0.78}
            roughness={0.9}
            depthWrite={false}
          />
        </mesh>

        {/* BackSide Fresnel Atmosphere Rim Glow */}
        <mesh scale={1.12} material={earthHalo}>
          <sphereGeometry args={[35, 48, 48]} />
        </mesh>
      </group>

      {/* 4. Cratered Moon Sphere at [0, 15, 120], R = 12 */}
      <group position={[0, 15, 120]}>
        <mesh ref={moonRef}>
          <sphereGeometry args={[12, 64, 64]} />
          <meshStandardMaterial
            map={pbr.moonMap}
            bumpMap={pbr.moonBump}
            bumpScale={0.32}
            roughnessMap={pbr.moonRoughness}
            roughness={0.94}
            metalness={0.04}
          />
        </mesh>
      </group>
    </group>
  );
};

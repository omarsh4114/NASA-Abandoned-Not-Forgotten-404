import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { SPATIAL_ARTIFACTS } from './data/artifacts';
import type {
  SpatialArtifact,
  SpatialTier,
  TargetCelestialBody,
  MechanicalHotspot,
} from './data/artifacts';
import {
  SolarSystemOrrery,
  CELESTIAL_ANCHORS,
  PLANET_RADII,
  getPlanetBaseViewDir,
  getArtifactSurfaceYawBias,
} from './components/solar-system/SolarSystemOrrery';
import { TrajectoryTrail } from './components/solar-system/TrajectoryTrail';
import { SpaceEnvironment } from './components/SpaceEnvironment';
import { ObservationPlatform } from './components/ObservationPlatform';
import { ArtifactPedestal } from './components/ArtifactPedestal';
import { PlanetaryMicroSite } from './components/inspector/PlanetaryMicroSite';
import {
  playArtifactVoice,
  stopArtifactVoice,
} from './components/inspector/ArtifactCommsCharacter';
import { SpatialHUD } from './components/ui/SpatialHUD';
import {
  StoryIntroOverlay,
  type MacroExperienceMode,
} from './components/ui/StoryIntroOverlay';
import { ArchaeologistPassport } from './components/ArchaeologistPassport';
import { CitationsAndAIDisclosure } from './components/CitationsAndAIDisclosure';
import { ArrowCameraController } from './components/ArrowCameraController';

const STORAGE_KEY = 'echoes_spatial_visited_v5';

interface CameraStateMachineProps {
  macroMode: MacroExperienceMode;
  tier: SpatialTier;
  activeArtifact: SpatialArtifact | null;
  selectedBody: TargetCelestialBody | null;
  teleportTarget: [number, number, number] | null;
  resetTrigger: number;
}

function computeFramingForState(
  macroMode: MacroExperienceMode,
  tier: SpatialTier,
  activeArtifact: SpatialArtifact | null,
  selectedBody: TargetCelestialBody | null,
  viewportAspect = 1.6
): {
  visualRadius: number;
  targetPos: THREE.Vector3;
  cameraPos: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  maxPolarAngle: number;
} {
  const inspectorPortraitBoost =
    viewportAspect < 0.95 ? Math.min(2.3, 1.06 / Math.max(0.42, viewportAspect)) : 1.0;
  const macroPortraitBoost =
    viewportAspect < 0.95 ? Math.min(1.65, 0.95 / Math.max(0.45, viewportAspect)) : 1.0;

  if (tier === 'inspector') {
    const visualRadius = 1.98;
    const focusDistance = visualRadius * 2.6 * inspectorPortraitBoost;
    const isFloatingOrbital =
      activeArtifact?.zone === 'Deep Space' ||
      activeArtifact?.statusCategory === 'Drifting' ||
      activeArtifact?.targetBody === 'Ceres' ||
      activeArtifact?.targetBody === 'Interstellar';

    const targetX = isFloatingOrbital ? 0 : viewportAspect < 0.85 ? 1.08 : 0.35;
    const camY = 1.82 * Math.sqrt(inspectorPortraitBoost);

    return {
      visualRadius,
      targetPos: new THREE.Vector3(targetX, 0.88, 0),
      cameraPos: new THREE.Vector3(targetX, camY, focusDistance),
      minDistance: visualRadius * 1.15,
      maxDistance: visualRadius * 8.0 * inspectorPortraitBoost,
      maxPolarAngle: isFloatingOrbital ? Math.PI * 0.85 : Math.PI * 0.48,
    };
  }

  if (macroMode === 'museum-platform') {
    if (activeArtifact) {
      const [px, py, pz] = activeArtifact.pedestalPosition;
      const visualRadius = 1.75;
      const focusDistance = visualRadius * 2.6 * macroPortraitBoost;
      const dist = Math.hypot(px, pz) || 1;
      const dirX = px / dist;
      const dirZ = pz / dist;

      return {
        visualRadius,
        targetPos: new THREE.Vector3(px, py + 1.15, pz),
        cameraPos: new THREE.Vector3(
          px - dirX * focusDistance,
          py + 2.05 * Math.sqrt(macroPortraitBoost),
          pz - dirZ * focusDistance
        ),
        minDistance: visualRadius * 1.35,
        maxDistance: 42,
        maxPolarAngle: Math.PI * 0.48,
      };
    }

    return {
      visualRadius: 6.0,
      targetPos: new THREE.Vector3(0, 1.2, -6),
      cameraPos: new THREE.Vector3(0, 4.2, 13 * macroPortraitBoost),
      minDistance: 3.0,
      maxDistance: 55,
      maxPolarAngle: Math.PI * 0.48,
    };
  }

  if (tier === 'trajectory') {
    const targetKey: TargetCelestialBody =
      activeArtifact?.targetBody ?? selectedBody ?? 'Moon';
    const destPos = CELESTIAL_ANCHORS[targetKey];
    const planetRadius = PLANET_RADII[targetKey] ?? 1.0;

    const visualRadius = Math.max(1.35, planetRadius * 1.85);
    const focusDistance = visualRadius * 2.6 * macroPortraitBoost;

    const yawBias = getArtifactSurfaceYawBias(activeArtifact?.id) * 0.22;
    const viewDir = getPlanetBaseViewDir(targetKey)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), yawBias)
      .normalize();

    const targetVec = new THREE.Vector3(destPos[0], destPos[1], destPos[2]);
    const camVec = targetVec
      .clone()
      .addScaledVector(viewDir, focusDistance)
      .add(new THREE.Vector3(0, focusDistance * 0.42, 0));

    return {
      visualRadius,
      targetPos: targetVec,
      cameraPos: camVec,
      minDistance: visualRadius * 1.35,
      maxDistance: 165,
      maxPolarAngle: Math.PI * 0.88,
    };
  }

  return {
    visualRadius: 24,
    targetPos: new THREE.Vector3(0, 0, 0),
    cameraPos: new THREE.Vector3(0, 38 * macroPortraitBoost, 68 * macroPortraitBoost),
    minDistance: 6,
    maxDistance: 175,
    maxPolarAngle: Math.PI * 0.88,
  };
}

const CameraStateMachine: React.FC<CameraStateMachineProps> = ({
  macroMode,
  tier,
  activeArtifact,
  selectedBody,
  teleportTarget,
  resetTrigger,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera, size } = useThree();
  const quantizedAspect = Math.round((size.width / Math.max(1, size.height)) * 20) / 20;

  const animRef = useRef<{
    active: boolean;
    elapsed: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
  }>({
    active: false,
    elapsed: 0,
    duration: 0.6,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
  });

  const framing = useMemo(
    () =>
      computeFramingForState(
        macroMode,
        tier,
        activeArtifact,
        selectedBody,
        quantizedAspect
      ),
    [macroMode, tier, activeArtifact, selectedBody, quantizedAspect]
  );

  useEffect(() => {
    const controls = controlsRef.current;
    animRef.current.startPos.copy(camera.position);
    animRef.current.endPos.copy(framing.cameraPos);
    animRef.current.startTarget.copy(
      controls ? controls.target : new THREE.Vector3(0, 0, 0)
    );
    animRef.current.endTarget.copy(framing.targetPos);
    animRef.current.elapsed = 0;
    animRef.current.duration = 0.6;
    animRef.current.active = true;
  }, [framing, resetTrigger, camera]);

  useEffect(() => {
    if (!teleportTarget || macroMode !== 'museum-platform' || tier === 'inspector') {
      return;
    }
    const controls = controlsRef.current;
    const [tx, , tz] = teleportTarget;
    animRef.current.startPos.copy(camera.position);
    animRef.current.endPos.set(tx, 1.85, tz + 4.2);
    animRef.current.startTarget.copy(
      controls ? controls.target : new THREE.Vector3()
    );
    animRef.current.endTarget.set(tx, 1.2, tz);
    animRef.current.elapsed = 0;
    animRef.current.duration = 0.6;
    animRef.current.active = true;
  }, [teleportTarget, macroMode, tier, camera]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (animRef.current.active) {
      animRef.current.elapsed += delta;
      const t = Math.min(1, animRef.current.elapsed / animRef.current.duration);
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(
        animRef.current.startPos,
        animRef.current.endPos,
        ease
      );
      controls.target.lerpVectors(
        animRef.current.startTarget,
        animRef.current.endTarget,
        ease
      );
      controls.update();

      if (t >= 1) {
        animRef.current.active = false;
      }
      return;
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.75}
        zoomSpeed={0.85}
        panSpeed={0.7}
        minDistance={framing.minDistance}
        maxDistance={framing.maxDistance}
        maxPolarAngle={framing.maxPolarAngle}
        minPolarAngle={0.08}
        onStart={() => {
          animRef.current.active = false;
        }}
      />
      <ArrowCameraController
        controlsRef={controlsRef}
        onUserInteract={() => {
          animRef.current.active = false;
        }}
      />
    </>
  );
};

export function App() {
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(true);
  const [macroMode, setMacroMode] = useState<MacroExperienceMode>('solar-system');
  const [tier, setTier] = useState<SpatialTier>('orrery');

  const [activeArtifact, setActiveArtifact] = useState<SpatialArtifact | null>(
    SPATIAL_ARTIFACTS[0]
  );
  const [selectedBody, setSelectedBody] = useState<TargetCelestialBody | null>('Moon');
  const [zoneFilter, setZoneFilter] = useState<
    'All' | 'Moon' | 'Mars' | 'Asteroids & Dwarf Planets' | 'Deep Space'
  >('All');
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const [normalizedScale, setNormalizedScale] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showAstronautScale, setShowAstronautScale] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<MechanicalHotspot | null>(null);

  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isCitationsOpen, setIsCitationsOpen] = useState<boolean>(false);

  const [arPassthrough, setArPassthrough] = useState<boolean>(false);
  const [arCameraError, setArCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [visitedIds, setVisitedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return ['apollo-11-eagle'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedIds));
    } catch {
      // ignore storage errors
    }
  }, [visitedIds]);

  const markVisited = (id: string) => {
    setVisitedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'r' || e.key === 'R') {
        setResetTrigger((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTier = (newTier: SpatialTier) => {
    setActiveHotspot(null);
    if (newTier !== 'inspector') {
      setArPassthrough(false);
    }
    setTier(newTier);
  };

  const handleSelectMacroMode = (mode: MacroExperienceMode) => {
    setMacroMode(mode);
    setArPassthrough(false);
    setActiveHotspot(null);
    if (mode === 'solar-system') {
      setTier('trajectory');
    } else {
      setTier('orrery');
    }
  };

  const handleSelectCelestialBody = (body: TargetCelestialBody) => {
    setSelectedBody(body);
    const matching = SPATIAL_ARTIFACTS.find((a) => a.targetBody === body);
    if (matching) {
      setActiveArtifact(matching);
      markVisited(matching.id);
      playArtifactVoice(matching.id);
    }
    setActiveHotspot(null);
    setTier('trajectory');
  };

  const handleSelectArtifact = (artifact: SpatialArtifact) => {
    setActiveArtifact(artifact);
    setSelectedBody(artifact.targetBody);
    setActiveHotspot(null);
    markVisited(artifact.id);
    playArtifactVoice(artifact.id);
    if (macroMode === 'solar-system' && tier === 'orrery') {
      setTier('trajectory');
    }
  };

  const handleStepArtifact = (dir: 'prev' | 'next') => {
    const list =
      zoneFilter === 'All'
        ? SPATIAL_ARTIFACTS
        : SPATIAL_ARTIFACTS.filter((a) => a.zone === zoneFilter);
    if (list.length === 0) return;

    const currentIndex = activeArtifact
      ? list.findIndex((a) => a.id === activeArtifact.id)
      : 0;
    const safeIdx = currentIndex === -1 ? 0 : currentIndex;
    const nextIdx =
      dir === 'next'
        ? (safeIdx + 1) % list.length
        : (safeIdx - 1 + list.length) % list.length;
    handleSelectArtifact(list[nextIdx]);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (arPassthrough && tier === 'inspector') {
      setArCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          })
          .then((mediaStream) => {
            stream = mediaStream;
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
          })
          .catch(() => {
            setArCameraError(
              'Live camera feed unavailable — anchoring 1:1 spacecraft on simulated AR floor.'
            );
          });
      } else {
        setArCameraError(
          'WebRTC camera API not detected — anchoring 1:1 spacecraft on simulated AR floor.'
        );
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [arPassthrough, tier]);

  const isArActive = arPassthrough && tier === 'inspector';

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#090B0E] text-white select-none font-sans">
      {isArActive && (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover opacity-90"
          />
          {arCameraError && (
            <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 rounded-full border border-emerald-400/30 bg-slate-950/85 px-4 py-1.5 text-xs text-emerald-200 backdrop-blur-md">
              {arCameraError}
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 h-full w-full">
        <Canvas
          shadows
          camera={{ position: [0, 38, 68], fov: 45, near: 0.08, far: 900 }}
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <CameraStateMachine
            macroMode={macroMode}
            tier={tier}
            activeArtifact={activeArtifact}
            selectedBody={selectedBody}
            teleportTarget={teleportTarget}
            resetTrigger={resetTrigger}
          />

          {macroMode === 'solar-system' && tier !== 'inspector' && (
            <group>
              <SolarSystemOrrery
                tier={tier}
                selectedBody={selectedBody}
                activeArtifact={activeArtifact}
                onSelectBody={handleSelectCelestialBody}
                onSelectArtifact={handleSelectArtifact}
              />
              <TrajectoryTrail
                artifact={activeArtifact}
                targetBody={selectedBody}
                tier={tier}
                visible={true}
              />
            </group>
          )}

          {macroMode === 'museum-platform' && tier !== 'inspector' && (
            <group>
              <SpaceEnvironment />
              <ObservationPlatform
                arPassthrough={false}
                onFloorClick={(pt) => {
                  setTeleportTarget(pt);
                }}
              />
              {SPATIAL_ARTIFACTS.map((artifact) => (
                <ArtifactPedestal
                  key={artifact.id}
                  artifact={artifact}
                  isSelected={activeArtifact?.id === artifact.id}
                  normalizedHologramMode={normalizedScale}
                  onSelect={(art) => {
                    handleSelectArtifact(art);
                  }}
                />
              ))}
            </group>
          )}

          {tier === 'inspector' && activeArtifact && (
            <PlanetaryMicroSite
              artifact={activeArtifact}
              normalizedScale={normalizedScale}
              showHotspots={showHotspots}
              showAstronautScale={showAstronautScale}
              activeHotspot={activeHotspot}
              onSelectHotspot={setActiveHotspot}
              arPassthrough={isArActive}
            />
          )}
        </Canvas>
      </div>

      <StoryIntroOverlay
        isOpen={isIntroOpen}
        onSelectMode={(chosenMode) => {
          setMacroMode(chosenMode);
          setIsIntroOpen(false);
          if (chosenMode === 'solar-system') {
            setTier('trajectory');
          } else {
            setTier('orrery');
          }
          const initial = activeArtifact ?? SPATIAL_ARTIFACTS[0];
          playArtifactVoice(initial.id);
        }}
      />

      {!isIntroOpen && (
        <SpatialHUD
          artifacts={SPATIAL_ARTIFACTS}
          activeArtifact={activeArtifact}
          macroMode={macroMode}
          tier={tier}
          selectedBody={selectedBody}
          zoneFilter={zoneFilter}
          normalizedScale={normalizedScale}
          showHotspots={showHotspots}
          showAstronautScale={showAstronautScale}
          activeHotspot={activeHotspot}
          arPassthrough={isArActive}
          discoveredCount={visitedIds.length}
          onSelectMacroMode={handleSelectMacroMode}
          onSelectTier={handleSelectTier}
          onSelectZoneFilter={(zone) => {
            setZoneFilter(zone);
            if (zone !== 'All') {
              const firstInZone = SPATIAL_ARTIFACTS.find((a) => a.zone === zone);
              if (firstInZone) {
                handleSelectArtifact(firstInZone);
              }
            }
          }}
          onSelectArtifact={handleSelectArtifact}
          onStepArtifact={handleStepArtifact}
          onToggleNormalizedScale={() => setNormalizedScale((prev) => !prev)}
          onToggleHotspots={() => setShowHotspots((prev) => !prev)}
          onToggleAstronautScale={() => setShowAstronautScale((prev) => !prev)}
          onSelectHotspot={setActiveHotspot}
          onToggleArPassthrough={() => setArPassthrough((prev) => !prev)}
          onResetCameraView={() => setResetTrigger((prev) => prev + 1)}
          onOpenIntro={() => {
            stopArtifactVoice();
            setArPassthrough(false);
            setIsIntroOpen(true);
          }}
          onOpenPassport={() => setIsPassportOpen(true)}
          onOpenCitations={() => setIsCitationsOpen(true)}
        />
      )}

      <ArchaeologistPassport
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        artifacts={SPATIAL_ARTIFACTS}
        discoveredIds={visitedIds}
        onUnlockAllDemo={() => setVisitedIds(SPATIAL_ARTIFACTS.map((a) => a.id))}
        onResetProgress={() => setVisitedIds(['apollo-11-eagle'])}
      />

      <CitationsAndAIDisclosure
        isOpen={isCitationsOpen}
        onClose={() => setIsCitationsOpen(false)}
      />
    </div>
  );
}

export default App;
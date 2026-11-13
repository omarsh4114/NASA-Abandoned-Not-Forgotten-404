import React, { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SPACECRAFT_PALETTE } from '../utils/spacecraftMaterials';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
useGLTF.setDecoderPath(DRACO_DECODER_PATH);

export interface NormalizedGlbModelProps {
  url: string;
  targetSize: number;
  fitByHeight?: boolean;
  receiveShadow?: boolean;
  innerRotation?: [number, number, number];
  fallback?: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GlbLoadErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const NormalizedGlbInner: React.FC<{
  url: string;
  targetSize: number;
  fitByHeight?: boolean;
  receiveShadow?: boolean;
  innerRotation?: [number, number, number];
  fallback?: React.ReactNode;
}> = ({ url, targetSize, fitByHeight = false, receiveShadow = true, innerRotation, fallback = null }) => {
  const { scene } = useGLTF(url, DRACO_DECODER_PATH);
  const isAstronaut = !receiveShadow || url.toLowerCase().includes('astronaut');

  const normalizedData = useMemo(() => {
    // 1. Deep Clone per instance so multiple views never steal parent nodes
    const clonedScene = scene.clone(true);
    clonedScene.updateMatrixWorld(true);

    // 2. Museum Art-Direction Normalization:
    // Clone materials per instance, harmonize astronaut suit vs spacecraft PBR parameters,
    // tint raw untextured grey/white CAD surfaces toward thermalWhite / instrumentSilver,
    // ensure smooth shading + vertex normals, and configure shadows cleanly.
    const thermalWhiteColor = new THREE.Color(SPACECRAFT_PALETTE.thermalWhite);
    const instrumentSilverColor = new THREE.Color(SPACECRAFT_PALETTE.instrumentSilver);
    const titaniumDarkColor = new THREE.Color(SPACECRAFT_PALETTE.titaniumDark);
    const hslScratch = { h: 0, s: 0, l: 0 };

    let meshCount = 0;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        meshCount += 1;
        mesh.castShadow = true;
        // Disable self-shadowing on the 1.75m astronaut so suit/helmet stay crisp and unblotched
        mesh.receiveShadow = isAstronaut ? false : true;

        const hasFlatShading = Array.isArray(mesh.material)
          ? mesh.material.some((m) => 'flatShading' in m && (m as THREE.MeshStandardMaterial).flatShading)
          : mesh.material && 'flatShading' in mesh.material && (mesh.material as THREE.MeshStandardMaterial).flatShading;

        if (mesh.geometry && (!mesh.geometry.attributes.normal || hasFlatShading)) {
          mesh.geometry.computeVertexNormals();
        }

        const tuneMaterial = (mat: THREE.Material): THREE.Material => {
          const clonedMat = mat.clone();
          if ('flatShading' in clonedMat) {
            (clonedMat as THREE.MeshStandardMaterial).flatShading = false;
          }

          if (isAstronaut) {
            // Force 100% solid opaque rendering on the astronaut (clears glTF alpha & transmission)
            clonedMat.transparent = false;
            clonedMat.opacity = 1;
            clonedMat.alphaTest = 0;
            clonedMat.depthWrite = true;
            clonedMat.depthTest = true;
            clonedMat.side = THREE.FrontSide;
            if ('alphaMap' in clonedMat) {
              (clonedMat as THREE.MeshStandardMaterial).alphaMap = null;
            }
            if ('transmission' in clonedMat) {
              const physMat = clonedMat as THREE.MeshPhysicalMaterial;
              physMat.transmission = 0;
              physMat.transmissionMap = null;
              physMat.thickness = 0;
              physMat.ior = 1.5;
            }
          }

          if ('metalness' in clonedMat && 'roughness' in clonedMat) {
            const stdMat = clonedMat as THREE.MeshStandardMaterial;

            if (isAstronaut) {
              // Keep astronaut fabric, visor, and life-support pack crisp and well-lit
              stdMat.metalness = Math.min(stdMat.metalness ?? 0.1, 0.2);
              stdMat.roughness = Math.max(stdMat.roughness ?? 0.65, 0.55);
              stdMat.envMapIntensity = 1.2;
            } else {
              stdMat.metalness = Math.min(0.75, Math.max(0.0, stdMat.metalness));
              stdMat.roughness = Math.min(0.78, Math.max(0.35, stdMat.roughness));
              stdMat.envMapIntensity = 1.25;
            }

            // Harmonize untextured neutral white/grey CAD surfaces with the museum palette
            if (!stdMat.map && stdMat.color) {
              stdMat.color.getHSL(hslScratch);
              if (hslScratch.s < 0.14) {
                if (hslScratch.l > 0.7) {
                  stdMat.color.lerp(thermalWhiteColor, 0.55);
                } else if (hslScratch.l >= 0.32) {
                  stdMat.color.lerp(instrumentSilverColor, 0.55);
                } else if (!isAstronaut && hslScratch.l < 0.1) {
                  stdMat.color.lerp(titaniumDarkColor, 0.45);
                }
              }
            }

            stdMat.needsUpdate = true;
          } else {
            clonedMat.needsUpdate = true;
          }
          return clonedMat;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(tuneMaterial);
        } else if (mesh.material) {
          mesh.material = tuneMaterial(mesh.material);
        }
      }
    });

    if (meshCount === 0) {
      return null;
    }

    // 3. Compute Bounding Box for Auto-Center & Ground Alignment
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // 4. Uniform Bounding-Box Scaling: targetSize / (referenceDim || 1)
    const refDim = fitByHeight ? size.y : Math.max(size.x, size.y, size.z);
    const safeDim = refDim > 0.0001 && Number.isFinite(refDim) ? refDim : 1;
    const scale = targetSize / safeDim;

    // Center X and Z horizontally, and align bottom (box.min.y) cleanly to y = 0
    const offset: [number, number, number] = [
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    ];

    return {
      clonedScene,
      scale,
      offset,
    };
  }, [scene, targetSize, fitByHeight, isAstronaut]);

  if (!normalizedData) {
    return <>{fallback}</>;
  }

  return (
    <group rotation={innerRotation}>
      <group position={normalizedData.offset} scale={normalizedData.scale}>
        <primitive object={normalizedData.clonedScene} />
      </group>
    </group>
  );
};

export const NormalizedGlbModel: React.FC<NormalizedGlbModelProps> = ({
  url,
  targetSize,
  fitByHeight = false,
  receiveShadow = true,
  innerRotation,
  fallback = null,
  position,
  rotation,
}) => {
  return (
    <group position={position} rotation={rotation}>
      <GlbLoadErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <NormalizedGlbInner
            url={url}
            targetSize={targetSize}
            fitByHeight={fitByHeight}
            receiveShadow={receiveShadow}
            innerRotation={innerRotation}
            fallback={fallback}
          />
        </Suspense>
      </GlbLoadErrorBoundary>
    </group>
  );
};

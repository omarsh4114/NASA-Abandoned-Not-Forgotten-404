import * as THREE from 'three';

/**
 * Shared Museum Material Palette matching the Apollo Lunar Module Descent Stage
 * and 1.75m Astronaut aesthetic for cohesive art direction across all 13 artifacts.
 */
export const SPACECRAFT_PALETTE = {
  kaptonGold: '#D99B26',
  thermalWhite: '#E6E9EF',
  titaniumDark: '#2A303C',
  solarCellBlue: '#162447',
  instrumentSilver: '#B8C0CC',
  accentCopper: '#C85A32',
} as const;

function createSolarGridTextures(): {
  map: THREE.CanvasTexture | null;
  roughnessMap: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') {
    return { map: null, roughnessMap: null };
  }

  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  if (!ctx || !rCtx) {
    return { map: null, roughnessMap: null };
  }

  // Base photovoltaic silicon tone (#162447)
  ctx.fillStyle = SPACECRAFT_PALETTE.solarCellBlue;
  ctx.fillRect(0, 0, size, size);

  // Base cell glossiness (~0.32 normalized into grayscale channel)
  rCtx.fillStyle = '#d0d0d0';
  rCtx.fillRect(0, 0, size, size);

  const cols = 4;
  const rows = 8;
  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;

      // Subtle wafer shimmer per cell
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#192a54');
      grad.addColorStop(0.5, '#162447');
      grad.addColorStop(1, '#121d3b');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Fine silver interconnect fingers inside each cell
      ctx.strokeStyle = 'rgba(164, 188, 224, 0.28)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const fy = y + (cellH * i) / 4;
        ctx.beginPath();
        ctx.moveTo(x + 3, fy);
        ctx.lineTo(x + cellW - 3, fy);
        ctx.stroke();
      }

      // Main silver-blue busbar down center of cell
      ctx.fillStyle = 'rgba(184, 198, 222, 0.55)';
      ctx.fillRect(x + cellW * 0.48, y + 2, 2.5, cellH - 4);

      // Dark gap between photovoltaic cells
      ctx.strokeStyle = '#0c1326';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 1.5, y + 1.5, cellW - 3, cellH - 3);

      // Rougher seam border in roughnessMap
      rCtx.strokeStyle = '#ffffff';
      rCtx.lineWidth = 4;
      rCtx.strokeRect(x + 1.5, y + 1.5, cellW - 3, cellH - 3);
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  map.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.anisotropy = 4;
  roughnessMap.needsUpdate = true;

  return { map, roughnessMap };
}

function createKaptonCrinkleBump(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Deterministic pseudo-random facets so gold MLI foil catches crisp directional highlights
  let seed = 4219;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 190; i++) {
    const cx = nextRand() * size;
    const cy = nextRand() * size;
    const r = 10 + nextRand() * 24;
    const shade = Math.floor(95 + nextRand() * 75);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.28)`;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(0) * r, cy + Math.sin(0) * r);
    const sides = 3 + Math.floor(nextRand() * 3);
    for (let s = 1; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2 + nextRand() * 0.4;
      const rad = r * (0.65 + nextRand() * 0.5);
      ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);
  bump.needsUpdate = true;
  return bump;
}

function createWovenWheelTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#3a414e';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#9aa5b6';
  ctx.lineWidth = 2;
  const step = 16;
  for (let x = -size; x < size * 2; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + size, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Chevron tread strips like Apollo LRV zinc-coated piano wire wheels
  ctx.fillStyle = '#d4a349';
  for (let y = 0; y < size; y += 32) {
    ctx.fillRect(0, y, size, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const solarGrid = createSolarGridTextures();
const kaptonBump = createKaptonCrinkleBump();
const wheelMeshTex = createWovenWheelTexture();

/** Crisp gold Kapton MLI thermal foil matching the Apollo Lunar Module Descent Stage. */
export const kaptonGold = new THREE.MeshStandardMaterial({
  color: SPACECRAFT_PALETTE.kaptonGold,
  metalness: 0.78,
  roughness: 0.34,
  bumpMap: kaptonBump ?? undefined,
  bumpScale: 0.012,
  flatShading: false,
  envMapIntensity: 1.25,
});

/** Clean matte thermal-painted spacecraft hull & aerodynamic shroud white. */
export const thermalWhite = new THREE.MeshStandardMaterial({
  color: SPACECRAFT_PALETTE.thermalWhite,
  metalness: 0.08,
  roughness: 0.68,
  flatShading: false,
  envMapIntensity: 1.08,
});

/** Anodized dark titanium struts, suspension links, joints, and dish frames. */
export const titaniumDark = new THREE.MeshStandardMaterial({
  color: SPACECRAFT_PALETTE.titaniumDark,
  metalness: 0.55,
  roughness: 0.48,
  flatShading: false,
  envMapIntensity: 1.15,
});

/** Photovoltaic array cells with crisp procedural wafer & busbar canvas grid. */
export const solarCellBlue = new THREE.MeshStandardMaterial({
  color: solarGrid.map ? '#ffffff' : SPACECRAFT_PALETTE.solarCellBlue,
  map: solarGrid.map ?? undefined,
  roughnessMap: solarGrid.roughnessMap ?? undefined,
  metalness: 0.45,
  roughness: 0.32,
  flatShading: false,
  envMapIntensity: 1.32,
});

/** Machined aluminum / stainless scientific instrumentation & telemetry dishes. */
export const instrumentSilver = new THREE.MeshStandardMaterial({
  color: SPACECRAFT_PALETTE.instrumentSilver,
  metalness: 0.72,
  roughness: 0.38,
  flatShading: false,
  envMapIntensity: 1.22,
});

/** Warm copper/beryllium-copper RF waveguides, collars, and optical accents. */
export const accentCopper = new THREE.MeshStandardMaterial({
  color: SPACECRAFT_PALETTE.accentCopper,
  metalness: 0.6,
  roughness: 0.42,
  flatShading: false,
  envMapIntensity: 1.2,
});

/** Precision fused-silica retroreflector prism & optical lens finish. */
export const opticalSilica = new THREE.MeshStandardMaterial({
  color: '#dcebf7',
  metalness: 0.25,
  roughness: 0.14,
  flatShading: false,
  envMapIntensity: 1.45,
});

/** Apollo LRV woven piano-wire tire mesh finish. */
export const wovenMeshTire = new THREE.MeshStandardMaterial({
  color: wheelMeshTex ? '#ffffff' : '#505866',
  map: wheelMeshTex ?? undefined,
  metalness: 0.52,
  roughness: 0.56,
  flatShading: false,
  envMapIntensity: 1.1,
});

export const spacecraftMaterials = {
  kaptonGold,
  thermalWhite,
  titaniumDark,
  solarCellBlue,
  instrumentSilver,
  accentCopper,
  opticalSilica,
  wovenMeshTire,
} as const;

/**
 * Computes smooth vertex normals on curved/sculpted BufferGeometry unless already present,
 * ensuring museum-grade shading without faceted creases.
 */
export function ensureSmoothNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  geometry.computeVertexNormals();
  return geometry;
}

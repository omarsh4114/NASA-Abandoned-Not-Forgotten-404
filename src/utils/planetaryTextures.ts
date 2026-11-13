import * as THREE from 'three';

const TEX_W = 1024;
const TEX_H = 512;

/**
 * Deterministic 3D lattice value hash in [0, 1] for seamless spherical wrapping.
 */
function hash3(ix: number, iy: number, iz: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 2147483647);
  n = (n ^ (n >> 13)) | 0;
  n = Math.imul(n, 1274126177);
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function smooth3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const c000 = hash3(ix, iy, iz);
  const c100 = hash3(ix + 1, iy, iz);
  const c010 = hash3(ix, iy + 1, iz);
  const c110 = hash3(ix + 1, iy + 1, iz);
  const c001 = hash3(ix, iy, iz + 1);
  const c101 = hash3(ix + 1, iy, iz + 1);
  const c011 = hash3(ix, iy + 1, iz + 1);
  const c111 = hash3(ix + 1, iy + 1, iz + 1);

  const x00 = c000 + (c100 - c000) * ux;
  const x10 = c010 + (c110 - c010) * ux;
  const x01 = c001 + (c101 - c001) * ux;
  const x11 = c011 + (c111 - c011) * ux;

  const y0 = x00 + (x10 - x00) * uy;
  const y1 = x01 + (x11 - x01) * uy;
  return y0 + (y1 - y0) * uz;
}

export function fbmSpherical(x: number, y: number, z: number, octaves = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * smooth3(x * freq + 17.3, y * freq - 9.1, z * freq + 23.7);
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

function makeCanvas(w = TEX_W, h = TEX_H): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function toTexture(canvas: HTMLCanvasElement, isColor: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

interface SphericalCrater {
  cx: number;
  cy: number;
  cz: number;
  angR: number;
  chordMax2: number;
  depth: number;
  hasRays: boolean;
  tx: number;
  ty: number;
  tz: number;
  bx: number;
  by: number;
  bz: number;
  rayFreq: number;
  rayPhase: number;
}

function createCratersWithBuckets(
  count: number,
  seedOffset: number,
  minAng: number,
  maxAng: number,
  heroRayCraters: Array<{ theta: number; phi: number; angR: number; depth: number; rayFreq: number }> = []
) {
  const craters: SphericalCrater[] = [];
  const pushCrater = (
    cx: number,
    cy: number,
    cz: number,
    angR: number,
    depth: number,
    hasRays: boolean,
    rayFreq: number,
    rayPhase: number
  ) => {
    const upX = Math.abs(cy) < 0.9 ? 0 : 1;
    const upY = Math.abs(cy) < 0.9 ? 1 : 0;
    const upZ = 0;
    let tx = upY * cz - upZ * cy;
    let ty = upZ * cx - upX * cz;
    let tz = upX * cy - upY * cx;
    const tLen = Math.hypot(tx, ty, tz) || 1;
    tx /= tLen;
    ty /= tLen;
    tz /= tLen;
    const bx = cy * tz - cz * ty;
    const by = cz * tx - cx * tz;
    const bz = cx * ty - cy * tx;

    const maxAngBound = angR * (hasRays ? 4.2 : 1.38);
    const chordMax2 = 2 - 2 * Math.cos(Math.min(Math.PI, maxAngBound));
    craters.push({
      cx,
      cy,
      cz,
      angR,
      chordMax2,
      depth,
      hasRays,
      tx,
      ty,
      tz,
      bx,
      by,
      bz,
      rayFreq,
      rayPhase,
    });
  };

  for (const hc of heroRayCraters) {
    const sp = Math.sin(hc.phi);
    pushCrater(
      sp * Math.cos(hc.theta),
      Math.cos(hc.phi),
      sp * Math.sin(hc.theta),
      hc.angR,
      hc.depth,
      true,
      hc.rayFreq,
      hc.theta * 3.1
    );
  }

  for (let i = 0; i < count; i++) {
    const u = hash3(i + seedOffset, 13, 7);
    const v = hash3(i + seedOffset, 31, 19);
    const s = hash3(i + seedOffset, 47, 53);

    const theta = u * Math.PI * 2;
    const cy = 2 * v - 1;
    const sinPhi = Math.sqrt(Math.max(0, 1 - cy * cy));
    const cx = sinPhi * Math.cos(theta);
    const cz = sinPhi * Math.sin(theta);

    // Power-law size distribution (a few large basins, many medium/tiny bowls)
    const sizeMix = Math.pow(s, 2.3);
    const angR = minAng + sizeMix * (maxAng - minAng);
    const depth = 0.22 + sizeMix * 0.58;
    const hasRays = i % 37 === 0 && sizeMix > 0.45;
    pushCrater(cx, cy, cz, angR, depth, hasRays, 9 + (i % 7), s * 6.28);
  }

  const BUCKETS = 24;
  const buckets: SphericalCrater[][] = Array.from({ length: BUCKETS }, () => []);
  for (const c of craters) {
    const margin = Math.min(0.95, c.angR * (c.hasRays ? 4.2 : 1.45));
    const bMin = Math.max(0, Math.floor(((c.cy - margin + 1) * 0.5) * BUCKETS));
    const bMax = Math.min(BUCKETS - 1, Math.floor(((c.cy + margin + 1) * 0.5) * BUCKETS));
    for (let b = bMin; b <= bMax; b++) {
      buckets[b].push(c);
    }
  }
  return { buckets, BUCKETS };
}

function sampleFieldBilinear(field: Float32Array, w: number, h: number, u: number, v: number): number {
  const fx = u * w;
  const fy = Math.max(0, Math.min(h - 1.001, v * h));
  const x0 = Math.floor(fx) % w;
  const x1 = (x0 + 1) % w;
  const y0 = Math.floor(fy);
  const y1 = Math.min(h - 1, y0 + 1);
  const tx = fx - Math.floor(fx);
  const ty = fy - y0;
  const i00 = field[y0 * w + x0];
  const i10 = field[y0 * w + x1];
  const i01 = field[y1 * w + x0];
  const i11 = field[y1 * w + x1];
  return (i00 + (i10 - i00) * tx) * (1 - ty) + (i01 + (i11 - i01) * tx) * ty;
}

function evalCraterAtPoint(
  nx: number,
  ny: number,
  nz: number,
  bucket: SphericalCrater[],
  rockJitter: number
): { heightDelta: number; albedoDelta: number; rayBoost: number; roughBoost: number } {
  let heightDelta = 0;
  let albedoDelta = 0;
  let rayBoost = 0;
  let roughBoost = 0;

  for (let i = 0; i < bucket.length; i++) {
    const c = bucket[i];
    const dx = nx - c.cx;
    const dy = ny - c.cy;
    const dz = nz - c.cz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > c.chordMax2) continue;

    // Chord distance closely tracks spherical arc for crater radii < 0.4 rad
    const angApprox = Math.sqrt(d2);
    const qRaw = angApprox / c.angR;
    const q = qRaw + (rockJitter - 0.5) * 0.09;

    if (q < 1.38) {
      if (q < 0.88) {
        const norm = q / 0.88;
        const bowl = -(1 - norm * norm) * c.depth;
        heightDelta += bowl;
        albedoDelta += bowl * 0.42;
        if (c.angR > 0.072 && q < 0.24) {
          const peak = (1 - q / 0.24) * c.depth * 0.36;
          heightDelta += peak;
          albedoDelta += peak * 0.4;
        }
      }
      // Natural soft-gradient crater rim crest & surrounding ejecta blanket
      const rimDist = (q - 0.94) / 0.17;
      const rim = Math.exp(-rimDist * rimDist) * c.depth * 0.44;
      heightDelta += rim;
      albedoDelta += rim * 0.72;
      roughBoost += rim * 0.35;
    }

    if (c.hasRays && q > 0.85) {
      const px = dx * c.tx + dy * c.ty + dz * c.tz;
      const py = dx * c.bx + dy * c.by + dz * c.bz;
      const az = Math.atan2(py, px);
      const streak = Math.pow(0.5 + 0.5 * Math.sin(az * c.rayFreq + c.rayPhase + rockJitter * 1.1), 4.0);
      const falloff = Math.exp(-(q - 0.85) * 0.85);
      rayBoost += streak * falloff * 0.48;
    }
  }

  return { heightDelta, albedoDelta, rayBoost, roughBoost };
}

function buildSunMaps() {
  const baseW = 512;
  const baseH = 256;
  const [smC, smCtx] = makeCanvas(baseW, baseH);
  const img = smCtx.createImageData(baseW, baseH);

  // Seamless spherical convective plasma + supergranulation field
  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const superCell = fbmSpherical(nx * 5.2 + 2.1, ny * 5.2 - 1.3, nz * 5.2 + 0.7, 3);
      const granuleRaw = fbmSpherical(nx * 19.5 - 3.4, ny * 19.5 + 1.8, nz * 19.5, 2);
      const cellCore = 1.0 - Math.abs(granuleRaw - 0.5) * 2.0;
      const heat = Math.max(0, Math.min(1, superCell * 0.58 + cellCore * 0.48));

      let r: number;
      let g: number;
      let b: number;
      if (heat < 0.52) {
        const t = heat / 0.52;
        r = 234 + (245 - 234) * t;
        g = 88 + (158 - 88) * t;
        b = 12 + (11 - 12) * t;
      } else {
        const t = (heat - 0.52) / 0.48;
        r = 245 + (255 - 245) * t;
        g = 158 + (251 - 158) * t;
        b = 11 + (235 - 11) * t;
      }

      const idx = (y * baseW + x) * 4;
      img.data[idx] = Math.round(r);
      img.data[idx + 1] = Math.round(g);
      img.data[idx + 2] = Math.round(b);
      img.data[idx + 3] = 255;
    }
  }
  smCtx.putImageData(img, 0, 0);

  const [sunC, sCtx] = makeCanvas(TEX_W, TEX_H);
  sCtx.drawImage(smC, 0, 0, TEX_W, TEX_H);

  // Crisp full-res convective solar granulation bubbles & dark intergranular lanes
  for (let i = 0; i < 1200; i++) {
    const cx = hash3(i, 11, 29) * TEX_W;
    const cy = 22 + hash3(i, 43, 61) * (TEX_H - 44);
    const latScale = 1 / Math.max(0.38, Math.sin((cy / TEX_H) * Math.PI));
    const rx = (3.5 + hash3(i, 71, 17) * 7.5) * Math.min(1.4, latScale);
    const ry = 3.5 + hash3(i, 71, 17) * 7.5;
    const isBrightCell = i % 3 !== 0;

    const xs = cx < 30 ? [cx, cx + TEX_W] : cx > TEX_W - 30 ? [cx, cx - TEX_W] : [cx];
    for (const px of xs) {
      const grad = sCtx.createRadialGradient(px, cy, 0.5, px, cy, rx);
      if (isBrightCell) {
        grad.addColorStop(0, 'rgba(255, 251, 235, 0.56)');
        grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.25)');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      } else {
        grad.addColorStop(0, 'rgba(194, 65, 12, 0.38)');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      }
      sCtx.fillStyle = grad;
      sCtx.beginPath();
      sCtx.ellipse(px, cy, rx, ry, 0, 0, Math.PI * 2);
      sCtx.fill();
    }
  }

  // Irregular multi-pore magnetic sunspot groups with fibrous penumbra + glowing active plage halos
  const sunspotClusters = [
    { x: 196, y: 204, pores: [{ dx: 0, dy: 0, r: 9 }, { dx: 16, dy: 7, r: 5 }, { dx: -11, dy: 5, r: 4 }] },
    { x: 492, y: 302, pores: [{ dx: 0, dy: 0, r: 10 }, { dx: 18, dy: -6, r: 6 }, { dx: 29, dy: 4, r: 4.5 }, { dx: -12, dy: -4, r: 4 }] },
    { x: 758, y: 194, pores: [{ dx: 0, dy: 0, r: 8 }, { dx: -14, dy: 6, r: 4.5 }] },
    { x: 908, y: 312, pores: [{ dx: 0, dy: 0, r: 7.5 }, { dx: 13, dy: 5, r: 4 }] },
  ];
  for (const cl of sunspotClusters) {
    const plage = sCtx.createRadialGradient(cl.x, cl.y, 10, cl.x, cl.y, 48);
    plage.addColorStop(0, 'rgba(255, 251, 235, 0.82)');
    plage.addColorStop(0.5, 'rgba(253, 224, 71, 0.34)');
    plage.addColorStop(1, 'rgba(245, 158, 11, 0)');
    sCtx.fillStyle = plage;
    sCtx.beginPath();
    sCtx.ellipse(cl.x, cl.y, 52, 28, -0.22, 0, Math.PI * 2);
    sCtx.fill();

    for (const pore of cl.pores) {
      const px = cl.x + pore.dx;
      const py = cl.y + pore.dy;
      // Radial penumbra filaments
      for (let f = 0; f < 14; f++) {
        const ang = (f / 14) * Math.PI * 2 + pore.r * 0.4;
        sCtx.strokeStyle = 'rgba(138, 42, 12, 0.55)';
        sCtx.lineWidth = 1.6;
        sCtx.beginPath();
        sCtx.moveTo(px + Math.cos(ang) * pore.r * 0.45, py + Math.sin(ang) * pore.r * 0.45);
        sCtx.lineTo(px + Math.cos(ang) * pore.r * 1.85, py + Math.sin(ang) * pore.r * 1.45);
        sCtx.stroke();
      }
      const umbra = sCtx.createRadialGradient(px, py, pore.r * 0.15, px, py, pore.r * 1.25);
      umbra.addColorStop(0, 'rgba(56, 14, 4, 0.96)');
      umbra.addColorStop(0.55, 'rgba(116, 36, 12, 0.8)');
      umbra.addColorStop(1, 'rgba(234, 88, 12, 0)');
      sCtx.fillStyle = umbra;
      sCtx.beginPath();
      sCtx.ellipse(px, py, pore.r * 1.25, pore.r * 0.98, 0.3, 0, Math.PI * 2);
      sCtx.fill();
    }
  }

  return {
    sunMap: toTexture(sunC, true),
  };
}

function buildMoonMaps() {
  const baseW = 512;
  const baseH = 256;
  const highlandField = new Float32Array(baseW * baseH);
  const mareField = new Float32Array(baseW * baseH);

  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);
      const idx = y * baseW + x;
      highlandField[idx] = fbmSpherical(nx * 2.8, ny * 2.8, nz * 2.8, 4);
      mareField[idx] = fbmSpherical(nx * 1.45 + 4.1, ny * 1.45, nz * 1.45 - 2.2, 3);
    }
  }

  // Named spherical basaltic maria basins (Tranquillitatis, Serenitatis, Imbrium, Oceanus Procellarum, Crisium, Fecunditatis)
  const mariaDefs = [
    { dir: new THREE.Vector3(-0.35, 0.14, 0.92).normalize(), ang: 0.42, strength: 0.85 },
    { dir: new THREE.Vector3(-0.08, 0.38, 0.92).normalize(), ang: 0.34, strength: 0.82 },
    { dir: new THREE.Vector3(0.32, 0.45, 0.83).normalize(), ang: 0.48, strength: 0.88 },
    { dir: new THREE.Vector3(0.76, 0.12, 0.64).normalize(), ang: 0.58, strength: 0.8 },
    { dir: new THREE.Vector3(-0.68, 0.25, 0.69).normalize(), ang: 0.24, strength: 0.82 },
    { dir: new THREE.Vector3(-0.56, -0.14, 0.81).normalize(), ang: 0.3, strength: 0.72 },
  ];

  // Tycho (southern highland starburst) & Copernicus (Oceanus Procellarum rim) rayed hero craters + 320 sculpted spherical craters
  const { buckets, BUCKETS } = createCratersWithBuckets(320, 101, 0.015, 0.115, [
    { theta: 2.65, phi: 2.32, angR: 0.068, depth: 0.78, rayFreq: 14 }, // Tycho
    { theta: 2.38, phi: 1.38, angR: 0.062, depth: 0.74, rayFreq: 11 }, // Copernicus
  ]);

  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);
  const imgA = aCtx.createImageData(TEX_W, TEX_H);
  const imgB = bCtx.createImageData(TEX_W, TEX_H);
  const imgR = rCtx.createImageData(TEX_W, TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    const vNorm = (y + 0.5) / TEX_H;
    const phi = vNorm * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const bIdx = Math.max(0, Math.min(BUCKETS - 1, Math.floor(((cosPhi + 1) * 0.5) * BUCKETS)));
    const bucket = buckets[bIdx];

    for (let x = 0; x < TEX_W; x++) {
      const uNorm = x / TEX_W;
      const theta = uNorm * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const n = sampleFieldBilinear(highlandField, baseW, baseH, uNorm, vNorm);
      const mareN = sampleFieldBilinear(mareField, baseW, baseH, uNorm, vNorm);
      const fine = smooth3(nx * 24.0 + 3.1, ny * 24.0, nz * 24.0 - 1.7);

      let basinMare = mareN < 0.44 ? Math.min(1, (0.44 - mareN) * 2.5) : 0;
      for (const m of mariaDefs) {
        const dot = nx * m.dir.x + ny * m.dir.y + nz * m.dir.z;
        const dist = Math.sqrt(Math.max(0, 2 - 2 * dot)) / m.ang + (n - 0.5) * 0.35;
        if (dist < 1.0) {
          basinMare = Math.max(basinMare, (1 - dist * dist) * m.strength);
        }
      }
      basinMare = Math.min(1, basinMare);

      const cr = evalCraterAtPoint(nx, ny, nz, bucket, fine);

      // Highland #8E939E (142,147,158) .. bright ejecta (#CBD5E1) down to basalt maria #4A4E57 (74,78,87)
      const highBase = 138 + n * 44 + (fine - 0.5) * 20;
      const mareBase = 72 + n * 16 + (fine - 0.5) * 12;
      let tone = highBase * (1 - basinMare * 0.78) + mareBase * (basinMare * 0.78);
      tone += cr.albedoDelta * 92 + cr.rayBoost * (96 + basinMare * 38);

      const idx = (y * TEX_W + x) * 4;
      imgA.data[idx] = Math.max(38, Math.min(232, tone));
      imgA.data[idx + 1] = Math.max(41, Math.min(235, tone + 4));
      imgA.data[idx + 2] = Math.max(46, Math.min(242, tone + 10));
      imgA.data[idx + 3] = 255;

      const hVal = Math.max(
        18,
        Math.min(244, 122 + n * 62 + (fine - 0.5) * 26 - basinMare * 36 + cr.heightDelta * 128)
      );
      imgB.data[idx] = hVal;
      imgB.data[idx + 1] = hVal;
      imgB.data[idx + 2] = hVal;
      imgB.data[idx + 3] = 255;

      const rVal = Math.max(195, Math.min(255, 232 + cr.roughBoost * 35 + (fine - 0.5) * 14));
      imgR.data[idx] = rVal;
      imgR.data[idx + 1] = rVal;
      imgR.data[idx + 2] = rVal;
      imgR.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(imgA, 0, 0);
  bCtx.putImageData(imgB, 0, 0);
  rCtx.putImageData(imgR, 0, 0);

  return {
    moonMap: toTexture(albedoC, true),
    moonBump: toTexture(bumpC, false),
    moonRoughness: toTexture(roughC, false),
  };
}

function buildMarsMaps() {
  const baseW = 512;
  const baseH = 256;
  const terrainField = new Float32Array(baseW * baseH);
  const basaltField = new Float32Array(baseW * baseH);

  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);
      const idx = y * baseW + x;
      terrainField[idx] = fbmSpherical(nx * 2.7 + 3.0, ny * 2.7, nz * 2.7 + 1.1, 4);
      basaltField[idx] = fbmSpherical(nx * 1.9 - 2.3, ny * 1.9 + 1.4, nz * 1.9, 3);
    }
  }

  const syrtisDir = new THREE.Vector3(-0.92, -0.06, 0.38).normalize();
  const olympusDir = new THREE.Vector3(-0.34, 0.36, 0.87).normalize();
  const { buckets, BUCKETS } = createCratersWithBuckets(260, 409, 0.014, 0.09);

  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);
  const imgA = aCtx.createImageData(TEX_W, TEX_H);
  const imgB = bCtx.createImageData(TEX_W, TEX_H);
  const imgR = rCtx.createImageData(TEX_W, TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    const vNorm = (y + 0.5) / TEX_H;
    const phi = vNorm * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const latDeg = Math.abs(vNorm * 180 - 90);
    const bIdx = Math.max(0, Math.min(BUCKETS - 1, Math.floor(((cosPhi + 1) * 0.5) * BUCKETS)));
    const bucket = buckets[bIdx];

    for (let x = 0; x < TEX_W; x++) {
      const uNorm = x / TEX_W;
      const theta = uNorm * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const n = sampleFieldBilinear(terrainField, baseW, baseH, uNorm, vNorm);
      const darkBasalt = sampleFieldBilinear(basaltField, baseW, baseH, uNorm, vNorm);
      const fine = smooth3(nx * 22.0 - 1.2, ny * 22.0 + 0.8, nz * 22.0);
      const cr = evalCraterAtPoint(nx, ny, nz, bucket, fine);

      // Rich rust-ochre highlands (#C85A32 = 200,90,50 to #9E3B1E = 158,59,30)
      let r = 182 + (n - 0.5) * 60 + (fine - 0.5) * 18;
      let g = 77 + (n - 0.5) * 32 + (fine - 0.5) * 10;
      let b = 41 + (n - 0.5) * 20 + (fine - 0.5) * 8;
      let heightMod = n * 86 + (fine - 0.5) * 22 + cr.heightDelta * 110;

      // Dark volcanic basalt shields + Syrtis Major
      const syrtisDist = Math.sqrt(Math.max(0, 2 - 2 * (nx * syrtisDir.x + ny * syrtisDir.y + nz * syrtisDir.z)));
      let basaltMix = darkBasalt < 0.45 ? Math.min(1, (0.45 - darkBasalt) * 2.9) : 0;
      if (syrtisDist < 0.38) {
        basaltMix = Math.max(basaltMix, (1 - syrtisDist / 0.38) * 0.9);
      }
      if (basaltMix > 0) {
        r = r * (1 - basaltMix * 0.56) + 74 * basaltMix * 0.56;
        g = g * (1 - basaltMix * 0.62) + 30 * basaltMix * 0.62;
        b = b * (1 - basaltMix * 0.58) + 22 * basaltMix * 0.58;
        heightMod -= basaltMix * 20;
      }

      // Fractal 3D Valles Marineris Grand Rift Canyon Scar across sunlit Martian equator
      const spanDist = Math.abs(theta - 2.38) / 0.82;
      if (spanDist < 1.0) {
        const taper = 1 - spanDist * spanDist;
        const centerY = -0.06 + 0.075 * Math.sin(theta * 3.4) + (n - 0.5) * 0.085 + (fine - 0.5) * 0.036;
        const distFromCanyon = Math.abs(ny - centerY);
        const halfWidth = (0.048 + 0.018 * Math.sin(theta * 9.0)) * taper;
        if (distFromCanyon < halfWidth * 2.3) {
          if (distFromCanyon < halfWidth) {
            const trench = 1 - distFromCanyon / halfWidth;
            r = r * (1 - trench * 0.68) + 54 * trench * 0.68;
            g = g * (1 - trench * 0.72) + 18 * trench * 0.72;
            b = b * (1 - trench * 0.7) + 12 * trench * 0.7;
            heightMod -= trench * 105;
          } else {
            const shoulder = 1 - (distFromCanyon - halfWidth) / (halfWidth * 1.3);
            r += shoulder * 34;
            g += shoulder * 18;
            b += shoulder * 10;
            heightMod += shoulder * 28;
          }
        }
      }

      // Olympus Mons shield volcano edifice & summit caldera
      const olyDist = Math.sqrt(Math.max(0, 2 - 2 * (nx * olympusDir.x + ny * olympusDir.y + nz * olympusDir.z)));
      if (olyDist < 0.21) {
        const slope = 1 - olyDist / 0.21;
        heightMod += slope * 92;
        r += slope * 24;
        g += slope * 12;
        if (olyDist < 0.032) {
          heightMod -= 65;
          r *= 0.68;
          g *= 0.62;
        }
      }

      // Apply 3D crater albedo shading
      r = r + cr.albedoDelta * 58;
      g = g + cr.albedoDelta * 36;
      b = b + cr.albedoDelta * 24;

      // Rugged serrated CO2/H2O polar ice caps (#F8FAFC) with spiral Chasma Boreale dark troughs
      let roughVal = 228 + cr.roughBoost * 25;
      const spiralCut = Math.sin(theta * 2.0 + (90 - latDeg) * 0.45) * (n - 0.35);
      const capBoundary = 78.5 + (n - 0.5) * 11.0 + (fine - 0.5) * 4.5 + spiralCut * 3.8;
      if (latDeg > capBoundary) {
        const capBlend = Math.min(1, (latDeg - capBoundary) / 2.6);
        r = r * (1 - capBlend) + 248 * capBlend;
        g = g * (1 - capBlend) + 250 * capBlend;
        b = b * (1 - capBlend) + 252 * capBlend;
        roughVal = roughVal * (1 - capBlend) + 196 * capBlend;
      }

      const idx = (y * TEX_W + x) * 4;
      imgA.data[idx] = Math.max(32, Math.min(252, r));
      imgA.data[idx + 1] = Math.max(16, Math.min(250, g));
      imgA.data[idx + 2] = Math.max(12, Math.min(252, b));
      imgA.data[idx + 3] = 255;

      const hVal = Math.max(14, Math.min(246, 114 + heightMod));
      imgB.data[idx] = hVal;
      imgB.data[idx + 1] = hVal;
      imgB.data[idx + 2] = hVal;
      imgB.data[idx + 3] = 255;

      const rr = Math.max(180, Math.min(255, roughVal));
      imgR.data[idx] = rr;
      imgR.data[idx + 1] = rr;
      imgR.data[idx + 2] = rr;
      imgR.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(imgA, 0, 0);
  bCtx.putImageData(imgB, 0, 0);
  rCtx.putImageData(imgR, 0, 0);

  return {
    marsMap: toTexture(albedoC, true),
    marsBump: toTexture(bumpC, false),
    marsRoughness: toTexture(roughC, false),
  };
}

function buildMercuryMaps() {
  const baseW = 512;
  const baseH = 256;
  const crustField = new Float32Array(baseW * baseH);
  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);
      crustField[y * baseW + x] = fbmSpherical(nx * 2.4 - 1.4, ny * 2.4 + 0.9, nz * 2.4, 4);
    }
  }

  const calorisDir = new THREE.Vector3(-0.62, 0.36, 0.69).normalize();
  const { buckets, BUCKETS } = createCratersWithBuckets(420, 223, 0.013, 0.11, [
    { theta: 1.95, phi: 1.85, angR: 0.058, depth: 0.72, rayFreq: 12 }, // Kuiper rayed crater
  ]);

  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);
  const imgA = aCtx.createImageData(TEX_W, TEX_H);
  const imgB = bCtx.createImageData(TEX_W, TEX_H);
  const imgR = rCtx.createImageData(TEX_W, TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    const vNorm = (y + 0.5) / TEX_H;
    const phi = vNorm * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const bIdx = Math.max(0, Math.min(BUCKETS - 1, Math.floor(((cosPhi + 1) * 0.5) * BUCKETS)));
    const bucket = buckets[bIdx];

    for (let x = 0; x < TEX_W; x++) {
      const uNorm = x / TEX_W;
      const theta = uNorm * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const macro = sampleFieldBilinear(crustField, baseW, baseH, uNorm, vNorm);
      const fine = smooth3(nx * 25.0 + 3.1, ny * 25.0, nz * 25.0 - 2.7);
      const cr = evalCraterAtPoint(nx, ny, nz, bucket, fine);

      const calDist = Math.sqrt(Math.max(0, 2 - 2 * (nx * calorisDir.x + ny * calorisDir.y + nz * calorisDir.z)));
      const calLift = calDist < 0.34 ? (1 - calDist / 0.34) * 18 : 0;

      // Dark grey silicate crust (#787570 ~ 120,117,112)
      const tone = 114 + (macro - 0.5) * 44 + (fine - 0.5) * 20 + calLift + cr.albedoDelta * 86 + cr.rayBoost * 98;
      const idx = (y * TEX_W + x) * 4;
      imgA.data[idx] = Math.max(46, Math.min(220, tone + 4));
      imgA.data[idx + 1] = Math.max(44, Math.min(216, tone));
      imgA.data[idx + 2] = Math.max(40, Math.min(210, tone - 4));
      imgA.data[idx + 3] = 255;

      const hVal = Math.max(18, Math.min(242, 118 + (macro - 0.5) * 64 + (fine - 0.5) * 26 + cr.heightDelta * 124));
      imgB.data[idx] = hVal;
      imgB.data[idx + 1] = hVal;
      imgB.data[idx + 2] = hVal;
      imgB.data[idx + 3] = 255;

      const rVal = Math.max(198, Math.min(255, 232 + cr.roughBoost * 32));
      imgR.data[idx] = rVal;
      imgR.data[idx + 1] = rVal;
      imgR.data[idx + 2] = rVal;
      imgR.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(imgA, 0, 0);
  bCtx.putImageData(imgB, 0, 0);
  rCtx.putImageData(imgR, 0, 0);

  return {
    mercuryMap: toTexture(albedoC, true),
    mercuryBump: toTexture(bumpC, false),
    mercuryRoughness: toTexture(roughC, false),
  };
}

function lonLatToCanvas(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * TEX_W;
  const y = ((90 - lat) / 180) * TEX_H;
  return [x, y];
}

function traceWrappedGeoPolygon(
  ctx: CanvasRenderingContext2D,
  coords: ReadonlyArray<readonly [number, number]>
) {
  if (coords.length === 0) return;
  for (const offsetX of [0, -TEX_W, TEX_W]) {
    ctx.beginPath();
    coords.forEach(([lon, lat], idx) => {
      const [x, y] = lonLatToCanvas(lon, lat);
      if (idx === 0) ctx.moveTo(x + offsetX, y);
      else ctx.lineTo(x + offsetX, y);
    });
    ctx.closePath();
    ctx.fill();
  }
}

function buildEarthMaps() {
  // 1. Paint simplified geographic continent silhouettes & desert belts at full 1024x512 resolution
  const [, landCtx] = makeCanvas(TEX_W, TEX_H);
  landCtx.fillStyle = '#000000';
  landCtx.fillRect(0, 0, TEX_W, TEX_H);
  landCtx.filter = 'blur(5px)';
  landCtx.fillStyle = '#ffffff';

  const continents: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
    // North & Central America
    [
      [-168, 65], [-161, 70], [-140, 70], [-125, 71], [-108, 73], [-92, 70], [-82, 65], [-81, 61],
      [-94, 59], [-88, 53], [-79, 51], [-76, 46], [-64, 51], [-56, 52], [-60, 46], [-67, 45],
      [-71, 41], [-76, 36], [-81, 31], [-80, 25], [-82, 26], [-83, 29], [-89, 30], [-97, 26],
      [-96, 19], [-90, 21], [-87, 21], [-84, 11], [-79, 9], [-85, 11], [-93, 15], [-105, 20],
      [-110, 24], [-113, 30], [-117, 32], [-122, 37], [-124, 42], [-125, 49], [-131, 55],
      [-138, 59], [-150, 60], [-161, 56], [-166, 61],
    ],
    // Canadian Arctic Archipelago & Baffin
    [[-85, 74], [-68, 70], [-64, 64], [-76, 65], [-84, 70]],
    // Greenland
    [[-58, 76], [-44, 82], [-20, 81], [-19, 73], [-25, 68], [-42, 60], [-51, 64], [-55, 71]],
    // South America
    [
      [-79, 9], [-74, 11], [-66, 10], [-61, 9], [-52, 4], [-49, 0], [-42, -3], [-35, -6],
      [-38, -13], [-40, -21], [-46, -24], [-49, -29], [-53, -34], [-57, -38], [-64, -41],
      [-67, -46], [-68, -53], [-70, -55], [-74, -52], [-75, -46], [-72, -37], [-71, -30],
      [-70, -18], [-76, -14], [-81, -5], [-79, 2],
    ],
    // Eurasia (Europe, Scandinavia, Arabia, India, Asia, Indochina, Kamchatka)
    [
      [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [8, 54], [9, 57], [11, 55], [14, 54],
      [19, 55], [21, 60], [18, 63], [22, 66], [28, 70], [32, 69], [42, 67], [58, 69], [68, 71],
      [80, 73], [104, 77], [125, 73], [145, 71], [170, 69], [178, 66], [165, 60], [161, 56],
      [156, 51], [159, 60], [144, 59], [138, 53], [141, 46], [134, 43], [128, 35], [126, 38],
      [121, 39], [122, 31], [118, 25], [110, 20], [108, 12], [104, 2], [100, 7], [98, 15],
      [91, 22], [85, 19], [80, 13], [77, 8], [73, 18], [69, 23], [62, 25], [56, 26], [51, 25],
      [58, 22], [53, 16], [44, 13], [42, 13], [35, 29], [36, 36], [27, 37], [23, 37], [20, 40],
      [16, 40], [13, 44], [15, 40], [12, 41], [9, 44], [4, 43], [0, 39], [-5, 36],
    ],
    // Great Britain & Ireland
    [[-6, 50], [-5, 55], [-6, 58], [-2, 58], [1, 53], [1, 51]],
    [[-10, 52], [-10, 55], [-6, 55], [-6, 52]],
    // Japan
    [[131, 32], [135, 34], [140, 36], [142, 41], [145, 44], [141, 45], [139, 39], [133, 35]],
    // Maritime Southeast Asia (Sumatra, Borneo, New Guinea)
    [[96, 5], [104, -1], [106, -6], [101, -4], [95, 2]],
    [[109, 2], [117, 6], [118, -3], [111, -3]],
    [[132, -2], [141, -3], [148, -9], [142, -9], [135, -5]],
    // Africa & Madagascar
    [
      [-6, 35], [5, 37], [11, 37], [12, 33], [20, 32], [25, 31], [32, 31], [35, 25], [40, 17],
      [43, 12], [51, 12], [48, 4], [41, -2], [40, -11], [35, -20], [32, -28], [27, -33],
      [19, -34], [15, -28], [12, -16], [12, -6], [9, 4], [2, 6], [-8, 5], [-13, 9],
      [-17, 15], [-16, 22], [-13, 27], [-9, 32],
    ],
    [[44, -25], [44, -18], [49, -12], [50, -17], [47, -25]],
    // Australia & New Zealand
    [
      [114, -22], [122, -17], [131, -12], [136, -12], [136, -15], [141, -17], [142, -11],
      [146, -18], [153, -26], [151, -34], [147, -38], [140, -37], [135, -34], [129, -32],
      [122, -34], [115, -34], [113, -26],
    ],
    [[173, -35], [178, -38], [175, -41], [172, -41], [168, -46], [167, -43]],
    // Antarctica perimeter & peninsula
    [
      [-180, -72], [-135, -74], [-95, -73], [-62, -64], [-56, -65], [-35, -75], [0, -70],
      [45, -68], [90, -67], [140, -67], [175, -72], [180, -72], [180, -90], [-180, -90],
    ],
  ];

  for (const poly of continents) {
    traceWrappedGeoPolygon(landCtx, poly);
  }
  landCtx.filter = 'none';
  const landPixels = landCtx.getImageData(0, 0, TEX_W, TEX_H).data;

  // Desert & arid region soft masks (Sahara, Arabia, Central Asia, Australian Outback, SW North America)
  const [, desertCtx] = makeCanvas(TEX_W, TEX_H);
  desertCtx.fillStyle = '#000000';
  desertCtx.fillRect(0, 0, TEX_W, TEX_H);
  const desertZones: ReadonlyArray<{ lon: number; lat: number; rx: number; ry: number; strength: number }> = [
    { lon: 8, lat: 23, rx: 85, ry: 32, strength: 0.95 },    // Sahara
    { lon: 46, lat: 23, rx: 42, ry: 24, strength: 0.95 },   // Arabian Desert
    { lon: 63, lat: 41, rx: 52, ry: 22, strength: 0.78 },   // Karakum / Kyzylkum / Gobi
    { lon: 96, lat: 41, rx: 46, ry: 18, strength: 0.75 },   // Gobi / Taklamakan
    { lon: 132, lat: -25, rx: 40, ry: 20, strength: 0.88 }, // Australian Outback
    { lon: -110, lat: 32, rx: 28, ry: 20, strength: 0.82 }, // Mojave / Sonoran
    { lon: 18, lat: -24, rx: 18, ry: 18, strength: 0.72 },  // Namib / Kalahari
  ];
  for (const dz of desertZones) {
    const [dx, dy] = lonLatToCanvas(dz.lon, dz.lat);
    const g = desertCtx.createRadialGradient(dx, dy, 4, dx, dy, Math.max(dz.rx, dz.ry));
    g.addColorStop(0, `rgba(255,255,255,${dz.strength})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    desertCtx.fillStyle = g;
    desertCtx.beginPath();
    desertCtx.ellipse(dx, dy, dz.rx, dz.ry, 0, 0, Math.PI * 2);
    desertCtx.fill();
  }
  const desertPixels = desertCtx.getImageData(0, 0, TEX_W, TEX_H).data;

  // 2. Full 1024x512 Equirectangular Albedo, Ocean/Land Roughness (0.25 vs 0.85), & Relief Bump
  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);

  const imgA = aCtx.createImageData(TEX_W, TEX_H);
  const imgR = rCtx.createImageData(TEX_W, TEX_H);
  const imgB = bCtx.createImageData(TEX_W, TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    const phi = ((y + 0.5) / TEX_H) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const latDeg = 90 - (y / TEX_H) * 180;

    for (let x = 0; x < TEX_W; x++) {
      const theta = (x / TEX_W) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const idx = (y * TEX_W + x) * 4;
      const baseMask = landPixels[idx] / 255;
      const desertMask = desertPixels[idx] / 255;

      // Fractal detail along coasts, terrain height, and biome moisture
      const detail = fbmSpherical(nx * 5.2 + 1.1, ny * 5.2 - 0.6, nz * 5.2 + 2.3, 3);
      const micro = fbmSpherical(nx * 14.0 - 2.1, ny * 14.0, nz * 14.0 + 0.8, 2);

      // Irregularize coastlines organically while preserving real continent topology
      const landSignal = baseMask + (detail - 0.5) * (baseMask > 0.04 && baseMask < 0.96 ? 0.36 : 0.08);
      const isArcticSeaIce = latDeg > 78 + (detail - 0.5) * 7;
      const isAntarcticIce = latDeg < -67 + (detail - 0.5) * 6 && baseMask > 0.2;
      const isGreenlandIce = latDeg > 66 && baseMask > 0.5 && x > 325 && x < 465;

      let r: number;
      let g: number;
      let b: number;
      let rough: number;
      let height: number;

      if (isArcticSeaIce || isAntarcticIce || isGreenlandIce) {
        // White Polar Ice Caps (#F1F5F9)
        const tint = (micro - 0.5) * 12;
        r = 241 + tint;
        g = 245 + tint;
        b = 249 + tint * 0.6;
        rough = 217; // ~0.85
        height = 176 + detail * 24;
      } else if (landSignal >= 0.48) {
        // Continental Landmasses: layered forest greens (#2D5A27 / #4A7C36) + desert ochre (#B89B6A)
        const elev = Math.min(1, Math.max(0, (detail - 0.25) * 1.15 + (micro - 0.5) * 0.35));
        const aridity = Math.min(1, desertMask * 0.9 + Math.max(0, 0.42 - micro) * 0.55);

        if (elev > 0.78) {
          // High alpine mountain ridges (Rockies / Andes / Himalayas)
          r = 148 + (elev - 0.78) * 260;
          g = 148 + (elev - 0.78) * 265;
          b = 145 + (elev - 0.78) * 275;
        } else {
          // Mix deep forest (#2D5A27 = 45,90,39) -> sunlit green (#4A7C36 = 74,124,54) -> desert ochre (#B89B6A = 184,155,106)
          const greenMix = Math.min(1, Math.max(0, detail * 0.9 + (micro - 0.5) * 0.5));
          const vegR = 45 + (74 - 45) * greenMix;
          const vegG = 90 + (124 - 90) * greenMix;
          const vegB = 39 + (54 - 39) * greenMix;

          r = vegR * (1 - aridity) + 184 * aridity;
          g = vegG * (1 - aridity) + 155 * aridity;
          b = vegB * (1 - aridity) + 106 * aridity;
        }

        rough = 217; // 0.85 on land
        height = Math.min(252, 132 + elev * 112);
      } else {
        // Ocean gradient: Deep Ocean (#0B2D5B = 11,45,91) -> Mid/Coastal Ocean (#154C8A = 21,76,138)
        const shelf = Math.min(1, Math.max(0, baseMask * 2.1 + (detail - 0.45) * 0.25));
        const abyssal = detail * 0.55 + Math.cos((latDeg * Math.PI) / 180) * 0.25;
        const oceanMix = Math.min(1, Math.max(0, shelf * 0.78 + abyssal * 0.35));

        r = 11 + (21 - 11) * oceanMix + shelf * 8;
        g = 45 + (76 - 45) * oceanMix + shelf * 28;
        b = 91 + (138 - 91) * oceanMix + shelf * 36;

        rough = 64; // 0.25 on water for sun specular glint
        height = 46;
      }

      imgA.data[idx] = Math.max(0, Math.min(255, r));
      imgA.data[idx + 1] = Math.max(0, Math.min(255, g));
      imgA.data[idx + 2] = Math.max(0, Math.min(255, b));
      imgA.data[idx + 3] = 255;

      imgR.data[idx] = rough;
      imgR.data[idx + 1] = rough;
      imgR.data[idx + 2] = rough;
      imgR.data[idx + 3] = 255;

      imgB.data[idx] = height;
      imgB.data[idx + 1] = height;
      imgB.data[idx + 2] = height;
      imgB.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(imgA, 0, 0);
  rCtx.putImageData(imgR, 0, 0);
  bCtx.putImageData(imgB, 0, 0);

  // 3. Wispy Transparent Cloud Layer (1024x512)
  const [cloudsC, cCtx] = makeCanvas(TEX_W, TEX_H);
  const cloudImg = cCtx.createImageData(TEX_W, TEX_H);
  for (let y = 0; y < TEX_H; y += 2) {
    const phi = ((y + 0.5) / TEX_H) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < TEX_W; x += 2) {
      const theta = (x / TEX_W) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const warp = fbmSpherical(nx * 2.1, ny * 2.4, nz * 2.1, 2) - 0.5;
      const swirl = fbmSpherical(nx * 2.8 + nz * 0.55 + warp, ny * 4.2, nz * 2.8 - nx * 0.55, 3);
      const alpha = swirl > 0.52 ? Math.min(220, Math.floor((swirl - 0.52) * 760)) : 0;

      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const ci = ((y + dy) * TEX_W + (x + dx)) * 4;
          cloudImg.data[ci] = 248;
          cloudImg.data[ci + 1] = 251;
          cloudImg.data[ci + 2] = 255;
          cloudImg.data[ci + 3] = alpha;
        }
      }
    }
  }
  cCtx.putImageData(cloudImg, 0, 0);

  return {
    earthMap: toTexture(albedoC, true),
    earthRoughness: toTexture(roughC, false),
    earthBump: toTexture(bumpC, false),
    earthClouds: toTexture(cloudsC, true),
  };
}

function buildCrateredBodyTextures(
  baseR: number,
  baseG: number,
  baseB: number,
  seedShift: number,
  craterCount: number,
  craterSeed: number,
  occatorCenter?: THREE.Vector3,
  secondarySaltCenter?: THREE.Vector3
) {
  const baseW = 512;
  const baseH = 256;
  const crustField = new Float32Array(baseW * baseH);
  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);
      crustField[y * baseW + x] = fbmSpherical(nx * 2.8 + seedShift, ny * 2.8, nz * 2.8 - seedShift, 4);
    }
  }

  const { buckets, BUCKETS } = createCratersWithBuckets(craterCount, craterSeed, 0.014, 0.11);
  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);
  const imgA = aCtx.createImageData(TEX_W, TEX_H);
  const imgB = bCtx.createImageData(TEX_W, TEX_H);
  const imgR = rCtx.createImageData(TEX_W, TEX_H);

  // Secondary salt facula offset around Occator basin
  const vinaliaDir = occatorCenter
    ? occatorCenter.clone().add(new THREE.Vector3(0.055, -0.02, -0.03)).normalize()
    : null;

  for (let y = 0; y < TEX_H; y++) {
    const vNorm = (y + 0.5) / TEX_H;
    const phi = vNorm * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const bIdx = Math.max(0, Math.min(BUCKETS - 1, Math.floor(((cosPhi + 1) * 0.5) * BUCKETS)));
    const bucket = buckets[bIdx];

    for (let x = 0; x < TEX_W; x++) {
      const uNorm = x / TEX_W;
      const theta = uNorm * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const macro = sampleFieldBilinear(crustField, baseW, baseH, uNorm, vNorm);
      const fine = smooth3(nx * 24.0 - seedShift, ny * 24.0 + 1.2, nz * 24.0);
      const cr = evalCraterAtPoint(nx, ny, nz, bucket, fine);

      const shade = 0.7 + macro * 0.45 + (fine - 0.5) * 0.22;
      let r = baseR * shade + cr.albedoDelta * 82;
      let g = baseG * shade + cr.albedoDelta * 84;
      let b = baseB * shade + cr.albedoDelta * 88;
      let hVal = 118 + (macro - 0.5) * 72 + (fine - 0.5) * 32 + cr.heightDelta * 130;
      let roughVal = 234 + cr.roughBoost * 24;

      if (occatorCenter) {
        const dOcc = Math.sqrt(
          Math.max(0, 2 - 2 * (nx * occatorCenter.x + ny * occatorCenter.y + nz * occatorCenter.z))
        );
        if (dOcc < 0.16) {
          const q = dOcc / 0.125;
          if (q < 1.0) {
            const bowl = 1 - q * q;
            r -= bowl * 28;
            g -= bowl * 28;
            b -= bowl * 28;
            hVal -= bowl * 86;
          }
          const rim = Math.exp(-Math.pow((q - 1.04) / 0.16, 2));
          r += rim * 38;
          g += rim * 40;
          b += rim * 44;
          hVal += rim * 48;

          // Bright sodium-carbonate Cerealia Facula central dome
          if (dOcc < 0.068) {
            const salt = Math.pow(1 - dOcc / 0.068, 1.25);
            r = r * (1 - salt) + 250 * salt;
            g = g * (1 - salt) + 253 * salt;
            b = b * (1 - salt) + 255 * salt;
            hVal += salt * 44;
            roughVal = roughVal * (1 - salt) + 135 * salt;
          }
        }
        if (vinaliaDir) {
          const dVin = Math.sqrt(
            Math.max(0, 2 - 2 * (nx * vinaliaDir.x + ny * vinaliaDir.y + nz * vinaliaDir.z))
          );
          if (dVin < 0.046) {
            const vs = Math.pow(1 - dVin / 0.046, 1.35);
            r = r * (1 - vs) + 240 * vs;
            g = g * (1 - vs) + 246 * vs;
            b = b * (1 - vs) + 255 * vs;
            roughVal = roughVal * (1 - vs) + 150 * vs;
          }
        }
      }
      if (secondarySaltCenter) {
        const dSec = Math.sqrt(
          Math.max(0, 2 - 2 * (nx * secondarySaltCenter.x + ny * secondarySaltCenter.y + nz * secondarySaltCenter.z))
        );
        if (dSec < 0.14) {
          const q2 = dSec / 0.11;
          if (q2 < 1.0) {
            const bowl2 = 1 - q2 * q2;
            r -= bowl2 * 26;
            g -= bowl2 * 26;
            b -= bowl2 * 26;
            hVal -= bowl2 * 82;
          }
          const rim2 = Math.exp(-Math.pow((q2 - 1.02) / 0.16, 2));
          r += rim2 * 36;
          g += rim2 * 38;
          b += rim2 * 42;
          hVal += rim2 * 44;

          if (dSec < 0.06) {
            const salt2 = Math.pow(1 - dSec / 0.06, 1.3);
            r = r * (1 - salt2) + 248 * salt2;
            g = g * (1 - salt2) + 252 * salt2;
            b = b * (1 - salt2) + 255 * salt2;
            hVal += salt2 * 36;
            roughVal = roughVal * (1 - salt2) + 140 * salt2;
          }
        }
      }

      const idx = (y * TEX_W + x) * 4;
      imgA.data[idx] = Math.max(16, Math.min(254, r));
      imgA.data[idx + 1] = Math.max(16, Math.min(254, g));
      imgA.data[idx + 2] = Math.max(18, Math.min(255, b));
      imgA.data[idx + 3] = 255;

      const clampedH = Math.max(14, Math.min(246, hVal));
      imgB.data[idx] = clampedH;
      imgB.data[idx + 1] = clampedH;
      imgB.data[idx + 2] = clampedH;
      imgB.data[idx + 3] = 255;

      const clampedR = Math.max(140, Math.min(255, roughVal));
      imgR.data[idx] = clampedR;
      imgR.data[idx + 1] = clampedR;
      imgR.data[idx + 2] = clampedR;
      imgR.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(imgA, 0, 0);
  bCtx.putImageData(imgB, 0, 0);
  rCtx.putImageData(imgR, 0, 0);

  return { albedoC, bumpC, roughC };
}

function buildCeresAndErosMaps() {
  // Dwarf Planet Ceres: dark carbonaceous grey crust (#4B4F58) + Occator & Haulani bright salt spots
  const ceres = buildCrateredBodyTextures(
    75,
    79,
    88,
    3.7,
    360,
    731,
    new THREE.Vector3(-0.78, 0.16, -0.6).normalize(),
    new THREE.Vector3(0.76, -0.1, 0.64).normalize()
  );

  // Asteroid 433 Eros: cratered rocky silicate regolith (#6E655F)
  const eros = buildCrateredBodyTextures(110, 101, 95, -2.4, 300, 911);

  return {
    ceresMap: toTexture(ceres.albedoC, true),
    ceresBump: toTexture(ceres.bumpC, false),
    ceresRoughness: toTexture(ceres.roughC, false),
    erosMap: toTexture(eros.albedoC, true),
    erosBump: toTexture(eros.bumpC, false),
    erosRoughness: toTexture(eros.roughC, false),
  };
}

function buildVenusAndJupiterMaps() {
  // 1. Venus: swirling V-shaped golden-cream sulfuric cloud bands (#E5C07B, #C89B54)
  const baseW = 512;
  const baseH = 256;
  const [venSm, venSmCtx] = makeCanvas(baseW, baseH);
  const venImg = venSmCtx.createImageData(baseW, baseH);
  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const lat = y / baseH - 0.5;
    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      // Equatorial super-rotation chevron warp
      const warp = fbmSpherical(nx * 2.4 + 1.4, ny * 3.8, nz * 2.4 - 0.8, 3);
      const swirl = fbmSpherical(
        nx * 3.2 + nz * 0.9 + warp * 1.4,
        ny * 7.5 + Math.abs(lat) * 2.2,
        nz * 3.2 - nx * 0.9,
        3
      );
      const t = Math.max(0, Math.min(1, swirl * 1.25 - 0.12));

      const idx = (y * baseW + x) * 4;
      venImg.data[idx] = Math.round(182 + (242 - 182) * t);
      venImg.data[idx + 1] = Math.round(138 + (212 - 138) * t);
      venImg.data[idx + 2] = Math.round(74 + (148 - 74) * t);
      venImg.data[idx + 3] = 255;
    }
  }
  venSmCtx.putImageData(venImg, 0, 0);
  const [venC, venCtx] = makeCanvas(TEX_W, TEX_H);
  const [venB, venBCtx] = makeCanvas(TEX_W, TEX_H);
  venCtx.drawImage(venSm, 0, 0, TEX_W, TEX_H);
  venBCtx.drawImage(venSm, 0, 0, TEX_W, TEX_H);

  // 2. Jupiter: turbulent wavy equatorial cloud belts & zones + festoons + Great Red Spot
  const [jupSm, jupSmCtx] = makeCanvas(baseW, baseH);
  const [jupBSm, jupBSmCtx] = makeCanvas(baseW, baseH);
  const jupImg = jupSmCtx.createImageData(baseW, baseH);
  const jupBImg = jupBSmCtx.createImageData(baseW, baseH);

  const beltPalette: ReadonlyArray<readonly [number, number, number]> = [
    [116, 106, 98],   // North polar hood
    [194, 168, 134],
    [152, 92, 54],    // NTB
    [244, 232, 208],  // NTrZ cream
    [156, 68, 36],    // NEB rust-brown
    [238, 224, 196],  // Equatorial Zone cream
    [214, 152, 92],   // Equatorial golden ochre streak
    [146, 62, 32],    // SEB rust-brown
    [246, 236, 214],  // STrZ cream
    [206, 150, 88],   // STB ochre
    [176, 146, 114],
    [112, 102, 94],   // South polar hood
  ];

  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const vNorm = y / baseH;

    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const eddy = fbmSpherical(nx * 4.2, ny * 9.5, nz * 4.2, 3);
      const fine = fbmSpherical(nx * 11.0 + 3.2, ny * 22.0, nz * 11.0 - 1.7, 2);
      const warpedV = Math.max(
        0,
        Math.min(0.999, vNorm + (eddy - 0.5) * 0.085 + (fine - 0.5) * 0.028)
      );

      const pos = warpedV * (beltPalette.length - 1);
      const idx0 = Math.floor(pos);
      const idx1 = Math.min(beltPalette.length - 1, idx0 + 1);
      const frac = pos - idx0;
      const sFrac = frac * frac * (3 - 2 * frac);

      const c0 = beltPalette[idx0];
      const c1 = beltPalette[idx1];
      const fineTint = (fine - 0.5) * 26;

      const idx = (y * baseW + x) * 4;
      jupImg.data[idx] = Math.max(30, Math.min(252, c0[0] + (c1[0] - c0[0]) * sFrac + fineTint));
      jupImg.data[idx + 1] = Math.max(25, Math.min(248, c0[1] + (c1[1] - c0[1]) * sFrac + fineTint * 0.9));
      jupImg.data[idx + 2] = Math.max(20, Math.min(240, c0[2] + (c1[2] - c0[2]) * sFrac + fineTint * 0.8));
      jupImg.data[idx + 3] = 255;

      const h = Math.max(40, Math.min(230, 110 + eddy * 70 + fine * 35));
      jupBImg.data[idx] = h;
      jupBImg.data[idx + 1] = h;
      jupBImg.data[idx + 2] = h;
      jupBImg.data[idx + 3] = 255;
    }
  }
  jupSmCtx.putImageData(jupImg, 0, 0);
  jupBSmCtx.putImageData(jupBImg, 0, 0);

  const [jupC, jCtx] = makeCanvas(TEX_W, TEX_H);
  const [jupB, jbCtx] = makeCanvas(TEX_W, TEX_H);
  jCtx.drawImage(jupSm, 0, 0, TEX_W, TEX_H);
  jbCtx.drawImage(jupBSm, 0, 0, TEX_W, TEX_H);

  // Bluish-grey equatorial festoons & anticyclonic white ovals at full 1024x512
  for (let i = 0; i < 16; i++) {
    const fx = (i * 67 + 28) % TEX_W;
    const fy = i % 2 === 0 ? 236 + (i % 5) * 3 : 352 + (i % 4) * 5;
    const isOval = i % 2 === 1;
    const fg = jCtx.createRadialGradient(fx, fy, 1, fx, fy, isOval ? 11 : 18);
    if (isOval) {
      fg.addColorStop(0, 'rgba(254, 249, 235, 0.92)');
      fg.addColorStop(0.65, 'rgba(232, 206, 172, 0.55)');
      fg.addColorStop(1, 'rgba(214, 152, 92, 0)');
    } else {
      fg.addColorStop(0, 'rgba(92, 116, 138, 0.52)');
      fg.addColorStop(1, 'rgba(238, 224, 196, 0)');
    }
    jCtx.fillStyle = fg;
    jCtx.beginPath();
    jCtx.ellipse(fx, fy, isOval ? 12 : 20, isOval ? 6.5 : 8, isOval ? 0 : 0.35, 0, Math.PI * 2);
    jCtx.fill();
  }

  // Iconic Great Red Spot with swirling collar eddies and ochre wake
  const grsX = 620;
  const grsY = 330;
  const grsWake = jCtx.createRadialGradient(grsX - 18, grsY, 10, grsX - 18, grsY, 76);
  grsWake.addColorStop(0, 'rgba(248, 232, 204, 0.75)');
  grsWake.addColorStop(1, 'rgba(238, 224, 196, 0)');
  jCtx.fillStyle = grsWake;
  jCtx.beginPath();
  jCtx.ellipse(grsX - 16, grsY, 78, 34, 0, 0, Math.PI * 2);
  jCtx.fill();

  const grsGrad = jCtx.createRadialGradient(grsX, grsY, 4, grsX, grsY, 44);
  grsGrad.addColorStop(0, 'rgba(176, 52, 28, 0.98)');
  grsGrad.addColorStop(0.45, 'rgba(208, 78, 42, 0.94)');
  grsGrad.addColorStop(0.75, 'rgba(228, 126, 76, 0.8)');
  grsGrad.addColorStop(1, 'rgba(244, 212, 172, 0)');
  jCtx.fillStyle = grsGrad;
  jCtx.beginPath();
  jCtx.ellipse(grsX, grsY, 44, 24, 0, 0, Math.PI * 2);
  jCtx.fill();

  // Concentric storm spiral arcs inside the Great Red Spot
  jCtx.strokeStyle = 'rgba(255, 236, 209, 0.45)';
  jCtx.lineWidth = 2.0;
  for (let rRing = 12; rRing <= 32; rRing += 10) {
    jCtx.beginPath();
    jCtx.ellipse(grsX, grsY, rRing, rRing * 0.52, 0, 0.2, Math.PI * 1.65);
    jCtx.stroke();
  }

  return {
    venusMap: toTexture(venC, true),
    venusBump: toTexture(venB, false),
    jupiterMap: toTexture(jupC, true),
    jupiterBump: toTexture(jupB, false),
  };
}

function buildSaturnUranusNeptuneMaps() {
  // 1. Saturn pale golden banded atmosphere (1024x512)
  const [satC, satCtx] = makeCanvas(TEX_W, TEX_H);
  const satGrad = satCtx.createLinearGradient(0, 0, 0, TEX_H);
  satGrad.addColorStop(0.0, '#78888a');   // Polar hexagon blue-slate tint
  satGrad.addColorStop(0.12, '#b8a882');
  satGrad.addColorStop(0.24, '#dfc487');
  satGrad.addColorStop(0.36, '#f6e5b8');
  satGrad.addColorStop(0.48, '#fbf0cf');  // Bright equatorial zone
  satGrad.addColorStop(0.58, '#e3c88b');
  satGrad.addColorStop(0.72, '#c8a768');
  satGrad.addColorStop(0.86, '#b4986c');
  satGrad.addColorStop(1.0, '#7e8682');
  satCtx.fillStyle = satGrad;
  satCtx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle zonal shear ripples across Saturn cloud deck
  for (let y = 24; y < TEX_H - 24; y += 6) {
    const alpha = 0.045 + ((y * 17) % 10) * 0.008;
    satCtx.fillStyle = y % 12 === 0 ? `rgba(255, 250, 235, ${alpha})` : `rgba(146, 112, 62, ${alpha})`;
    satCtx.fillRect(0, y, TEX_W, 3);
  }

  // 2. Saturn 1024x64 radial ring texture (mapped polar u = 0 inner C-ring .. 1 outer F-ring)
  const [ringC, ringCtx] = makeCanvas(TEX_W, 64);
  ringCtx.clearRect(0, 0, TEX_W, 64);
  for (let x = 0; x < TEX_W; x++) {
    const u = x / (TEX_W - 1);
    const fineRipple = 0.84 + 0.16 * Math.sin(u * 185) * Math.cos(u * 67);
    let alpha = 0;
    let r = 240;
    let g = 224;
    let b = 186;

    if (u >= 0.02 && u < 0.19) {
      // Translucent dusky C-ring
      alpha = 0.14 + (u - 0.02) * 0.75 * fineRipple;
      r = 166;
      g = 152;
      b = 132;
    } else if (u >= 0.19 && u < 0.58) {
      // Dense luminous B-ring icy bands
      const wave = 0.5 + 0.5 * Math.sin((u - 0.19) * 95);
      alpha = (0.72 + wave * 0.22) * fineRipple;
      r = Math.round(230 + wave * 22);
      g = Math.round(206 + wave * 34);
      b = Math.round(162 + wave * 42);
    } else if (u >= 0.58 && u < 0.655) {
      // Dark Cassini Division gap
      alpha = 0.03;
      r = 40;
      g = 36;
      b = 32;
    } else if (u >= 0.655 && u < 0.925) {
      // Translucent A-ring with sharp hairline Encke Gap near u = 0.855
      const encke = Math.abs(u - 0.855) < 0.01 ? 0.08 : 1.0;
      alpha = (0.52 + 0.16 * fineRipple) * encke;
      r = 222;
      g = 204;
      b = 172;
    } else if (u >= 0.96 && u <= 0.985) {
      // Narrow outer F-ring strand
      alpha = 0.42;
      r = 244;
      g = 232;
      b = 204;
    }

    ringCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
    ringCtx.fillRect(x, 0, 1, 64);
  }

  // 3. Uranus: smooth banded pale-cyan ice giant (#7DD3FC)
  const [uraC, uCtx] = makeCanvas(TEX_W, TEX_H);
  const uraGrad = uCtx.createLinearGradient(0, 0, 0, TEX_H);
  uraGrad.addColorStop(0.0, '#bae6fd');   // Pale polar methane hood
  uraGrad.addColorStop(0.22, '#7dd3fc');
  uraGrad.addColorStop(0.45, '#5bc0eb');
  uraGrad.addColorStop(0.55, '#7dd3fc');
  uraGrad.addColorStop(0.78, '#38bdf8');
  uraGrad.addColorStop(1.0, '#a5f3fc');
  uCtx.fillStyle = uraGrad;
  uCtx.fillRect(0, 0, TEX_W, TEX_H);
  for (let y = 18; y < TEX_H - 18; y += 10) {
    uCtx.fillStyle = y % 20 === 0 ? 'rgba(224, 242, 254, 0.09)' : 'rgba(14, 116, 144, 0.06)';
    uCtx.fillRect(0, y, TEX_W, 4);
  }

  // 4. Neptune: rich banded deep cobalt ice giant (#1D4ED8) + Great Dark Spot + methane cirrus streaks
  const [nepC, nCtx] = makeCanvas(TEX_W, TEX_H);
  const nepGrad = nCtx.createLinearGradient(0, 0, 0, TEX_H);
  nepGrad.addColorStop(0.0, '#1e3a8a');
  nepGrad.addColorStop(0.24, '#1d4ed8');
  nepGrad.addColorStop(0.46, '#2563eb');
  nepGrad.addColorStop(0.62, '#1d4ed8');
  nepGrad.addColorStop(0.84, '#1e40af');
  nepGrad.addColorStop(1.0, '#172554');
  nCtx.fillStyle = nepGrad;
  nCtx.fillRect(0, 0, TEX_W, TEX_H);

  for (let y = 20; y < TEX_H - 20; y += 8) {
    nCtx.fillStyle = y % 16 === 0 ? 'rgba(96, 165, 250, 0.14)' : 'rgba(15, 23, 42, 0.14)';
    nCtx.fillRect(0, y, TEX_W, 3.5);
  }

  // Neptune Great Dark Spot + companion bright white high-altitude methane cirrus wisps
  const gds = nCtx.createRadialGradient(410, 315, 4, 410, 315, 40);
  gds.addColorStop(0, 'rgba(12, 24, 72, 0.92)');
  gds.addColorStop(0.65, 'rgba(23, 37, 84, 0.58)');
  gds.addColorStop(1, 'rgba(29, 78, 216, 0)');
  nCtx.fillStyle = gds;
  nCtx.beginPath();
  nCtx.ellipse(410, 315, 42, 22, 0, 0, Math.PI * 2);
  nCtx.fill();

  const cirrus = [
    { x: 425, y: 292, w: 64, h: 4.5 },
    { x: 680, y: 215, w: 54, h: 3.5 },
    { x: 185, y: 344, w: 72, h: 4.0 },
    { x: 840, y: 274, w: 48, h: 3.2 },
  ];
  for (const c of cirrus) {
    const cg = nCtx.createLinearGradient(c.x - c.w, c.y, c.x + c.w, c.y);
    cg.addColorStop(0, 'rgba(224, 242, 254, 0)');
    cg.addColorStop(0.5, 'rgba(240, 249, 255, 0.85)');
    cg.addColorStop(1, 'rgba(224, 242, 254, 0)');
    nCtx.fillStyle = cg;
    nCtx.beginPath();
    nCtx.ellipse(c.x, c.y, c.w, c.h, 0, 0, Math.PI * 2);
    nCtx.fill();
  }

  return {
    saturnMap: toTexture(satC, true),
    saturnRingMap: toTexture(ringC, true),
    uranusMap: toTexture(uraC, true),
    neptuneMap: toTexture(nepC, true),
  };
}

export function generatePlanetaryPBRTextures() {
  return {
    ...buildSunMaps(),
    ...buildMoonMaps(),
    ...buildMarsMaps(),
    ...buildMercuryMaps(),
    ...buildEarthMaps(),
    ...buildCeresAndErosMaps(),
    ...buildVenusAndJupiterMaps(),
    ...buildSaturnUranusNeptuneMaps(),
  };
}

export type PlanetaryPBRTextures = ReturnType<typeof generatePlanetaryPBRTextures>;

let cachedTextures: PlanetaryPBRTextures | null = null;

export function getCachedPlanetaryPBRTextures(): PlanetaryPBRTextures {
  if (!cachedTextures) {
    cachedTextures = generatePlanetaryPBRTextures();
  }
  return cachedTextures;
}

/**
 * Generates radial UV-mapped RingGeometry for Saturn's rings (u = 0 inner .. 1 outer)
 * so 1D concentric ring bands and the Cassini Division gap render razor-sharp.
 */
export function createSaturnRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thetaSegments = 128
): THREE.BufferGeometry {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const radius = Math.hypot(v.x, v.y);
    const u = THREE.MathUtils.clamp(
      (radius - innerRadius) / Math.max(0.0001, outerRadius - innerRadius),
      0,
      1
    );
    const angle = (Math.atan2(v.y, v.x) + Math.PI) / (Math.PI * 2);
    uv.setXY(i, u, angle);
  }
  uv.needsUpdate = true;
  return geo;
}

/**
 * Generates displaced rocky potato/bean IcosahedronGeometry for Asteroid 433 Eros
 * with multi-octave vertex cratering (Himeros & Psyche saddle basins) and smooth normals.
 */
export function createDisplacedErosGeometry(radius: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 5);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const dir = new THREE.Vector3();

  // Deterministic major asteroid crater pockets (unit directions + angular radii)
  const craters = [
    { dir: new THREE.Vector3(0.32, 0.78, 0.54).normalize(), ang: 0.48, depth: 0.19 }, // Himeros saddle
    { dir: new THREE.Vector3(-0.46, 0.52, -0.72).normalize(), ang: 0.42, depth: 0.16 }, // Psyche crater
    { dir: new THREE.Vector3(0.75, -0.35, -0.56).normalize(), ang: 0.3, depth: 0.12 },
    { dir: new THREE.Vector3(-0.78, -0.25, 0.56).normalize(), ang: 0.28, depth: 0.11 },
    { dir: new THREE.Vector3(0.08, -0.82, -0.56).normalize(), ang: 0.34, depth: 0.13 },
    { dir: new THREE.Vector3(-0.18, 0.2, 0.96).normalize(), ang: 0.25, depth: 0.1 },
  ];

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    dir.copy(v).normalize();

    // Elongated bilobed kidney/bean silhouette of 433 Eros
    const sx = dir.x * 1.48;
    const sy = dir.y * 0.68 + 0.14 * (dir.x * dir.x - 0.5);
    const sz = dir.z * 0.74 - 0.12 * Math.sin(dir.x * 2.1);

    const rocky = fbmSpherical(dir.x * 3.4, dir.y * 3.4, dir.z * 3.4, 4);
    const fine = fbmSpherical(dir.x * 9.0, dir.y * 9.0, dir.z * 9.0, 2);
    let rMod = 0.88 + rocky * 0.22 + (fine - 0.5) * 0.06;

    for (const c of craters) {
      const angDist = Math.acos(Math.max(-1, Math.min(1, dir.dot(c.dir))));
      if (angDist < c.ang) {
        const t = 1 - angDist / c.ang;
        // Depressed bowl + subtle raised rim near edge
        rMod -= c.depth * (t * t) - (t < 0.22 ? 0.025 * Math.sin((t / 0.22) * Math.PI) : 0);
      }
    }

    pos.setXYZ(i, sx * radius * rMod, sy * radius * rMod, sz * radius * rMod);
  }

  pos.needsUpdate = true;

  // IcosahedronGeometry is non-indexed; accumulate face normals across shared vertex positions for silky-smooth sculptural shading
  const norm = geo.attributes.normal as THREE.BufferAttribute;
  const smoothAccum = new Map<string, THREE.Vector3>();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  const keyFor = (p: THREE.Vector3) =>
    `${Math.round(p.x * 10000)}_${Math.round(p.y * 10000)}_${Math.round(p.z * 10000)}`;

  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    cb.subVectors(c, b);
    ab.subVectors(a, b);
    cb.cross(ab).normalize();

    for (const p of [a, b, c]) {
      const k = keyFor(p);
      let acc = smoothAccum.get(k);
      if (!acc) {
        acc = new THREE.Vector3();
        smoothAccum.set(k, acc);
      }
      acc.add(cb);
    }
  }

  for (let i = 0; i < pos.count; i++) {
    a.fromBufferAttribute(pos, i);
    const acc = smoothAccum.get(keyFor(a));
    if (acc && acc.lengthSq() > 0) {
      a.copy(acc).normalize();
      norm.setXYZ(i, a.x, a.y, a.z);
    }
  }
  norm.needsUpdate = true;
  return geo;
}

/**
 * Realistic BackSide Fresnel atmospheric limb halo shader material with zero outer shell hard edge.
 */
export function createBackSideAtmosphereMaterial(
  colorHex: string,
  power = 2.2,
  intensity = 1.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
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
        float ndotv = dot(normalize(vNormal), normalize(vViewDir));
        float rim = pow(clamp(-ndotv * 1.95, 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * uIntensity, rim * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

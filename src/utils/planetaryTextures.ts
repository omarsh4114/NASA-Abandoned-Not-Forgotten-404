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

function drawPairedCraters(
  albedoCtx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  roughCtx: CanvasRenderingContext2D | null,
  count: number,
  seedOffset: number,
  rimColor: string,
  floorColor: string,
  withEjectaRays = false
) {
  for (let i = 0; i < count; i++) {
    const s1 = hash3(i + seedOffset, 13, 7);
    const s2 = hash3(i + seedOffset, 31, 19);
    const s3 = hash3(i + seedOffset, 47, 53);

    const cx = s1 * TEX_W;
    const cy = 28 + s2 * (TEX_H - 56);
    const latScale = 1 / Math.max(0.35, Math.sin((cy / TEX_H) * Math.PI));
    const baseR =
      i < count * 0.1
        ? 16 + s3 * 22
        : i < count * 0.38
          ? 6 + s3 * 10
          : 1.8 + s3 * 4.2;

    // Optional bright radial ejecta ray burst on young highland craters
    if (withEjectaRays && i % 29 === 0 && baseR > 12) {
      albedoCtx.save();
      albedoCtx.translate(cx, cy);
      for (let ray = 0; ray < 10; ray++) {
        const ang = (ray / 10) * Math.PI * 2 + s3 * 2.0;
        const rayLen = baseR * (2.6 + (ray % 3) * 1.4);
        albedoCtx.strokeStyle = 'rgba(232, 238, 245, 0.24)';
        albedoCtx.lineWidth = 1.6;
        albedoCtx.beginPath();
        albedoCtx.moveTo(Math.cos(ang) * baseR * 0.9, Math.sin(ang) * baseR * 0.9);
        albedoCtx.lineTo(Math.cos(ang) * rayLen * Math.min(1.4, latScale), Math.sin(ang) * rayLen);
        albedoCtx.stroke();
      }
      albedoCtx.restore();
    }

    // Wrap across x=0/TEX_W horizontally so spherical seams never clip craters
    const xs = cx < baseR * 2 ? [cx, cx + TEX_W] : cx > TEX_W - baseR * 2 ? [cx, cx - TEX_W] : [cx];
    for (const px of xs) {
      // 1. Albedo bowl & raised bright rim
      albedoCtx.fillStyle = floorColor;
      albedoCtx.beginPath();
      albedoCtx.ellipse(px, cy, baseR * Math.min(1.35, latScale), baseR, 0, 0, Math.PI * 2);
      albedoCtx.fill();

      albedoCtx.strokeStyle = rimColor;
      albedoCtx.lineWidth = baseR > 12 ? 2.4 : 1.25;
      albedoCtx.beginPath();
      albedoCtx.ellipse(px, cy, baseR * Math.min(1.35, latScale), baseR, 0, 0, Math.PI * 2);
      albedoCtx.stroke();

      // 2. Aligned Bump Heightmap (dark bowl floor, bright raised rim)
      bumpCtx.fillStyle = baseR > 14 ? '#222222' : '#3a3a3a';
      bumpCtx.beginPath();
      bumpCtx.ellipse(px, cy, baseR * 0.88 * Math.min(1.35, latScale), baseR * 0.88, 0, 0, Math.PI * 2);
      bumpCtx.fill();

      bumpCtx.strokeStyle = baseR > 12 ? '#e6e6e6' : '#c6c6c6';
      bumpCtx.lineWidth = baseR > 12 ? 2.8 : 1.4;
      bumpCtx.beginPath();
      bumpCtx.ellipse(px, cy, baseR * Math.min(1.35, latScale), baseR, 0, 0, Math.PI * 2);
      bumpCtx.stroke();

      if (baseR > 16) {
        bumpCtx.fillStyle = '#d4d4d4';
        bumpCtx.beginPath();
        bumpCtx.arc(px, cy, baseR * 0.16, 0, Math.PI * 2);
        bumpCtx.fill();
      }

      if (roughCtx) {
        roughCtx.strokeStyle = '#ffffff';
        roughCtx.lineWidth = 2.0;
        roughCtx.beginPath();
        roughCtx.ellipse(px, cy, baseR * Math.min(1.35, latScale), baseR, 0, 0, Math.PI * 2);
        roughCtx.stroke();
      }
    }
  }
}

function buildMoonMaps() {
  const baseW = 512;
  const baseH = 256;
  const [smA, smACtx] = makeCanvas(baseW, baseH);
  const [smB, smBCtx] = makeCanvas(baseW, baseH);
  const imgA = smACtx.createImageData(baseW, baseH);
  const imgB = smBCtx.createImageData(baseW, baseH);

  // Seamless spherical lunar highland + basaltic maria noise field
  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const n = fbmSpherical(nx * 2.4, ny * 2.4, nz * 2.4, 4);
      const mareFactor = fbmSpherical(nx * 1.4 + 4.1, ny * 1.4, nz * 1.4 - 2.2, 3);
      const isMare = mareFactor < 0.44 ? (0.44 - mareFactor) * 2.4 : 0;

      const idx = (y * baseW + x) * 4;
      const baseTone = 152 + n * 48 - isMare * 68;
      imgA.data[idx] = Math.max(48, Math.min(220, baseTone));
      imgA.data[idx + 1] = Math.max(52, Math.min(222, baseTone + 3));
      imgA.data[idx + 2] = Math.max(58, Math.min(228, baseTone + 8));
      imgA.data[idx + 3] = 255;

      const hVal = Math.max(40, Math.min(225, 118 + n * 75 - isMare * 38));
      imgB.data[idx] = hVal;
      imgB.data[idx + 1] = hVal;
      imgB.data[idx + 2] = hVal;
      imgB.data[idx + 3] = 255;
    }
  }
  smACtx.putImageData(imgA, 0, 0);
  smBCtx.putImageData(imgB, 0, 0);

  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);

  aCtx.drawImage(smA, 0, 0, TEX_W, TEX_H);
  bCtx.drawImage(smB, 0, 0, TEX_W, TEX_H);

  // Named lunar maria (Sea of Tranquility, Serenitatis, Imbrium, Oceanus Procellarum)
  const maria = [
    { x: 560, y: 230, rx: 95, ry: 68 },
    { x: 470, y: 175, rx: 85, ry: 64 },
    { x: 380, y: 165, rx: 110, ry: 85 },
    { x: 255, y: 235, rx: 135, ry: 115 },
    { x: 645, y: 195, rx: 52, ry: 44 },
  ];
  for (const m of maria) {
    const g = aCtx.createRadialGradient(m.x, m.y, 12, m.x, m.y, Math.max(m.rx, m.ry));
    g.addColorStop(0, 'rgba(54, 62, 74, 0.72)');
    g.addColorStop(0.65, 'rgba(72, 81, 95, 0.44)');
    g.addColorStop(1, 'rgba(120, 128, 140, 0)');
    aCtx.fillStyle = g;
    aCtx.beginPath();
    aCtx.ellipse(m.x, m.y, m.rx, m.ry, 0.2, 0, Math.PI * 2);
    aCtx.fill();

    // Slightly depressed smooth basalt mare plains in bump
    const gb = bCtx.createRadialGradient(m.x, m.y, 10, m.x, m.y, Math.max(m.rx, m.ry));
    gb.addColorStop(0, 'rgba(55, 55, 55, 0.55)');
    gb.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bCtx.fillStyle = gb;
    bCtx.beginPath();
    bCtx.ellipse(m.x, m.y, m.rx, m.ry, 0.2, 0, Math.PI * 2);
    bCtx.fill();
  }

  rCtx.fillStyle = '#efefef';
  rCtx.fillRect(0, 0, TEX_W, TEX_H);

  drawPairedCraters(aCtx, bCtx, rCtx, 420, 101, 'rgba(226, 232, 240, 0.72)', 'rgba(64, 72, 84, 0.58)', true);

  // Fine lunar regolith mineral sparkle/grain
  for (let i = 0; i < 4200; i++) {
    const gx = (i * 313 + (i % 13) * 19) % TEX_W;
    const gy = (i * 197 + (i % 7) * 11) % TEX_H;
    aCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)';
    aCtx.fillRect(gx, gy, 1.5, 1.5);
  }

  return {
    moonMap: toTexture(albedoC, true),
    moonBump: toTexture(bumpC, false),
    moonRoughness: toTexture(roughC, false),
  };
}

function buildMarsMaps() {
  const baseW = 512;
  const baseH = 256;
  const [smA, smACtx] = makeCanvas(baseW, baseH);
  const [smB, smBCtx] = makeCanvas(baseW, baseH);
  const imgA = smACtx.createImageData(baseW, baseH);
  const imgB = smBCtx.createImageData(baseW, baseH);

  // Rich Martian iron-oxide ochre (#B54A2A -> #6E2716) + volcanic basalt shields
  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const latDeg = Math.abs((y / baseH) * 180 - 90);

    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const n = fbmSpherical(nx * 2.5 + 3.0, ny * 2.5, nz * 2.5 + 1.1, 4);
      const darkBasalt = fbmSpherical(nx * 1.8 - 2.3, ny * 1.8 + 1.4, nz * 1.8, 3);

      // Blend from bright ochre plains (#B54A2A) down to dark iron-basalt (#6E2716 / #4B1D13)
      let r = 186 + (n - 0.5) * 65;
      let g = 80 + (n - 0.5) * 34;
      let b = 45 + (n - 0.5) * 20;

      if (darkBasalt < 0.45) {
        const k = Math.min(1, (0.45 - darkBasalt) * 3.0);
        r = r * (1 - k * 0.48) + 84 * k * 0.48;
        g = g * (1 - k * 0.55) + 34 * k * 0.55;
        b = b * (1 - k * 0.52) + 22 * k * 0.52;
      }

      // Rugged spiral polar CO2/H2O ice caps
      const capNoise = 81.5 + n * 6.5;
      if (latDeg > capNoise) {
        const capBlend = Math.min(1, (latDeg - capNoise) / 2.2);
        r = r * (1 - capBlend) + 245 * capBlend;
        g = g * (1 - capBlend) + 236 * capBlend;
        b = b * (1 - capBlend) + 230 * capBlend;
      }

      const idx = (y * baseW + x) * 4;
      imgA.data[idx] = Math.max(35, Math.min(250, r));
      imgA.data[idx + 1] = Math.max(18, Math.min(244, g));
      imgA.data[idx + 2] = Math.max(12, Math.min(240, b));
      imgA.data[idx + 3] = 255;

      const hVal = Math.max(30, Math.min(235, 118 + n * 90 - (darkBasalt < 0.45 ? 24 : 0)));
      imgB.data[idx] = hVal;
      imgB.data[idx + 1] = hVal;
      imgB.data[idx + 2] = hVal;
      imgB.data[idx + 3] = 255;
    }
  }
  smACtx.putImageData(imgA, 0, 0);
  smBCtx.putImageData(imgB, 0, 0);

  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);

  aCtx.drawImage(smA, 0, 0, TEX_W, TEX_H);
  bCtx.drawImage(smB, 0, 0, TEX_W, TEX_H);
  rCtx.fillStyle = '#e8e8e8';
  rCtx.fillRect(0, 0, TEX_W, TEX_H);

  // Valles Marineris Grand Rift Canyon Scar across Martian equator
  const traceValles = (ctx: CanvasRenderingContext2D, stroke: string, lineWidth: number) => {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(395, 258);
    ctx.bezierCurveTo(445, 248, 495, 272, 540, 266);
    ctx.bezierCurveTo(580, 260, 622, 276, 665, 255);
    ctx.stroke();

    // Tributary canyon fractures
    ctx.lineWidth = lineWidth * 0.55;
    ctx.beginPath();
    ctx.moveTo(475, 256);
    ctx.lineTo(498, 232);
    ctx.moveTo(558, 268);
    ctx.lineTo(576, 294);
    ctx.stroke();
    ctx.restore();
  };

  // Bright canyon rim shoulders + dark deeply carved rift floor
  traceValles(aCtx, 'rgba(214, 114, 72, 0.65)', 16);
  traceValles(aCtx, 'rgba(72, 22, 12, 0.88)', 8);
  traceValles(bCtx, '#dcdcdc', 16);
  traceValles(bCtx, '#161616', 8);

  // Olympus Mons shield dome + summit caldera
  const olympusGrad = bCtx.createRadialGradient(265, 205, 4, 265, 205, 42);
  olympusGrad.addColorStop(0, '#ffffff');
  olympusGrad.addColorStop(0.55, 'rgba(215, 215, 215, 0.72)');
  olympusGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
  bCtx.fillStyle = olympusGrad;
  bCtx.beginPath();
  bCtx.arc(265, 205, 42, 0, Math.PI * 2);
  bCtx.fill();
  bCtx.fillStyle = '#303030';
  bCtx.beginPath();
  bCtx.arc(265, 205, 6, 0, Math.PI * 2);
  bCtx.fill();

  drawPairedCraters(aCtx, bCtx, rCtx, 230, 409, 'rgba(229, 148, 108, 0.55)', 'rgba(88, 28, 14, 0.52)', false);

  return {
    marsMap: toTexture(albedoC, true),
    marsBump: toTexture(bumpC, false),
    marsRoughness: toTexture(roughC, false),
  };
}

function buildEarthMaps() {
  const baseW = 512;
  const baseH = 256;
  const [smA, smACtx] = makeCanvas(baseW, baseH);
  const [smR, smRCtx] = makeCanvas(baseW, baseH);
  const [smB, smBCtx] = makeCanvas(baseW, baseH);

  const imgA = smACtx.createImageData(baseW, baseH);
  const imgR = smRCtx.createImageData(baseW, baseH);
  const imgB = smBCtx.createImageData(baseW, baseH);

  for (let y = 0; y < baseH; y++) {
    const phi = ((y + 0.5) / baseH) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const lat = Math.abs((y / baseH) * 180 - 90);

    for (let x = 0; x < baseW; x++) {
      const theta = (x / baseW) * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const ny = cosPhi;
      const nz = sinPhi * Math.sin(theta);

      const cont = fbmSpherical(nx * 1.9 + 1.2, ny * 1.9 - 0.5, nz * 1.9 + 2.1, 4);
      const moisture = fbmSpherical(nx * 3.8 - 4.0, ny * 3.8 + 1.2, nz * 3.8, 3);

      const idx = (y * baseW + x) * 4;
      let r: number;
      let g: number;
      let b: number;
      let rough: number;
      let height: number;

      if (lat > 79 + cont * 5) {
        // Polar ice sheets
        r = 240;
        g = 246;
        b = 252;
        rough = 212;
        height = 178;
      } else if (cont > 0.52) {
        // Textured continental landmasses (coastal forest greens -> arid golden ochre -> alpine grey)
        const elev = (cont - 0.52) / 0.48;
        if (elev > 0.52) {
          r = 165 + elev * 65;
          g = 158 + elev * 68;
          b = 148 + elev * 75;
        } else if (moisture < 0.43 && lat < 38) {
          r = 176 - elev * 20;
          g = 136 - moisture * 22;
          b = 76;
        } else {
          r = 34 + elev * 62;
          g = 104 + moisture * 46;
          b = 46 + elev * 20;
        }
        rough = 220; // Matte land (~0.86)
        height = Math.min(250, 128 + elev * 115);
      } else {
        // Specular Earth oceans with shallow coastal shelf brightness
        const shelf = Math.max(0, 1 - (0.52 - cont) * 11);
        r = 10 + shelf * 14;
        g = 46 + shelf * 52;
        b = 98 + shelf * 62;
        rough = 64; // Low roughness (~0.25) so sunlight produces ocean specular glint
        height = 48;
      }

      imgA.data[idx] = r;
      imgA.data[idx + 1] = g;
      imgA.data[idx + 2] = b;
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
  smACtx.putImageData(imgA, 0, 0);
  smRCtx.putImageData(imgR, 0, 0);
  smBCtx.putImageData(imgB, 0, 0);

  const [albedoC, aCtx] = makeCanvas(TEX_W, TEX_H);
  const [roughC, rCtx] = makeCanvas(TEX_W, TEX_H);
  const [bumpC, bCtx] = makeCanvas(TEX_W, TEX_H);
  aCtx.drawImage(smA, 0, 0, TEX_W, TEX_H);
  rCtx.drawImage(smR, 0, 0, TEX_W, TEX_H);
  bCtx.drawImage(smB, 0, 0, TEX_W, TEX_H);

  // Seamless cyclonic cloud layer (1024x512)
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

      const swirl = fbmSpherical(nx * 3.1 + nz * 0.45, ny * 3.6, nz * 3.1 - nx * 0.45, 3);
      const alpha = swirl > 0.53 ? Math.min(225, Math.floor((swirl - 0.53) * 720)) : 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const ci = ((y + dy) * TEX_W + (x + dx)) * 4;
          cloudImg.data[ci] = 248;
          cloudImg.data[ci + 1] = 252;
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

function buildCeresAndErosMaps() {
  // Dwarf Planet Ceres: dark carbonaceous crust + cratering + Occator Crater bright salt spots
  const [ceresA, ceresACtx] = makeCanvas(TEX_W, TEX_H);
  const [ceresB, ceresBCtx] = makeCanvas(TEX_W, TEX_H);
  ceresACtx.fillStyle = '#474c54';
  ceresACtx.fillRect(0, 0, TEX_W, TEX_H);
  ceresBCtx.fillStyle = '#7e7e7e';
  ceresBCtx.fillRect(0, 0, TEX_W, TEX_H);

  for (let i = 0; i < 65; i++) {
    const x = hash3(i, 5, 9) * TEX_W;
    const y = hash3(i, 19, 27) * TEX_H;
    const r = 45 + hash3(i, 41, 3) * 85;
    ceresACtx.fillStyle = i % 2 === 0 ? 'rgba(42, 46, 54, 0.35)' : 'rgba(92, 98, 108, 0.28)';
    ceresACtx.beginPath();
    ceresACtx.arc(x, y, r, 0, Math.PI * 2);
    ceresACtx.fill();
  }
  drawPairedCraters(ceresACtx, ceresBCtx, null, 340, 731, 'rgba(148, 158, 172, 0.58)', 'rgba(34, 38, 44, 0.68)', false);

  // Occator Crater (bright sodium-carbonate evaporite domes on Ceres surface)
  const occX = 635;
  const occY = 198;
  ceresACtx.strokeStyle = 'rgba(186, 196, 210, 0.85)';
  ceresACtx.lineWidth = 3.2;
  ceresACtx.beginPath();
  ceresACtx.arc(occX, occY, 26, 0, Math.PI * 2);
  ceresACtx.stroke();
  ceresACtx.fillStyle = '#2a2e35';
  ceresACtx.beginPath();
  ceresACtx.arc(occX, occY, 22, 0, Math.PI * 2);
  ceresACtx.fill();

  // Cerealia Facula central bright dome + Vinalia Faculae cluster
  const spots = [
    { x: occX, y: occY, r: 9.5, op: 0.96 },
    { x: occX + 10, y: occY + 5, r: 4.5, op: 0.82 },
    { x: occX + 13, y: occY - 4, r: 3.5, op: 0.78 },
  ];
  for (const sp of spots) {
    const sg = ceresACtx.createRadialGradient(sp.x, sp.y, 0.5, sp.x, sp.y, sp.r);
    sg.addColorStop(0, `rgba(248, 252, 255, ${sp.op})`);
    sg.addColorStop(0.55, `rgba(219, 234, 254, ${sp.op * 0.6})`);
    sg.addColorStop(1, 'rgba(148, 163, 184, 0)');
    ceresACtx.fillStyle = sg;
    ceresACtx.beginPath();
    ceresACtx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
    ceresACtx.fill();
  }

  // Asteroid 433 Eros rocky silicate map
  const [erosA, erosACtx] = makeCanvas(TEX_W, TEX_H);
  const [erosB, erosBCtx] = makeCanvas(TEX_W, TEX_H);
  erosACtx.fillStyle = '#8b8278';
  erosACtx.fillRect(0, 0, TEX_W, TEX_H);
  erosBCtx.fillStyle = '#848484';
  erosBCtx.fillRect(0, 0, TEX_W, TEX_H);
  for (let i = 0; i < 80; i++) {
    const x = hash3(i, 7, 3) * TEX_W;
    const y = hash3(i, 23, 17) * TEX_H;
    const r = 35 + hash3(i, 37, 29) * 75;
    erosACtx.fillStyle = i % 2 === 0 ? 'rgba(98, 90, 82, 0.42)' : 'rgba(174, 163, 150, 0.32)';
    erosACtx.beginPath();
    erosACtx.arc(x, y, r, 0, Math.PI * 2);
    erosACtx.fill();
  }
  drawPairedCraters(erosACtx, erosBCtx, null, 280, 911, 'rgba(212, 204, 195, 0.65)', 'rgba(68, 62, 56, 0.65)', false);

  return {
    ceresMap: toTexture(ceresA, true),
    ceresBump: toTexture(ceresB, false),
    erosMap: toTexture(erosA, true),
    erosBump: toTexture(erosB, false),
  };
}

function buildGasGiantMaps() {
  const [jupC, jCtx] = makeCanvas(512, 256);
  const bands = [
    '#78350f', '#d97706', '#fef3c7', '#b45309', '#fde68a',
    '#92400e', '#f59e0b', '#fef3c7', '#b45309', '#78350f',
  ];
  const bandH = 256 / bands.length;
  bands.forEach((col, idx) => {
    jCtx.fillStyle = col;
    jCtx.fillRect(0, idx * bandH, 512, bandH + 2);
  });
  jCtx.fillStyle = '#dc2626';
  jCtx.beginPath();
  jCtx.ellipse(310, 165, 28, 16, 0, 0, Math.PI * 2);
  jCtx.fill();
  jCtx.strokeStyle = '#fef08a';
  jCtx.lineWidth = 3;
  jCtx.stroke();

  const [ringC, sCtx] = makeCanvas(512, 512);
  sCtx.clearRect(0, 0, 512, 512);
  const ringBands = [
    { r: 145, w: 12, color: 'rgba(253, 230, 138, 0.35)' },
    { r: 165, w: 22, color: 'rgba(254, 243, 199, 0.85)' },
    { r: 190, w: 16, color: 'rgba(217, 119, 6, 0.65)' },
    { r: 222, w: 20, color: 'rgba(253, 230, 138, 0.75)' },
    { r: 244, w: 8, color: 'rgba(180, 83, 9, 0.45)' },
  ];
  for (const rb of ringBands) {
    sCtx.strokeStyle = rb.color;
    sCtx.lineWidth = rb.w;
    sCtx.beginPath();
    sCtx.arc(256, 256, rb.r, 0, Math.PI * 2);
    sCtx.stroke();
  }

  return {
    jupiterMap: toTexture(jupC, true),
    saturnRingMap: toTexture(ringC, true),
  };
}

export function generatePlanetaryPBRTextures() {
  return {
    ...buildMoonMaps(),
    ...buildMarsMaps(),
    ...buildEarthMaps(),
    ...buildCeresAndErosMaps(),
    ...buildGasGiantMaps(),
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
  geo.computeVertexNormals();
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

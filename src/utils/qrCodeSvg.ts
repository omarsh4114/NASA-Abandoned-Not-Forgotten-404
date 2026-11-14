// Zero-dependency ISO/IEC 18004 QR Code Matrix Generator (Versions 1-6, ECC Level L, Byte Mode)

interface QrVersionSpec {
  version: number;
  size: number;
  totalCodewords: number;
  dataCodewords: number;
  eccPerBlock: number;
  blocks: number;
  align: number[];
}

const VERSION_SPECS: QrVersionSpec[] = [
  { version: 1, size: 21, totalCodewords: 26, dataCodewords: 19, eccPerBlock: 7, blocks: 1, align: [] },
  { version: 2, size: 25, totalCodewords: 44, dataCodewords: 34, eccPerBlock: 10, blocks: 1, align: [6, 18] },
  { version: 3, size: 29, totalCodewords: 70, dataCodewords: 55, eccPerBlock: 15, blocks: 1, align: [6, 22] },
  { version: 4, size: 33, totalCodewords: 100, dataCodewords: 80, eccPerBlock: 20, blocks: 1, align: [6, 26] },
  { version: 5, size: 37, totalCodewords: 134, dataCodewords: 108, eccPerBlock: 26, blocks: 1, align: [6, 30] },
  { version: 6, size: 41, totalCodewords: 172, dataCodewords: 136, eccPerBlock: 18, blocks: 2, align: [6, 34] },
];

// BCH(15,5) + 0x5412 masked format bits for ECC Level L (01) across Mask Patterns 0..7
const FORMAT_INFO_L = [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEcc(data: number[], eccLen: number): number[] {
  const gen = rsGeneratorPoly(eccLen);
  const msg = [...data, ...new Array<number>(eccLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

function encodeCodewords(bytes: Uint8Array, spec: QrVersionSpec): number[] {
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >>> i) & 1);
    }
  };

  // Mode 0100 (Byte), 8-bit length, payload
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (let i = 0; i < bytes.length; i++) {
    pushBits(bytes[i], 8);
  }

  const maxBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    dataBytes.push(b);
  }

  const padCycle = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < spec.dataCodewords) {
    dataBytes.push(padCycle[padIdx % 2]);
    padIdx++;
  }

  const dataPerBlock = Math.floor(spec.dataCodewords / spec.blocks);
  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];

  for (let b = 0; b < spec.blocks; b++) {
    const slice = dataBytes.slice(b * dataPerBlock, (b + 1) * dataPerBlock);
    dataBlocks.push(slice);
    eccBlocks.push(rsComputeEcc(slice, spec.eccPerBlock));
  }

  const interleaved: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) {
      interleaved.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < spec.eccPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) {
      interleaved.push(eccBlocks[b][i]);
    }
  }

  return interleaved;
}

function applyMaskPredicate(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0:
      return (r + c) % 2 === 0;
    case 1:
      return r % 2 === 0;
    case 2:
      return c % 3 === 0;
    case 3:
      return (r + c) % 3 === 0;
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    default:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
  }
}

function scoreMask(modules: boolean[][]): number {
  const n = modules.length;
  let penalty = 0;

  for (let r = 0; r < n; r++) {
    let runColor = modules[r][0];
    let runLen = 1;
    for (let c = 1; c < n; c++) {
      if (modules[r][c] === runColor) {
        runLen++;
        if (runLen === 5) penalty += 3;
        else if (runLen > 5) penalty += 1;
      } else {
        runColor = modules[r][c];
        runLen = 1;
      }
    }
  }

  for (let c = 0; c < n; c++) {
    let runColor = modules[0][c];
    let runLen = 1;
    for (let r = 1; r < n; r++) {
      if (modules[r][c] === runColor) {
        runLen++;
        if (runLen === 5) penalty += 3;
        else if (runLen > 5) penalty += 1;
      } else {
        runColor = modules[r][c];
        runLen = 1;
      }
    }
  }

  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = modules[r][c];
      if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
        penalty += 3;
      }
    }
  }

  return penalty;
}

export function generateQrMatrix(text: string): { size: number; modules: boolean[][] } {
  const encoder = new TextEncoder();
  let bytes = encoder.encode(text);
  if (bytes.length > 134) {
    bytes = bytes.slice(0, 134);
  }

  const spec =
    VERSION_SPECS.find((s) => bytes.length + 2 <= s.dataCodewords) ??
    VERSION_SPECS[VERSION_SPECS.length - 1];
  const size = spec.size;

  const baseModules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const isFunction = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));

  const setFunc = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      baseModules[r][c] = dark;
      isFunction[r][c] = true;
    }
  };

  // Finder patterns + 1px separators
  const drawFinder = (topR: number, leftC: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunc(topR + dr, leftC + dc, inOuter && (onBorder || inCore));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Alignment pattern (Versions 2-6 have a single non-overlapping center at [align[1], align[1]])
  if (spec.align.length === 2) {
    const center = spec.align[1];
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const isDark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
        setFunc(center + dr, center + dc, isDark);
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Dark module & reserve format info areas
  setFunc(size - 8, 8, true);
  for (let i = 0; i <= 8; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8][size - 1 - i] = true;
    if (i < 7) isFunction[size - 1 - i][8] = true;
  }

  // Place data bits in standard zigzag order
  const codewords = encodeCodewords(bytes, spec);
  const dataBits: number[] = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) {
      dataBits.push((cw >>> b) & 1);
    }
  }

  let bitIdx = 0;
  let upward = true;
  for (let rightCol = size - 1; rightCol >= 1; rightCol -= 2) {
    if (rightCol === 6) rightCol--;
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let offset = 0; offset < 2; offset++) {
        const c = rightCol - offset;
        if (!isFunction[r][c]) {
          const bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
          baseModules[r][c] = bit === 1;
        }
      }
    }
    upward = !upward;
  }

  // Evaluate masks 0..7 and select optimal contrast pattern
  let bestMask = 0;
  let bestScore = Infinity;
  let bestModules = baseModules;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = baseModules.map((row, r) =>
      row.map((val, c) => (isFunction[r][c] ? val : val !== applyMaskPredicate(mask, r, c)))
    );

    const fmt = FORMAT_INFO_L[mask];
    const fmtBit = (idx: number) => ((fmt >>> idx) & 1) === 1;

    // Copy 1 (top-left)
    for (let i = 0; i <= 5; i++) candidate[8][i] = fmtBit(14 - i);
    candidate[8][7] = fmtBit(8);
    candidate[8][8] = fmtBit(7);
    candidate[7][8] = fmtBit(6);
    for (let i = 0; i <= 5; i++) candidate[5 - i][8] = fmtBit(5 - i);

    // Copy 2 (bottom-left & top-right)
    for (let i = 0; i <= 6; i++) candidate[size - 1 - i][8] = fmtBit(14 - i);
    for (let i = 0; i <= 7; i++) candidate[8][size - 8 + i] = fmtBit(7 - i);

    const score = scoreMask(candidate);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
      bestModules = candidate;
    }
  }

  void bestMask;
  return { size, modules: bestModules };
}
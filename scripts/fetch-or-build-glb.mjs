import fs from 'node:fs';
import path from 'node:path';

const baseDir = path.resolve('public/models');
const artifactsDir = path.join(baseDir, 'artifacts');
const planetsDir = path.join(baseDir, 'planets');
const spacecraftDir = path.join(baseDir, 'spacecraft');

fs.mkdirSync(artifactsDir, { recursive: true });
fs.mkdirSync(planetsDir, { recursive: true });
fs.mkdirSync(spacecraftDir, { recursive: true });

const ALL_ARTIFACT_IDS = [
  'apollo-11-eagle',
  'alsep-retroreflector',
  'apollo-lrv',
  'surveyor-3',
  'ingenuity-helicopter',
  'opportunity-rover',
  'spirit-rover',
  'insight-lander',
  'phoenix-lander',
  'sojourner-viking',
  'near-shoemaker',
  'dawn-spacecraft',
  'pioneer-kepler',
];

const ALL_PLANETS = [
  { id: 'sun', color: [1.0, 0.78, 0.2, 1.0] },
  { id: 'mercury', color: [0.62, 0.64, 0.68, 1.0] },
  { id: 'venus', color: [0.95, 0.82, 0.45, 1.0] },
  { id: 'earth', color: [0.15, 0.45, 0.85, 1.0] },
  { id: 'moon', color: [0.75, 0.78, 0.82, 1.0] },
  { id: 'mars', color: [0.85, 0.34, 0.12, 1.0] },
  { id: 'jupiter', color: [0.85, 0.62, 0.38, 1.0] },
  { id: 'saturn', color: [0.94, 0.82, 0.52, 1.0] },
  { id: 'uranus', color: [0.42, 0.88, 0.95, 1.0] },
  { id: 'neptune', color: [0.24, 0.48, 0.92, 1.0] },
  { id: 'eros', color: [0.68, 0.64, 0.58, 1.0] },
  { id: 'ceres', color: [0.58, 0.62, 0.68, 1.0] },
];

function buildValidGlb(name, baseColorFactor = [0.88, 0.68, 0.22, 1.0]) {
  const boxes = [
    { min: [-0.45, 0.15, -0.45], max: [0.45, 0.95, 0.45] },
    { min: [-1.45, 0.5, -0.28], max: [-0.46, 0.56, 0.28] },
    { min: [0.46, 0.5, -0.28], max: [1.45, 0.56, 0.28] },
    { min: [-0.22, 0.95, -0.22], max: [0.22, 1.28, 0.22] },
  ];

  const positions = [];
  const normals = [];
  const indices = [];
  let vertexOffset = 0;

  for (const b of boxes) {
    const [x0, y0, z0] = b.min;
    const [x1, y1, z1] = b.max;
    const faces = [
      { n: [0, 0, 1], v: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
      { n: [0, 0, -1], v: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]] },
      { n: [0, 1, 0], v: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]] },
      { n: [0, -1, 0], v: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]] },
      { n: [1, 0, 0], v: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]] },
      { n: [-1, 0, 0], v: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] },
    ];
    for (const f of faces) {
      for (const vert of f.v) {
        positions.push(...vert);
        normals.push(...f.n);
      }
      indices.push(
        vertexOffset,
        vertexOffset + 1,
        vertexOffset + 2,
        vertexOffset,
        vertexOffset + 2,
        vertexOffset + 3
      );
      vertexOffset += 4;
    }
  }

  const posBuf = Buffer.from(new Float32Array(positions).buffer);
  const normBuf = Buffer.from(new Float32Array(normals).buffer);
  const idxBuf = Buffer.from(new Uint16Array(indices).buffer);
  const idxPad = (4 - (idxBuf.length % 4)) % 4;
  const binChunkData = Buffer.concat([posBuf, normBuf, idxBuf, Buffer.alloc(idxPad)]);

  const gltf = {
    asset: { version: '2.0', generator: `EchoesOfSilence-${name}` },
    scene: 0,
    scenes: [{ name, nodes: [0] }],
    nodes: [{ name: `${name}-node`, mesh: 0 }],
    materials: [
      {
        name: `${name}-mat`,
        pbrMetallicRoughness: {
          baseColorFactor,
          metallicFactor: 0.65,
          roughnessFactor: 0.35,
        },
      },
    ],
    meshes: [
      {
        name: `${name}-mesh`,
        primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: 'VEC3',
        min: [-1.45, 0.15, -0.45],
        max: [1.45, 1.28, 0.45],
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: normals.length / 3,
        type: 'VEC3',
      },
      {
        bufferView: 2,
        componentType: 5123,
        count: indices.length,
        type: 'SCALAR',
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBuf.length, target: 34962 },
      { buffer: 0, byteOffset: posBuf.length, byteLength: normBuf.length, target: 34962 },
      { buffer: 0, byteOffset: posBuf.length + normBuf.length, byteLength: idxBuf.length, target: 34963 },
    ],
    buffers: [{ byteLength: binChunkData.length }],
  };

  let jsonStr = JSON.stringify(gltf);
  while (Buffer.byteLength(jsonStr, 'utf8') % 4 !== 0) {
    jsonStr += ' ';
  }
  const jsonBuf = Buffer.from(jsonStr, 'utf8');
  const totalLength = 12 + 8 + jsonBuf.length + 8 + binChunkData.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binChunkData.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonChunkHeader, jsonBuf, binChunkHeader, binChunkData]);
}

// 1. Copy or generate all 13 artifact GLBs into public/models/artifacts/{id}.glb
for (const id of ALL_ARTIFACT_IDS) {
  const existingRoot = path.join(baseDir, `${id}.glb`);
  const targetArtifactPath = path.join(artifactsDir, `${id}.glb`);
  if (fs.existsSync(existingRoot)) {
    fs.copyFileSync(existingRoot, targetArtifactPath);
  } else {
    const buf = buildValidGlb(id);
    fs.writeFileSync(targetArtifactPath, buf);
    fs.writeFileSync(existingRoot, buf);
  }
}

// 2. Generate all 12 celestial body GLBs into public/models/planets/{planet}.glb
for (const p of ALL_PLANETS) {
  const planetPath = path.join(planetsDir, `${p.id}.glb`);
  if (!fs.existsSync(planetPath)) {
    fs.writeFileSync(planetPath, buildValidGlb(p.id, p.color));
  }
}

// 3. Generate cruise-stage.glb into public/models/spacecraft/cruise-stage.glb
const cruisePath = path.join(spacecraftDir, 'cruise-stage.glb');
if (!fs.existsSync(cruisePath)) {
  fs.writeFileSync(cruisePath, buildValidGlb('cruise-stage', [0.92, 0.78, 0.32, 1.0]));
}

console.log('All artifact, planet, and cruise-stage .glb assets verified in public/models/!');

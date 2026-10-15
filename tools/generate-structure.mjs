import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const byte = n => Buffer.from([n & 255]);
const short = n => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const int = n => { const b = Buffer.alloc(4); b.writeInt32BE(n); return b; };
const long = n => { const b = Buffer.alloc(8); b.writeBigInt64BE(BigInt(n)); return b; };
const str = s => { const b = Buffer.from(s, 'utf8'); return Buffer.concat([short(b.length), b]); };
const payload = (type, value) => {
  if (type === 1) return byte(value);
  if (type === 3) return int(value);
  if (type === 4) return long(value);
  if (type === 8) return str(value);
  if (type === 9) return Buffer.concat([byte(value.type), int(value.items.length), ...value.items.map(item => payload(value.type, item))]);
  if (type === 10) return Buffer.concat([...value.map(([name, kind, data]) => Buffer.concat([byte(kind), str(name), payload(kind, data)])), byte(0)]);
  throw new Error(`Unsupported NBT tag ${type}`);
};
const list = (type, items) => ({ type, items });
const compound = fields => fields;

const palette = [];
const blocks = [];
function add(x, y, z, name, properties, nbt) {
  const key = JSON.stringify([name, properties]);
  let state = palette.findIndex(item => item.key === key);
  if (state < 0) { state = palette.length; palette.push({ key, name, properties }); }
  blocks.push({ pos: [x, y, z], state, nbt });
}

for (let x = 3; x <= 7; x++) for (let z = 0; z <= 4; z++) {
  add(x, 0, z, z === 2 ? 'minecraft:gravel' : 'minecraft:coarse_dirt');
  add(x, 1, z, 'minecraft:air');
}
for (const x of [0, 1, 2, 8, 9, 10]) add(x, 0, 2, 'minecraft:gravel');
add(5, 1, 2, 'minecraft:campfire', { lit: 'false', facing: 'north', signal_fire: 'false', waterlogged: 'false' });
for (const [x, z] of [[5, 1], [5, 3], [4, 2], [6, 2]]) add(x, 1, z, 'minecraft:cobblestone');
for (const x of [3, 7]) add(x, 1, 2, 'minecraft:oak_log', { axis: 'z' });
for (const [x, y, z] of [[3, 1, 0], [3, 2, 0], [7, 1, 0]]) add(x, y, z, 'minecraft:oak_fence', { east: 'false', north: 'false', south: 'false', waterlogged: 'false', west: 'false' });
add(7, 1, 4, 'minecraft:chest', { facing: 'north', type: 'single', waterlogged: 'false' }, compound([
  ['id', 8, 'minecraft:chest'],
  ['LootTable', 8, 'forgotten_trails:chests/ruined_camp'],
]));

const root = compound([
  ['DataVersion', 3, 4790],
  ['size', 9, list(3, [11, 3, 5])],
  ['palette', 9, list(10, palette.map(item => compound([
    ['Name', 8, item.name],
    ...(item.properties ? [['Properties', 10, compound(Object.entries(item.properties).map(([k, v]) => [k, 8, v]))]] : []),
  ])))],
  ['blocks', 9, list(10, blocks.map(item => compound([
    ['pos', 9, list(3, item.pos)],
    ['state', 3, item.state],
    ...(item.nbt ? [['nbt', 10, item.nbt]] : []),
  ])))],
  ['entities', 9, list(10, [])],
]);
const nbt = Buffer.concat([byte(10), str(''), payload(10, root)]);
const destination = new URL('../src/main/resources/data/forgotten_trails/structure/ruined_camp.nbt', import.meta.url);
await mkdir(new URL('.', destination), { recursive: true });
await writeFile(destination, gzipSync(nbt));
console.log(`Wrote ${blocks.length} blocks with ${palette.length} states`);

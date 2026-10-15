import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

const root = new URL('../src/main/resources/', import.meta.url);
const data = new URL('data/forgotten_trails/', root);
const json = async path => JSON.parse(await readFile(new URL(path, data), 'utf8'));
const structure = await json('worldgen/structure/ruined_camp.json');
const set = await json('worldgen/structure_set/ruined_camps.json');
const pool = await json('worldgen/template_pool/ruined_camp.json');
const biomeTag = await json('tags/worldgen/biome/has_structure/ruined_camp.json');
const loot = await json('loot_table/chests/ruined_camp.json');
const meta = JSON.parse(await readFile(new URL('fabric.mod.json', root), 'utf8'));

assert.equal(meta.id, 'forgotten_trails');
assert.equal(structure.type, 'minecraft:jigsaw');
assert.equal(structure.biomes, '#forgotten_trails:has_structure/ruined_camp');
assert.equal(structure.start_pool, 'forgotten_trails:ruined_camp');
assert.equal(set.structures[0].structure, 'forgotten_trails:ruined_camp');
assert.equal(pool.elements[0].element.location, 'forgotten_trails:ruined_camp');
assert.ok(biomeTag.values.includes('minecraft:plains'));
assert.ok(biomeTag.values.includes('minecraft:desert'));
assert.ok(loot.pools.length > 0);
assert.ok(!(await readdir(new URL('../src/main/java/', import.meta.url)).catch(() => [])).some(name => name === 'ForgottenTrails.java'));

const raw = gunzipSync(await readFile(new URL('structure/ruined_camp.nbt', data)));
let offset = 0;
const u8 = () => raw.readUInt8(offset++);
const i16 = () => { const n = raw.readUInt16BE(offset); offset += 2; return n; };
const i32 = () => { const n = raw.readInt32BE(offset); offset += 4; return n; };
const i64 = () => { const n = raw.readBigInt64BE(offset); offset += 8; return n; };
const string = () => { const n = i16(); const s = raw.toString('utf8', offset, offset + n); offset += n; return s; };
function value(type) {
  if (type === 1) return u8();
  if (type === 3) return i32();
  if (type === 4) return i64();
  if (type === 8) return string();
  if (type === 9) { const itemType = u8(); const length = i32(); return Array.from({ length }, () => value(itemType)); }
  if (type === 10) { const result = {}; for (;;) { const kind = u8(); if (!kind) return result; result[string()] = value(kind); } }
  throw new Error(`Unsupported NBT type ${type}`);
}
assert.equal(u8(), 10);
assert.equal(string(), '');
const nbt = value(10);
assert.equal(offset, raw.length);
assert.equal(nbt.DataVersion, 4790);
assert.deepEqual(nbt.size, [11, 3, 5]);
assert.ok(nbt.blocks.length > 60);
const chest = nbt.blocks.find(block => nbt.palette[block.state].Name === 'minecraft:chest');
assert.ok(chest);
assert.equal(chest.nbt.LootTable, 'forgotten_trails:chests/ruined_camp');
assert.ok(nbt.blocks.some(block => nbt.palette[block.state].Name === 'minecraft:campfire'));
console.log('Worldgen references, NBT template, chest loot, and version passed.');

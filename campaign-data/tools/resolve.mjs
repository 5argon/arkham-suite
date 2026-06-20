#!/usr/bin/env node
// Resolve card codes -> English names from the pack reference.
//   node resolve.mjs 09001 09002 ...
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACK = path.resolve(__dirname, '../references/pack');
const index = new Map();
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.json')) {
      let json;
      try {
        json = JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch {
        return;
      }
      for (const c of Array.isArray(json) ? json : [json]) {
        if (c && c.code && c.name && !index.has(c.code)) index.set(c.code, c.name);
      }
    }
  }
})(PACK);

for (const code of process.argv.slice(2)) {
  console.log(`${code}\t${index.get(code) ?? '(not found)'}`);
}

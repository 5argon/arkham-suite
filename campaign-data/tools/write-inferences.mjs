#!/usr/bin/env node
// Merges achievement-inference classifications into the per-campaign curation
// files (adds `achievements.<id>.infer`) and compiles a questions report.
//
//   node write-inferences.mjs <workflow-output.json>
//
// Input: { classifications: [ { code, achievements:[{id,status,infer?,reason,question?}] } ] }
// Preserves existing curation content (spoilers, sections, shared flags).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATION_DIR = path.resolve(__dirname, '../curation');

const inPath = process.argv[2];
if (!inPath) {
  console.error('usage: node write-inferences.mjs <workflow-output.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const classifications = data.classifications || data;

const questions = []; // { code, id, question }
let inferCount = 0;
let manualCount = 0;

for (const c of classifications) {
  if (!c || !c.code) continue;
  const curPath = path.join(CURATION_DIR, `${c.code}.json`);
  const cur = fs.existsSync(curPath) ? JSON.parse(fs.readFileSync(curPath, 'utf8')) : { code: c.code };
  cur.achievements ||= {};
  for (const a of c.achievements || []) {
    if (a.status === 'infer' && a.infer) {
      cur.achievements[a.id] = { ...(cur.achievements[a.id] || {}), infer: a.infer };
      inferCount++;
    } else if (a.status === 'manual') {
      manualCount++;
    } else if (a.status === 'unsure') {
      questions.push({ code: c.code, id: a.id, question: a.question || a.reason || '(no question text)' });
    }
  }
  // drop the map if empty to keep curation tidy
  if (!Object.keys(cur.achievements).length) delete cur.achievements;
  fs.writeFileSync(curPath, JSON.stringify(cur, null, 2) + '\n');
}

// questions report
const lines = ['# Achievement inference — questions for review', ''];
lines.push(`Inferred: ${inferCount} · Manual (not log-trackable): ${manualCount} · Unsure: ${questions.length}`, '');
let curCode = '';
for (const q of questions) {
  if (q.code !== curCode) {
    curCode = q.code;
    lines.push(`## ${curCode}`);
  }
  lines.push(`- **${q.id}** — ${q.question}`);
}
fs.writeFileSync(path.join(CURATION_DIR, 'inference-questions.md'), lines.join('\n') + '\n');

console.log(`inferred=${inferCount} manual=${manualCount} unsure=${questions.length}`);
console.log(`wrote inference-questions.md`);

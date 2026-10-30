// Extract named icons from an IcoMoon project JSON into standalone SVGs (IcoMoon export style).
// usage: node tool/extract-arkham-build.mjs <project.json> <outDir> name1 name2 ...
import fs from 'node:fs';
import path from 'node:path';
const [projectPath, outDir, ...names] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
for (const name of names) {
  let found = null;
  for (const set of project.iconSets) {
    const i = set.selection?.findIndex((s) => s.name === name);
    if (i !== undefined && i >= 0) { found = { icon: set.icons[i], height: set.height ?? 1024 }; break; }
  }
  if (!found) throw new Error(`icon not found: ${name}`);
  const { icon, height } = found;
  const width = icon.width ?? height;
  const paths = icon.paths.map((d) => `<path d="${d}"></path>`).join('\n');
  const svg = `<!-- Extracted from arkham.build's IcoMoon project (encounters) -->\n<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${(32 * width) / height}" height="32" viewBox="0 0 ${width} ${height}">\n${paths}\n</svg>\n`;
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
}
console.log(`wrote ${names.length} svg(s) to ${outDir}`);

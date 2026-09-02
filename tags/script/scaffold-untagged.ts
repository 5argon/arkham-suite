/**
 * Scaffold an UNTAGGED pack file from a JSON list of cards, ready for the tag-cards skill.
 *
 *   node script/scaffold-untagged.ts <pack> [input.json]
 *
 * Input JSON (defaults to json/input/<pack>.json) is an array of cards:
 *   [{ code: string, name: string, text: string, type?, traits?, health?, sanity? }]
 *
 * Produces:
 *   - json/untagged/<pack>.json   the tagging WORKLIST: each card with an empty `tags: []`
 *                                 (the tag-cards skill fills these in, then re-assembles)
 *   - src/tagged-cards/<pack>.ts  an untagged placeholder (every card, empty tags)
 * and registers `<pack>` in src/tagged-cards/index.ts.
 *
 * Then run the `tag-cards` skill, which reads reference/_taxonomy-digest.md + the worklist,
 * fills every `tags` array with TS tag expressions, and runs assemble-tagged-cards.ts.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadCardMetadata, metadataLines } from "./card-metadata.ts";
import { root } from "./lib.ts";

const pack = process.argv[2];
if (!pack) {
  console.error("usage: node script/scaffold-untagged.ts <pack> [input.json]");
  process.exit(1);
}
const inputPath = process.argv[3] ?? join(root, "json", "input", `${pack}.json`);
if (!existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}`);
  process.exit(1);
}

interface InCard {
  code: string;
  name: string;
  text?: string;
}
const cards: InCard[] = JSON.parse(await readFile(inputPath, "utf8"));

// 1. worklist JSON (assemble input shape, empty tags)
const worklist = cards.map((c) => ({ code: c.code, name: c.name, text: c.text ?? "", tags: [] as string[] }));
await mkdir(join(root, "json", "untagged"), { recursive: true });
const worklistPath = join(root, "json", "untagged", `${pack}.json`);
await writeFile(worklistPath, JSON.stringify(worklist, null, 1) + "\n");

// 2. untagged placeholder .ts (with resolved stat metadata so tag authors see icons/level/type)
const meta = await loadCardMetadata();
const body = worklist
  .map((r) => {
    const metaBlock = metadataLines(meta.get(r.code))
      .map((l) => l + "\n")
      .join("");
    return (
      `  {\n    code: ${JSON.stringify(r.code)},\n    name: ${JSON.stringify(r.name)},\n` +
      `    text: ${JSON.stringify(r.text)},\n` +
      metaBlock +
      `    tags: [],\n  },`
    );
  })
  .join("\n");
const ts = `import { TaggedCard } from "../type.js";\n\nconst taggedCards: TaggedCard[] = [\n${body}\n];\nexport default taggedCards;\n`;
await writeFile(join(root, "src", "tagged-cards", `${pack}.ts`), ts);

// 3. register in index.ts (idempotent)
const indexPath = join(root, "src", "tagged-cards", "index.ts");
let index = await readFile(indexPath, "utf8");
if (!index.includes(`./${pack}.js`)) {
  const importLines = index.split("\n").filter((l) => /^import .* from "\.\/.*\.js";$/.test(l));
  const lastImport = importLines[importLines.length - 1];
  index = index.replace(lastImport, `${lastImport}\nimport ${pack} from "./${pack}.js";`);
  index = index.replace(/\n\];/, `\n  ...${pack},\n];`);
  await writeFile(indexPath, index);
}

console.log(
  `Scaffolded ${pack}: ${worklist.length} cards.\n` +
    `  worklist:    json/untagged/${pack}.json  (fill each card's tags)\n` +
    `  placeholder: src/tagged-cards/${pack}.ts  (registered in index.ts)\n` +
    `Next: run the tag-cards skill, then\n` +
    `  node script/assemble-tagged-cards.ts json/untagged/${pack}.json src/tagged-cards/${pack}.ts && yarn build`,
);

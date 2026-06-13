/**
 * Assemble a typed src/tagged-cards/<pack>.ts file from structured tagging output.
 *
 *   node ./script/assemble-tagged-cards.ts <input.json> <output.ts>
 *
 * Input JSON shape (produced by the Stage-B tagging agents):
 *   [{ code: string, name: string, text: string,
 *      tags: string[] }]          // each element is a TS object literal, e.g.
 *                                 //   "{ type: TagTypeHeal.HealDamageYou, value: 1 }"
 *
 * The agents only write the tag-object expressions (using the exact enum references
 * shown in the taxonomy digest). This script derives the imports deterministically by
 * scanning those expressions, so agents can never get an import wrong. `tsc -b`
 * afterwards validates every discriminant + argument.
 */
import { readFile, writeFile } from "node:fs/promises";
import { loadCardMetadata, metadataLines } from "./card-metadata.ts";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: node assemble-tagged-cards.ts <input.json> <output.ts>");
  process.exit(1);
}

interface Row {
  code: string;
  name: string;
  text: string;
  tags: string[];
}

const rows: Row[] = JSON.parse(await readFile(inPath, "utf8"));

// Collect every identifier reference used across all tag expressions.
const allExpr = rows.flatMap((r) => r.tags ?? []).join("\n");
const idRegex = /\b(TagType[A-Za-z0-9]+|BasicAction|SkillType|SkillIcon|TimingQualifier|HealTarget)\b/g;
const used = new Set<string>();
for (const m of allExpr.matchAll(idRegex)) used.add(m[1]);

const tagTypeEnums = [...used].filter((id) => id.startsWith("TagType")).sort();
const kohakuEnums = ["BasicAction", "SkillType", "SkillIcon"].filter((id) => used.has(id));
const typeEnums = ["TimingQualifier", "HealTarget"].filter((id) => used.has(id));

const lines: string[] = [];
if (tagTypeEnums.length) {
  lines.push(`import {\n${tagTypeEnums.map((e) => `  ${e},`).join("\n")}\n} from "../tags/index.js";`);
}
if (kohakuEnums.length) {
  lines.push(`import { ${kohakuEnums.join(", ")} } from "../kohaku.js";`);
}
lines.push(`import { TaggedCard${typeEnums.length ? ", " + typeEnums.join(", ") : ""} } from "../type.js";`);

// Stat metadata (level/type/icons) is resolved by code so agents never supply it.
const meta = await loadCardMetadata();

const body = rows
  .map((r) => {
    const tags = (r.tags ?? []).map((t) => `      ${t},`).join("\n");
    const metaBlock = metadataLines(meta.get(r.code))
      .map((l) => l + "\n")
      .join("");
    return (
      `  {\n` +
      `    code: ${JSON.stringify(r.code)},\n` +
      `    name: ${JSON.stringify(r.name)},\n` +
      `    text: ${JSON.stringify(r.text)},\n` +
      metaBlock +
      `    tags: [\n${tags}\n    ],\n` +
      `  },`
    );
  })
  .join("\n");

const out = `${lines.join("\n")}\n\nconst taggedCards: TaggedCard[] = [\n${body}\n];\nexport default taggedCards;\n`;

await writeFile(outPath, out);
console.log(`Wrote ${outPath} with ${rows.length} cards (${tagTypeEnums.length} tag-type enums imported).`);

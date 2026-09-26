/**
 * Dump the whole tagged corpus as ONE LINE PER CARD to reference/_corpus.tsv — the grep target
 * for review work ("which cards say 'shuffle it into your deck' and what do they carry?").
 *
 *   node ./script/corpus.ts [--out path]
 *
 * Columns: code · name · pack · cardType · level · text (newlines as " | ") · base tags
 * (`id{arg:value,…}` joined by " ; ") · compounds (joined by ", "). Weaknesses (never tagged)
 * are left out.
 *
 * Reads the BUILT package (dist/) — run `yarn build` first.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { flagValue, loadCorpus, referenceDir } from "./lib.ts";

const outPath = flagValue(process.argv.slice(2), "--out") ?? join(referenceDir, "_corpus.tsv");
const corpus = await loadCorpus();
const { resolveCompounds } = await import("../dist/index.js");

const argsOf = (t: Record<string, unknown>) => {
  const entries = Object.entries(t).filter(([k]) => k !== "type");
  return entries.length ? `{${entries.map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(",")}}` : "";
};
const oneLine = (s: string) => s.replace(/\s*\n\s*/g, " | ").replace(/\t/g, " ");

const lines = ["code\tname\tpack\tcardType\tlevel\ttext\ttags\tcompounds"];
// weaknesses are never tagged, so they are no one's peer or precedent
const tagged = corpus.filter((c) => !c.subtype);
for (const c of tagged) {
  lines.push(
    [
      c.code,
      c.name,
      c.pack,
      c.cardType ?? "",
      c.level ?? "",
      oneLine(c.text ?? ""),
      c.tags.map((t) => t.type + argsOf(t)).join(" ; "),
      (resolveCompounds(c.tags as never) as string[]).join(", "),
    ].join("\t"),
  );
}
await writeFile(outPath, lines.join("\n") + "\n");
console.log(`Wrote ${outPath} (${tagged.length} cards; ${corpus.length - tagged.length} weaknesses left out)`);

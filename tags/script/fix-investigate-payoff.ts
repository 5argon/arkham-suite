/**
 * One-off cross-pack fix: cards whose OWN investigate has a success rider were wrongly
 * tagged `timing-after-successfully-investigate` (a PERSISTENT after-any-investigation
 * trigger = the Investigate Payoff signal). Remove that tag from them, and add
 * `skill-test-condition-successful` (the right "if you succeed at THIS test" tag) where
 * it's missing. Block-aware so it only touches the targeted card objects.
 *
 *   node ./script/fix-investigate-payoff.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "src", "tagged-cards");

const FILES = ["dwl", "har", "tfa", "win", "jac"];
const REMOVE = new Set(["02150", "60219", "04157", "04272", "60227", "60315", "60328", "60431"]);
const ADD_COND = new Set(["02150", "60219", "04272", "60328", "60431"]);
const COND_LINE = "      { type: TagTypeSkillTestCondition.SkillTestConditionSuccessful },";

let removed = 0;
let added = 0;

for (const pack of FILES) {
  const path = join(dir, `${pack}.ts`);
  const lines = (await readFile(path, "utf8")).split("\n");
  const out = [];
  let buf = null;
  let code = null;

  const flush = () => {
    if (!buf) return;
    let b = buf;
    if (REMOVE.has(code)) {
      const before = b.length;
      b = b.filter((l) => !l.includes("TimingAfterSuccessfullyInvestigate"));
      removed += before - b.length;
    }
    if (ADD_COND.has(code) && !b.some((l) => l.includes("SkillTestConditionSuccessful"))) {
      const i = b.findIndex((l) => /^    tags: \[/.test(l));
      if (i >= 0) {
        b.splice(i + 1, 0, COND_LINE);
        added++;
      }
    }
    out.push(...b);
    buf = null;
    code = null;
  };

  for (const line of lines) {
    if (/^  \{$/.test(line)) {
      flush();
      buf = [line];
      continue;
    }
    if (buf) {
      buf.push(line);
      const m = line.match(/^    code: "([^"]+)"/);
      if (m) code = m[1];
      if (/^  \},$/.test(line)) flush();
      continue;
    }
    out.push(line);
  }
  flush();
  await writeFile(path, out.join("\n"));
}

console.log(`Removed ${removed} after-investigate tags, added ${added} success-condition tags.`);

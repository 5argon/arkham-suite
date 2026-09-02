/**
 * Shared helpers for the tags maintenance scripts: package paths, the built corpus, and
 * command-line flags.
 */
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const srcDir = join(root, "src");
export const distDir = join(root, "dist");
export const referenceDir = join(root, "reference");
export const tagsDir = join(srcDir, "tags");

export interface CorpusTag {
  type: string;
  [k: string]: unknown;
}

export interface CorpusCard {
  code: string;
  name: string;
  text: string;
  level?: number;
  cardType?: string;
  icons?: string[];
  tags: CorpusTag[];
  /** The `src/tagged-cards/<pack>.ts` file the card comes from. */
  pack: string;
}

/** The pack ids with a `src/tagged-cards/<pack>.ts` file (dist may hold stale packs). */
export async function listPacks(): Promise<string[]> {
  return (await readdir(join(srcDir, "tagged-cards")))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
}

/** Every tagged card from the BUILT package (run `yarn build` first), stamped with its pack. */
export async function loadCorpus(): Promise<CorpusCard[]> {
  const corpus: CorpusCard[] = [];
  for (const pack of await listPacks()) {
    const mod = await import(join(distDir, "tagged-cards", `${pack}.js`));
    for (const c of mod.default as Omit<CorpusCard, "pack">[]) corpus.push({ ...c, pack });
  }
  return corpus;
}

/** Every tag-definition source file under `src/tags` (excluding the barrels), sorted. */
export async function listTagFiles(): Promise<string[]> {
  const entries = await readdir(tagsDir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".ts") && e.name !== "index.ts")
    .map((e) => join(e.parentPath, e.name))
    .sort();
}

/** The value following `--name` on the command line, or undefined. */
export function flagValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

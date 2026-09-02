/**
 * Convert the official Rules Reference (rules.html) into a clean Markdown reference
 * (reference/rules.md) that tagging agents can consult for game terminology.
 *
 *   node ./script/rules-to-md.ts
 *
 * Walks the DOM with jsdom rather than regex-stripping.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { root } from "./lib.ts";

const html = await readFile(join(root, "rules.html"), "utf8");
const dom = new JSDOM(html);
const doc = dom.window.document;
const { Node } = dom.window;

// Drop the table-of-contents nav; the headings below carry the structure.
doc.querySelector("nav.toc")?.remove();

const collapse = (s: string) => s.replace(/\s+/g, " ");

function renderInline(node: any): string {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      out += collapse(child.textContent ?? "");
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      if (tag === "strong" || tag === "b") out += "**" + renderInline(child).trim() + "**";
      else if (tag === "em" || tag === "i") out += "*" + renderInline(child).trim() + "*";
      else if (tag === "code") out += "`" + renderInline(child).trim() + "`";
      else if (tag === "br") out += " ";
      else out += renderInline(child); // a, span, etc. -> unwrap
    }
  }
  return out;
}

function listItemInline(li: any): string {
  let s = "";
  for (const c of li.childNodes) {
    if (c.nodeType === Node.ELEMENT_NODE) {
      const tag = c.tagName.toLowerCase();
      if (tag === "ul" || tag === "ol") continue; // nested lists handled separately
    }
    s += renderInline({ childNodes: [c] });
  }
  return collapse(s).trim();
}

function renderList(node: any, depth: number): string {
  const ordered = node.tagName.toLowerCase() === "ol";
  let out = "";
  let i = 1;
  for (const li of node.children) {
    if (li.tagName.toLowerCase() !== "li") continue;
    const indent = "  ".repeat(depth);
    const marker = ordered ? `${i}. ` : "- ";
    out += indent + marker + listItemInline(li) + "\n";
    for (const c of li.children) {
      const tag = c.tagName.toLowerCase();
      if (tag === "ul" || tag === "ol") out += renderList(c, depth + 1);
    }
    i++;
  }
  return out;
}

function renderTable(table: any): string {
  const rows = Array.from(table.querySelectorAll("tr")) as any[];
  if (!rows.length) return "";
  const cells = (tr: any) =>
    (Array.from(tr.children) as any[]).map((td) => collapse(renderInline(td)).trim());
  const header = cells(rows[0]);
  let out = "\n| " + header.join(" | ") + " |\n";
  out += "| " + header.map(() => "---").join(" | ") + " |\n";
  for (const r of rows.slice(1)) out += "| " + cells(r).join(" | ") + " |\n";
  return out + "\n";
}

function renderBlock(node: any): string {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = collapse(child.textContent ?? "").trim();
      if (t) out += t + "\n\n";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        out += "#".repeat(Number(tag[1])) + " " + collapse(renderInline(child)).trim() + "\n\n";
      } else if (tag === "p") {
        const t = collapse(renderInline(child)).trim();
        if (t) out += t + "\n\n";
      } else if (tag === "ul" || tag === "ol") {
        out += renderList(child, 0) + "\n";
      } else if (tag === "table") {
        out += renderTable(child);
      } else if (tag === "br") {
        // ignore stray line breaks between blocks
      } else {
        out += renderBlock(child); // div/section/etc.
      }
    }
  }
  return out;
}

let md = renderBlock(doc.body);
md = md.replace(/\n{3,}/g, "\n\n").trim() + "\n";

const header =
  "# Arkham Horror: The Card Game — Rules Reference\n\n" +
  "> Converted from the official Rules Reference (arkhamdb.com/rules) for use as a tagging reference.\n\n";

await mkdir(join(root, "reference"), { recursive: true });
await writeFile(join(root, "reference", "rules.md"), header + md);
console.log(`Wrote reference/rules.md (${(header + md).length} chars)`);

import tagsJson from "../json/input/tags.json" with { type: "json" };

// Group tags by their first prefix
const tagGroups = new Map<string, string[]>();

for (const tag of tagsJson) {
  const name = tag.name as string;
  const firstPart = name.split("_")[0];
  
  if (!tagGroups.has(firstPart)) {
    tagGroups.set(firstPart, []);
  }
  tagGroups.get(firstPart)!.push(name);
}

// Sort and display
const sorted = Array.from(tagGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]));

for (const [prefix, tags] of sorted) {
  console.log(`\n=== ${prefix} (${tags.length} tags) ===`);
  console.log(tags.slice(0, 10).join("\n"));
  if (tags.length > 10) {
    console.log(`... and ${tags.length - 10} more`);
  }
}

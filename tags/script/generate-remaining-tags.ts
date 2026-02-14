import tagsJson from "../json/input/tags.json" with { type: "json" };
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Manual categorization of tags into folders and files
const categoryMap: Record<string, { folder: string; file: string }> = {
  // Doom
  "doom_add": { folder: "doom", file: "index" },
  "doom_check": { folder: "doom", file: "index" },
  "doom_remove": { folder: "doom", file: "index" },
  
  // Gain
  "gain_aloof": { folder: "gain", file: "keyword" },
  "gain_retaliate": { folder: "gain", file: "keyword" },
  "gain_resource": { folder: "gain", file: "resource" },
  "gain_resource_1": { folder: "gain", file: "resource" },
  "gain_resource_2": { folder: "gain", file: "resource" },
  "gain_resource_3": { folder: "gain", file: "resource" },
  "gain_resource_4": { folder: "gain", file: "resource" },
  "gain_resource_5": { folder: "gain", file: "resource" },
  "gain_resource_6": { folder: "gain", file: "resource" },
  "gain_resource_9": { folder: "gain", file: "resource" },
  "gain_resource_10": { folder: "gain", file: "resource" },
  
  // Lose
  "lose_action": { folder: "lose", file: "index" },
  
  // Skill (card type)
  "skill_another_investigator": { folder: "skill", file: "target" },
  "skill_benefit_performing": { folder: "skill", file: "benefit" },
  "skill_gains_agility": { folder: "skill", file: "gains" },
  "skill_gains_combat": { folder: "skill", file: "gains" },
  "skill_gains_wild": { folder: "skill", file: "gains" },
  "skill_gains_willpower": { folder: "skill", file: "gains" },
  "skill_gains_willpower_wild": { folder: "skill", file: "gains" },
  "skill_icons": { folder: "skill", file: "icons" },
  
  // Stat
  "stat_add_agility": { folder: "stat", file: "add" },
  "stat_add_agility_for_attack": { folder: "stat", file: "add" },
  "stat_add_agility_for_investigate": { folder: "stat", file: "add" },
  "stat_add_intellect_for_agility": { folder: "stat", file: "add" },
  "stat_add_intellect_for_combat": { folder: "stat", file: "add" },
  "stat_add_intellect_for_evade": { folder: "stat", file: "add" },
  "stat_add_willpower": { folder: "stat", file: "add" },
  "stat_add_willpower_for_attack": { folder: "stat", file: "add" },
  "stat_add_willpower_for_evade": { folder: "stat", file: "add" },
  "stat_add_willpower_for_investigate": { folder: "stat", file: "add" },
  "stat_base_6": { folder: "stat", file: "base" },
  "stat_base_agility_6": { folder: "stat", file: "base" },
  "stat_base_combat_4": { folder: "stat", file: "base" },
  "stat_base_combat_6": { folder: "stat", file: "base" },
  "stat_base_intellect_4": { folder: "stat", file: "base" },
  "stat_base_set": { folder: "stat", file: "base" },
  "stat_from_spent_resource": { folder: "stat", file: "misc" },
  "stat_not_agility": { folder: "stat", file: "restriction" },
  "stat_not_combat": { folder: "stat", file: "restriction" },
  "stat_not_intellect": { folder: "stat", file: "restriction" },
  "stat_use_agility": { folder: "stat", file: "use" },
  "stat_use_combat": { folder: "stat", file: "use" },
  "stat_use_intellect": { folder: "stat", file: "use" },
  "stat_use_willpower": { folder: "stat", file: "use" },
  
  // Uses
  "uses_add_ammo": { folder: "uses", file: "add" },
  "uses_add_charge": { folder: "uses", file: "add" },
  "uses_add_secret": { folder: "uses", file: "add" },
  "uses_add_supply": { folder: "uses", file: "add" },
  "uses_manip_charge_spend": { folder: "uses", file: "manipulate" },
  "uses_manip_charge_to_resource": { folder: "uses", file: "manipulate" },
  "uses_manip_secret_to_resource": { folder: "uses", file: "manipulate" },
  "uses_replenish": { folder: "uses", file: "replenish" },
  "uses_starting_0": { folder: "uses", file: "starting" },
  "uses_starting_1": { folder: "uses", file: "starting" },
  "uses_starting_2": { folder: "uses", file: "starting" },
  "uses_starting_3": { folder: "uses", file: "starting" },
  "uses_starting_4": { folder: "uses", file: "starting" },
  "uses_starting_5": { folder: "uses", file: "starting" },
  "uses_starting_6": { folder: "uses", file: "starting" },
  "uses_starting_7": { folder: "uses", file: "starting" },
  "uses_starting_8": { folder: "uses", file: "starting" },
  "uses_starting_9": { folder: "uses", file: "starting" },
  "uses_starting_10": { folder: "uses", file: "starting" },
  "uses_support_charge": { folder: "uses", file: "support" },
  "uses_type_aether": { folder: "uses", file: "type" },
  "uses_type_ammo": { folder: "uses", file: "type" },
  "uses_type_bounties": { folder: "uses", file: "type" },
  "uses_type_charge": { folder: "uses", file: "type" },
  "uses_type_durability": { folder: "uses", file: "type" },
  "uses_type_evidence": { folder: "uses", file: "type" },
  "uses_type_keys": { folder: "uses", file: "type" },
  "uses_type_leylines": { folder: "uses", file: "type" },
  "uses_type_offerings": { folder: "uses", file: "type" },
  "uses_type_resource": { folder: "uses", file: "type" },
  "uses_type_secret": { folder: "uses", file: "type" },
  "uses_type_supply": { folder: "uses", file: "type" },
  "uses_type_time": { folder: "uses", file: "type" },
  "uses_type_tries": { folder: "uses", file: "type" },
};

// Convert snake_case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

// Convert snake_case to kebab-case
function toKebabCase(str: string): string {
  return str.replace(/_/g, "-");
}

// Group tags by folder and file
const groupedTags: Record<string, Record<string, string[]>> = {};

for (const tag of tagsJson as Array<{ name: string }>) {
  const mapping = categoryMap[tag.name];
  if (!mapping) continue;
  
  const { folder, file } = mapping;
  if (!groupedTags[folder]) {
    groupedTags[folder] = {};
  }
  if (!groupedTags[folder][file]) {
    groupedTags[folder][file] = [];
  }
  groupedTags[folder][file].push(tag.name);
}

// Generate TypeScript files
for (const [folder, files] of Object.entries(groupedTags)) {
  for (const [file, tags] of Object.entries(files)) {
    const enumName = `TagType${toPascalCase(folder)}${file === "index" ? "" : toPascalCase(file)}`;
    const baseName = `Tag${toPascalCase(folder)}${file === "index" ? "" : toPascalCase(file)}Base`;
    
    let content = `import { TagBase } from "../../base.js";\n\n`;
    
    // Generate enum
    content += `export enum ${enumName} {\n`;
    for (const tag of tags) {
      const enumKey = toPascalCase(tag);
      const enumValue = toKebabCase(tag);
      content += `  ${enumKey} = "${enumValue}",\n`;
    }
    content += `}\n\n`;
    
    // Generate base interface
    content += `interface ${baseName} extends TagBase {}\n\n`;
    
    // Generate specific interfaces
    for (const tag of tags) {
      const interfaceName = `Tag${toPascalCase(tag)}`;
      const enumKey = toPascalCase(tag);
      content += `export interface ${interfaceName} extends ${baseName} {\n`;
      content += `  type: ${enumName}.${enumKey};\n`;
      content += `}\n\n`;
    }
    
    // Write file
    const filePath = `../src/tags/${folder}/${file}.ts`;
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
    console.log(`Created ${filePath}`);
  }
  
  // Generate index.ts for the folder
  const indexPath = `../src/tags/${folder}/index.ts`;
  const files = Object.keys(groupedTags[folder]);
  let indexContent = "";
  for (const file of files) {
    indexContent += `export * from "./${file}.js";\n`;
  }
  writeFileSync(indexPath, indexContent);
  console.log(`Created ${indexPath}`);
}

console.log("Done!");

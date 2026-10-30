import * as fs from "jsr:@std/fs";

const inputFile: string = "tool/selection.json";
const svgFolder: string = "tool/svg";
/**
 * Icons that are not in the ArkhamCards IcoMoon export, kept as standalone
 * SVGs. See the README in that folder for where each one comes from.
 */
const extraSvgFolder: string = "tool/svg-arkham-build";
const styleFile: string = "tool/style.css";
const outputSvelteFolder: string = "src/lib/individual/svelte";
const outputReactFolder: string = "src/lib/individual/react";

interface Icon {
  paths: string[];
  attrs: unknown[];
  width: number;
  isMulticolor: boolean;
  isMulticolor2: boolean;
  grid: number;
  tags: string[];
}

interface IconOuter {
  icon: Icon;
  attrs: unknown[];
  properties: {
    order: number;
    id: number;
    name: string;
    prevSize: number;
    code: number;
  };
  setIdx: number;
  setId: number;
  iconIdx: number;
}

interface Json {
  icons: IconOuter[];
}

const readCss = await Deno.readTextFile(styleFile);

await fs.emptyDir(outputSvelteFolder);
await fs.emptyDir(outputReactFolder);

const inputText = await Deno.readTextFile(inputFile);
const inputJson = JSON.parse(inputText) as Json;
const allIcons = inputJson.icons;

const componentNames = assignComponentNames(allIcons);

const promises: Promise<void>[] = [];
console.log("Generating...");
for (const outerIcon of allIcons) {
  promises.push(
    generateSvelte(
      await readSvg(`${svgFolder}/${outerIcon.properties.name}.svg`),
      getStyleWidth(outerIcon),
      componentNames.get(outerIcon.properties.name)!
    )
  );
}

const takenNames = new Set(
  [...componentNames.values()].map((n) => n.toLowerCase())
);
for await (const entry of Deno.readDir(extraSvgFolder)) {
  if (!entry.isFile || !entry.name.endsWith(".svg")) continue;
  const name = entry.name.slice(0, -".svg".length);
  const componentName = makeIconComponentName(name);
  if (takenNames.has(componentName.toLowerCase())) {
    throw new Error(
      `${extraSvgFolder}/${entry.name} collides with existing component ${componentName}`
    );
  }
  takenNames.add(componentName.toLowerCase());
  const svg = await readSvg(`${extraSvgFolder}/${entry.name}`);
  promises.push(generateSvelte(svg, getViewBoxWidth(svg), componentName));
}
await Promise.all(promises);
console.log("Done");

/**
 * Output PascalCase, e.g. "arrow_left" -> "ArrowLeft".
 * Icons are originally tagged in snake_case.
 * If "-" is found in front of number like "-4", turn into "Minus4". Any
 * other places, remove them.
 */
function makeIconComponentName(tagName: string): string {
  const words = tagName.split("_");
  const result = words.map((word) => {
    if (word.startsWith("-")) {
      return `Minus${word.slice(1)}`;
    }
    // Remove any other dashes.
    word = word.replaceAll("-", "");
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return result.join("");
}

/**
 * Map each icon name to a component name. Names that differ only by case
 * (e.g. "check_circle" -> "CheckCircle" and "check-circle" -> "Checkcircle")
 * would overwrite each other on a case-insensitive file system, so the later
 * one gets a numeric suffix like IcoMoon does for duplicated names.
 */
function assignComponentNames(icons: IconOuter[]): Map<string, string> {
  const baseNames = icons.map((i) => makeIconComponentName(i.properties.name));
  const taken = new Set<string>();
  const reserved = new Set(baseNames.map((n) => n.toLowerCase()));
  const result = new Map<string, string>();
  icons.forEach((icon, idx) => {
    const base = baseNames[idx];
    let name = base;
    if (taken.has(name.toLowerCase())) {
      let suffix = 1;
      while (
        taken.has(`${base}${suffix}`.toLowerCase()) ||
        reserved.has(`${base}${suffix}`.toLowerCase())
      ) {
        suffix++;
      }
      name = `${base}${suffix}`;
      console.log(`Renamed ${icon.properties.name} -> ${name}`);
    }
    taken.add(name.toLowerCase());
    result.set(icon.properties.name, name);
  });
  return result;
}

function getStyleWidth(icon: IconOuter): number {
  /**
   * Style in the file is in this format, extract the em number.
      .ahicon-the_road_to_oz {
        width: 1.0107421875em;
      }
   */
  const name = `.ahicon-${icon.properties.name}`;
  const cssString = readCss;
  const regex = new RegExp(`${name}\\s*{\\s*width:\\s*([\\d.]+)em;\\s*}`);
  const match = cssString.match(regex);
  if (match) {
    return parseFloat(match[1]);
  }
  return 1; // Default width if not found
}

/**
 * Width in em for icons without a style.css entry: the viewBox aspect ratio,
 * since every icon is rendered 1em tall.
 */
function getViewBoxWidth(svg: string): number {
  const match = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
  if (!match) return 1;
  return parseFloat(match[1]) / parseFloat(match[2]);
}

async function readSvg(iconPath: string): Promise<string> {
  const svgText = await Deno.readTextFile(iconPath);
  // Add class="icon" to the svg element.
  const svgWithClass = svgText.replace("<svg", '<svg class="icon"');
  return svgWithClass;
}

async function generateSvelte(
  svg: string,
  styleWidth: number,
  componentName: string
): Promise<void> {
  const svelteContent = `${svg}
<style>
  .icon {
    display: inline-block;
    width: ${styleWidth}em;
    height: 1em;
    stroke-width: 0;
    stroke: currentColor;
    fill: currentColor;
  }
</style>
  `;
  await Deno.writeTextFile(
    `${outputSvelteFolder}/${componentName}.svelte`,
    svelteContent
  );
}

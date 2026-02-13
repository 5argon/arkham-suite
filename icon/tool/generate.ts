import * as fs from "jsr:@std/fs";

const inputFile: string = "tool/selection.json";
const svgFolder: string = "tool/svg";
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

const promises: Promise<void>[] = [];
console.log("Generating...");
for (const outerIcon of allIcons) {
  promises.push(generateSvelte(outerIcon));
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
    word = word.replace("-", "");
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return result.join("");
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

async function readSvg(icon: IconOuter): Promise<string> {
  const iconPath = `${svgFolder}/${icon.properties.name}.svg`;
  const svgText = await Deno.readTextFile(iconPath);
  // Add class="icon" to the svg element.
  const svgWithClass = svgText.replace("<svg", '<svg class="icon"');
  return svgWithClass;
}

async function generateSvelte(iconOuter: IconOuter): Promise<void> {
  const componentName = makeIconComponentName(iconOuter.properties.name);
  const svg = await readSvg(iconOuter);
  const styleWidth = getStyleWidth(iconOuter);
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

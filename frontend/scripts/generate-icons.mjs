// Erzeugt src/icons.ts aus scripts/icons.json (Google Material Symbols, SVG).
//
// Aufruf: npm run icons
// Neue Icons: Namen in scripts/icons.json ergänzen (Namen siehe
// https://fonts.google.com/icons) und das Skript erneut ausführen.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconDir = join(root, "node_modules", "@material-symbols", "svg-400", "outlined");
const groups = JSON.parse(readFileSync(join(root, "scripts", "icons.json"), "utf8"));
const names = [...new Set(Object.values(groups).flat())];

const ident = (name, filled) => `${name.replaceAll("_", "")}${filled ? "Fill" : ""}`;

for (const name of names) {
  for (const suffix of ["", "-fill"]) {
    if (!existsSync(join(iconDir, `${name}${suffix}.svg`))) {
      console.error(`Icon not found: ${name}${suffix}`);
      process.exit(1);
    }
  }
}

const imports = names.flatMap((name) => [
  `import ${ident(name, false)} from "@material-symbols/svg-400/outlined/${name}.svg?raw";`,
  `import ${ident(name, true)} from "@material-symbols/svg-400/outlined/${name}-fill.svg?raw";`,
]);

const entries = names.map(
  (name) =>
    `  ${name}: { outlined: pathOf(${ident(name, false)}), filled: pathOf(${ident(name, true)}) },`,
);

const source = `/**
 * Icons aus Google Material Symbols (Apache-2.0), als SVG-Pfade eingebunden.
 * Es landen nur die hier gelisteten Icons im Bundle, kein Font und keine
 * externen Anfragen.
 *
 * Diese Datei wird erzeugt (npm run icons), nicht von Hand bearbeiten.
 * Neue Icons: Namen in scripts/icons.json ergänzen.
 */

${imports.join("\n")}

/** Extrahiert die Pfaddaten (d) aus einem SVG-String. */
function pathOf(svg: string): string {
  const match = /\\sd="([^"]+)"/.exec(svg);

  if (!match) {
    throw new Error("Icon without path data");
  }

  return match[1];
}

export const ICON_NAMES = [
${names.map((name) => `  "${name}",`).join("\n")}
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICONS: Record<IconName, { outlined: string; filled: string }> = {
${entries.join("\n")}
};
`;

writeFileSync(join(root, "src", "icons.ts"), source);
console.log(`${names.length} icons written to src/icons.ts`);

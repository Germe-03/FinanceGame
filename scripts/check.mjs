// Syntax-Check für alle JS-Module des Projekts (node --check).
// Neue Dateien werden automatisch erfasst — kein Pflegen einer Liste nötig.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const targets = [
  "server.mjs",
  ...collectJsFiles("src"),
  ...collectJsFiles("scripts"),
  ...collectJsFiles("tests"),
];

let failed = false;
for (const file of targets) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failed = true;
    console.error(`✖ ${file}\n${result.stderr}`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(`✔ ${targets.length} Dateien geprüft, keine Syntaxfehler.`);

function collectJsFiles(directory) {
  return readdirSync(directory, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith(".js") || name.endsWith(".mjs"))
    .map((name) => join(directory, name));
}

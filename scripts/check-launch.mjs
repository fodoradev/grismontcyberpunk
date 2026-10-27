// Pre-launch gate (docs/content-plan/00-README.md): fail while the source still holds content-pack placeholders.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["app", "components", "content", "data", "lib"];
const marker = /\{\{(FILL|DECIDE|CHECK)\b[^}]*\}\}/g;
const hits = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(tsx?|css|mjs)$/.test(entry.name)) {
      (await readFile(file, "utf8")).split("\n").forEach((line, i) => {
        for (const m of line.matchAll(marker)) hits.push(`${file}:${i + 1}  ${m[0]}`);
      });
    }
  }
}

for (const root of roots) await walk(root);
if (hits.length) {
  console.error(`Not ready to launch: ${hits.length} unresolved placeholder(s).\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("No unresolved {{FILL}}, {{DECIDE}} or {{CHECK}} placeholders.");

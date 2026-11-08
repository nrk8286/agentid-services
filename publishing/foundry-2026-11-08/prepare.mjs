import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const expectedModules = {
  "portfolio-wrapper.mjs": "855713f2cafad6b50554caecd5376deae6afc9467d97d24b1ab69e3a71801bd4",
  "index.js": "04fdebf7ee26ebe13a7e7d7603077e7df44f4cd30d0f653d09a02d99b6c056ff",
  "portfolio-ui.mjs": "efd821c4d42c62773a9e3174e70fdf7fa3f5d22f306240272c3ab4ca21c37d7b"
};
export const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function patchIndex(bytes) {
  if (digest(bytes) !== expectedModules["index.js"]) throw new Error("Live publisher baseline changed; inspect and prepare a new publication");
  const source = bytes.toString("utf8");
  const marker = "// src/publisher-site.js";
  if (source.split(marker).length !== 2) throw new Error("Expected one publisher insertion point");
  return Buffer.from('import { applyFoundryPublication } from "./foundry-promotion.mjs";\n' + source.replace(marker, "publisherArticles = applyFoundryPublication(publisherArticles);\n\n" + marker));
}
export async function prepare(baselineDirectory, outputDirectory) {
  const baseline = path.resolve(baselineDirectory), output = path.resolve(outputDirectory);
  if (baseline === output) throw new Error("Output must be a new directory");
  const manifest = JSON.parse(await fs.readFile(path.join(baseline, "manifest.json"), "utf8"));
  if (JSON.stringify(manifest.modules.map(({ name }) => name).sort()) !== JSON.stringify(Object.keys(expectedModules).sort())) throw new Error("Unexpected baseline module set");
  const modules = [];
  for (const [name, hash] of Object.entries(expectedModules)) {
    const bytes = await fs.readFile(path.join(baseline, name));
    if (digest(bytes) !== hash) throw new Error(`Baseline hash mismatch: ${name}`);
    modules.push({ name, bytes: name === "index.js" ? patchIndex(bytes) : bytes });
  }
  modules.push({ name: "foundry-promotion.mjs", bytes: await fs.readFile(new URL("./foundry-promotion.mjs", import.meta.url)) });
  await fs.mkdir(output); // Fail if it already exists; never overwrite a prior release.
  for (const { name, bytes } of modules) await fs.writeFile(path.join(output, name), bytes, { flag: "wx" });
  const result = { entrypoint: "portfolio-wrapper.mjs", baseline: expectedModules, modules: modules.map(({ name, bytes }) => ({ name, type: "application/javascript+module", bytes: bytes.length, sha256: digest(bytes) })) };
  await fs.writeFile(path.join(output, "manifest.json"), JSON.stringify(result, null, 2), { flag: "wx" });
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error("Usage: node prepare.mjs <captured-live-modules-directory> <new-output-directory>");
  console.log(JSON.stringify(await prepare(process.argv[2], process.argv[3]), null, 2));
}

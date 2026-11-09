import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { digest } from "../foundry-2026-11-08/prepare.mjs";

export const expectedModules = {
  "portfolio-wrapper.mjs": "855713f2cafad6b50554caecd5376deae6afc9467d97d24b1ab69e3a71801bd4",
  "index.js": "9cc7bc65222648576b425830c1d950c84a61292c5e60b6b8a846b7c2fc4d21ca",
  "portfolio-ui.mjs": "efd821c4d42c62773a9e3174e70fdf7fa3f5d22f306240272c3ab4ca21c37d7b",
  "foundry-promotion.mjs": "c97946a35af62ccc3aa1f0db1540ed33f128ff085ed02c39779f2ca658aeb0a2"
};
export function patchIndex(bytes) {
  if (digest(bytes) !== expectedModules["index.js"]) throw new Error("Live publisher baseline changed; inspect before patching");
  const source = bytes.toString("utf8");
  const oldLine = '  return [...new Set(agentIdIndexablePaths(env).map((path) => `${siteUrl2(env)}${path}`))];';
  if (source.split(oldLine).length !== 2) throw new Error("Expected one IndexNow URL generator");
  const newLine = '  return includePublishedGuides([...new Set(agentIdIndexablePaths(env).map((path) => `${siteUrl2(env)}${path}`))], publisherArticles, { enabled: publisherEnabled(env), origin: siteUrl2(env) });';
  return Buffer.from('import { includePublishedGuides } from "./guide-discovery.mjs";\n' + source.replace(oldLine, newLine));
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
  modules.push({ name: "guide-discovery.mjs", bytes: await fs.readFile(new URL("./guide-discovery.mjs", import.meta.url)) });
  await fs.mkdir(output);
  for (const { name, bytes } of modules) await fs.writeFile(path.join(output, name), bytes, { flag: "wx" });
  const result = { entrypoint: "portfolio-wrapper.mjs", baseline: expectedModules, modules: modules.map(({ name, bytes }) => ({ name, type: "application/javascript+module", bytes: bytes.length, sha256: digest(bytes) })) };
  await fs.writeFile(path.join(output, "manifest.json"), JSON.stringify(result, null, 2), { flag: "wx" });
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error("Usage: node prepare.mjs <captured-live-modules-directory> <new-output-directory>");
  console.log(JSON.stringify(await prepare(process.argv[2], process.argv[3]), null, 2));
}

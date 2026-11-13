import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { digest } from "../foundry-2026-11-08/prepare.mjs";

export const expectedModules = {
  "foundry-promotion.mjs": "c97946a35af62ccc3aa1f0db1540ed33f128ff085ed02c39779f2ca658aeb0a2",
  "guide-discovery.mjs": "ad0db311ba894b7660555443b3bb1087e306610d65d98c74f8362215d1b2cf66",
  "index.js": "3569d232314eeebccf62a7a3155198b39ba8a90a192b55c9cf31e1422d6a845f",
  "portfolio-ui.mjs": "efd821c4d42c62773a9e3174e70fdf7fa3f5d22f306240272c3ab4ca21c37d7b",
  "portfolio-wrapper.mjs": "855713f2cafad6b50554caecd5376deae6afc9467d97d24b1ab69e3a71801bd4"
};

export async function prepare(baselineDirectory, outputDirectory) {
  const baseline=path.resolve(baselineDirectory), output=path.resolve(outputDirectory);
  if(baseline===output) throw new Error("Output must be a new directory");
  const manifest=JSON.parse(await fs.readFile(path.join(baseline,"manifest.json"),"utf8"));
  if(JSON.stringify(manifest.modules.map(({name})=>name).sort())!==JSON.stringify(Object.keys(expectedModules).sort())) throw new Error("Unexpected baseline module set");
  const modules=[];
  for(const [name,hash] of Object.entries(expectedModules)) {
    const original=await fs.readFile(path.join(baseline,name));
    if(digest(original)!==hash) throw new Error(`Baseline hash mismatch: ${name}`);
    const bytes=name==="foundry-promotion.mjs"?await fs.readFile(new URL("../foundry-2026-11-08/foundry-promotion.mjs",import.meta.url)):original;
    modules.push({name,bytes});
  }
  await fs.mkdir(output);
  for(const {name,bytes} of modules) await fs.writeFile(path.join(output,name),bytes,{flag:"wx"});
  const result={entrypoint:"portfolio-wrapper.mjs",baseline:expectedModules,modules:modules.map(({name,bytes})=>({name,type:"application/javascript+module",bytes:bytes.length,sha256:digest(bytes)}))};
  await fs.writeFile(path.join(output,"manifest.json"),JSON.stringify(result,null,2),{flag:"wx"});
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length!==4) throw new Error("Usage: node prepare.mjs <captured-live-modules-directory> <new-output-directory>");
  console.log(JSON.stringify(await prepare(process.argv[2],process.argv[3]),null,2));
}

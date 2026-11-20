import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// A source-only copy correction for the separately captured publisher runtime.
// No Cloudflare client, credentials, configuration, or deployment operations.
const corrections = [
  {
    id: "cuekeeper", destination: "cuekeeper",
    before: "Requires Python and a Base USDC wallet for checkout. It does not transcribe audio or translate text.",
    after: "Requires Python 3.10+. Pay $1 USD with PayPal or 1 USDC on Base. A compatible wallet is needed only for USDC. It does not transcribe audio or translate text.",
  },
  {
    id: "recovery-evidence", destination: "supabase-recovery",
    before: "Requires Python and a Base USDC wallet. It does not access or repair databases, diagnose root cause, or contact support.",
    after: "Requires Python 3.10+. Pay $1 USD with PayPal or 1 USDC on Base. A compatible wallet is needed only for USDC. It does not access or repair databases, diagnose root cause, or contact support.",
  },
];
const oldPrice = 'price: "$1 USDC one time"';
const newPrice = 'price: "$1 USD via PayPal or 1 USDC on Base, one time"';
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function correctCheckoutCopy(source) {
  let candidate = source;
  for (const { id, destination, before, after } of corrections) {
    const pattern = new RegExp(`^[ \\t]*\\{ id: "${id}",[^\\r\\n]*\\},?$`, "gm");
    const matches = [...candidate.matchAll(pattern)];
    assert.equal(matches.length, 1, `Expected one unchanged ${id} catalog record`);
    const record = matches[0][0];
    for (const expected of [oldPrice, `boundary: ${JSON.stringify(before)}`, `href: "https://score.agentid.life/${destination}"`]) {
      assert.equal(record.split(expected).length - 1, 1, `Review changed ${id} catalog copy before preparing`);
    }
    const corrected = record.replace(oldPrice, newPrice).replace(`boundary: ${JSON.stringify(before)}`, `boundary: ${JSON.stringify(after)}`);
    candidate = candidate.slice(0, matches[0].index) + corrected + candidate.slice(matches[0].index + record.length);
  }
  return candidate;
}

export async function prepare(input, output, expectedSha256) {
  assert.match(expectedSha256 || "", /^[a-f0-9]{64}$/, "Pin the reviewed input SHA-256");
  assert.notEqual(path.resolve(input), path.resolve(output), "Use a new output file");
  const original = await readFile(input);
  assert.equal(sha256(original), expectedSha256, "Captured source changed after review");
  const source = original.toString("utf8");
  assert.ok(Buffer.from(source).equals(original), "Expected UTF-8 JavaScript");
  const candidate = Buffer.from(correctCheckoutCopy(source));
  await writeFile(output, candidate, { flag: "wx", mode: 0o600 });
  return { inputSha256: sha256(original), outputSha256: sha256(candidate), changedOffers: corrections.map(({ id }) => id), deployed: false };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 5, "Usage: node prepare.mjs <captured-index.js> <new-output.js> <reviewed-input-sha256>");
  console.log(JSON.stringify(await prepare(...process.argv.slice(2)), null, 2));
}

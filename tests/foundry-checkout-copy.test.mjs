import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";
import { correctCheckoutCopy, prepare } from "../publishing/foundry-2026-11-19/prepare.mjs";

const fixture = `var offers = [
  { id: "cuekeeper", price: "$1 USDC one time", href: "https://score.agentid.life/cuekeeper", boundary: "Requires Python and a Base USDC wallet for checkout. It does not transcribe audio or translate text.", includes: ["Local UI"] },
  { id: "recovery-evidence", price: "$1 USDC one time", href: "https://score.agentid.life/supabase-recovery", boundary: "Requires Python and a Base USDC wallet. It does not access or repair databases, diagnose root cause, or contact support.", includes: ["Timeline"] },
  { id: "other", price: "$1 USDC one time", href: "/other", boundary: "Preserve this offer." }
];
// Keep all unrelated runtime code intact.
`;
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const catalog = (source) => JSON.parse(JSON.stringify(vm.runInNewContext(source + "\noffers")));

test("both toolkit offers expose PayPal without changing links, limits or other products", () => {
  const before = catalog(fixture), after = catalog(correctCheckoutCopy(fixture));
  for (let i = 0; i < 2; i++) {
    assert.match(after[i].price, /\$1 USD via PayPal or 1 USDC on Base, one time/);
    assert.match(after[i].boundary, /Requires Python 3\.10\+/);
    assert.match(after[i].boundary, /wallet is needed only for USDC/);
    assert.equal(after[i].boundary.split("It does not")[1], before[i].boundary.split("It does not")[1]);
    assert.deepEqual({ ...after[i], price: before[i].price, boundary: before[i].boundary }, before[i]);
  }
  assert.deepEqual(after[2], before[2]);
  assert.ok(correctCheckoutCopy(fixture).endsWith("// Keep all unrelated runtime code intact.\n"));
});

test("changed, missing, duplicate or already-corrected offers require a fresh review", () => {
  for (const source of [
    fixture.replace('id: "cuekeeper"', 'id: "retired"'),
    fixture + fixture,
    fixture.replace('price: "$1 USDC one time"', 'price: "$2 USDC one time"'),
    fixture.replace('href: "https://score.agentid.life/cuekeeper"', 'href: "https://example.com/other"'),
    correctCheckoutCopy(fixture),
  ]) assert.throws(() => correctCheckoutCopy(source));
});

test("preparation checks the captured hash and preserves source and existing outputs", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "foundry-copy-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const input = path.join(dir, "input.js"), output = path.join(dir, "candidate.js");
  await writeFile(input, fixture);
  await assert.rejects(prepare(input, output, "0".repeat(64)), /changed after review/);
  await assert.rejects(readFile(output), { code: "ENOENT" });
  await assert.rejects(prepare(input, input, digest(fixture)), /new output/);
  const result = await prepare(input, output, digest(fixture));
  assert.equal(result.deployed, false);
  assert.equal(result.outputSha256, digest(await readFile(output)));
  await assert.rejects(prepare(input, output, digest(fixture)), { code: "EEXIST" });
  assert.equal(await readFile(input, "utf8"), fixture);
});

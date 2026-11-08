import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { applyFoundryPublication, cueArticle, cueSlug, recoveryArticle, recoverySlug } from "../publishing/foundry-2026-11-08/foundry-promotion.mjs";
import { patchIndex } from "../publishing/foundry-2026-11-08/prepare.mjs";

test("publication changes only the targeted article and prepends one new guide", () => {
  const existing = [{ slug: cueSlug, bodyHtml: "old" }, { slug: "existing-review", bodyHtml: "keep", status: "published" }, { slug: "draft", status: "draft" }];
  const before = structuredClone(existing);
  const result = applyFoundryPublication(existing);
  assert.equal(result.length, existing.length + 1);
  assert.equal(result[0], recoveryArticle);
  assert.equal(result[1], cueArticle);
  assert.equal(result[2], existing[1]);
  assert.equal(result[3], existing[2]);
  assert.deepEqual(existing, before);
  assert.throws(() => applyFoundryPublication(result), /already published/);
  assert.throws(() => applyFoundryPublication([]), /exactly one/);
  assert.throws(() => applyFoundryPublication([{ slug: cueSlug }, { slug: cueSlug }]), /exactly one/);
});
test("unknown deployed source fails closed before a patch can be produced", () => {
  assert.throws(() => patchIndex(Buffer.from("// src/publisher-site.js")), /baseline changed/);
});
test("commercial links identify the product and evidence scope is explicit", async () => {
  const evidence = JSON.parse(await readFile(new URL("../publishing/foundry-2026-11-08/evidence.json", import.meta.url), "utf8"));
  for (const [article, product, ref, sample] of [[cueArticle, "cuekeeper", "gmp-cuekeeper-guide", evidence.products[0]], [recoveryArticle, "supabase-recovery", "gmp-recovery-guide", evidence.products[1]]]) {
    assert.equal(article.status, "published");
    assert.match(article.bodyHtml, /share ownership/);
    assert.match(article.bodyHtml, /AI assistance/);
    assert.match(article.bodyHtml, /Python 3\.10/);
    assert.match(article.testing.limits, /synthetic/);
    assert(article.bodyHtml.includes(`${product}/paypal?ref=${ref}`));
    assert(article.bodyHtml.includes(sample.command));
    assert.equal(sample.exit_status, 0);
    assert(sample.observed_files.every(file => article.bodyHtml.includes(file)));
    assert.equal(new URL(article.prices[0].url).searchParams.get("ref"), ref);
    assert.match(article.prices[0].price, /\$1\.00 USD with PayPal; or 1\.00 USDC on Base/);
    for (const match of article.bodyHtml.matchAll(/href="([^"]+)"/g)) assert.equal(new URL(match[1]).protocol, "https:");
  }
  assert.equal(recoveryArticle.slug, recoverySlug);
  assert.match(recoveryArticle.bodyHtml, /not affiliated with Supabase/);
  assert.match(recoveryArticle.bodyHtml, /before creating the input file/);
});

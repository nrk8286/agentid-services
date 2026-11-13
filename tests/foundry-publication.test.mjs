import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import { applyFoundryPublication, cueArticle, cueSlug, recoveryArticle, recoverySlug, cueExampleArticle, recoveryExampleArticle, cueExampleSlug, recoveryExampleSlug } from "../publishing/foundry-2026-11-08/foundry-promotion.mjs";
import { patchIndex } from "../publishing/foundry-2026-11-08/prepare.mjs";

test("publication preserves unrelated articles and adds distinct Foundry guides", () => {
  const existing = [{ slug: cueSlug, bodyHtml: "old" }, { slug: "existing-review", bodyHtml: "keep", status: "published" }, { slug: "draft", status: "draft" }];
  const before = structuredClone(existing);
  const result = applyFoundryPublication(existing);
  assert.equal(result.length, existing.length + 3);
  assert.equal(result[0], cueExampleArticle);
  assert.equal(result[1], recoveryExampleArticle);
  assert.equal(result[2], recoveryArticle);
  assert.equal(result[3], cueArticle);
  assert.equal(result[4], existing[1]);
  assert.equal(result[5], existing[2]);
  assert.deepEqual(existing, before);
  assert.throws(() => applyFoundryPublication(result), /already published/);
  assert.throws(() => applyFoundryPublication([]), /exactly one/);
  assert.throws(() => applyFoundryPublication([{ slug: cueSlug }, { slug: cueSlug }]), /exactly one/);
  for (const slug of [cueExampleSlug,recoveryExampleSlug]) assert.throws(() => applyFoundryPublication([{slug:cueSlug},{slug}]), /already published/);
});

test("published examples match the captured synthetic artifacts and attribution", async () => {
  const base = new URL("../publishing/foundry-2026-11-12/", import.meta.url);
  const evidence = JSON.parse(await readFile(new URL("evidence.json", base), "utf8"));
  for (const product of evidence.products) {
    assert.equal(product.exit_status, 0);
    for (const file of product.files) {
      const bytes = await readFile(new URL(file.published, base));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
    }
  }
  const escape = text => text.trim().replaceAll("\r\n", "\n").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  for (const file of ["valid.srt", "valid.md", "valid.dialogue.txt"]) {
    const text = await readFile(new URL(`samples/cuekeeper/${file}`, base), "utf8");
    assert(cueExampleArticle.bodyHtml.includes(escape(text)), `Published excerpt differs: ${file}`);
  }
  const report = JSON.parse(await readFile(new URL("samples/recovery/report.json", base), "utf8"));
  assert.equal(report.review.status, "pending");
  assert.equal(report.configuration.contradiction_window_minutes, 15);
  assert.deepEqual(report.contradictions[0].source_ids, ["control-1", "control-2"]);
  assert.match(recoveryExampleArticle.bodyHtml, /does not complete a human review/);
  assert.match(recoveryExampleArticle.bodyHtml, /may describe a state transition/);
  for (const [article, product, ref] of [[cueExampleArticle, "cuekeeper", "gmp-cue-example-20261112"], [recoveryExampleArticle, "supabase-recovery", "gmp-recovery-example-20261112"]]) {
    assert.match(article.bodyHtml, /We own and sell/);
    assert.match(article.bodyHtml, /AI assistance/);
    assert(article.bodyHtml.includes(`${product}/paypal?ref=${ref}`));
    assert.equal(new URL(article.prices[0].url).searchParams.get("ref"), ref);
    assert.match(article.testing.limits, /Synthetic/);
    for (const [,href] of article.bodyHtml.matchAll(/href="([^"]+)"/g)) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:");
      if (url.href.startsWith("https://github.com/nrk8286/agentid-services/blob/main/publishing/foundry-2026-11-12/")) {
        const relative = url.pathname.split("/publishing/foundry-2026-11-12/")[1];
        if (!relative.endsWith("cuekeeper") && !relative.endsWith("recovery")) await readFile(new URL(relative, base));
      }
    }
  }
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

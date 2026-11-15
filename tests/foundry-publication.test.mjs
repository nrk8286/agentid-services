import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import { applyFoundryPublication, cueArticle, cueSlug, recoveryArticle, recoverySlug, cueExampleArticle, recoveryExampleArticle, cueExampleSlug, recoveryExampleSlug, cueQualityArticle, cueQualitySlug } from "../publishing/foundry-2026-11-08/foundry-promotion.mjs";
import { patchIndex } from "../publishing/foundry-2026-11-08/prepare.mjs";
import { includePublishedGuides } from "../publishing/foundry-2026-11-09/guide-discovery.mjs";
import { expectedModules as qualityBaseline } from "../publishing/foundry-2026-11-15/prepare.mjs";

test("publication preserves unrelated articles and adds distinct Foundry guides", () => {
  const existing = [{ slug: cueSlug, bodyHtml: "old" }, { slug: "existing-review", bodyHtml: "keep", status: "published" }, { slug: "draft", status: "draft" }];
  const before = structuredClone(existing);
  const result = applyFoundryPublication(existing);
  assert.equal(result.length, existing.length + 4);
  assert.equal(result[0], cueQualityArticle);
  assert.equal(result[1], cueExampleArticle);
  assert.equal(result[2], recoveryExampleArticle);
  assert.equal(result[3], recoveryArticle);
  assert.equal(result[4], cueArticle);
  assert.equal(result[5], existing[1]);
  assert.equal(result[6], existing[2]);
  assert.deepEqual(existing, before);
  assert.throws(() => applyFoundryPublication(result), /already published/);
  assert.throws(() => applyFoundryPublication([]), /exactly one/);
  assert.throws(() => applyFoundryPublication([{ slug: cueSlug }, { slug: cueSlug }]), /exactly one/);
  for (const slug of [cueExampleSlug,recoveryExampleSlug,cueQualitySlug]) assert.throws(() => applyFoundryPublication([{slug:cueSlug},{slug}]), /already published/);
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

test("the fourth Foundry addition yields eight published guides and keeps the seven existing guide entries", () => {
  const legacy = [
    { slug: cueSlug, status: "published" },
    ...["existing-review-a", "existing-review-b", "existing-review-c"].map(slug => ({ slug, status: "published", bodyHtml: `Unchanged ${slug}` }))
  ];
  const before = structuredClone(legacy);
  const result = applyFoundryPublication(legacy);
  assert.equal(result.length, 8);
  assert.equal(result.filter(article => article.status === "published").length, 8);
  assert.deepEqual(result.slice(1, 5), [cueExampleArticle, recoveryExampleArticle, recoveryArticle, cueArticle]);
  for (const article of legacy.slice(1)) assert.equal(result.find(item => item.slug === article.slug), article);
  assert.deepEqual(legacy, before);
  const urls = includePublishedGuides(["https://gptmarketplus.com/"], result, { enabled: true, origin: "https://gptmarketplus.com" });
  assert.equal(urls.length, 9);
  assert.equal(new Set(urls).size, 9);
  for (const article of result) assert(urls.includes(`https://gptmarketplus.com/guides/${article.slug}`));
});

test("quality fixtures match their selected artifact hashes and the actual CLI outcomes", async () => {
  const base = new URL("../publishing/foundry-2026-11-15/", import.meta.url);
  const evidence = JSON.parse(await readFile(new URL("evidence.json", base), "utf8"));
  assert.equal(evidence.archive_sha256, "b9d7fdb31bdbe69423b5031e1681a9868406b7fb093cef82b8db66396fcc6dcc");
  assert.deepEqual(evidence.runtime, { implementation: "CPython", platform: "Windows", python: "3.13.14" });
  assert.equal(evidence.cases.length, 7);
  const expectedFailures = { "invalid-timestamp": "INVALID_TIMESTAMP", "reversed-interval": "INVALID_INTERVAL", "empty-dialogue": "EMPTY_DIALOGUE" };
  for (const entry of evidence.cases) {
    assert.equal(entry.command, `python app.py convert fixtures/${entry.id}.srt -o output/${entry.id} --dialogue-only`);
    assert.equal(entry.exit_status, expectedFailures[entry.id] ? 2 : 0);
    assert.match(entry.raw_stdout_sha256, /^[a-f0-9]{64}$/);
    assert.equal(entry.raw_stderr_sha256, createHash("sha256").update("").digest("hex"));
    for (const file of entry.published_files) {
      assert(file.path.startsWith(`samples/${entry.id}/`));
      assert(!file.path.includes(".."));
      assert.match(file.path, /\.(?:srt|json|md|txt)$/);
      const bytes = await readFile(new URL(file.path, base));
      assert.equal(bytes.length, file.bytes);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256, file.path);
      assert.doesNotMatch(bytes.toString(), /C:\\Users\\|\/home\/|cuekeeper\.db/);
    }
    const report = JSON.parse(await readFile(new URL(`samples/${entry.id}/${entry.id}.report.selected.json`, base), "utf8"));
    const summary = JSON.parse(await readFile(new URL(`samples/${entry.id}/batch-summary.selected.json`, base), "utf8"));
    assert.deepEqual(Object.keys(report).sort(), evidence.public_selection.report_fields.toSorted());
    assert(!Object.hasOwn(report, "artifact_paths"));
    assert.deepEqual(summary.results, [report]);
    assert.equal(summary.status, entry.batch_status);
    assert.deepEqual(report.errors.map(item => item.code), entry.error_codes);
    assert.deepEqual(report.warnings.map(item => item.code), entry.warning_codes);
    if (expectedFailures[entry.id]) {
      assert.equal(report.status, "FAILED");
      assert.equal(report.emitted_cue_count, 0);
      assert.deepEqual(report.errors.map(({ code, cue_index }) => ({ code, cue_index })), [{ code: expectedFailures[entry.id], cue_index: 1 }]);
      assert(!entry.published_files.some(file => file.path.endsWith(".md") || file.path.endsWith(".dialogue.txt")));
    }
  }
  const selected = async id => JSON.parse(await readFile(new URL(`samples/${id}/${id}.report.selected.json`, base), "utf8"));
  const warnings = await selected("warnings");
  assert.equal(warnings.status, "COMPLETE");
  assert.equal(warnings.emitted_cue_count, 3);
  assert.deepEqual(warnings.warnings.map(({ code, cue_indices }) => ({ code, cue_indices })), [
    { code: "UNSUPPORTED_MARKUP", cue_indices: [1] }, { code: "OVERLAP", cue_indices: [1, 2] },
    { code: "DUPLICATE_CUE", cue_indices: [2, 3] }, { code: "OVERLAP", cue_indices: [2, 3] }
  ]);
  const zero = await selected("zero-length");
  assert.equal(zero.status, "COMPLETE");
  assert.equal(zero.emitted_cue_count, 1);
  assert.deepEqual(zero.warnings, []);
  assert.match(await readFile(new URL("samples/zero-length/zero-length.md", base), "utf8"), /\[00:00:01\.000 --> 00:00:01\.000\]/);
  const nonadjacent = await selected("nonadjacent-overlap");
  assert.equal(nonadjacent.emitted_cue_count, 3);
  assert.deepEqual(nonadjacent.warnings.map(({ code, cue_indices }) => ({ code, cue_indices })), [{ code: "OVERLAP", cue_indices: [1, 2] }]);
  assert.match(await readFile(new URL("samples/warnings/warnings.dialogue.txt", base), "utf8"), /^Hello & goodbye\n\nOverlap\n\nOverlap\n$/);
  assert.deepEqual(await readFile(new URL("samples/clean/clean.md", base)), await readFile(new URL("../foundry-2026-11-12/samples/cuekeeper/valid.md", base)));
});

test("quality guide gives free manual value, exact examples, limits, provenance and distinct purchase links", async () => {
  const base = new URL("../publishing/foundry-2026-11-15/", import.meta.url);
  assert.equal(cueQualityArticle.slug, "srt-subtitle-quality-checklist");
  assert.equal(cueQualityArticle.status, "published");
  assert.match(cueQualityArticle.bodyHtml, /We own and sell CueKeeper/);
  assert.match(cueQualityArticle.bodyHtml, /AI assistance/);
  assert.match(cueQualityArticle.bodyHtml, /fictional SRT fixtures/);
  assert.match(cueQualityArticle.bodyHtml, /without buying the toolkit/);
  assert.match(cueQualityArticle.bodyHtml, /accepts this zero-length cue without a warning/);
  assert.match(cueQualityArticle.bodyHtml, /does not flag cue 3's nonadjacent overlap with cue 1/);
  assert.match(cueQualityArticle.bodyHtml, /free browser preview uses a stricter/);
  assert.match(cueQualityArticle.bodyHtml, /separate implementations/);
  assert.match(cueQualityArticle.bodyHtml, /not the full unmodified report/);
  assert.match(cueQualityArticle.testing.limits, /Synthetic SRT/);
  assert.match(cueQualityArticle.testing.limits, /not full unmodified reports/);
  const escape = text => text.trim().replaceAll("\r\n", "\n").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  for (const id of ["invalid-timestamp", "reversed-interval", "empty-dialogue", "warnings", "zero-length", "nonadjacent-overlap"]) {
    const input = await readFile(new URL(`samples/${id}/${id}.srt`, base), "utf8");
    assert(cueQualityArticle.bodyHtml.includes(escape(input)), `Guide input differs from captured fixture: ${id}`);
  }
  const destinations = new Set();
  for (const [, href] of cueQualityArticle.bodyHtml.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(href);
    assert.equal(url.protocol, "https:");
    if (url.hostname === "score.agentid.life") {
      assert.equal(url.searchParams.get("ref"), "gmp-cue-qc-20261115");
      destinations.add(url.pathname);
    }
    const prefix = "https://github.com/nrk8286/agentid-services/blob/main/publishing/foundry-2026-11-15/";
    if (href.startsWith(prefix)) await readFile(new URL(href.slice(prefix.length), base));
  }
  assert.deepEqual(destinations, new Set(["/cuekeeper/try", "/cuekeeper/paypal", "/cuekeeper"]));
  assert.equal(new URL(cueQualityArticle.prices[0].url).searchParams.get("ref"), "gmp-cue-qc-20261115");
  assert.match(cueQualityArticle.prices[0].price, /\$1\.00 USD with PayPal; or 1\.00 USDC on Base/);
});

test("quality release preparation pins the current five-module baseline", () => {
  assert.equal(Object.keys(qualityBaseline).length, 5);
  assert.equal(qualityBaseline["foundry-promotion.mjs"], "4883ee5042838a169238c426dc274fe42224fbec12b9dbedf0a9200f55fadc74");
  assert.equal(qualityBaseline["portfolio-wrapper.mjs"], "855713f2cafad6b50554caecd5376deae6afc9467d97d24b1ab69e3a71801bd4");
});

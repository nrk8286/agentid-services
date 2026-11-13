# Inspectable product examples — November 12, 2026

This content release adds two distinct articles to GPTMarketPlus: an SRT-to-Markdown before-and-after and a fictional incident-packet walkthrough. The existing five articles remain. The new articles disclose product ownership and AI assistance, show observed output, link to public synthetic fixtures, and use separate purchase-attribution tags. They do not claim customer results or revenue.

The samples are copied from fresh runs of the reviewed product archives. [evidence.json](evidence.json) records archive hashes, commands, runtime version, exit status, and output hashes. Recovery's generated review and checklist labels are explicitly qualified: they do not establish human review, performed actions, or recovery. No customer or production incident data is published.

The deployable content remains in the existing `foundry-promotion.mjs` module. Only that module changes; the current index, wrapper, UI, and discovery module remain byte-identical. The publisher automatically includes both articles in its guide library, topic pages, sitemap, and existing IndexNow URL list.

Run `npm run test:publication` and `npm run validate`. Prepare a content-only release from a fresh private production capture:

```text
node publishing/foundry-2026-11-12/prepare.mjs <captured-live-modules-directory> <new-output-directory>
```

Preparation requires the exact five-module baseline hashes. Keep captured source, tokens, and runtime settings outside this public repository. Review the generated manifest before publication. The existing production redeploy script can verify the resulting five-module set after this content release; it intentionally does not apply changed source itself.

Immediately before the authorized content replacement, run `scripts/inspect-production-release.mjs` with the existing account authorization to verify stale `If-Match` requests return HTTP 412 and leave production unchanged. Re-read module hashes and the strong ETag, abort on changes, then send all five modules to the content-only replacement endpoint with `If-Match` and metadata containing only `main_module: "portfolio-wrapper.mjs"`. Compare uploaded hashes, runtime settings, and the canonical deployment/version afterwards. Do not run a legacy entry-point upload or a database migration.

Verify the two live articles, their canonical URLs, discovery entries, product links, and responsive layout. An IndexNow acknowledgment confirms URL receipt only; it is not proof of indexing, traffic, sales, or profit. External forum submission is recorded separately and requires an eligible signed-in account.

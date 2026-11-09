# Include publisher guides in IndexNow discovery

The publisher sitemap includes its current articles, while the automatic IndexNow URL generator used only the older service catalog. As a result, the normal notification flow omitted the publisher's guides.

This release adds published guide URLs to that existing generator for the enabled publisher at `https://gptmarketplus.com`. It deduplicates URLs, excludes drafts and withdrawn articles, preserves every legacy URL, and leaves other hostnames and a disabled publisher unchanged. Future published articles enter the same collection automatically. The public IndexNow status preview lists the guides first.

The change does not alter schedules, submission cooldowns, budgets, credentials, payment behavior, or article content. It does not itself send an IndexNow request. A successful notification acknowledges receipt of URLs; it does not prove indexing or ranking. See the [official IndexNow protocol](https://www.indexnow.org/documentation).

Run `npm run test:publication` for the focused content and discovery checks. To prepare the content-only release from the November 9 private live snapshot:

```text
node publishing/foundry-2026-11-09/prepare.mjs <captured-live-modules-directory> <new-output-directory>
```

The preparation checks all four original module hashes, adds `guide-discovery.mjs`, and changes only the IndexNow URL generator plus its import. The existing promotion, wrapper, and UI modules remain byte-identical. Keep snapshots, settings, and tokens outside the public repository.

Publish through Cloudflare's content-only Worker replacement endpoint with all five modules and `main_module: "portfolio-wrapper.mjs"`. Recheck live module hashes immediately before upload, then compare uploaded hashes and settings afterward. Provider-generated deployment annotations may change; runtime settings and bindings must remain unchanged. Verify the live `/api/agents/indexnow` result and preservation of the guides and sitemap. Do not run the older repository entry-point deployment or D1 migration command for this bounded release.

# Foundry product publication, November 8, 2026

This publication refreshes the existing CueKeeper guide and adds a Supabase Recovery Evidence Agent tutorial to GPTMarketPlus. Both disclose shared ownership and AI assistance, document synthetic sample checks, state product limits, and link to the $1 USD PayPal checkout and separate USDC offer. No customer outcomes or sales are claimed.

The live `agentid-services-agent-system` Worker contains a publisher that is newer than this repository's `src/index.js`. Deploying the repository's older entry point would remove live functionality. This bounded release therefore adds one content module to an exact, captured live Worker version. `prepare.mjs` checks all three original module hashes, adds the import and article transformation, and leaves the wrapper and UI modules byte-identical. The other three published articles retain their existing objects.

Run the focused check with `npm run test:publication`. To prepare from the approved private snapshot:

```text
node publishing/foundry-2026-11-08/prepare.mjs <captured-live-modules-directory> <new-output-directory>
```

The snapshot must contain `manifest.json` and the three modules named in `expectedModules`. Keep downloaded production source, provider settings, and credentials outside this public repository. The output directory must not exist. Inspect the resulting modules and manifest before upload.

Publication uses Cloudflare's **Replace Worker Script Content** endpoint, `PUT /accounts/{account_id}/workers/scripts/{script_name}/content`, with multipart `metadata` containing only `main_module: "portfolio-wrapper.mjs"` and all four JavaScript module parts. That endpoint preserves configuration and metadata. Before uploading, re-read the deployed modules and require their names and hashes to match the snapshot. Abort on concurrent changes. Do not run this repository's ordinary deployment or database-migration command for this publication.

After upload, compare all deployed module hashes, check that Worker settings and bindings match the pre-upload snapshot, and verify both guides, discovery pages, sitemap, policy pages, mobile layout, and product links. Retain the original three modules for a content-only rollback. Never replay the old snapshot over a subsequent unrelated deployment.

The evidence JSON records the actual included-example commands and observed output files. It does not claim payment settlement or product effectiveness. External forum drafts and channel restrictions are tracked separately in the Agent Foundry repository; this blog publication does not imply that any forum post was sent.

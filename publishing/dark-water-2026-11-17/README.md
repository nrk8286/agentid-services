# GPTMarketPlus dark theme and pointer water release

This release adds a readable dark presentation layer and a transparent pointer-driven water effect to the current GPTMarketPlus publisher. It keeps the active publisher runtime, business logic, commerce, data bindings, routes and settings intact.

## Production architecture

Production contains newer private publisher modules than the repository's legacy `src/index.js`. **Do not deploy the legacy entrypoint with `wrangler deploy`.** The theme release downloads the active Worker modules through the authenticated Cloudflare content API and preserves their exact bytes in memory.

The supported baseline has the entrypoint `portfolio-wrapper.mjs` and exactly these five modules:

```text
foundry-promotion.mjs
guide-discovery.mjs
index.js
portfolio-ui.mjs
portfolio-wrapper.mjs
```

The themed runtime retains those five modules and adds exactly:

```text
publisher-theme.mjs
publisher-water.mjs
theme-wrapper.mjs
```

Its entrypoint is `theme-wrapper.mjs`, which delegates to the existing `portfolio-wrapper.mjs`. The three new modules use the `application/javascript+module` MIME type.

## Release commands

Use the existing production credentials through the approved deployment environment. Do not copy credentials into source, commands, logs or this document. The release command requires the existing `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` environment variables. Set `GITHUB_SHA` through CI to record source provenance.

Run the relevant release tests before publication:

```bash
npm run test:deployment
```

Apply the reviewed theme:

```bash
node scripts/release-publisher-theme.mjs apply
```

Remove this presentation layer while retaining the current underlying publisher:

```bash
node scripts/release-publisher-theme.mjs rollback
```

The CLI action must be explicit; there is no default CLI action and no force mode. The **Deploy Cloudflare Worker** workflow remains manually dispatched and uses its existing `production` environment and `production-cloudflare` concurrency group. Its `theme_action` choice maps to these operations:

| Workflow choice | Operation |
| --- | --- |
| `redeploy` (default) | Re-publish the verified current modules unchanged, preserving either the baseline or dark-water appearance. |
| `apply-dark-water` | Run `node scripts/release-publisher-theme.mjs apply`. |
| `rollback-dark-water` | Run `node scripts/release-publisher-theme.mjs rollback`. |

Leave `inspect_only` unchecked for publication. When it is checked, the workflow performs its conditional-request inspection and existing route checks, and skips all publication steps. There is no push-triggered production deployment.

The apply/rollback choices also verify the requested presentation marker on representative public routes. Apply verifies both the stylesheet and animation asset responses. These automated checks supplement the visual and interaction checks below.

| Current verified runtime | Action | Result |
| --- | --- | --- |
| Exact five-module baseline | `apply` | Preserve all five modules, add three reviewed modules, select the theme entrypoint. |
| Exact eight-module themed runtime | `apply` | Verify the current theme matches this commit; return `changed: false` without uploading. |
| Exact eight-module themed runtime | `rollback` | Remove only the three reviewed theme modules; restore the original entrypoint. |
| Exact five-module baseline | `rollback` | Verify the baseline; return `changed: false` without uploading. |
| Any unrecognized or partial runtime | Either | Refuse before publication. |

## Preservation and concurrency checks

`scripts/release-publisher-theme.mjs` performs these checks:

1. Read live module content, a strong content ETag, runtime settings and the active deployment. Require exactly one version receiving 100% of traffic.
2. Require an exact supported module set and matching entrypoint. Duplicate, missing or additional modules are rejected.
3. Verify the live `foundry-promotion.mjs` and `guide-discovery.mjs` digests against their tracked files. If the theme is already active, verify all three theme module digests and MIME types as well. Empty tracked files are rejected.
4. Construct the target using unchanged bytes and MIME types for every existing baseline module. Add or remove only the exact theme module names.
5. Read a second complete snapshot. Refuse if content, ETag, runtime settings or active deployment changed during preparation.
6. Send one conditional `PUT /content` with `If-Match` set to the observed strong ETag. The upload metadata contains only `main_module`; the script never sends bindings, credentials, routes, compatibility settings, migrations or other configuration.
7. Read back the published content and settings, compare every module digest and entrypoint, and correlate the upload's version ID with the canonical 100% deployment. Only provider-managed annotations and binding order may differ in the settings comparison.

Successful output includes source commit, previous/current deployment and version IDs, whether a mutation occurred, module names/types/digests, and preservation results. It never includes private module source, secret values or runtime settings. Existing private modules remain in memory and are not written to disk or artifacts.

## Rollback and uncertain outcomes

Use the reviewed commit whose tracked publisher and theme modules match the live release. The targeted `rollback` command removes only this theme layer and leaves the underlying live code unchanged. A different theme digest or a later publisher change requires inspection and a reviewed release; it must not be forced through the guard.

An HTTP 412 indicates the conditional write was rejected. A transport error, missing upload version, or failed post-publication verification leaves the actual outcome to be inspected. The script does **not** retry the write or automatically roll back. Re-read the current deployment before deciding whether to rerun a verified no-op, complete the release, or perform the targeted rollback.

After apply or rollback, verify the actual public site: homepage, a guide/article page, navigation and buttons, mobile layout, text contrast, keyboard focus, reduced-motion behavior and the mouse effect. Confirm the expected presentation marker and that the existing production health checks still pass. Do not report the public change as live based solely on a commit, successful local tests, or a requested workflow dispatch.

## Integration with the existing content redeployer

`scripts/redeploy-production.mjs` now recognizes both exact supported runtimes through `identifyPublisherRuntime` and `verifyPublisherRuntime` from the theme release script. It reads the actual `cf-entrypoint`, verifies the known baseline and active theme module digests, and preserves that entrypoint and every existing module during content-only re-publication.

Its existing two-snapshot comparison, conditional ETag upload, settings-preservation checks and post-publication verification remain in place. The redeployment tests cover unchanged baseline publication, preservation of all eight themed modules, rejected theme digest/MIME changes, mismatched module/entrypoint combinations, and a concurrent change to a theme module.

Consequently, the workflow's default `redeploy` choice retains the active appearance. It does not add or remove the theme; those operations require the corresponding explicit choice.

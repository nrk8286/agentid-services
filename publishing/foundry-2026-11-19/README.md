# Correct the toolkit payment requirements

On November 19, 2026 (America/Chicago), the live GPTMarketPlus `/solutions` and
`/solutions/cuekeeper` pages still said a Base USDC wallet was required. The
storefront's CueKeeper PayPal review page displayed a $1 USD one-time purchase.
The catalog uses the same outdated wallet-only requirement for Recovery Evidence
Agent. This correction changes only those two offer records' displayed prices
and requirements; checkout prices and payment behavior are unchanged.

The corrected copy offers **$1 USD via PayPal or 1 USDC on Base, one time**,
specifies Python 3.10+, and says a wallet is required only for USDC. Existing
product limitations, destination links, attribution and all other catalog fields
remain intact. Both the HTML pages and public catalog consume these records.

## Preparation, not deployment

Production's publisher runtime is newer than this repository's legacy `src/`
application. Do not deploy that legacy source or copy the dirty local checkout.
`prepare.mjs` accepts a private captured `index.js`, changes the two identified
records and writes a new private output file. It requires a reviewed input hash,
rejects missing, duplicate, reformatted or already-corrected records, and never
overwrites an existing output. It makes no network request.

```sh
node publishing/foundry-2026-11-19/prepare.mjs \
  /private/fresh-capture/index.js /private/candidate/index.js \
  <reviewed-input-sha256>
```

The paths and hash above are placeholders. Review an actual fresh production
capture before choosing the hash. A locally generated candidate is not evidence
of deployment. Keep captured runtime modules and settings outside Git.

Before publication, reverify both product offers, capture the current complete
module set and runtime settings, and replace only the corrected `index.js` in
that set. Use the existing reviewed code-only publication procedure with current
authorization and a strong conditional request. Abort if the live module hashes,
settings or ETag change. Preserve the current entry module, theme, discovery,
OAuth wrapper, all bindings and secrets. Do not apply migrations or publish a
historical snapshot. If conditional publication is unavailable, stop for review.

Verify `/solutions`, both solution detail pages and `/api/sales/catalog` after
publication, plus the existing destination links. Public page checks do not
establish payment settlement, fulfillment, traffic or sales.

Validation: `node --test tests/foundry-checkout-copy.test.mjs`; the standard
`npm run test:publication` and `npm run validate` include this coverage.

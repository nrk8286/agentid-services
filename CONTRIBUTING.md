# Contributing

## Development

Use Node.js 22 or newer for the Cloudflare Worker and Workers AI revenue agent. The release toolchain uses npm 12 and the project-pinned Wrangler version; run `npm ci` for reproducible installs.

```bash
npm ci
npm run validate
npm run validate:links:live
npm run test:revenue-agent
```

The live revenue-agent check verifies the deployed Workers AI binding and
schedule without requiring a provider API key:

```bash
npm run test:revenue-agent:live
```

## Pull requests

Keep changes focused, explain the user or operational outcome, and include validation evidence. Never commit `.env` files, Worker secrets, service-account JSON, Terraform state or plans, generated evaluations, customer data, or payment data.

Production deployments require an explicit deployment action and should include a rollback path. Revenue-agent changes must pass both the binding contract tests and the manually dispatched live production gate before release.

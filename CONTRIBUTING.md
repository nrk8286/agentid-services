# Contributing

## Development

Use Node.js 20 or newer for the Cloudflare Worker and Python 3.11–3.13 with `uv` for the Google agent project.

```bash
npm ci
npm run validate
npm run validate:links:live

cd agentid-revenue-agents
uv sync --dev --extra lint
uv run ruff check .
uv run ruff format . --check
uv run codespell
uv run ty check .
uv run pytest tests/unit tests/integration -q
```

## Pull requests

Keep changes focused, explain the user or operational outcome, and include validation evidence. Never commit `.env` files, Worker secrets, service-account JSON, Terraform state or plans, generated evaluations, customer data, or payment data.

Production deployments require an explicit deployment action and should include a rollback path. Google Agent Runtime deployments must complete the project evaluation gate before release.

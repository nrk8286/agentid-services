# AgentID Revenue Agents

An ADK multi-agent system for `gptmarketplus.com`, generated with
`google-agents-cli` 1.2.1.

[GPTMarketPlus](https://gptmarketplus.com) · [Repository](https://github.com/nrk8286/agentid-services) · [Runtime support](../SUPPORT.md) · [Security policy](../SECURITY.md)

The system contains:

- `revenue_coordinator`: routes evidence-backed work and reports operational
  status.
- `growth_agent`: analyzes AgentID traffic/revenue data and stages attributed
  growth actions.
- `sales_agent`: qualifies opportunities and stages consent-respecting
  follow-up.

The FastAPI runtime enables ADK's authenticated Pub/Sub trigger endpoint at
`/apps/app/trigger/pubsub`. A Cloud Scheduler job can publish a
`scheduled_revenue_cycle` event every six hours after deployment; the same
topic can receive authorized AgentID operational events.

The code remains safe when production settings are absent, while the current
deployment is configured for verified live execution:

- `AGENTID_DRY_RUN=false` in the deployed and local runtime configuration
- hard spend caps of `$10/day` and `$100/month`
- UTM attribution for every staged AgentID destination
- opt-out, bounce, complaint, and human-takeover suppression
- deceptive traffic, fake engagement, purchased lists, and spam blocked
- unavailable adapters reported honestly instead of simulated as successful

## Project Structure

```
agentid-revenue-agents/
├── app/         # Core agent code
│   ├── agent.py               # Coordinator and specialist agents
│   ├── config.py              # Validated runtime configuration
│   ├── policy.py              # Deterministic spend, UTM, and consent controls
│   ├── plugins.py             # Global pre/post-tool safety hooks
│   ├── tools.py               # AgentID API, Agent Search, and action tools
│   ├── fast_api_app.py        # FastAPI Backend server
│   └── app_utils/             # App utilities and helpers
├── tests/                     # Unit, integration, and load tests
├── AGENTS.md                  # AI-assisted development guide
└── pyproject.toml             # Project dependencies
```

> 💡 **Tip:** Use [Antigravity CLI](https://antigravity.google/) for AI-assisted development - project context is pre-configured in `GEMINI.md`.

## Configuration

Copy `.env.example` to `.env` for local development. The checked-in example
contains no credentials. Production secrets belong in Secret Manager or the
deployment platform, never source control.

Channel flags remain false until their corresponding credentials and adapters
are provisioned and tested:

```dotenv
AGENTID_GMAIL_ENABLED=false
AGENTID_SOCIAL_ENABLED=false
AGENTID_PAID_ADS_ENABLED=false
```

`AGENTID_ADMIN_TOKEN`, `AGENTID_ACTION_ENDPOINT`, and
`AGENTID_SPEND_LEDGER_ENDPOINT` are required for live execution. Paid execution
is refused unless the shared atomic spend ledger is configured and approves the
reservation.

## Requirements

Before you begin, ensure you have:
- **uv**: Python package manager (used for all dependency management in this project) - [Install](https://docs.astral.sh/uv/getting-started/installation/) ([add packages](https://docs.astral.sh/uv/concepts/dependencies/) with `uv add <package>`)
- **agents-cli**: Agents CLI - Install with `uv tool install google-agents-cli`
- **Google Cloud SDK**: For GCP services - [Install](https://cloud.google.com/sdk/docs/install)


## Quick Start

Install `agents-cli` and its skills if not already installed:

```bash
uvx google-agents-cli setup
```

Install required packages:

```bash
agents-cli install
```

Test the agent with a local web server:

```bash
agents-cli playground
```

You can also use features from the [ADK](https://adk.dev/) CLI with `uv run adk`.

Run deterministic integration fixtures without invoking live AgentID mutation
endpoints:

```bash
INTEGRATION_TEST=TRUE uv run pytest tests/unit tests/integration
```

## Commands

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `agents-cli install` | Install dependencies using uv                                                         |
| `agents-cli playground` | Launch local development environment                                                  |
| `agents-cli lint`    | Run code quality checks                                                               |
| `agents-cli eval`    | Evaluate agent behavior (generate, grade, analyze, and more — see `agents-cli eval --help`) |
| `uv run pytest tests/unit tests/integration` | Run unit and integration tests                                                        || [A2A Inspector](https://github.com/a2aproject/a2a-inspector) | Launch A2A Protocol Inspector                                                        |

## 🛠️ Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Development

Edit your agent logic in `app/agent.py` and test with `agents-cli playground` - it auto-reloads on save.

## Evaluation

The evaluation set covers zero-cost growth readiness, spend-policy refusal,
consent suppression, and honest dry-run reporting:

```bash
INTEGRATION_TEST=TRUE agents-cli eval generate
agents-cli eval grade
```

## Deployment

Deployment is intentionally gated. Run `agents-cli deploy` only after the
evaluation results pass and the operator explicitly approves a development
deployment.

```bash
gcloud config set project agentid-genai-app-2026
agents-cli deploy
```

To add CI/CD and Terraform, run `agents-cli scaffold enhance`.
To set up your production infrastructure, run `agents-cli infra cicd`.

### Current live deployment

- Google Cloud project: `agentid-genai-app-2026`
- Agent Runtime region: `us-east1`
- Runtime resource:
  `projects/497730280367/locations/us-east1/reasoningEngines/29924308461551616`
- Scheduler job:
  `projects/agentid-genai-app-2026/locations/us-east1/jobs/agentid-revenue-cycle-6h`
- Schedule: `0 */6 * * *` (`Etc/UTC`)
- Runtime mode: `AGENTID_DRY_RUN=false`
- Enabled actions: AgentID website publishing, IndexNow submission, planning,
  lead discovery, PayPal subscriptions, and PayPal one-time products
- Shared spend caps: `$10/day` and `$100/month`
- Gmail, social, and paid ads remain disabled until their real adapters and
  credentials pass end-to-end verification

The scheduler and its query-only service account are managed from
`deployment/terraform/scheduler/`. Change infrastructure there and apply with
Terraform so the schedule, authentication, and runtime target remain auditable.

## Observability

Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.

## A2A Inspector

This agent supports the [A2A Protocol](https://a2a-protocol.org/). Use the [A2A Inspector](https://github.com/a2aproject/a2a-inspector) to test interoperability.
See the [A2A Inspector docs](https://github.com/a2aproject/a2a-inspector) for details.

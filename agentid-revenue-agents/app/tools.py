"""Tools connecting the ADK agents to AgentID and its policy controls."""

from __future__ import annotations

import hashlib
from typing import Any
from urllib.parse import urljoin

import aiohttp
from google.adk.tools import ToolContext
from google.adk.tools.vertex_ai_search_tool import VertexAiSearchTool

from app.config import CONFIG
from app.policy import (
    build_utm_url,
    validate_action_text,
    validate_outreach,
    validate_spend,
)

SNAPSHOT_ENDPOINTS = {
    "health": "/api/agents/health",
    "state": "/api/agents/state",
    "tasks": "/api/agents/tasks",
    "revenue": "/api/agents/revenue",
    "playbook": "/api/agents/playbook",
    "traffic": "/api/agents/traffic/pages",
    "prospects": "/api/agents/lead-spider/prospects",
    "acquisition": "/api/agents/acquisition/brief",
    "ad_packages": "/api/agents/ads/packages",
    "software_builds": "/api/agents/software-builds",
}

OPERATION_ENDPOINTS = {
    "lead_spider": "/api/agents/lead-spider/run",
    "indexnow": "/api/agents/indexnow/ping",
    "planning_run": "/api/agents/run",
}


def _mock_snapshot(section: str) -> dict[str, Any]:
    return {
        "status": "ok",
        "source": "integration_fixture",
        "section": section,
        "data": {
            "site": "agentid.services",
            "daily_spend_limit_cents": CONFIG.daily_spend_limit_cents,
            "monthly_spend_limit_cents": CONFIG.monthly_spend_limit_cents,
        },
    }


async def _agentid_request(
    method: str,
    path_or_url: str,
    payload: dict[str, Any] | None,
    requires_admin: bool,
) -> dict[str, Any]:
    url = (
        path_or_url
        if path_or_url.startswith(("http://", "https://"))
        else urljoin(f"{CONFIG.base_url}/", path_or_url.lstrip("/"))
    )
    headers = {"Accept": "application/json"}
    if payload is not None:
        headers["Content-Type"] = "application/json"
    if requires_admin:
        if not CONFIG.admin_token:
            return {
                "status": "unavailable",
                "code": "admin_token_missing",
                "reason": "AGENTID_ADMIN_TOKEN is not configured in this runtime.",
            }
        headers["Authorization"] = f"Bearer {CONFIG.admin_token}"

    timeout = aiohttp.ClientTimeout(total=15)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.request(
                method, url, headers=headers, json=payload
            ) as response:
                content_type = response.headers.get("Content-Type", "")
                if "application/json" in content_type:
                    body: Any = await response.json()
                else:
                    body = (await response.text())[:4_000]
                return {
                    "status": "ok" if response.status < 400 else "error",
                    "http_status": response.status,
                    "data": body,
                }
    except (aiohttp.ClientError, TimeoutError) as exc:
        return {
            "status": "error",
            "code": "agentid_request_failed",
            "reason": str(exc),
        }


async def get_agentid_snapshot(section: str) -> dict[str, Any]:
    """Read an allowlisted AgentID operational snapshot.

    Args:
        section: One of health, state, tasks, revenue, playbook, traffic,
            prospects, acquisition, ad_packages, or software_builds.

    Returns:
        The selected AgentID data or a structured validation/error response.
    """
    normalized = section.strip().lower()
    if normalized not in SNAPSHOT_ENDPOINTS:
        return {
            "status": "blocked",
            "code": "invalid_snapshot_section",
            "allowed_sections": sorted(SNAPSHOT_ENDPOINTS),
        }
    if CONFIG.integration_test:
        return _mock_snapshot(normalized)
    return await _agentid_request(
        "GET", SNAPSHOT_ENDPOINTS[normalized], None, requires_admin=False
    )


def check_channel_readiness(channel: str) -> dict[str, Any]:
    """Report whether a requested publishing or outreach channel is configured.

    Args:
        channel: Runtime channel such as website, Gmail, social, or paid_ads.

    Returns:
        A readiness result that never reveals credentials.
    """
    normalized = channel.strip().lower()
    enabled = CONFIG.channel_enabled(normalized)
    return {
        "status": "ready" if enabled else "unavailable",
        "channel": normalized,
        "enabled": enabled,
        "dry_run": CONFIG.dry_run,
        "reason": (
            "Channel is enabled."
            if enabled
            else "Required runtime credentials or adapter have not been enabled."
        ),
    }


def get_spend_status(tool_context: ToolContext) -> dict[str, Any]:
    """Read current session spend reservations and the hard account limits.

    Returns:
        Daily and monthly reserved spend plus the configured hard limits.
    """
    daily = int(tool_context.state.get("spend:daily_cents", 0))
    monthly = int(tool_context.state.get("spend:monthly_cents", 0))
    return {
        "status": "ok",
        "daily_reserved_cents": daily,
        "monthly_reserved_cents": monthly,
        "daily_limit_cents": CONFIG.daily_spend_limit_cents,
        "monthly_limit_cents": CONFIG.monthly_spend_limit_cents,
        "remaining_daily_cents": max(CONFIG.daily_spend_limit_cents - daily, 0),
        "remaining_monthly_cents": max(CONFIG.monthly_spend_limit_cents - monthly, 0),
        "persistence": (
            "session_only"
            if not CONFIG.spend_ledger_endpoint
            else "external_ledger_configured"
        ),
    }


def _reserve_session_spend(
    amount_cents: int,
    idempotency_key: str,
    tool_context: ToolContext,
) -> dict[str, Any]:
    idempotency_hash = hashlib.sha256(idempotency_key.encode()).hexdigest()
    state_key = f"spend:idempotency:{idempotency_hash}"
    if tool_context.state.get(state_key):
        return {
            "status": "duplicate",
            "code": "idempotent_replay",
            "reserved": False,
        }

    daily = int(tool_context.state.get("spend:daily_cents", 0))
    monthly = int(tool_context.state.get("spend:monthly_cents", 0))
    decision = validate_spend(
        amount_cents,
        daily,
        monthly,
        CONFIG.daily_spend_limit_cents,
        CONFIG.monthly_spend_limit_cents,
    )
    if not decision.allowed:
        return {
            "status": "blocked",
            "code": decision.code,
            "reason": decision.reason,
            "reserved": False,
        }

    tool_context.state["spend:daily_cents"] = daily + amount_cents
    tool_context.state["spend:monthly_cents"] = monthly + amount_cents
    tool_context.state[state_key] = True
    return {
        "status": "reserved",
        "reserved": True,
        "amount_cents": amount_cents,
        "daily_reserved_cents": daily + amount_cents,
        "monthly_reserved_cents": monthly + amount_cents,
    }


async def _reserve_external_spend(
    amount_cents: int,
    action_type: str,
    channel: str,
    idempotency_key: str,
) -> dict[str, Any]:
    if amount_cents <= 0:
        return {"status": "not_required", "reserved": False, "amount_cents": 0}
    if not CONFIG.spend_ledger_endpoint:
        return {
            "status": "unavailable",
            "code": "atomic_spend_ledger_required",
            "reserved": False,
            "reason": "Paid execution requires a shared atomic spend ledger.",
        }
    result = await _agentid_request(
        "POST",
        CONFIG.spend_ledger_endpoint,
        {
            "amount_cents": amount_cents,
            "action_type": action_type,
            "channel": channel,
            "idempotency_key": idempotency_key,
        },
        requires_admin=True,
    )
    response = result.get("data")
    if result["status"] != "ok" or not isinstance(response, dict):
        return {
            "status": "blocked",
            "code": "spend_reservation_failed",
            "reserved": False,
            "ledger": result,
        }
    if response.get("status") == "duplicate":
        return {
            "status": "duplicate",
            "code": "idempotent_replay",
            "reserved": False,
            "ledger": response,
        }
    if response.get("status") != "reserved" or not response.get("reserved"):
        return {
            "status": "blocked",
            "code": str(response.get("code") or "spend_reservation_failed"),
            "reserved": False,
            "ledger": response,
        }
    return {
        "status": "reserved",
        "reserved": True,
        "amount_cents": amount_cents,
        "ledger": response,
    }


async def prepare_growth_action(
    action_type: str,
    title: str,
    body: str,
    destination_url: str,
    channel: str,
    campaign: str,
    estimated_cost_cents: int,
    idempotency_key: str,
    tool_context: ToolContext,
) -> dict[str, Any]:
    """Validate, attribute, and stage a growth action for safe execution.

    Args:
        action_type: The action category, such as publish, promote, or test.
        title: A concise action title.
        body: The proposed public-facing copy.
        destination_url: An AgentID destination URL.
        channel: The intended website, social, email, or paid-ads channel.
        campaign: A stable campaign slug used for UTM attribution.
        estimated_cost_cents: Maximum expected cost for this action in cents.
        idempotency_key: A unique stable key preventing duplicate execution.

    Returns:
        A blocked, dry-run, unavailable, or executed action result.
    """
    if not idempotency_key.strip():
        return {
            "status": "blocked",
            "code": "idempotency_key_required",
        }
    text_decision = validate_action_text(f"{action_type} {title} {body}")
    if not text_decision.allowed:
        return {
            "status": "blocked",
            "code": text_decision.code,
            "reason": text_decision.reason,
        }
    try:
        attributed_url = build_utm_url(
            destination_url,
            source=channel,
            medium="agent",
            campaign=campaign,
        )
    except ValueError as exc:
        return {
            "status": "blocked",
            "code": "invalid_destination_url",
            "reason": str(exc),
        }

    readiness = check_channel_readiness(channel)
    if not readiness["enabled"]:
        return readiness

    external_reservation = {"status": "not_required", "reserved": False}
    if estimated_cost_cents > 0 and not (CONFIG.dry_run or CONFIG.integration_test):
        external_reservation = await _reserve_external_spend(
            estimated_cost_cents,
            action_type,
            channel,
            idempotency_key,
        )
        if external_reservation["status"] in {
            "blocked",
            "duplicate",
            "unavailable",
        }:
            return external_reservation

    reservation = _reserve_session_spend(
        estimated_cost_cents, idempotency_key, tool_context
    )
    if reservation["status"] in {"blocked", "duplicate"}:
        return reservation

    action = {
        "action_type": action_type,
        "title": title,
        "body": body,
        "destination_url": attributed_url,
        "channel": channel,
        "campaign": campaign,
        "estimated_cost_cents": estimated_cost_cents,
        "idempotency_key": idempotency_key,
    }
    if CONFIG.dry_run or CONFIG.integration_test:
        return {
            "status": "dry_run",
            "executed": False,
            "action": action,
            "spend": reservation,
            "external_spend": external_reservation,
        }
    if not CONFIG.action_endpoint:
        return {
            "status": "unavailable",
            "executed": False,
            "code": "action_endpoint_missing",
            "spend": reservation,
            "external_spend": external_reservation,
        }
    result = await _agentid_request(
        "POST", CONFIG.action_endpoint, action, requires_admin=True
    )
    return {
        "status": result["status"],
        "executed": result["status"] == "ok",
        "spend": reservation,
        "external_spend": external_reservation,
        **result,
    }


async def prepare_sales_followup(
    lead_id: str,
    channel: str,
    message: str,
    campaign: str,
    consent: bool,
    opted_out: bool,
    bounced: bool,
    complaint: bool,
    human_takeover: bool,
    idempotency_key: str,
) -> dict[str, Any]:
    """Validate and stage a consent-respecting sales follow-up.

    Args:
        lead_id: Internal opaque lead identifier; never a raw email or phone.
        channel: The requested outreach channel.
        message: The proposed outreach message.
        campaign: The attribution campaign slug.
        consent: Whether a valid outreach basis is documented.
        opted_out: Whether the lead opted out.
        bounced: Whether prior delivery bounced.
        complaint: Whether the lead filed a complaint.
        human_takeover: Whether a person now owns the conversation.
        idempotency_key: A unique stable key preventing duplicate outreach.

    Returns:
        A blocked, dry-run, unavailable, or executed follow-up result.
    """
    if not lead_id.strip() or "@" in lead_id:
        return {
            "status": "blocked",
            "code": "opaque_lead_id_required",
            "reason": "Use an internal lead ID, not contact information.",
        }
    if not idempotency_key.strip():
        return {"status": "blocked", "code": "idempotency_key_required"}
    policy = validate_outreach(consent, opted_out, bounced, complaint, human_takeover)
    if not policy.allowed:
        return {
            "status": "blocked",
            "code": policy.code,
            "reason": policy.reason,
        }
    text_policy = validate_action_text(message)
    if not text_policy.allowed:
        return {
            "status": "blocked",
            "code": text_policy.code,
            "reason": text_policy.reason,
        }
    readiness = check_channel_readiness(channel)
    if not readiness["enabled"]:
        return readiness

    action = {
        "action_type": "sales_followup",
        "lead_id": lead_id,
        "channel": channel,
        "message": message,
        "campaign": campaign,
        "idempotency_key": idempotency_key,
    }
    if CONFIG.dry_run or CONFIG.integration_test:
        return {"status": "dry_run", "executed": False, "action": action}
    if not CONFIG.action_endpoint:
        return {
            "status": "unavailable",
            "executed": False,
            "code": "action_endpoint_missing",
        }
    result = await _agentid_request(
        "POST", CONFIG.action_endpoint, action, requires_admin=True
    )
    return {"status": result["status"], "executed": result["status"] == "ok", **result}


async def run_agentid_operation(
    operation: str,
    idempotency_key: str,
) -> dict[str, Any]:
    """Run an allowlisted existing AgentID operation.

    Args:
        operation: One of lead_spider, indexnow, or planning_run.
        idempotency_key: A unique stable key used by the operation request.

    Returns:
        A dry-run, unavailable, blocked, or live operation result.
    """
    normalized = operation.strip().lower()
    if normalized not in OPERATION_ENDPOINTS:
        return {
            "status": "blocked",
            "code": "invalid_operation",
            "allowed_operations": sorted(OPERATION_ENDPOINTS),
        }
    if not idempotency_key.strip():
        return {"status": "blocked", "code": "idempotency_key_required"}
    if CONFIG.dry_run or CONFIG.integration_test:
        return {
            "status": "dry_run",
            "executed": False,
            "operation": normalized,
            "idempotency_key": idempotency_key,
        }
    return await _agentid_request(
        "POST",
        OPERATION_ENDPOINTS[normalized],
        {"idempotency_key": idempotency_key},
        requires_admin=True,
    )


def create_agentid_search_tool() -> Any:
    """Create Agent Search with a deterministic integration-test seam."""
    if CONFIG.integration_test:

        def search_agentid_knowledge(query: str) -> dict[str, Any]:
            """Search the AgentID knowledge fixture during integration tests.

            Args:
                query: A question about AgentID services, pricing, or agents.

            Returns:
                A deterministic fixture search result.
            """
            return {
                "status": "ok",
                "query": query,
                "results": [
                    {
                        "title": "AgentID Services",
                        "url": "https://agentid.services/",
                        "summary": (
                            "AgentID offers agent discovery, sponsor inventory, "
                            "and productized software-build services."
                        ),
                    }
                ],
            }

        return search_agentid_knowledge

    return VertexAiSearchTool(
        data_store_id=CONFIG.search_data_store,
        max_results=5,
        bypass_multi_tools_limit=True,
    )

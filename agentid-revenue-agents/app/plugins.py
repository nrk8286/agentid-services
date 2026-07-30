"""Global deterministic safety hooks for every AgentID tool call."""

from __future__ import annotations

import json
from typing import Any

from google.adk.plugins import BasePlugin

from app.config import CONFIG
from app.policy import validate_action_text

SENSITIVE_KEYS = {
    "access_token",
    "admin_token",
    "authorization",
    "email",
    "password",
    "phone",
    "refresh_token",
    "secret",
    "token",
}


def _redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: "[REDACTED]" if key.lower() in SENSITIVE_KEYS else _redact(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


class RevenueSafetyPlugin(BasePlugin):
    """Block unsafe growth actions and remove sensitive tool output."""

    def __init__(self) -> None:
        super().__init__(name="agentid_revenue_safety")

    async def before_tool_callback(
        self,
        *,
        tool: Any,
        tool_args: dict[str, Any],
        tool_context: Any,
    ) -> dict[str, Any] | None:
        del tool_context
        serialized = json.dumps(tool_args, sort_keys=True, default=str)
        decision = validate_action_text(serialized)
        if not decision.allowed:
            return {
                "status": "blocked",
                "code": decision.code,
                "reason": decision.reason,
                "tool": getattr(tool, "name", "unknown"),
            }

        spend = tool_args.get("estimated_cost_cents")
        if isinstance(spend, int) and spend > CONFIG.daily_spend_limit_cents:
            return {
                "status": "blocked",
                "code": "per_action_limit_exceeded",
                "reason": "The requested action exceeds the hard daily spend limit.",
                "tool": getattr(tool, "name", "unknown"),
            }
        return None

    async def after_tool_callback(
        self,
        *,
        tool: Any,
        tool_args: dict[str, Any],
        tool_context: Any,
        result: dict[str, Any],
    ) -> dict[str, Any] | None:
        del tool, tool_args, tool_context
        redacted = _redact(result)
        return redacted if redacted != result else None

"""Deterministic evaluator for AgentID specialist delegation."""

from __future__ import annotations

from typing import Any


def _function_calls(agent_data: dict[str, Any]) -> list[dict[str, Any]]:
    calls: list[dict[str, Any]] = []
    for turn in agent_data.get("turns", []):
        for event in turn.get("events", []):
            for part in event.get("content", {}).get("parts", []):
                if function_call := part.get("function_call"):
                    calls.append(function_call)
    return calls


def evaluate(instance: dict[str, Any]) -> dict[str, Any]:
    prompt = str(instance.get("prompt", "")).lower()
    expected_agent = None
    if "growth readiness" in prompt:
        expected_agent = "growth_agent"
    elif "lead-42" in prompt or "sponsor pitch" in prompt:
        expected_agent = "sales_agent"

    if expected_agent is None:
        return {
            "score": 1,
            "explanation": "No specialist delegation is required for this case.",
        }

    calls = _function_calls(instance.get("agent_data") or {})
    delegated_agents = {
        call.get("args", {}).get("agent_name")
        for call in calls
        if call.get("name") == "transfer_to_agent"
    }
    if expected_agent in delegated_agents:
        return {
            "score": 1,
            "explanation": f"Coordinator delegated to {expected_agent}.",
        }
    return {
        "score": 0,
        "explanation": f"Coordinator did not delegate to {expected_agent}.",
    }

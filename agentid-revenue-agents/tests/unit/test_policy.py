"""Unit tests for AgentID's deterministic revenue controls."""

import pytest

from app.config import AgentIdConfig
from app.policy import (
    build_utm_url,
    validate_action_text,
    validate_outreach,
    validate_spend,
)


def test_spend_allows_exact_limits() -> None:
    decision = validate_spend(250, 750, 9_750, 1_000, 10_000)
    assert decision.allowed


@pytest.mark.parametrize(
    ("amount", "daily", "monthly", "code"),
    [
        (1_001, 0, 0, "per_action_limit_exceeded"),
        (300, 800, 0, "daily_limit_exceeded"),
        (200, 0, 9_900, "monthly_limit_exceeded"),
        (-1, 0, 0, "invalid_spend"),
    ],
)
def test_spend_blocks_limit_violations(
    amount: int, daily: int, monthly: int, code: str
) -> None:
    decision = validate_spend(amount, daily, monthly, 1_000, 10_000)
    assert not decision.allowed
    assert decision.code == code


def test_outreach_requires_consent() -> None:
    decision = validate_outreach(False, False, False, False, False)
    assert not decision.allowed
    assert decision.code == "consent_required"


@pytest.mark.parametrize(
    ("opted_out", "bounced", "complaint", "human_takeover", "code"),
    [
        (True, False, False, False, "opted_out"),
        (False, True, False, False, "suppressed_bounce"),
        (False, False, True, False, "suppressed_complaint"),
        (False, False, False, True, "human_takeover"),
    ],
)
def test_outreach_honors_suppression(
    opted_out: bool,
    bounced: bool,
    complaint: bool,
    human_takeover: bool,
    code: str,
) -> None:
    decision = validate_outreach(True, opted_out, bounced, complaint, human_takeover)
    assert not decision.allowed
    assert decision.code == code


def test_utm_builder_preserves_existing_query() -> None:
    url = build_utm_url(
        "https://gptmarketplus.com/pricing?plan=sponsor",
        "newsletter",
        "email",
        "summer_launch",
    )
    assert "plan=sponsor" in url
    assert "utm_source=newsletter" in url
    assert "utm_medium=email" in url
    assert "utm_campaign=summer_launch" in url


def test_utm_builder_rejects_external_destination() -> None:
    with pytest.raises(ValueError, match=r"gptmarketplus\.com"):
        build_utm_url("https://example.com", "social", "agent", "test")


def test_action_policy_blocks_fake_engagement() -> None:
    decision = validate_action_text("Please click our own ads to boost revenue")
    assert not decision.allowed
    assert decision.code == "prohibited_growth_tactic"


def test_config_defaults_to_dry_run(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("AGENTID_DRY_RUN", raising=False)
    config = AgentIdConfig.from_environment()
    assert config.dry_run is True
    assert config.daily_spend_limit_cents == 1_000
    assert config.monthly_spend_limit_cents == 10_000

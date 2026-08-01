"""Deterministic safety and attribution policy for revenue actions."""

from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


@dataclass(frozen=True)
class PolicyDecision:
    """A machine-readable policy result."""

    allowed: bool
    code: str
    reason: str


PROHIBITED_ACTION_PHRASES = (
    "buy followers",
    "click our own ad",
    "click our own ads",
    "fake click",
    "fake review",
    "impersonate",
    "purchased list",
    "scrape private",
    "spam",
)


def validate_action_text(text: str) -> PolicyDecision:
    """Reject deceptive, fraudulent, invasive, or spam-oriented requests."""
    normalized = " ".join(text.lower().split())
    for phrase in PROHIBITED_ACTION_PHRASES:
        if phrase in normalized:
            return PolicyDecision(
                allowed=False,
                code="prohibited_growth_tactic",
                reason=f"Action contains prohibited tactic: {phrase}.",
            )
    return PolicyDecision(True, "allowed", "Action text passed deterministic policy.")


def validate_spend(
    amount_cents: int,
    daily_spend_cents: int,
    monthly_spend_cents: int,
    daily_limit_cents: int,
    monthly_limit_cents: int,
) -> PolicyDecision:
    """Validate a proposed reservation against hard daily and monthly limits."""
    if amount_cents < 0:
        return PolicyDecision(False, "invalid_spend", "Spend cannot be negative.")
    if amount_cents > daily_limit_cents:
        return PolicyDecision(
            False,
            "per_action_limit_exceeded",
            "One action cannot exceed the entire daily limit.",
        )
    if daily_spend_cents + amount_cents > daily_limit_cents:
        return PolicyDecision(
            False,
            "daily_limit_exceeded",
            "The proposed action would exceed the daily spend limit.",
        )
    if monthly_spend_cents + amount_cents > monthly_limit_cents:
        return PolicyDecision(
            False,
            "monthly_limit_exceeded",
            "The proposed action would exceed the monthly spend limit.",
        )
    return PolicyDecision(True, "allowed", "Spend is within both hard limits.")


def validate_outreach(
    consent: bool,
    opted_out: bool,
    bounced: bool,
    complaint: bool,
    human_takeover: bool,
) -> PolicyDecision:
    """Validate a sales follow-up against consent and suppression controls."""
    if human_takeover:
        return PolicyDecision(
            False,
            "human_takeover",
            "Automation is paused because a human has taken ownership.",
        )
    if opted_out:
        return PolicyDecision(False, "opted_out", "The recipient opted out.")
    if bounced:
        return PolicyDecision(False, "suppressed_bounce", "The address bounced.")
    if complaint:
        return PolicyDecision(
            False, "suppressed_complaint", "The recipient filed a complaint."
        )
    if not consent:
        return PolicyDecision(
            False,
            "consent_required",
            "Documented consent or another valid outreach basis is required.",
        )
    return PolicyDecision(True, "allowed", "Outreach passed suppression controls.")


def build_utm_url(
    destination_url: str,
    source: str,
    medium: str,
    campaign: str,
) -> str:
    """Return an AgentID URL with normalized UTM attribution parameters."""
    parsed = urlparse(destination_url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("destination_url must use http or https")
    if parsed.hostname not in {"gptmarketplus.com", "www.gptmarketplus.com"}:
        raise ValueError("destination_url must point to gptmarketplus.com")

    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query.update(
        {
            "utm_source": source.strip().lower().replace(" ", "_"),
            "utm_medium": medium.strip().lower().replace(" ", "_"),
            "utm_campaign": campaign.strip().lower().replace(" ", "_"),
        }
    )
    return urlunparse(parsed._replace(query=urlencode(query)))

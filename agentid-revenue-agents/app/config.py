"""Runtime configuration for the AgentID revenue-agent team."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _as_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _as_positive_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    parsed = int(value)
    if parsed <= 0:
        raise ValueError(f"{name} must be a positive integer")
    return parsed


@dataclass(frozen=True)
class AgentIdConfig:
    """Validated environment-backed AgentID settings."""

    base_url: str
    project_id: str
    location: str
    search_data_store: str
    daily_spend_limit_cents: int
    monthly_spend_limit_cents: int
    dry_run: bool
    integration_test: bool
    admin_token: str
    action_endpoint: str
    spend_ledger_endpoint: str
    gmail_enabled: bool
    social_enabled: bool
    paid_ads_enabled: bool

    @classmethod
    def from_environment(cls) -> AgentIdConfig:
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "agentid-genai-app-2026")
        return cls(
            base_url=os.getenv("AGENTID_BASE_URL", "https://agentid.services").rstrip(
                "/"
            ),
            project_id=project_id,
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "global"),
            search_data_store=os.getenv(
                "AGENTID_SEARCH_DATA_STORE",
                (
                    "projects/497730280367/locations/global/collections/"
                    "default_collection/dataStores/agentid-public-knowledge"
                ),
            ),
            daily_spend_limit_cents=_as_positive_int(
                "AGENTID_DAILY_SPEND_LIMIT_CENTS", 1_000
            ),
            monthly_spend_limit_cents=_as_positive_int(
                "AGENTID_MONTHLY_SPEND_LIMIT_CENTS", 10_000
            ),
            dry_run=_as_bool("AGENTID_DRY_RUN", True),
            integration_test=_as_bool("INTEGRATION_TEST", False),
            admin_token=os.getenv("AGENTID_ADMIN_TOKEN", ""),
            action_endpoint=os.getenv("AGENTID_ACTION_ENDPOINT", "").strip(),
            spend_ledger_endpoint=os.getenv(
                "AGENTID_SPEND_LEDGER_ENDPOINT", ""
            ).strip(),
            gmail_enabled=_as_bool("AGENTID_GMAIL_ENABLED", False),
            social_enabled=_as_bool("AGENTID_SOCIAL_ENABLED", False),
            paid_ads_enabled=_as_bool("AGENTID_PAID_ADS_ENABLED", False),
        )

    def channel_enabled(self, channel: str) -> bool:
        """Return whether a runtime channel is explicitly enabled."""
        normalized = channel.strip().lower()
        if normalized in {"website", "indexnow", "agentid"}:
            return True
        if normalized in {"email", "gmail"}:
            return self.gmail_enabled
        if normalized in {"social", "linkedin", "x", "facebook", "instagram"}:
            return self.social_enabled
        if normalized in {"paid_ads", "google_ads", "advertising"}:
            return self.paid_ads_enabled
        return False


CONFIG = AgentIdConfig.from_environment()

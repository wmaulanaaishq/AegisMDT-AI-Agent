"""AegisMDT Configuration — Centralized environment variable loading."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class LLMConfig:
    """LLM provider configuration."""
    api_key: str
    base_url: str
    model: str


@dataclass(frozen=True)
class BandAgentConfig:
    """Single Band agent credentials."""
    agent_id: str
    api_key: str
    handle: str


@dataclass(frozen=True)
class Settings:
    """Application-wide settings loaded from environment."""

    # LLM Providers
    featherless: LLMConfig = field(default_factory=lambda: LLMConfig(
        api_key=os.getenv("FEATHERLESS_API_KEY", ""),
        base_url=os.getenv("FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1"),
        model=os.getenv("FEATHERLESS_MODEL", "Qwen/Qwen3-32B"),
    ))
    aimlapi: LLMConfig = field(default_factory=lambda: LLMConfig(
        api_key=os.getenv("AIMLAPI_KEY", ""),
        base_url=os.getenv("AIMLAPI_BASE_URL", "https://api.aimlapi.com/v1"),
        model=os.getenv("AIMLAPI_MODEL", "Qwen/Qwen3-235B-A22B"),
    ))

    # Band Platform
    band_rest_url: str = field(default_factory=lambda: os.getenv("BAND_REST_URL", "https://app.band.ai"))
    band_ws_url: str = field(default_factory=lambda: os.getenv("BAND_WS_URL", "wss://app.band.ai/api/v1/socket/websocket"))

    # Band Agents
    moderator: BandAgentConfig = field(default_factory=lambda: BandAgentConfig(
        agent_id=os.getenv("MODERATOR_AGENT_ID", ""),
        api_key=os.getenv("MODERATOR_API_KEY", ""),
        handle="@maulaishaq1/moderator-agent",
    ))
    pathology: BandAgentConfig = field(default_factory=lambda: BandAgentConfig(
        agent_id=os.getenv("PATHOLOGY_AGENT_ID", ""),
        api_key=os.getenv("PATHOLOGY_API_KEY", ""),
        handle="@maulaishaq1/pathology-agent",
    ))
    prognostication: BandAgentConfig = field(default_factory=lambda: BandAgentConfig(
        agent_id=os.getenv("PROGNOSTICATION_AGENT_ID", ""),
        api_key=os.getenv("PROGNOSTICATION_API_KEY", ""),
        handle="@maulaishaq1/prognostication-agent",
    ))
    clinical_trial: BandAgentConfig = field(default_factory=lambda: BandAgentConfig(
        agent_id=os.getenv("CLINICAL_TRIAL_AGENT_ID", ""),
        api_key=os.getenv("CLINICAL_TRIAL_API_KEY", ""),
        handle="@maulaishaq1/clinical-trial-agent",
    ))

    # ChromaDB
    chroma_api_key: str = field(default_factory=lambda: os.getenv("CHROMA_API_KEY", ""))
    chroma_tenant: str = field(default_factory=lambda: os.getenv("CHROMA_TENANT", ""))
    chroma_database: str = field(default_factory=lambda: os.getenv("CHROMA_DATABASE", "Cyllene"))

    # App
    app_host: str = field(default_factory=lambda: os.getenv("APP_HOST", "0.0.0.0"))
    app_port: int = field(default_factory=lambda: int(os.getenv("APP_PORT", "8000")))
    frontend_url: str = field(default_factory=lambda: os.getenv("FRONTEND_URL", "http://localhost:3000"))
    debug: bool = field(default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true")

    # DOKU Payment Gateway
    doku_client_id: str = field(default_factory=lambda: os.getenv("DOKU_CLIENT_ID", ""))
    doku_secret_key: str = field(default_factory=lambda: os.getenv("DOKU_SECRET_KEY", ""))


settings = Settings()

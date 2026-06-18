"""Pydantic models for AegisMDT — patient cases, agent messages, diagnoses."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class CaseStatus(str, Enum):
    SUBMITTED = "submitted"
    PROCESSING = "processing"
    DEBATING = "debating"
    CONSENSUS_REACHED = "consensus_reached"
    AWAITING_APPROVAL = "awaiting_approval"
    APPROVED = "approved"
    REVISED = "revised"
    ERROR = "error"


class AgentRole(str, Enum):
    MODERATOR = "moderator"
    PATHOLOGY = "pathology"
    PROGNOSTICATION = "prognostication"
    CLINICAL_TRIAL = "clinical_trial"
    PRIVACY = "privacy"


class PatientCaseInput(BaseModel):
    """Input from doctor submitting a case."""
    description: str = Field(..., min_length=20, description="Detailed case description")
    age: Optional[int] = Field(None, ge=0, le=150)
    sex: Optional[str] = Field(None, pattern="^(male|female|other)$")
    medical_history: Optional[str] = None
    current_symptoms: Optional[str] = None
    lab_results: Optional[str] = None
    genetic_profile: Optional[str] = None
    image_url: Optional[str] = None


class PatientCase(BaseModel):
    """Full patient case record."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: CaseStatus = CaseStatus.SUBMITTED
    input_data: PatientCaseInput
    anonymized_summary: Optional[str] = None
    band_room_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    consensus_result: Optional[ConsensusResult] = None
    timeline: list[AgentMessage] = Field(default_factory=list)


class AgentMessage(BaseModel):
    """A single message from an agent in the discussion."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    agent_role: AgentRole
    agent_handle: str
    content: str
    message_type: str = "analysis"  # analysis, debate, consensus, reference
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    references: list[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    debate_round: Optional[int] = None
    reasoning_trace: Optional[str] = None


class Diagnosis(BaseModel):
    """Structured diagnosis from pathology agent."""
    primary_diagnosis: str = "Unspecified Diagnosis"
    who_classification: Optional[str] = None
    mutation_profile: list[str] = Field(default_factory=list)
    morphology_findings: Optional[str] = None
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    supporting_evidence: list[str] = Field(default_factory=list)


class RiskAssessment(BaseModel):
    """Risk assessment from prognostication agent."""
    risk_category: str = "Unknown"  # Low, Intermediate-1, Intermediate-2, High
    ipss_score: Optional[float] = None
    estimated_survival_months: Optional[int] = None
    treatment_urgency: str = "monitoring"  # immediate, urgent, elective, monitoring
    prognostic_factors: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)


class ClinicalTrialMatch(BaseModel):
    """Clinical trial match from trial agent."""
    trial_id: str = "N/A"
    title: str = "Unknown Trial"
    phase: str = "Unknown"
    status: str = "Unknown"
    eligibility_match_score: float = Field(default=0.0, ge=0.0, le=1.0)
    location: Optional[str] = None
    intervention: Optional[str] = None
    url: Optional[str] = None


class ConsensusResult(BaseModel):
    """Final consensus from the medical board."""
    diagnosis: Diagnosis
    risk_assessment: RiskAssessment
    clinical_trials: list[ClinicalTrialMatch] = Field(default_factory=list)
    treatment_recommendation: str = "Review required"
    consensus_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    debate_rounds: int = 0
    dissenting_opinions: list[str] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)


class CaseApproval(BaseModel):
    """Doctor's approval/revision of the consensus."""
    approved: bool
    doctor_notes: Optional[str] = None


# Forward reference resolution
PatientCase.model_rebuild()

import asyncio
import json
import logging
from datetime import datetime

from models import (PatientCase, AgentMessage, Diagnosis, RiskAssessment, 
                    ClinicalTrialMatch, ConsensusResult, CaseStatus, AgentRole)

from agents.privacy_agent import anonymize_case
from agents.pathology_agent import analyze_pathology
from agents.prognostication_agent import assess_prognosis
from agents.clinical_trial_agent import match_clinical_trials
from agents.moderator_agent import mediate_debate, synthesize_consensus
from band_integration import setup_case_room, send_agent_message
from config import settings

logger = logging.getLogger(__name__)

async def run_case_pipeline(case: PatientCase, message_callback=None) -> PatientCase:
    """Core orchestration engine for the medical board workflow."""
    
    async def emit_message(msg: AgentMessage):
        case.timeline.append(msg)
        if message_callback:
            await message_callback(msg)

    # 1. Privacy & Anonymization
    case.status = CaseStatus.PROCESSING
    anonymized_summary, msg = await anonymize_case(case.input_data, case.id)
    await emit_message(msg)
    case.anonymized_summary = anonymized_summary

    # Setup Band Room (Fire and forget, we don't strictly wait on it for the internal pipeline)
    band_room_id = await setup_case_room(case.id, anonymized_summary)
    case.band_room_id = band_room_id

    # 2. Pathology Analysis
    path_coro = analyze_pathology(anonymized_summary, case.input_data.image_url)
    prog_coro = assess_prognosis(anonymized_summary, {})  # Initial prognosis without full pathology
    
    path_result, path_msg = await path_coro
    prog_result, prog_msg = await prog_coro
    
    await emit_message(path_msg)
    if band_room_id:
        await send_agent_message(band_room_id, settings.pathology.api_key, path_msg.content)
        
    await emit_message(prog_msg)
    if band_room_id:
        await send_agent_message(band_room_id, settings.prognostication.api_key, prog_msg.content)

    # 3. Clinical Trials Match
    trials_result, trial_msg = await match_clinical_trials(anonymized_summary, path_result, prog_result)
    await emit_message(trial_msg)
    if band_room_id:
        await send_agent_message(band_room_id, settings.clinical_trial.api_key, trial_msg.content)

    # 4 & 5. ICE Protocol: Iterative Consensus Ensemble (Max 3 Rounds)
    max_rounds = 3
    current_round = 1
    debate_history = []
    
    # Initial Synthesis
    synth_result, synth_msg = await synthesize_consensus(
        anonymized_summary, path_result, prog_result, trials_result, debate_history
    )
    await emit_message(synth_msg)
    if band_room_id:
        await send_agent_message(band_room_id, settings.moderator.api_key, synth_msg.content)

    while current_round < max_rounds and synth_result.get("consensus_confidence", 0.0) < 0.8:
        current_round += 1
        case.status = CaseStatus.DEBATING
        topic = f"Round {current_round}: Consensus confidence is low ({synth_result.get('consensus_confidence', 0.0):.2f}). Dissenting points: {synth_result.get('dissenting_opinions', [])}. Please debate and resolve conflicts."
        
        resolution, debate_msgs = await mediate_debate(
            json.dumps(path_result), 
            json.dumps(prog_result), 
            topic
        )
        
        for d_msg in debate_msgs:
            d_msg.debate_round = current_round
            await emit_message(d_msg)
            debate_history.append(d_msg.content)
            
            api_key = settings.moderator.api_key
            if d_msg.agent_role == "pathology":
                api_key = settings.pathology.api_key
            elif d_msg.agent_role == "prognostication":
                api_key = settings.prognostication.api_key
                
            if band_room_id:
                await send_agent_message(band_room_id, api_key, d_msg.content)
                
        # Re-synthesize after debate
        synth_result, synth_msg = await synthesize_consensus(
            anonymized_summary, path_result, prog_result, trials_result, debate_history
        )
        synth_msg.debate_round = current_round
        await emit_message(synth_msg)
        if band_room_id:
            await send_agent_message(band_room_id, settings.moderator.api_key, synth_msg.content)

    # Fallback to human if consensus is still low
    if synth_result.get("consensus_confidence", 0.0) < 0.8:
        synth_result["treatment_recommendation"] = "[REQUIRES DOCTOR INTERVENTION] " + synth_result.get("treatment_recommendation", "")

    # Build ConsensusResult
    case.consensus_result = ConsensusResult(
        diagnosis=Diagnosis(**path_result) if path_result.get("primary_diagnosis") else Diagnosis(primary_diagnosis="Unknown", confidence=0),
        risk_assessment=RiskAssessment(**prog_result) if prog_result.get("risk_category") else RiskAssessment(risk_category="Unknown", treatment_urgency="monitoring", confidence=0),
        clinical_trials=[ClinicalTrialMatch(**t) for t in trials_result] if isinstance(trials_result, list) else [],
        treatment_recommendation=synth_result.get("treatment_recommendation", "Review required"),
        consensus_confidence=synth_result.get("consensus_confidence", 0.0),
        debate_rounds=len(debate_history) // 2,
        dissenting_opinions=synth_result.get("dissenting_opinions", []),
        references=synth_result.get("references", [])
    )
    
    case.status = CaseStatus.AWAITING_APPROVAL
    case.updated_at = datetime.utcnow()
    
    return case

async def process_revision_bg(case: PatientCase, feedback: str, message_callback=None) -> PatientCase:
    """Handles doctor's revision request and triggers re-synthesis."""
    
    async def emit_message(msg: AgentMessage):
        case.timeline.append(msg)
        if message_callback:
            await message_callback(msg)

    # Emit Doctor's Feedback as a Message
    doctor_msg = AgentMessage(
        agent_role=AgentRole.MODERATOR,
        agent_handle="Attending Physician (Human)",
        content=f"**Human Review Feedback:**\n{feedback}\n\nPlease revise the consensus taking this clinical feedback into consideration.",
        message_type="analysis"
    )
    await emit_message(doctor_msg)
    
    if case.band_room_id:
        await send_agent_message(case.band_room_id, settings.moderator.api_key, doctor_msg.content)
        
    # Extract previous results from consensus
    debate_history = [m.content for m in case.timeline if m.message_type == 'debate']
    debate_history.append(f"Doctor's Feedback: {feedback}")
    
    path_result = case.consensus_result.diagnosis.model_dump() if case.consensus_result else {}
    prog_result = case.consensus_result.risk_assessment.model_dump() if case.consensus_result else {}
    trials_result = [t.model_dump() for t in case.consensus_result.clinical_trials] if case.consensus_result else []
    
    # Re-synthesize
    synth_result, synth_msg = await synthesize_consensus(
        case.anonymized_summary or "", 
        path_result, 
        prog_result, 
        trials_result, 
        debate_history
    )
    await emit_message(synth_msg)
    if case.band_room_id:
        await send_agent_message(case.band_room_id, settings.moderator.api_key, synth_msg.content)
        
    # Update Consensus
    if case.consensus_result:
        case.consensus_result.treatment_recommendation = synth_result.get("treatment_recommendation", case.consensus_result.treatment_recommendation)
        case.consensus_result.consensus_confidence = synth_result.get("consensus_confidence", case.consensus_result.consensus_confidence)
        case.consensus_result.dissenting_opinions = synth_result.get("dissenting_opinions", case.consensus_result.dissenting_opinions)
        case.consensus_result.references = synth_result.get("references", case.consensus_result.references)
    
    case.status = CaseStatus.AWAITING_APPROVAL
    case.updated_at = datetime.utcnow()
    
    return case

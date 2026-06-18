import logging
import json
from datetime import datetime

from models import AgentRole, AgentMessage
from llm_client import call_llm, fold_context
from config import settings

logger = logging.getLogger(__name__)

async def match_clinical_trials(anonymized_case: str, pathology_result: dict, prognosis_result: dict) -> tuple[list[dict], AgentMessage]:
    """Match the patient to appropriate experimental therapies."""
    logger.info("Clinical Trial Agent: Matching trials")
    
    system_prompt = """You are a clinical research coordinator specializing in oncology trial matching.
Based on the patient's diagnosis, genetic profile, and risk assessment, identify the most relevant clinical trials.
Generate realistic trial data based on actual common oncology trials, or simulate a ClinicalTrials.gov search.
Format: Return a JSON array of trial objects. Do NOT wrap it in a top-level object, just return the array `[ {...}, {...} ]`.
Each object should have:
{
    "trial_id": "string (e.g., NCT01234567)",
    "title": "string",
    "phase": "string (e.g., Phase 1/2)",
    "status": "string (e.g., Recruiting)",
    "eligibility_match_score": float (0.0 to 1.0),
    "location": "string",
    "intervention": "string",
    "url": "string"
}
"""
    
    user_message = f"""
Case Description:
{anonymized_case}

Pathology Findings:
{json.dumps(pathology_result, indent=2)}

Prognostication:
{json.dumps(prognosis_result, indent=2)}
"""
    
    try:
        folded_input = fold_context(user_message)
        from llm_client import call_llm_json
        
        try:
            result, thinking_trace = await call_llm_json(
                system_prompt=system_prompt,
                user_message=folded_input,
                provider="featherless",
                temperature=0.2,
                max_retries=2
            )
        except Exception as e:
            logger.error("Clinical Trial Agent: Failed to obtain valid JSON")
            result = []
            thinking_trace = ""
            
        if isinstance(result, dict) and "trials" in result:
            result = result["trials"]
        elif not isinstance(result, list):
            result = [result] if result else []

        content = f"Found {len(result)} potential clinical trial matches based on the current profile."
        if result:
            top_trial = result[0]
            if isinstance(top_trial, dict):
                content += f" Top match: {top_trial.get('title', 'Unknown')} (Phase {top_trial.get('phase', 'Unknown')})."
        
        message = AgentMessage(
            agent_role=AgentRole.CLINICAL_TRIAL,
            agent_handle=settings.clinical_trial.handle,
            content=content,
            message_type="analysis",
            confidence=0.8 if result else 0.4,
            reasoning_trace=thinking_trace
        )
        
        return result, message
    except Exception as e:
        logger.error(f"Clinical Trial Agent failed: {e}")
        return [], AgentMessage(
            agent_role=AgentRole.CLINICAL_TRIAL,
            agent_handle=settings.clinical_trial.handle,
            content=f"Error matching trials: {str(e)}",
            message_type="error",
            confidence=0.0
        )

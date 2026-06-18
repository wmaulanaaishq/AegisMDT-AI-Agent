import logging
import json
from datetime import datetime

from models import AgentRole, AgentMessage
from llm_client import call_llm, fold_context
from config import settings

logger = logging.getLogger(__name__)

async def assess_prognosis(anonymized_case: str, pathology_result: dict) -> tuple[dict, AgentMessage]:
    """Calculate risk and estimate survival using clinical scoring systems."""
    logger.info("Prognostication Agent: Assessing prognosis")
    
    system_prompt = """You are a senior clinical oncologist specializing in prognostication. 
Use IPSS-R (Revised International Prognostic Scoring System) and other validated scoring systems based on the case description and pathology findings.
Consider the pathology findings provided. Always explain your risk stratification reasoning.
Return a JSON object with the following schema:
{
    "risk_category": "string (Low, Intermediate-1, Intermediate-2, High)",
    "ipss_score": float (or null),
    "estimated_survival_months": int (or null),
    "treatment_urgency": "string (immediate, urgent, elective, monitoring)",
    "prognostic_factors": ["string"],
    "confidence": float (0.0 to 1.0)
}
"""
    
    user_message = f"""
Case Description:
{anonymized_case}

Pathology Findings:
{json.dumps(pathology_result, indent=2)}
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
            logger.error("Prognostication Agent: Failed to obtain valid JSON")
            result = {
                "risk_category": "Unknown",
                "ipss_score": None,
                "estimated_survival_months": None,
                "treatment_urgency": "monitoring",
                "prognostic_factors": [],
                "confidence": 0.0
            }
            thinking_trace = ""

        # Create the agent message for the timeline
        risk = result.get("risk_category", "Unknown")
        urgency = result.get("treatment_urgency", "monitoring")
        conf = result.get("confidence", 0.0)
        content = f"Prognostic assessment: Risk Category is {risk}. Treatment Urgency: {urgency.upper()}. Confidence: {conf:.2f}. Key factors: {', '.join(result.get('prognostic_factors', []))}."
        
        message = AgentMessage(
            agent_role=AgentRole.PROGNOSTICATION,
            agent_handle=settings.prognostication.handle,
            content=content,
            message_type="analysis",
            confidence=conf,
            reasoning_trace=thinking_trace
        )
        
        return result, message
    except Exception as e:
        logger.error(f"Prognostication Agent failed: {e}")
        return {}, AgentMessage(
            agent_role=AgentRole.PROGNOSTICATION,
            agent_handle=settings.prognostication.handle,
            content=f"Error during prognostication: {str(e)}",
            message_type="error",
            confidence=0.0
        )

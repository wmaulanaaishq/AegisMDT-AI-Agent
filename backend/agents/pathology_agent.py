import logging
import json
from datetime import datetime

from models import AgentRole, AgentMessage
from llm_client import call_llm, fold_context
from config import settings

logger = logging.getLogger(__name__)

async def analyze_pathology(anonymized_case: str, image_url: str = None) -> tuple[dict, AgentMessage]:
    """Analyze the case from a pathology and genomics perspective."""
    logger.info("Pathology Agent: Analyzing case")
    
    system_prompt = """You are a world-class hematopathologist and genomics specialist. 
Analyze the anonymized patient case using WHO 2022 classification criteria.
If a medical image (e.g., Whole Slide Image) is provided, visually analyze the morphology in conjunction with the clinical text.
Identify morphological features, cytogenetic abnormalities, and molecular mutations. Always cite WHO classification standards.
Return a JSON object with the following schema:
{
    "primary_diagnosis": "string",
    "who_classification": "string",
    "mutation_profile": ["string"],
    "morphology_findings": "string",
    "confidence": float (0.0 to 1.0),
    "supporting_evidence": ["string"]
}
"""
    
    try:
        folded_input = fold_context(anonymized_case)
        from llm_client import call_llm_json
        
        try:
            result, thinking_trace = await call_llm_json(
                system_prompt=system_prompt,
                user_message=folded_input,
                provider="featherless",
                temperature=0.2,
                max_retries=2,
                image_url=image_url
            )
        except Exception as e:
            logger.error("Pathology Agent: Failed to obtain valid JSON")
            result = {
                "primary_diagnosis": "Error parsing diagnosis",
                "who_classification": "Unknown",
                "mutation_profile": [],
                "morphology_findings": "Error",
                "confidence": 0.0,
                "supporting_evidence": []
            }
            thinking_trace = ""

        # Create the agent message for the timeline
        diagnosis = result.get("primary_diagnosis", "Unknown")
        conf = result.get("confidence", 0.0)
        content = f"Pathology analysis complete. Primary Diagnosis: {diagnosis} (Confidence: {conf:.2f}). WHO Classification: {result.get('who_classification', 'N/A')}. Mutations found: {', '.join(result.get('mutation_profile', []))}."
        
        message = AgentMessage(
            agent_role=AgentRole.PATHOLOGY,
            agent_handle=settings.pathology.handle,
            content=content,
            message_type="analysis",
            confidence=conf,
            references=result.get("supporting_evidence", []),
            reasoning_trace=thinking_trace
        )
        
        return result, message
    except Exception as e:
        logger.error(f"Pathology Agent failed: {e}")
        return {}, AgentMessage(
            agent_role=AgentRole.PATHOLOGY,
            agent_handle=settings.pathology.handle,
            content=f"Error during pathology analysis: {str(e)}",
            message_type="error",
            confidence=0.0
        )

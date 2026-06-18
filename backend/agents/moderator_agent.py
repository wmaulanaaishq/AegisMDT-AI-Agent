import logging
import json
from datetime import datetime

from models import AgentRole, AgentMessage, ConsensusResult, Diagnosis, RiskAssessment, ClinicalTrialMatch
from llm_client import call_llm, call_llm_with_history, fold_context
from config import settings

logger = logging.getLogger(__name__)

async def mediate_debate(agent_a_opinion: str, agent_b_opinion: str, topic: str) -> tuple[dict, list[AgentMessage]]:
    """Mediate a debate between two conflicting opinions (ICE Protocol)."""
    logger.info("Moderator Agent: Mediating debate")
    
    messages = []
    
    import asyncio
    
    from pubmed_client import fetch_literature_context
    logger.info("Fetching literature context for debate groundedness...")
    literature_context = await fetch_literature_context(f"{topic} rare presentation")
    
    # Simulate a multi-round debate
    system_prompt_a = f"""You are Agent A, a specialist. Defend your opinion against Agent B using specific literature citations.
    
REAL MEDICAL LITERATURE CONTEXT (Use this to ground your argument):
{literature_context}
"""
    system_prompt_b = f"""You are Agent B, a specialist. Defend your opinion against Agent A using specific literature citations.

REAL MEDICAL LITERATURE CONTEXT (Use this to ground your argument):
{literature_context}
"""
    
    # Round 1 (Parallel execution)
    task_a = call_llm(system_prompt_a, f"Topic: {topic}\nYour Opinion: {agent_a_opinion}\nAgent B's Opinion: {agent_b_opinion}\nWrite a 2-paragraph rebuttal.")
    task_b = call_llm(system_prompt_b, f"Topic: {topic}\nYour Opinion: {agent_b_opinion}\nAgent A's Opinion: {agent_a_opinion}\nWrite a 2-paragraph rebuttal.")
    
    (rebuttal_a, trace_a), (rebuttal_b, trace_b) = await asyncio.gather(task_a, task_b)
    
    messages.append(AgentMessage(
        agent_role=AgentRole.PATHOLOGY,
        agent_handle=settings.pathology.handle,
        content=rebuttal_a,
        message_type="debate",
        debate_round=1,
        reasoning_trace=trace_a
    ))
    messages.append(AgentMessage(
        agent_role=AgentRole.PROGNOSTICATION,
        agent_handle=settings.prognostication.handle,
        content=rebuttal_b,
        message_type="debate",
        debate_round=1,
        reasoning_trace=trace_b
    ))
    
    # Moderator Resolution
    mod_sys_prompt = "You are the Chairman of the MDT Board. Resolve the debate between Agent A and Agent B. Return a JSON with: 'consensus' (string), 'resolution' (string), 'confidence' (float), 'references' (list)."
    mod_user = f"Topic: {topic}\nAgent A: {rebuttal_a}\nAgent B: {rebuttal_b}"
    
    resolution_text, trace_mod = await call_llm(mod_sys_prompt, mod_user, json_mode=True)
    try:
        resolution = json.loads(resolution_text)
    except:
        resolution = {
            "consensus": "Debate inconclusive",
            "resolution": "Requires human review",
            "confidence": 0.5,
            "references": []
        }
        
    messages.append(AgentMessage(
        agent_role=AgentRole.MODERATOR,
        agent_handle=settings.moderator.handle,
        content=f"Debate Resolved. Consensus: {resolution.get('consensus')}",
        message_type="consensus",
        confidence=resolution.get("confidence", 0.8),
        references=resolution.get("references", []),
        reasoning_trace=trace_mod
    ))
    
    return resolution, messages

async def synthesize_consensus(anonymized_case: str, pathology: dict, prognosis: dict, trials: list, debate_history: list[str]) -> tuple[dict, AgentMessage]:
    """Synthesize all results into a final consensus recommendation."""
    logger.info("Moderator Agent: Synthesizing consensus")
    
    system_prompt = """You are the Chairman of an international Molecular Tumor Board.
Your role is to synthesize specialist opinions, resolve diagnostic conflicts, and produce a final consensus recommendation.
Return a JSON object with the following schema:
{
    "treatment_recommendation": "string",
    "consensus_confidence": float (0.0 to 1.0),
    "dissenting_opinions": ["string"],
    "references": ["string"]
}
"""
    
    from vector_store import search_similar_cases
    historical_cases = search_similar_cases(anonymized_case)
    history_context = chr(10).join(historical_cases) if historical_cases else "No similar historical cases found."
    
    user_message = f"""
Patient Case:
{anonymized_case}

Pathology Findings:
{json.dumps(pathology, indent=2)}

Prognosis Assessment:
{json.dumps(prognosis, indent=2)}

Clinical Trial Matches:
{json.dumps(trials, indent=2)}

Debate History:
{chr(10).join(debate_history) if debate_history else "No debate required."}

Similar Historical Precedents (RAG Database):
{history_context}
"""
    
    try:
        folded_input = fold_context(user_message)
        from llm_client import call_llm_json
        
        try:
            result, thinking_trace = await call_llm_json(
                system_prompt=system_prompt,
                user_message=user_message,
                provider="featherless",
                temperature=0.3,
                max_retries=2
            )
        except Exception as e:
            logger.error("Moderator Agent: Failed to obtain valid JSON")
            result = {
                "diagnosis": pathology,
                "risk_assessment": prognosis,
                "clinical_trials": trials,
                "treatment_recommendation": "Error compiling consensus. Please review individual agent notes.",
                "consensus_confidence": 0.0,
                "dissenting_opinions": [],
                "references": []
            }
            thinking_trace = ""
            
        content = f"Final Consensus Reached. Recommendation: {result.get('treatment_recommendation')} (Confidence: {result.get('consensus_confidence', 0.0):.2f})."
        message = AgentMessage(
            agent_role=AgentRole.MODERATOR,
            agent_handle=settings.moderator.handle,
            content=content,
            message_type="consensus",
            confidence=result.get("consensus_confidence", 0.0),
            references=result.get("references", []),
            reasoning_trace=thinking_trace
        )
        
        return result, message
    except Exception as e:
        logger.error(f"Moderator Agent failed: {e}")
        return {}, AgentMessage(
            agent_role=AgentRole.MODERATOR,
            agent_handle=settings.moderator.handle,
            content=f"Error generating consensus: {str(e)}",
            message_type="error",
            confidence=0.0
        )

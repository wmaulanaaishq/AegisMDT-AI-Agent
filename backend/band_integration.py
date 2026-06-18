import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)

async def create_case_room(case_id: str, case_summary: str) -> str:
    """Create a new Band room for a case using the Moderator's credentials."""
    logger.info(f"Creating Band room for case {case_id}")
    url = f"{settings.band_rest_url}/api/v1/me/chats"
    headers = {
        "X-API-Key": settings.moderator.api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "chat": {
            "name": f"AegisMDT Case: {case_id[:8]}",
            "description": case_summary[:100] + "..."
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("id", "")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            logger.warning("Band Integration Disabled (403 Forbidden). Falling back to local orchestrator only.")
        else:
            logger.warning(f"Band API error: {e}")
        return ""
    except Exception as e:
        logger.error(f"Failed to create Band room: {e}")
        return ""

async def add_agent_to_room(room_id: str, agent_id: str, api_key: str) -> None:
    """Add an agent to a Band room as a participant."""
    if not room_id or not agent_id:
        return
        
    logger.info(f"Adding agent {agent_id} to room {room_id}")
    url = f"{settings.band_rest_url}/api/v1/me/chats/{room_id}/participants"
    # Using moderator API key to invite other agents
    headers = {
        "X-API-Key": settings.moderator.api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "participant": {
            "participant_id": agent_id
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            pass # Already warned in create_case_room
        else:
            logger.warning(f"Band API error: {e}")
    except Exception as e:
        logger.error(f"Failed to add agent {agent_id} to room {room_id}: {e}")

async def send_agent_message(room_id: str, agent_api_key: str, message: str) -> None:
    """Send a message to a Band room on behalf of an agent."""
    if not room_id:
        return
        
    url = f"{settings.band_rest_url}/api/v1/chats/{room_id}/messages"
    headers = {
        "X-API-Key": agent_api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "message": {
            "text": message
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            pass # Already warned
        else:
            logger.warning(f"Band API error: {e}")
    except Exception as e:
        logger.error(f"Failed to send message to room {room_id}: {e}")

async def setup_case_room(case_id: str, summary: str) -> str:
    """Create room and add all specialist agents."""
    room_id = await create_case_room(case_id, summary)
    if room_id:
        # Moderator is already in the room because they created it
        await add_agent_to_room(room_id, settings.pathology.agent_id, settings.moderator.api_key)
        await add_agent_to_room(room_id, settings.prognostication.agent_id, settings.moderator.api_key)
        await add_agent_to_room(room_id, settings.clinical_trial.agent_id, settings.moderator.api_key)
        logger.info(f"Successfully set up Band room {room_id} for case {case_id}")
    return room_id

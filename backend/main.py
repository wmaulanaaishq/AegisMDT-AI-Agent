import asyncio
import json
import logging
from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from models import PatientCase, PatientCaseInput, CaseApproval, AgentMessage, CaseStatus
from orchestrator import run_case_pipeline, process_revision_bg
from config import settings
from db import init_db, save_case, get_case, get_all_cases

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AegisMDT API",
    description="Secure Multi-Agent Orchestration for Rare Oncology",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections per case
active_connections: Dict[str, list[WebSocket]] = {}

@app.on_event("startup")
async def startup_event():
    logger.info(f"AegisMDT Backend started. Band WS URL: {settings.band_ws_url}")
    
    # Pre-flight environment validation
    if not settings.featherless.api_key:
        logger.critical("FATAL: FEATHERLESS_API_KEY is missing from environment. Agent LLM calls will fail.")
    if not settings.moderator.api_key:
        logger.warning("WARNING: Band SDK Agent API Keys are missing. System will fallback to Local Mode without Band Cloud Integration.")
        
    # Initialize Supabase tables
    init_db()

@app.get("/")
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "project": "AegisMDT"}

@app.post("/api/cases", response_model=PatientCase)
async def create_case(case_input: PatientCaseInput, background_tasks: BackgroundTasks):
    """Submit a new patient case."""
    case = PatientCase(input_data=case_input)
    save_case(case)
    
    # Run the orchestration pipeline in the background
    background_tasks.add_task(process_case_bg, case.id)
    
    return case

async def process_case_bg(case_id: str):
    """Background task to run the orchestrator and broadcast WebSocket updates."""
    case = get_case(case_id)
    if not case:
        return
        
    async def message_callback(msg: AgentMessage):
        # Save every new message to the database immediately
        current_case = get_case(case_id)
        if current_case:
            current_case.timeline.append(msg)
            save_case(current_case)
            
        # Broadcast to all connected WebSockets
        if case_id in active_connections:
            websockets = active_connections[case_id]
            dead_sockets = []
            for ws in websockets:
                try:
                    await ws.send_json({
                        "type": "agent_message",
                        "data": msg.model_dump(mode='json')
                    })
                except Exception:
                    dead_sockets.append(ws)
            
            for ws in dead_sockets:
                websockets.remove(ws)

    try:
        updated_case = await run_case_pipeline(case, message_callback=message_callback)
        save_case(updated_case)
        
        # Broadcast final status
        if case_id in active_connections:
            for ws in active_connections[case_id]:
                try:
                    await ws.send_json({
                        "type": "status_update",
                        "data": {"status": updated_case.status.value}
                    })
                    if updated_case.consensus_result:
                        await ws.send_json({
                            "type": "consensus",
                            "data": updated_case.consensus_result.model_dump(mode='json')
                        })
                except Exception:
                    pass
                    
    except Exception as e:
        logger.error(f"Pipeline failed for case {case_id}: {e}")
        error_case = get_case(case_id)
        if error_case:
            error_case.status = "error"
            save_case(error_case)

@app.get("/api/cases", response_model=list[PatientCase])
async def list_cases():
    """List all cases."""
    return get_all_cases()

@app.get("/api/cases/{case_id}", response_model=PatientCase)
async def get_case_api(case_id: str):
    """Get a specific case."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.post("/api/cases/{case_id}/approve", response_model=PatientCase)
async def approve_case(case_id: str, approval: CaseApproval, background_tasks: BackgroundTasks):
    """Doctor approval of the consensus."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if approval.approved:
        case.status = CaseStatus.APPROVED
        # Security: Only index to Vector DB (RAG) AFTER human doctor approval
        try:
            from vector_store import index_case
            if case.anonymized_summary:
                index_case(case_id, case.anonymized_summary)
        except Exception as e:
            logger.error(f"Failed to index approved case to ChromaDB: {e}")
    else:
        case.status = CaseStatus.PROCESSING
        if approval.doctor_notes:
            # Trigger background revision task
            background_tasks.add_task(process_revision_task_bg, case_id, approval.doctor_notes)
        
    save_case(case)
    return case

async def process_revision_task_bg(case_id: str, feedback: str):
    case = get_case(case_id)
    if not case: return
    
    async def message_callback(msg: AgentMessage):
        current_case = get_case(case_id)
        if current_case:
            current_case.timeline.append(msg)
            save_case(current_case)
        if case_id in active_connections:
            websockets = active_connections[case_id]
            for ws in list(websockets):
                try:
                    await ws.send_json({"type": "agent_message", "data": msg.model_dump(mode='json')})
                except Exception:
                    websockets.remove(ws)

    try:
        updated_case = await process_revision_bg(case, feedback, message_callback)
        save_case(updated_case)
        
        if case_id in active_connections:
            for ws in list(active_connections[case_id]):
                try:
                    await ws.send_json({"type": "status_update", "data": {"status": updated_case.status.value}})
                    if updated_case.consensus_result:
                        await ws.send_json({"type": "consensus", "data": updated_case.consensus_result.model_dump(mode='json')})
                except Exception:
                    active_connections[case_id].remove(ws)
    except Exception as e:
        logger.error(f"Revision failed for case {case_id}: {e}")
        case.status = CaseStatus.ERROR
        save_case(case)

@app.websocket("/ws/cases/{case_id}")
async def websocket_endpoint(websocket: WebSocket, case_id: str):
    """Real-time streaming of agent messages for a specific case."""
    await websocket.accept()
    
    if case_id not in active_connections:
        active_connections[case_id] = []
    active_connections[case_id].append(websocket)
    
    # Send all existing messages to catch up
    case = get_case(case_id)
    if case:
        for msg in case.timeline:
            await websocket.send_json({
                "type": "agent_message",
                "data": msg.model_dump(mode='json')
            })
            
    try:
        while True:
            # Keep connection alive, wait for client disconnect
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[case_id].remove(websocket)
        if not active_connections[case_id]:
            del active_connections[case_id]

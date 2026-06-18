import asyncio
import httpx
import time

API_URL = "http://127.0.0.1:8000"

async def test_system():
    print("--- Starting System Test ---")
    
    # 1. Test Health
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{API_URL}/api/health")
            print(f"Health Check: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return

    # 2. Test Case Submission (including Phase 3 Vision URL)
    payload = {
        "description": "Patient presented with progressive plum-colored maculopapular and nodular skin lesions spreading to the chest, face, and upper extremities over the past 3 weeks. Severe night sweats, 8 kg weight loss, and left-sided facial nerve palsy (Bell's palsy) developed within the last 48 hours. Laboratory: Mild pancytopenia. Lactate dehydrogenase (LDH) markedly elevated at 1,200 U/L.",
        "age": 45,
        "sex": "female",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Blastic_plasmacytoid_dendritic_cell_neoplasm.jpg"
    }
    
    print("\nSubmitting Test Case...")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{API_URL}/api/cases", json=payload, timeout=30.0)
            if resp.status_code == 200:
                data = resp.json()
                case_id = data.get("id")
                print(f"Case Submitted Successfully! ID: {case_id}")
            else:
                print(f"Case Submission Failed: {resp.status_code} - {resp.text}")
                return
    except Exception as e:
        print(f"Case Submission Failed: {e}")
        return
        
    # 3. Poll for status (Simulating frontend WebSocket wait)
    print("\nWaiting for orchestration pipeline to complete (max 120 seconds)...")
    for _ in range(24):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{API_URL}/api/cases/{case_id}")
                data = resp.json()
                status = data.get("status")
                print(f"Current Status: {status}")
                if status in ["consensus_reached", "awaiting_approval", "error"]:
                    print(f"Pipeline finished with status: {status}")
                    break
        except Exception as e:
            print(f"Error checking status: {e}")
        time.sleep(5)
        
if __name__ == "__main__":
    asyncio.run(test_system())

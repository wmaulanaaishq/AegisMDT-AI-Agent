import requests
import json
import time

BASE_URL = "http://localhost:8000"
USERNAME = "dr.test@aegis.md"

def print_step(title):
    print(f"\n{'='*50}\n[TEST] {title}\n{'='*50}")

def test_flow():
    print_step("1. Testing Health Check")
    res = requests.get(f"{BASE_URL}/")
    print(res.json())

    print_step("2. Testing Mock Login")
    res = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": USERNAME, "password": "password123"}
    )
    data = res.json()
    print("Login Response:", data)
    token = data["token"]
    assert "token" in data

    print_step("3. Testing DOKU Subscribe (Generate Checkout Link)")
    res = requests.post(
        f"{BASE_URL}/api/payments/subscribe",
        json={"username": USERNAME}
    )
    sub_data = res.json()
    print("Subscribe Response:", sub_data)
    assert "payment_url" in sub_data

    print_step("4. Simulating DOKU Payment Success Callback (Activation)")
    res = requests.post(
        f"{BASE_URL}/api/payments/activate",
        json={"username": USERNAME}
    )
    print("Activation Response:", res.json())
    assert res.json().get("success") == True

    print_step("5. Validating Auth /me status")
    res = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    me_data = res.json()
    print("Auth /me Response:", me_data)
    assert me_data["user"]["subscription_active"] == True

    print_step("6. Submitting a new Medical Case")
    case_payload = {
        "description": "Patient presented with progressive plum-colored maculopapular skin lesions. Severe night sweats, 8 kg weight loss. Laboratory: LDH 1,200 U/L. Pathology: Infiltration of CD4+, CD56+, CD123+ blastoid cells. Genetics: TET2 mutation, ASXL1 mutation, MYC-BCL2 fusion.",
        "age": 45,
        "sex": "male"
    }
    res = requests.post(f"{BASE_URL}/api/cases", json=case_payload)
    case_data = res.json()
    print("Case Creation Response:", case_data)
    assert "id" in case_data
    case_id = case_data["id"]

    print_step("7. Waiting for Orchestrator to process (5 seconds)")
    for i in range(5):
        print(f"Waiting... {i+1}s")
        time.sleep(1)

    print_step("8. Fetching Case Status")
    res = requests.get(f"{BASE_URL}/api/cases/{case_id}")
    final_case = res.json()
    print(f"Case Status: {final_case['status']}")
    print(f"Timeline Events Count: {len(final_case['timeline'])}")

    print("\n✅ All End-to-End Tests Passed Successfully!")

if __name__ == "__main__":
    test_flow()

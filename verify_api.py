import requests
import json

BASE_URL = "http://localhost:8080"

def run_tests():
    print("==================================================")
    print("   EASYGIG END-TO-END API AUDIT & VERIFICATION    ")
    print("==================================================")
    
    # 1. Login
    print("\n[1] Testing Auth / Login (/auth/login)...")
    login_payload = {
        "email": "stefanoreali.whs@gmail.com",
        "password": "Killer90231"
    }
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        if resp.status_code == 200:
            data = resp.json()
            token = data["token"]
            user = data["user"]
            user_id = user["id"]
            print(f" -> SUCCESS (200). User ID: {user_id}, Role: {user['role']}")
        else:
            print(f" -> FAILED ({resp.status_code}): {resp.text}")
            return
    except Exception as e:
        print(f" -> ERROR: {e}")
        return

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # 2. Users endpoint
    print("\n[2] Testing Get User Profile (/users/{id})...")
    try:
        resp = requests.get(f"{BASE_URL}/users/{user_id}", headers=headers)
        print(f" -> Status: {resp.status_code} ({'OK' if resp.status_code == 200 else 'FAIL'})")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 3. Cities search
    print("\n[3] Testing Cities Search (/cities/search?name=Roma)...")
    try:
        resp = requests.get(f"{BASE_URL}/cities/search?name=Roma")
        print(f" -> Status: {resp.status_code}. Cities found: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 4. Genres
    print("\n[4] Testing Genres (/genres)...")
    try:
        resp = requests.get(f"{BASE_URL}/genres")
        print(f" -> Status: {resp.status_code}. Genres: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 5. Venues search
    print("\n[5] Testing Venues Search (/venues/search)...")
    try:
        resp = requests.get(f"{BASE_URL}/venues/search", headers=headers)
        print(f" -> Status: {resp.status_code}. Count: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 6. Bands search
    print("\n[6] Testing Bands Search (/bands/search)...")
    try:
        resp = requests.get(f"{BASE_URL}/bands/search", headers=headers)
        print(f" -> Status: {resp.status_code}. Count: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 7. Organizations search
    print("\n[7] Testing Organizations Search (/organizations/search)...")
    try:
        resp = requests.get(f"{BASE_URL}/organizations/search", headers=headers)
        print(f" -> Status: {resp.status_code}. Count: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 8. Slots Creation & Deletion
    print("\n[8] Testing Slot Creation & Deletion (/slots)...")
    slot_payload = {
        "venueId": 1,
        "start": "2026-12-25T21:00:00",
        "end": "2026-12-25T23:59:59"
    }
    try:
        resp = requests.post(f"{BASE_URL}/slots", json=slot_payload, headers=headers)
        if resp.status_code == 201:
            slot_id = resp.json()["id"]
            print(f" -> Slot created with ID: {slot_id}. Deleting...")
            del_resp = requests.delete(f"{BASE_URL}/slots/{slot_id}", headers=headers)
            print(f" -> Delete Status: {del_resp.status_code}")
        else:
            print(f" -> Status: {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 9. Bookings User List
    print("\n[9] Testing User Bookings (/bookings/user/{id})...")
    try:
        resp = requests.get(f"{BASE_URL}/bookings/user/{user_id}", headers=headers)
        print(f" -> Status: {resp.status_code}. Count: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 10. Notifications
    print("\n[10] Testing User Notifications (/api/v1/notifications/user/{id})...")
    try:
        resp = requests.get(f"{BASE_URL}/api/v1/notifications/user/{user_id}", headers=headers)
        print(f" -> Status: {resp.status_code}. Count: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    # 11. Chat messages
    print("\n[11] Testing Chat Messages (/api/v1/chat/1)...")
    try:
        resp = requests.get(f"{BASE_URL}/api/v1/chat/1", headers=headers)
        print(f" -> Status: {resp.status_code}. Messages: {len(resp.json()) if resp.status_code == 200 else 0}")
    except Exception as e:
        print(f" -> ERROR: {e}")

    print("\n==================================================")
    print("               AUDIT COMPLETED                    ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

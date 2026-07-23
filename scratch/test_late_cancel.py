import urllib.request
import urllib.parse
import json
import datetime
import ssl
import base64
import subprocess
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
BASE_URL = "http://localhost:8080" # Gateway
PROFILE_URL = "http://localhost:8081"
BOOKING_URL = "http://localhost:8082"

def request(method, path, data=None, token=None, service_url=BASE_URL):
    url = service_url + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        # Quando colpiamo il servizio direttamente, dobbiamo simulare il Gateway che inietta X-User-Id
        if service_url != BASE_URL:
            user_id = decode_token(token).get('userId')
            headers['X-User-Id'] = str(user_id)
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            resp_body = response.read().decode('utf-8')
            return json.loads(resp_body) if resp_body else {"status": "SUCCESS"}
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode('utf-8')
        try:
            return json.loads(resp_body)
        except:
            return {"error": e.code, "message": resp_body}

def decode_token(token):
    payload = token.split('.')[1]
    payload += '=' * (-len(payload) % 4)
    return json.loads(base64.b64decode(payload).decode('utf-8'))

def run_sql(db, sql):
    cmd = ["docker", "exec", "easygig-postgres", "psql", "-U", "postgres", "-d", db, "-c", sql]
    subprocess.run(cmd, capture_output=True)

print("--- START TEST ---")
print("1. Login Director")
login_resp = request("POST", "/auth/login", {"email": "stefanoreali.whs@gmail.com", "password": "Killer90231"}, service_url=PROFILE_URL)
token_director = login_resp.get("token")
if not token_director:
    print("Login failed:", login_resp)
    exit(1)
director_id = decode_token(token_director).get('userId')
venues = request("GET", f"/venues/director/{director_id}", token=token_director, service_url=PROFILE_URL)
venue_id = venues[0]['id']
print(f"Director ID: {director_id}, Venue ID: {venue_id}")

print("2. Create NEW Slot for 5 days from now")
start_time = (datetime.datetime.now() + datetime.timedelta(days=5)).strftime("%Y-%m-%dT20:00:00")
end_time = (datetime.datetime.now() + datetime.timedelta(days=5)).replace(hour=23).strftime("%Y-%m-%dT23:00:00")
slot = request("POST", "/slots", data={"venueId": venue_id, "start": start_time, "end": end_time}, token=token_director, service_url=BOOKING_URL)
slot_id = slot.get('id')
if not slot_id:
    print("Slot creation failed:", slot)
    exit(1)
print(f"Slot ID: {slot_id}")

print("3. Login Artist")
artist_email = "test_artist_late@test.com"
login_artist = request("POST", "/auth/login", {"email": artist_email, "password": "Password123!"}, service_url=PROFILE_URL)
token_artist = login_artist.get("token")
artist_id = decode_token(token_artist).get('userId')

print("4. Book and Accept")
booking = request("POST", "/bookings", data={"slotId": slot_id, "userId": artist_id}, token=token_artist, service_url=BOOKING_URL)
booking_id = booking.get('bookingId')
request("PATCH", f"/bookings/{booking_id}/accept", token=token_director, service_url=BOOKING_URL)
print(f"Booking {booking_id} Accepted")

print("5. Manipulate DB to make it 'Tomorrow' and reset strikes")
tomorrow_sql = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
run_sql("easygig-bookings", f"UPDATE slot SET start_time='{tomorrow_sql}' WHERE id={slot_id}")
run_sql("easygig-profiles", f"UPDATE state_account SET strikes=0 WHERE id=(SELECT state_account_id FROM users WHERE id={director_id})")
print("DB updated.")

print("6. Artist tries to cancel (Should fail)")
cancel_artist = request("PATCH", f"/bookings/{booking_id}/cancel-user", data={"reason": "Late cancel attempt"}, token=token_artist, service_url=BOOKING_URL)
print("Artist Cancel Result (Expected Error):", cancel_artist.get('message'))

print("7. Director tries to cancel (Should SUCCEED now with fix)")
cancel_dir = request("PATCH", f"/bookings/{booking_id}/cancel-venue", data={"reason": "Director cancel"}, token=token_director, service_url=BOOKING_URL)
if cancel_dir.get('status') == 'CANCELED' or cancel_dir.get('bookingId'):
    print("Director Cancel Result: SUCCESS")
else:
    print("Director Cancel Result: FAILED", cancel_dir)

print("8. Wait for Kafka and check Strikes")
time.sleep(3) # Wait for consumer
cmd = ["docker", "exec", "easygig-postgres", "psql", "-U", "postgres", "-d", "easygig-profiles", "-t", "-c", f"SELECT strikes FROM state_account WHERE id=(SELECT state_account_id FROM users WHERE id={director_id})"]
res = subprocess.run(cmd, capture_output=True, text=True)
strikes = res.stdout.strip()
print(f"Director Strikes: {strikes} (Expected: 1)")

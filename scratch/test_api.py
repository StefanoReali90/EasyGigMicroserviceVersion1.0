import urllib.request
import urllib.parse
import json
import datetime
import ssl
import base64

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
BASE_URL = "http://localhost:8080"

def request(method, path, data=None, token=None):
    url = BASE_URL + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            resp_body = response.read().decode('utf-8')
            return json.loads(resp_body) if resp_body else {}
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

print("1. Login Director")
login_resp = request("POST", "/auth/login", {"email": "stefanoreali.whs@gmail.com", "password": "Killer90231"})
token_director = login_resp.get("token")
if not token_director:
    print("Login Failed:", login_resp)
    exit(1)
print("Director token OK")

decoded_dir = decode_token(token_director)
director_id = decoded_dir.get('userId')
print(f"Director ID: {director_id}")

print("2. Get Venue for Director")
venues = request("GET", f"/venues/director/{director_id}", token=token_director)
if not venues or 'error' in venues:
    print("Failed to get venues:", venues)
    exit(1)
venue_id = venues[0]['id']
print(f"Venue ID: {venue_id}")

print("3. Create Slots (Tomorrow and 5 Days)")
tomorrow = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%dT20:00:00")
five_days = (datetime.datetime.now() + datetime.timedelta(days=5)).strftime("%Y-%m-%dT20:00:00")

slot1 = request("POST", "/slots", data={"venueId": venue_id, "start": tomorrow, "end": (datetime.datetime.now() + datetime.timedelta(days=1)).replace(hour=23).strftime("%Y-%m-%dT23:00:00")}, token=token_director)
slot2 = request("POST", "/slots", data={"venueId": venue_id, "start": five_days, "end": (datetime.datetime.now() + datetime.timedelta(days=5)).replace(hour=23).strftime("%Y-%m-%dT23:00:00")}, token=token_director)

print(f"Slot 1 ID: {slot1.get('id')}, Slot 2 ID: {slot2.get('id')}")

print("4. Register Artist")
artist_email = f"artist_{int(datetime.datetime.now().timestamp())}@test.com"
artist_reg = request("POST", "/users/", data={
    "email": artist_email, 
    "password": "Password123!", 
    "role": "ARTIST", 
    "firstName": "Band", 
    "lastName": "Test",
    "privacyAccepted": True
})
print(f"Artist registered: {artist_email}")

print("5. Login Artist")
login_artist = request("POST", "/auth/login", {"email": artist_email, "password": "Password123!"})
token_artist = login_artist.get("token")
artist_id = decode_token(token_artist).get('userId')
print(f"Artist ID: {artist_id}")

print("6. Request Bookings")
# In BookingRequestDTO, userId is also used but controller overrides it with X-User-Id header from gateway.
booking1 = request("POST", "/bookings", data={"slotId": slot1.get('id'), "userId": artist_id}, token=token_artist)
booking2 = request("POST", "/bookings", data={"slotId": slot2.get('id'), "userId": artist_id}, token=token_artist)

b1_id = booking1.get('bookingId')
b2_id = booking2.get('bookingId')
print(f"Booking 1 ID: {b1_id}, Booking 2 ID: {b2_id}")

if b1_id is None:
    print("Booking 1 failed:", booking1)
if b2_id is None:
    print("Booking 2 failed:", booking2)

print("7. Accept Bookings (Director)")
request("PATCH", f"/bookings/{b1_id}/accept", token=token_director)
request("PATCH", f"/bookings/{b2_id}/accept", token=token_director)
print("Bookings accepted")

print("8. Artist tries to cancel Booking 1 (Tomorrow - Late Cancellation)")
cancel1 = request("PATCH", f"/bookings/{b1_id}/cancel-user", data={"reason": "Test Late Cancel"}, token=token_artist)
print("Cancel 1 Result:", cancel1)

print("9. Artist tries to cancel Booking 2 (5 Days - Normal)")
cancel2 = request("PATCH", f"/bookings/{b2_id}/cancel-user", data={"reason": "Test Normal Cancel"}, token=token_artist)
print("Cancel 2 Result:", cancel2)

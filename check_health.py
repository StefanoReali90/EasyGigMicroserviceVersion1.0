import requests

SERVICES = {
    "profile": "http://localhost:8081",
    "booking": "http://localhost:8082",
    "notification": "http://localhost:8083",
    "chat": "http://localhost:8085",
    "gateway": "http://localhost:8080",
    "discovery": "http://localhost:8761/eureka/apps"
}

def check_health():
    print("Checking Backend Services Health...")
    for name, url in SERVICES.items():
        try:
            resp = requests.get(url + "/actuator/health", timeout=5)
            print(f"{name.upper()}: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"{name.upper()}: FAILED - {e}")

    print("\nChecking Eureka Registered Apps...")
    try:
        resp = requests.get(SERVICES["discovery"], headers={"Accept": "application/json"}, timeout=5)
        if resp.status_code == 200:
            apps = resp.json()["applications"]["application"]
            for app in apps:
                print(f"App: {app['name']}, Status: {app['instance'][0]['status']}")
        else:
            print(f"Eureka: {resp.status_code}")
    except Exception as e:
        print(f"Eureka: FAILED - {e}")

if __name__ == "__main__":
    check_health()

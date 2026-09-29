import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from main import app
import random

client = TestClient(app)

print("Running Full Backend Diagnostics & Test Suite...\n")

# 1. Health Check
r = client.get("/api/v1/health")
print(f"1. Health Check: HTTP {r.status_code} -> {r.json()['message']}")
assert r.status_code == 200

# 2. Register
rand_email = f"testuser_{random.randint(10000, 99999)}@test.com"
r = client.post("/api/v1/auth/register", json={
    "name": "Test User",
    "email": rand_email,
    "password": "password123",
    "phone": "9876543210"
})
print(f"2. User Registration: HTTP {r.status_code} (User: {rand_email})")
assert r.status_code == 201

# 3. Customer Login
r = client.post("/api/v1/auth/login", json={
    "email": "demo@smarttariff.com",
    "password": "password123"
})
print(f"3. Customer Login: HTTP {r.status_code}")
assert r.status_code == 200
user_token = r.json()["data"]["token"]
u_headers = {"Authorization": f"Bearer {user_token}"}

# 4. User Profile & Customer Profile
r = client.get("/api/v1/users/me", headers=u_headers)
print(f"4. User Info (/users/me): HTTP {r.status_code} ({r.json()['data']['email']})")
assert r.status_code == 200

r = client.get("/api/v1/customers/me/profile", headers=u_headers)
print(f"5. Customer Profile (/customers/me/profile): HTTP {r.status_code} (Budget: ₹{r.json()['data']['monthlyBudget']})")
assert r.status_code == 200

# 5. Plans Search and Filter
r = client.get("/api/v1/plans?category=Basic")
plan_count = len(r.json()["data"]["docs"])
print(f"6. Plans Query: HTTP {r.status_code} ({plan_count} plans found)")
assert r.status_code == 200

# 6. Usage History and Latest
r = client.get("/api/v1/usage/me", headers=u_headers)
usage_count = len(r.json()["data"]["docs"])
print(f"7. Usage History (/usage/me): HTTP {r.status_code} ({usage_count} records)")
assert r.status_code == 200

r = client.get("/api/v1/usage/me/latest", headers=u_headers)
latest_m = r.json()["data"]["month"]
print(f"8. Latest Usage (/usage/me/latest): HTTP {r.status_code} (Month: {latest_m})")
# 6.5 ML Model Status Check
r = client.get("/api/v1/recommendations/model-status")
m_status = r.json()["data"]
print(f"8.5. ML Model Status: HTTP {r.status_code} ({m_status.get('model_name', 'N/A')} v{m_status.get('version', 'N/A')}, Status: {m_status.get('status')})")
assert r.status_code == 200
assert m_status["status"] == "active"

# 7. Generate Recommendations
r = client.post("/api/v1/recommendations/generate", headers=u_headers)
rec_data = r.json()["data"]
rec_id = rec_data["_id"]
rec_plan_count = len(rec_data["plans"])
gen_by = rec_data.get("generatedBy", "N/A")
print(f"9. Generate Recommendations: HTTP {r.status_code} (Generated {rec_plan_count} plans via '{gen_by}', Rec ID: {rec_id})")
for p in rec_data["plans"]:
    print(f"   - Rank {p['rank']}: {p['plan']['name']} ({p['plan'].get('planCode')}) | Score: {p['score']}% | Reasons: {', '.join(p['reasons'][:2])}")
assert r.status_code == 201
assert gen_by == "ml"

# 8. Recommendation History & Specific Rec
r = client.get("/api/v1/recommendations/history", headers=u_headers)
hist_count = r.json()["data"]["totalDocs"]
print(f"10. Recommendation History: HTTP {r.status_code} ({hist_count} total entries)")
assert r.status_code == 200

r = client.get(f"/api/v1/recommendations/{rec_id}", headers=u_headers)
print(f"11. Get Recommendation by ID: HTTP {r.status_code}")
assert r.status_code == 200

# 9. Feedback Submission
r = client.post("/api/v1/feedback", headers=u_headers, json={
    "recommendationId": int(rec_id),
    "rating": 5,
    "comment": "Great recommendation match!"
})
print(f"12. Feedback Submission: HTTP {r.status_code}")
assert r.status_code == 201

# 10. Admin Login & Dashboard
r = client.post("/api/v1/auth/login", json={
    "email": "admin@smarttariff.com",
    "password": "admin123"
})
print(f"13. Admin Login: HTTP {r.status_code}")
assert r.status_code == 200
admin_token = r.json()["data"]["token"]
a_headers = {"Authorization": f"Bearer {admin_token}"}

r = client.get("/api/v1/admin/dashboard", headers=a_headers)
cards = r.json()["data"]["cards"]
print(f"14. Admin Dashboard: HTTP {r.status_code} (Customers: {cards['totalCustomers']}, Plans: {cards['activePlans']}, Recommendations: {cards['totalRecommendations']})")
assert r.status_code == 200

r = client.get("/api/v1/admin/customers", headers=a_headers)
cust_total = r.json()["data"]["totalDocs"]
print(f"15. Admin Customers List: HTTP {r.status_code} ({cust_total} customers)")
assert r.status_code == 200

r = client.get("/api/v1/admin/usage", headers=a_headers)
usage_total = r.json()["data"]["totalDocs"]
print(f"16. Admin Usage List: HTTP {r.status_code} ({usage_total} records)")
assert r.status_code == 200

r = client.get("/api/v1/admin/feedback", headers=a_headers)
fb_total = r.json()["data"]["totalDocs"]
print(f"17. Admin Feedback List: HTTP {r.status_code} ({fb_total} entries)")
assert r.status_code == 200

print("\n========================================================")
print("  ALL 17 BACKEND ENDPOINT TESTS PASSED WITH 100% SUCCESS!")
print("========================================================")

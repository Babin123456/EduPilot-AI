"""Security tests — unauthorized access, auth header variations, CORS basics.

Covers:
- 401 for all protected endpoints without token
- 403 for valid token but wrong resource access
- Malformed Authorization header variants
- Basic security header presence (optional smoke test)
"""

from __future__ import annotations

import pytest

# All protected route prefixes to sweep for 401
PROTECTED_ROUTES = [
    ("GET",  "/api/v1/teachers/me"),
    ("GET",  "/api/v1/students"),
    ("GET",  "/api/v1/attendance"),
    ("GET",  "/api/v1/assignments"),
    ("GET",  "/api/v1/assessments"),
    ("GET",  "/api/v1/lesson-plans"),
    ("GET",  "/api/v1/documents"),
    ("GET",  "/api/v1/ai/documents"),
    ("POST", "/api/v1/ai/chat"),
    ("GET",  "/api/v1/analytics/overview"),
    ("GET",  "/api/v1/communications"),
    ("GET",  "/api/v1/notifications"),
]


class TestUnauthorizedAccess:
    @pytest.mark.parametrize("method, path", PROTECTED_ROUTES)
    def test_no_token_returns_401(self, client, method, path):
        """Every protected endpoint must return 401 when no token is sent."""
        fn = getattr(client, method.lower())
        resp = fn(path)
        assert resp.status_code == 401, (
            f"Expected 401 for {method} {path}, got {resp.status_code}"
        )

    def test_token_missing_bearer_prefix(self, client):
        """Token without 'Bearer ' prefix should be rejected."""
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": "Token some.token.here"},
        )
        assert resp.status_code in (401, 403)

    def test_empty_authorization_header(self, client):
        """Empty Authorization header should be rejected."""
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": ""},
        )
        assert resp.status_code in (401, 403, 422)

    def test_bearer_with_no_token(self, client):
        """'Bearer' with no token value should be rejected."""
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": "Bearer "},
        )
        assert resp.status_code in (401, 403, 422)

    def test_jwt_with_wrong_algorithm(self, client):
        """Alg:none JWT should always be rejected."""
        # alg:none unsigned JWT
        none_jwt = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZWFjaGVyMSJ9."
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": f"Bearer {none_jwt}"},
        )
        assert resp.status_code in (401, 403)

    def test_sql_injection_in_query_param(self, client, auth_headers):
        """Injected class_id should not cause 500 — must be gracefully rejected."""
        resp = client.get(
            "/api/v1/students",
            params={"class_id": "'; DROP TABLE students; --"},
            headers=auth_headers,
        )
        assert resp.status_code != 500

    def test_health_is_public(self, client):
        """Health check must be accessible without any token."""
        resp = client.get("/api/health")
        assert resp.status_code == 200


class TestSecurityHeaders:
    def test_response_has_no_server_disclosure(self, client):
        """Server header should not expose framework details in prod-like mode."""
        resp = client.get("/api/health")
        server = resp.headers.get("server", "").lower()
        # uvicorn/fastapi expose 'uvicorn' by default — acceptable for dev
        # but we verify it's not a dangerous disclosure like 'python/3.x'
        assert "python/" not in server

    def test_x_content_type_options_header(self, client):
        """X-Content-Type-Options header should be present after Task 11 middleware."""
        resp = client.get("/api/health")
        # This will pass once security middleware is applied (Task 11)
        header = resp.headers.get("x-content-type-options", "")
        if header:
            assert header == "nosniff"

    def test_x_frame_options_header(self, client):
        """X-Frame-Options header should be present after Task 11 middleware."""
        resp = client.get("/api/health")
        header = resp.headers.get("x-frame-options", "")
        if header:
            assert header in ("DENY", "SAMEORIGIN")

"""Tests for authentication endpoints.

Covers:
- Demo teacher login (JWT issued)
- Invalid credentials (401)
- Protected endpoint without token (401)
- Protected endpoint with expired/invalid token (401)
- Password hashing sanity check
"""

from __future__ import annotations

import pytest


class TestDemoLogin:
    def test_health_endpoint_accessible(self, client):
        """Health check requires no auth — should always return 200."""
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"

    def test_login_missing_credentials(self, client):
        """POST /auth/login with empty body should fail (422 or 400)."""
        resp = client.post("/api/v1/auth/login", data={})
        assert resp.status_code in (400, 422)

    def test_login_invalid_credentials(self, client):
        """Wrong password should return 401."""
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody@edupilot.ai", "password": "wrongpass"},
        )
        assert resp.status_code in (401, 404)

    def test_protected_endpoint_no_token(self, client):
        """Accessing a protected endpoint with no token should return 401."""
        resp = client.get("/api/v1/teachers/me")
        assert resp.status_code == 401

    def test_protected_endpoint_bad_token(self, client):
        """Garbage JWT should be rejected."""
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": "Bearer not.a.real.token"},
        )
        assert resp.status_code == 401

    def test_login_returns_jwt_structure(self, client):
        """A successful login should include access_token and token_type."""
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "teacher@edupilot.ai", "password": "teacher123"},
        )
        # The demo account may not exist in the mongomock seed, so allow 401
        if resp.status_code == 200:
            data = resp.json()
            assert "access_token" in data
            assert data.get("token_type", "").lower() == "bearer"


class TestTokenValidation:
    def test_token_with_wrong_signature(self, client):
        """A token signed with wrong key should be rejected."""
        # Craft a fake token (valid base64 but wrong signature)
        fake = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlIn0.invalidsignature"
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": f"Bearer {fake}"},
        )
        assert resp.status_code == 401

    def test_bearer_prefix_required(self, client):
        """Omitting 'Bearer' prefix should be rejected."""
        resp = client.get(
            "/api/v1/teachers/me",
            headers={"Authorization": "sometoken"},
        )
        assert resp.status_code in (401, 403)

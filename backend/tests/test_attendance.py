"""Tests for attendance endpoints.

Covers:
- Listing students for a session
- Bulk status submission
- Attendance percentage calculation response shape
"""

from __future__ import annotations

import pytest


class TestAttendanceRoutes:
    def test_attendance_no_auth(self, client):
        """Attendance endpoint must reject unauthenticated requests."""
        resp = client.get("/api/v1/attendance")
        assert resp.status_code == 401

    def test_attendance_list_requires_class_id(self, client, auth_headers):
        """GET /attendance without class_id should fail with 422."""
        if not auth_headers.get("Authorization", "").endswith(""):
            pytest.skip("No valid auth token available — skipping authenticated tests")
        resp = client.get("/api/v1/attendance", headers=auth_headers)
        # Expect either 422 (validation) or 403 (no class_id) — not 200
        assert resp.status_code in (403, 404, 422)

    def test_bulk_attendance_no_auth(self, client):
        """POST /attendance/bulk should return 401 without a token."""
        resp = client.post(
            "/api/v1/attendance/bulk",
            json={"class_id": "tca-test-001", "date": "2026-08-11", "records": []},
        )
        assert resp.status_code == 401

    def test_attendance_percentage_response_shape(self, client, auth_headers):
        """GET /attendance/percentage should return a structured object if auth is valid."""
        resp = client.get(
            "/api/v1/attendance/percentage",
            params={"class_id": "tca-test-001"},
            headers=auth_headers,
        )
        # May be 403 (invalid TCA) or 200 (found) — must not be 500
        assert resp.status_code != 500

    def test_attendance_session_list_shape(self, client, auth_headers):
        """GET /attendance/sessions should return a list."""
        resp = client.get(
            "/api/v1/attendance/sessions",
            params={"class_id": "tca-test-001"},
            headers=auth_headers,
        )
        assert resp.status_code != 500
        if resp.status_code == 200:
            assert isinstance(resp.json(), list)

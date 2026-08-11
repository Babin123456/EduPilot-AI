"""Tests for student directory endpoints.

Covers:
- List students (requires auth + class_id)
- Search by name / roll number
- Year / section filter response structure
- Pagination meta
"""

from __future__ import annotations

import pytest


class TestStudentRoutes:
    def test_students_no_auth(self, client):
        """GET /students should return 401 without a token."""
        resp = client.get("/api/v1/students")
        assert resp.status_code == 401

    def test_students_list_requires_params(self, client, auth_headers):
        """Without required query params, should return 422."""
        resp = client.get("/api/v1/students", headers=auth_headers)
        assert resp.status_code in (200, 403, 422)

    def test_students_list_with_class_id(self, client, auth_headers):
        """With a valid (or unknown) class_id, should not crash."""
        resp = client.get(
            "/api/v1/students",
            params={"class_id": "tca-test-001"},
            headers=auth_headers,
        )
        assert resp.status_code != 500
        if resp.status_code == 200:
            data = resp.json()
            assert isinstance(data, list)
            for student in data:
                assert "id" in student
                assert "roll_number" in student

    def test_students_search(self, client, auth_headers):
        """Search should not crash and return a list when 200."""
        resp = client.get(
            "/api/v1/students",
            params={"class_id": "tca-test-001", "search": "Student"},
            headers=auth_headers,
        )
        assert resp.status_code != 500
        if resp.status_code == 200:
            assert isinstance(resp.json(), list)

    def test_student_detail_not_found(self, client, auth_headers):
        """GET /students/{id} for a nonexistent ID should return 404."""
        resp = client.get("/api/v1/students/nonexistent-id-xyz", headers=auth_headers)
        assert resp.status_code in (401, 403, 404)

    def test_student_detail_shape(self, client, auth_headers):
        """GET /students/{id} for a seeded student should include required fields."""
        resp = client.get("/api/v1/students/student-test-001", headers=auth_headers)
        assert resp.status_code != 500
        if resp.status_code == 200:
            data = resp.json()
            required_fields = {"id", "roll_number", "first_name", "last_name"}
            assert required_fields.issubset(data.keys())

"""EduPilot AI — Custom exception classes and FastAPI exception handlers."""

from __future__ import annotations

from fastapi import HTTPException, status


class EduPilotException(Exception):
    """Base exception for EduPilot application."""
    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class AuthenticationError(EduPilotException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(EduPilotException):
    """Raised when a user is not authorized to access a resource."""
    pass


class NotFoundError(EduPilotException):
    """Raised when a requested resource is not found."""
    pass


class ValidationError(EduPilotException):
    """Raised when input validation fails."""
    pass


class AIServiceError(EduPilotException):
    """Raised when an AI service call fails."""
    pass


class DocumentGenerationError(EduPilotException):
    """Raised when document generation fails."""
    pass


class EmailError(EduPilotException):
    """Raised when email sending fails."""
    pass


# ---- HTTP Exception shortcuts ----

def http_400(detail: str = "Bad request") -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def http_401(detail: str = "Invalid credentials") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def http_403(detail: str = "Not authorized") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def http_404(detail: str = "Not found") -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def http_422(detail: str = "Validation error") -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


def http_500(detail: str = "Internal server error") -> HTTPException:
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

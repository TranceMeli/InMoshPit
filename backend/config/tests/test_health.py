import pytest
from rest_framework import status
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_endpoint_reports_running_backend():
    api_client = APIClient()
    response = api_client.get("/api/v1/health/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "status": "success",
        "application": "InMoshPit API",
        "message": "Backend is running!",
    }

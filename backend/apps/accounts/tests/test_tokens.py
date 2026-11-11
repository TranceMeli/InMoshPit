
import pytest

from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

REFRESH_URL = "/api/v1/accounts/token/refresh/"


@pytest.mark.django_db
def test_refresh_token_success(api_client, user):
    refresh = RefreshToken.for_user(user)

    response = api_client.post(
        REFRESH_URL,
        {
            "refresh": str(refresh),
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data


@pytest.mark.django_db
def test_refresh_token_invalid(api_client):
    response = api_client.post(
        REFRESH_URL,
        {
            "refresh": "invalid-token",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_refresh_token_missing(api_client):
    response = api_client.post(
        REFRESH_URL,
        {},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST

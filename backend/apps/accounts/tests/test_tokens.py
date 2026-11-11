
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


@pytest.mark.django_db
def test_refresh_rotates_the_refresh_token(api_client, user):
    refresh = str(RefreshToken.for_user(user))

    response = api_client.post(REFRESH_URL, {"refresh": refresh}, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["refresh"]
    assert response.data["refresh"] != refresh


@pytest.mark.django_db
def test_new_access_token_is_accepted(api_client, user):
    refresh = str(RefreshToken.for_user(user))
    tokens = api_client.post(REFRESH_URL, {"refresh": refresh}, format="json").data

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    response = api_client.get("/api/v1/community/follows/")

    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_expired_access_token_is_rejected(api_client, user):
    from datetime import timedelta

    token = RefreshToken.for_user(user).access_token
    token.set_exp(from_time=token.current_time, lifetime=-timedelta(seconds=1))

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    response = api_client.get("/api/v1/community/follows/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_token_lifetimes_are_configured():
    from datetime import timedelta

    from django.conf import settings

    assert settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] == timedelta(minutes=15)
    assert settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"] == timedelta(days=7)
    assert settings.SIMPLE_JWT["ROTATE_REFRESH_TOKENS"] is True

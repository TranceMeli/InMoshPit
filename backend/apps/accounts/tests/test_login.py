
import pytest

from rest_framework import status

LOGIN_URL = "/api/v1/accounts/token/"


@pytest.mark.django_db
def test_login_success(api_client, user, strong_password):
    response = api_client.post(
        LOGIN_URL,
        {
            "username": user.username,
            "password": strong_password,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_login_wrong_password(api_client, user):
    response = api_client.post(
        LOGIN_URL,
        {
            "username": user.username,
            "password": "WrongPassword!123",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_login_unknown_user(api_client):
    response = api_client.post(
        LOGIN_URL,
        {
            "username": "unknown_user",
            "password": "WrongPassword!123",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_login_missing_password(api_client, user):
    response = api_client.post(
        LOGIN_URL,
        {
            "username": user.username,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST

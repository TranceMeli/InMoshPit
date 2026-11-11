
import pytest

from django.contrib.auth import get_user_model
from rest_framework import status

from apps.accounts.models import UserProfile

User = get_user_model()

REGISTER_URL = "/api/v1/accounts/register/"


@pytest.mark.django_db
def test_register_user_success(api_client, registration_data):
    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user"]["username"] == "newuser"
    assert response.data["user"]["email"] == "newuser@example.com"

    assert User.objects.filter(username="newuser").exists()


@pytest.mark.django_db
def test_register_creates_user_profile(api_client, registration_data):
    api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    user = User.objects.get(username="newuser")

    assert UserProfile.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_register_password_is_hashed(api_client, registration_data):
    api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    user = User.objects.get(username="newuser")

    assert user.password != registration_data["password"]
    assert user.check_password(registration_data["password"])


@pytest.mark.django_db
def test_register_does_not_return_password(api_client, registration_data):
    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert "password" not in response.data
    assert "password_confirm" not in response.data


@pytest.mark.django_db
def test_register_duplicate_email(api_client, user, registration_data):
    registration_data["email"] = user.email

    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_register_duplicate_username(api_client, user, registration_data):
    registration_data["username"] = user.username

    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_register_passwords_do_not_match(api_client, registration_data):
    registration_data["password_confirm"] = "DifferentPassword!928"

    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password_confirm" in response.data


@pytest.mark.django_db
def test_register_password_too_short(api_client, registration_data):
    registration_data["password"] = "abc"
    registration_data["password_confirm"] = "abc"

    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data


@pytest.mark.django_db
def test_register_missing_email(api_client, registration_data):
    registration_data.pop("email")

    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_register_duplicate_email_case_insensitive(
    api_client,
    user,
    registration_data,
):
    registration_data["email"] = user.email.upper()

    response = api_client.post(
        REGISTER_URL,
        registration_data,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST

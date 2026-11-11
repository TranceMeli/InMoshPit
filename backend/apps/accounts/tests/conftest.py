
import pytest

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def strong_password():
    return "X7!qL9#vR2@pK8zM"


@pytest.fixture
def user(db, strong_password):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password=strong_password,
    )


@pytest.fixture
def registration_data(strong_password):
    return {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": strong_password,
        "password_confirm": strong_password,
    }

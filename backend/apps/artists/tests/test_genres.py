import pytest

from rest_framework import status


GENRES_URL = "/api/v1/genres/"


@pytest.mark.django_db
def test_genre_list_returns_genres_in_name_order(
    api_client,
    indie_genre,
    jazz_genre,
):
    response = api_client.get(GENRES_URL)

    assert response.status_code == status.HTTP_200_OK
    assert [item["name"] for item in response.data] == ["Indie Rock", "Jazz"]


@pytest.mark.django_db
def test_genre_list_searches_by_name(api_client, indie_genre, jazz_genre):
    response = api_client.get(GENRES_URL, {"search": "jazz"})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == ["jazz"]


@pytest.mark.django_db
def test_genre_list_returns_empty_list_when_no_genres_exist(api_client):
    response = api_client.get(GENRES_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data == []

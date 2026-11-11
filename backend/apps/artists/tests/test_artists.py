import pytest

from rest_framework import status

from apps.artists.models import Artist


ARTISTS_URL = "/api/v1/artists/"


@pytest.mark.django_db
def test_artist_list_returns_artists_in_name_order(
    api_client,
    artist,
    second_artist,
):
    response = api_client.get(ARTISTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert [item["name"] for item in response.data] == [
        "Aster Lane",
        "Mira Vale",
    ]


@pytest.mark.django_db
def test_artist_list_serializes_genres(api_client, artist, indie_genre):
    response = api_client.get(ARTISTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["genres"] == [
        {
            "id": indie_genre.id,
            "name": indie_genre.name,
            "slug": indie_genre.slug,
        }
    ]


@pytest.mark.django_db
def test_artist_list_searches_name_bio_and_genre(
    api_client,
    artist,
    second_artist,
):
    response = api_client.get(ARTISTS_URL, {"search": "indie"})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == ["mira-vale"]


@pytest.mark.django_db
def test_artist_list_can_be_ordered(api_client, artist, second_artist):
    response = api_client.get(ARTISTS_URL, {"ordering": "-name"})

    assert response.status_code == status.HTTP_200_OK
    assert [item["name"] for item in response.data] == [
        "Mira Vale",
        "Aster Lane",
    ]


@pytest.mark.django_db
def test_artist_detail_returns_artist_by_slug(api_client, artist, indie_genre):
    response = api_client.get(f"{ARTISTS_URL}{artist.slug}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == artist.name
    assert response.data["slug"] == artist.slug
    assert response.data["genres"][0]["slug"] == indie_genre.slug


@pytest.mark.django_db
def test_artist_detail_returns_not_found_for_unknown_slug(api_client):
    response = api_client.get(f"{ARTISTS_URL}missing-artist/")

    assert response.status_code == status.HTTP_404_NOT_FOUND

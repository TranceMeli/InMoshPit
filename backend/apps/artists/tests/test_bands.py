import pytest

from rest_framework import status

from apps.artists.models import Band


BANDS_URL = "/api/v1/artists/bands/"


@pytest.mark.django_db
def test_band_list_returns_bands_in_name_order(api_client, band, artist):
    Band.objects.create(name="Aster Band", slug="aster-band")

    response = api_client.get(BANDS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert [item["name"] for item in response.data] == [
        "Aster Band",
        "The Vale Collective",
    ]


@pytest.mark.django_db
def test_band_list_serializes_members_and_roles(api_client, band, artist):
    response = api_client.get(BANDS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["members"] == [
        {
            "id": artist.band_memberships.get(band=band).id,
            "artist": {
                "id": artist.id,
                "name": artist.name,
                "slug": artist.slug,
                "image": None,
            },
            "role": "Vocals",
            "joined_on": None,
            "left_on": None,
        }
    ]


@pytest.mark.django_db
def test_band_list_searches_band_fields_genres_and_member_names(
    api_client,
    band,
    artist,
):
    response = api_client.get(BANDS_URL, {"search": artist.name})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [band.slug]


@pytest.mark.django_db
def test_band_detail_returns_band_by_slug(api_client, band, artist):
    response = api_client.get(f"{BANDS_URL}{band.slug}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == band.name
    assert response.data["members"][0]["artist"]["slug"] == artist.slug
    assert response.data["members"][0]["role"] == "Vocals"


@pytest.mark.django_db
def test_band_detail_returns_not_found_for_unknown_slug(api_client):
    response = api_client.get(f"{BANDS_URL}missing-band/")

    assert response.status_code == status.HTTP_404_NOT_FOUND

import pytest

from rest_framework.test import APIClient

from apps.artists.models import Artist, Band, BandMember, Genre


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def indie_genre(db):
    return Genre.objects.create(name="Indie Rock", slug="indie-rock")


@pytest.fixture
def jazz_genre(db):
    return Genre.objects.create(name="Jazz", slug="jazz")


@pytest.fixture
def artist(indie_genre):
    artist = Artist.objects.create(
        name="Mira Vale",
        slug="mira-vale",
        bio="Independent singer-songwriter.",
        website="https://example.com/mira",
    )
    artist.genres.add(indie_genre)
    return artist


@pytest.fixture
def second_artist(jazz_genre):
    artist = Artist.objects.create(
        name="Aster Lane",
        slug="aster-lane",
        bio="Jazz pianist.",
    )
    artist.genres.add(jazz_genre)
    return artist


@pytest.fixture
def band(artist, indie_genre):
    band = Band.objects.create(
        name="The Vale Collective",
        slug="the-vale-collective",
        bio="A live indie band.",
        website="https://example.com/collective",
    )
    band.genres.add(indie_genre)
    BandMember.objects.create(
        band=band,
        artist=artist,
        role="Vocals",
    )
    return band

from datetime import datetime, timedelta, timezone

import pytest
from rest_framework.test import APIClient

from apps.artists.models import Artist, Band, Genre
from apps.events.models import Event, EventArtist, Stage, Venue


EVENTS_URL = "/api/v1/events/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def venue(db):
    return Venue.objects.create(
        name="MoshPit Arena",
        address="Musikstraße 1",
        city="Karlsruhe",
        postal_code="76199",
        country="Deutschland",
        capacity=12000,
        website="https://example.com/venue",
    )


@pytest.fixture
def published_event(venue):
    return Event.objects.create(
        title="Summer Rock Night",
        slug="summer-rock-night",
        description="An outdoor rock concert.",
        event_type=Event.EventType.CONCERT,
        venue=venue,
        start_at=datetime(2027, 7, 10, 18, tzinfo=timezone.utc),
        end_at=datetime(2027, 7, 10, 23, tzinfo=timezone.utc),
        status=Event.Status.PUBLISHED,
    )


@pytest.fixture
def festival_event(venue):
    return Event.objects.create(
        title="City Sounds Festival",
        slug="city-sounds-festival",
        description="A weekend of live music.",
        event_type=Event.EventType.FESTIVAL,
        venue=venue,
        start_at=datetime(2027, 8, 20, 12, tzinfo=timezone.utc),
        status=Event.Status.PUBLISHED,
    )


@pytest.fixture
def draft_event(venue):
    return Event.objects.create(
        title="Secret Draft Show",
        slug="secret-draft-show",
        description="Not ready for publication.",
        event_type=Event.EventType.CONCERT,
        venue=venue,
        start_at=datetime(2027, 6, 1, 18, tzinfo=timezone.utc),
        status=Event.Status.DRAFT,
    )


@pytest.fixture
def cancelled_event(venue):
    return Event.objects.create(
        title="Cancelled Live Show",
        slug="cancelled-live-show",
        event_type=Event.EventType.CONCERT,
        venue=venue,
        start_at=datetime(2027, 6, 15, 18, tzinfo=timezone.utc),
        status=Event.Status.CANCELLED,
    )


@pytest.fixture
def event_lineup(published_event):
    genre = Genre.objects.create(name="Indie Rock", slug="indie-rock")
    artist = Artist.objects.create(
        name="Mira Vale",
        slug="mira-vale",
        bio="Independent musician.",
    )
    band = Band.objects.create(
        name="The Vale Collective",
        slug="the-vale-collective",
    )
    stage = Stage.objects.create(
        event=published_event,
        name="Main Stage",
        description="The main outdoor stage.",
    )
    first_performance = datetime(2027, 7, 10, 19, tzinfo=timezone.utc)
    EventArtist.objects.create(
        event=published_event,
        artist=artist,
        stage=stage,
        performance_start=first_performance,
        position=1,
    )
    EventArtist.objects.create(
        event=published_event,
        band=band,
        stage=stage,
        performance_start=first_performance + timedelta(hours=1),
        position=2,
    )
    artist.genres.add(genre)
    return {"artist": artist, "band": band, "stage": stage}

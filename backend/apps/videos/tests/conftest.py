from datetime import datetime, timezone

import pytest
from rest_framework.test import APIClient

from apps.artists.models import Artist, Band
from apps.events.models import Event, EventArtist, Venue
from apps.videos.models import Video


VIDEOS_URL = "/api/v1/videos/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def venue(db):
    return Venue.objects.create(name="Video Hall", city="Karlsruhe")


@pytest.fixture
def published_event(venue):
    return Event.objects.create(
        title="Live Sessions",
        slug="live-sessions",
        venue=venue,
        start_at=datetime(2027, 7, 10, 18, tzinfo=timezone.utc),
        status=Event.Status.PUBLISHED,
    )


@pytest.fixture
def published_video(published_event):
    return Video.objects.create(
        title="Live Session One",
        slug="live-session-one",
        description="A live rock performance.",
        event=published_event,
        duration_seconds=240,
        status=Video.Status.PUBLISHED,
        published_at=datetime(2027, 7, 11, 12, tzinfo=timezone.utc),
    )


@pytest.fixture
def video_with_artist_performance(published_event, published_video):
    artist = Artist.objects.create(name="Mira Vale", slug="mira-vale")
    performance = EventArtist.objects.create(
        event=published_event,
        artist=artist,
        position=1,
    )
    published_video.performance = performance
    published_video.save(update_fields=["performance"])
    return published_video, artist


@pytest.fixture
def video_with_band_performance(published_event):
    band = Band.objects.create(name="The Vale Collective", slug="vale-collective")
    performance = EventArtist.objects.create(
        event=published_event,
        band=band,
        position=2,
    )
    return (
        Video.objects.create(
            title="Band Session",
            slug="band-session",
            event=published_event,
            performance=performance,
            status=Video.Status.PUBLISHED,
            published_at=datetime(2027, 7, 12, 12, tzinfo=timezone.utc),
        ),
        band,
    )

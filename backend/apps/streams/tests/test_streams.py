import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.events.models import Event, Venue
from apps.streams.models import Stream


@pytest.fixture
def event(db):
    venue = Venue.objects.create(name="Arena", city="Wien")
    return Event.objects.create(
        title="Show", slug="show", venue=venue,
        start_at=timezone.now(), status=Event.Status.PUBLISHED,
    )


def test_stream_list_and_detail(event):
    Stream.objects.create(
        title="Live", slug="live", event=event,
        status=Stream.Status.SCHEDULED, scheduled_at=timezone.now(),
    )
    c = APIClient()
    r = c.get("/api/v1/streams/")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert c.get("/api/v1/streams/live/").status_code == 200
    assert c.get("/api/v1/streams/?status=live").json() == []

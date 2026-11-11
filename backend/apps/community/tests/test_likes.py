import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.community.models import Like
from apps.events.models import Event, Venue
from apps.videos.models import Video


@pytest.fixture
def video(db):
    venue = Venue.objects.create(name="Arena", city="Wien")
    event = Event.objects.create(
        title="Show", slug="show", venue=venue,
        start_at=timezone.now(), status=Event.Status.PUBLISHED,
    )
    return Video.objects.create(
        title="Clip", slug="clip", event=event,
        status=Video.Status.PUBLISHED,
    )


@pytest.fixture
def client(db):
    user = User.objects.create_user("u", "u@example.com", "X7!qL9#vR2@pK8zM")
    c = APIClient()
    c.force_authenticate(user)
    return c, user


def test_like_status(video, client):
    c, user = client
    r = c.get("/api/v1/videos/clip/like/")
    assert r.status_code == 200
    assert r.json() == {"liked": False, "like_count": 0}
    Like.objects.create(user=user, video=video)
    assert c.get("/api/v1/videos/clip/like/").json() == {
        "liked": True, "like_count": 1,
    }


def test_like_status_requires_auth(video):
    assert APIClient().get("/api/v1/videos/clip/like/").status_code == 401

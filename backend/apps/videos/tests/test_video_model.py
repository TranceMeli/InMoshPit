import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from apps.artists.models import Artist
from apps.events.models import Event, EventArtist
from apps.videos.models import Video


@pytest.mark.django_db
def test_video_rejects_performance_from_another_event(
    published_event,
    venue,
):
    other_event = Event.objects.create(
        title="Other Event",
        slug="other-event",
        venue=venue,
        start_at="2027-08-01T18:00:00Z",
        status=Event.Status.PUBLISHED,
    )
    artist = Artist.objects.create(name="Test Artist", slug="test-artist")
    performance = EventArtist.objects.create(
        event=other_event,
        artist=artist,
    )
    video = Video(
        title="Mismatched Video",
        slug="mismatched-video",
        event=published_event,
        performance=performance,
    )

    with pytest.raises(ValidationError) as error:
        video.full_clean()

    assert "performance" in error.value.message_dict


@pytest.mark.django_db
def test_video_slug_must_be_unique(published_event):
    Video.objects.create(
        title="First Video",
        slug="same-video-slug",
        event=published_event,
    )

    with pytest.raises(IntegrityError), transaction.atomic():
        Video.objects.create(
            title="Second Video",
            slug="same-video-slug",
            event=published_event,
        )

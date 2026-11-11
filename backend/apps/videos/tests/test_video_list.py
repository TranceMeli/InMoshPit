import pytest
from rest_framework import status

from apps.events.models import Event
from apps.videos.models import Video

from .conftest import VIDEOS_URL


@pytest.mark.django_db
def test_video_list_returns_published_videos_only(
    api_client,
    published_video,
    published_event,
):
    Video.objects.create(
        title="Draft Video",
        slug="draft-video",
        event=published_event,
        status=Video.Status.DRAFT,
    )
    draft_event = Event.objects.create(
        title="Draft Event",
        slug="draft-event",
        venue=published_event.venue,
        start_at="2027-08-01T18:00:00Z",
        status=Event.Status.DRAFT,
    )
    Video.objects.create(
        title="Video for Draft Event",
        slug="draft-event-video",
        event=draft_event,
        status=Video.Status.PUBLISHED,
    )

    response = api_client.get(VIDEOS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [published_video.slug]


@pytest.mark.django_db
def test_video_list_includes_event_and_venue_summaries(
    api_client,
    published_video,
):
    response = api_client.get(VIDEOS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["event"] == published_video.event_id
    assert response.data[0]["event_title"] == published_video.event.title
    assert response.data[0]["event_slug"] == published_video.event.slug
    assert response.data[0]["venue_name"] == published_video.event.venue.name
    assert response.data[0]["venue_city"] == published_video.event.venue.city


@pytest.mark.django_db
@pytest.mark.parametrize(
    "search",
    ["Live Session One", "live rock", "Live Sessions"],
)
def test_video_list_searches_video_and_event_fields(
    api_client,
    published_video,
    search,
):
    response = api_client.get(VIDEOS_URL, {"search": search})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [published_video.slug]


@pytest.mark.django_db
def test_video_list_supports_ordering(api_client, published_video):
    later_video = Video.objects.create(
        title="Later Session",
        slug="later-session",
        event=published_video.event,
        status=Video.Status.PUBLISHED,
        published_at="2027-07-12T12:00:00Z",
    )

    response = api_client.get(VIDEOS_URL, {"ordering": "title"})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [
        "later-session",
        published_video.slug,
    ]
    assert later_video.status == Video.Status.PUBLISHED


@pytest.mark.django_db
def test_video_list_is_public(api_client, published_video):
    response = api_client.get(VIDEOS_URL)

    assert response.status_code == status.HTTP_200_OK

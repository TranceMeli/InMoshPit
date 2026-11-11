import pytest
from rest_framework import status

from apps.videos.models import Video

from .conftest import VIDEOS_URL


@pytest.mark.django_db
def test_video_detail_serializes_artist_performance(
    api_client,
    video_with_artist_performance,
):
    video, artist = video_with_artist_performance

    response = api_client.get(f"{VIDEOS_URL}{video.slug}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["performance"] == {
        "type": "artist",
        "name": artist.name,
        "slug": artist.slug,
    }


@pytest.mark.django_db
def test_video_detail_serializes_band_performance(
    api_client,
    video_with_band_performance,
):
    video, band = video_with_band_performance

    response = api_client.get(f"{VIDEOS_URL}{video.slug}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["performance"] == {
        "type": "band",
        "name": band.name,
        "slug": band.slug,
    }


@pytest.mark.django_db
def test_video_detail_returns_null_performance_when_missing(
    api_client,
    published_video,
):
    response = api_client.get(f"{VIDEOS_URL}{published_video.slug}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["performance"] is None


@pytest.mark.django_db
def test_video_detail_hides_unpublished_video(api_client, published_event):
    video = Video.objects.create(
        title="Unpublished Video",
        slug="unpublished-video",
        event=published_event,
        status=Video.Status.DRAFT,
    )

    response = api_client.get(f"{VIDEOS_URL}{video.slug}/")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_video_detail_hides_video_for_unpublished_event(
    api_client,
    venue,
):
    from apps.events.models import Event

    event = Event.objects.create(
        title="Unpublished Event",
        slug="unpublished-event",
        venue=venue,
        start_at="2027-08-01T18:00:00Z",
        status=Event.Status.DRAFT,
    )
    video = Video.objects.create(
        title="Published Video for Draft Event",
        slug="published-video-for-draft-event",
        event=event,
        status=Video.Status.PUBLISHED,
    )

    response = api_client.get(f"{VIDEOS_URL}{video.slug}/")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_video_detail_returns_not_found_for_unknown_slug(api_client):
    response = api_client.get(f"{VIDEOS_URL}unknown-video/")

    assert response.status_code == status.HTTP_404_NOT_FOUND

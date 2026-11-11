import os

import pytest
from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APIClient

from apps.artists.models import Artist, Band
from apps.events.models import Event, EventArtist, Venue
from apps.streams.models import Stream
from apps.videos.models import Video


@pytest.fixture
def seeded(db, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    call_command("seed_demo", verbosity=0)

    return tmp_path


def media_files(root):
    return sorted(
        os.path.relpath(os.path.join(folder, name), root)
        for folder, _, names in os.walk(root)
        for name in names
    )


def test_venues_are_spread_over_several_cities_and_countries(seeded):
    cities = set(Venue.objects.values_list("city", flat=True))
    countries = set(Venue.objects.values_list("country", flat=True))

    assert len(cities) >= 5
    assert len(countries) >= 3
    assert "Wien" in cities  # Wien ist dabei, aber nicht alles findet dort statt


def test_events_do_not_all_take_place_in_one_city(seeded):
    event_cities = {event.venue.city for event in Event.objects.select_related("venue")}

    assert len(event_cities) >= 5


def test_seed_is_idempotent(seeded):
    counts = lambda: (  # noqa: E731
        Venue.objects.count(), Artist.objects.count(), Band.objects.count(),
        Event.objects.count(), EventArtist.objects.count(),
        Stream.objects.count(), Video.objects.count(),
    )
    before_counts, before_files = counts(), media_files(seeded)

    call_command("seed_demo", verbosity=0)

    assert counts() == before_counts
    assert media_files(seeded) == before_files


def test_every_act_event_stream_and_video_has_a_cover(seeded):
    assert all(a.image for a in Artist.objects.all())
    assert all(b.image for b in Band.objects.all())
    assert all(e.image for e in Event.objects.all())
    assert all(s.thumbnail for s in Stream.objects.all())
    assert all(v.thumbnail for v in Video.objects.all())

    for artist in Artist.objects.all():
        assert artist.image.storage.exists(artist.image.name)


def test_refresh_images_regenerates_without_duplicates(seeded):
    before = media_files(seeded)

    call_command("seed_demo", "--refresh-images", verbosity=0)

    assert media_files(seeded) == before


def test_streams_have_consistent_states(seeded):
    now = timezone.now()
    live = Stream.objects.filter(status=Stream.Status.LIVE)
    upcoming = Stream.objects.filter(status=Stream.Status.SCHEDULED)
    ended = Stream.objects.filter(status=Stream.Status.ENDED)

    assert live.count() == 1
    assert live.get().playback_url.endswith(".m3u8")
    assert live.get().scheduled_at < now
    assert upcoming.count() >= 3
    assert all(s.scheduled_at > now for s in upcoming)
    assert ended.count() >= 2
    assert all(s.recording and s.ended_at for s in ended)

    for stream in Stream.objects.all():
        stream.full_clean()


def test_videos_belong_to_their_event_lineup(seeded):
    for video in Video.objects.select_related("performance", "event"):
        assert video.performance.event_id == video.event_id
        assert video.hls_playlist.name.endswith(".m3u8")


def test_events_are_visible_through_the_api(seeded):
    client = APIClient()

    events = client.get("/api/v1/events/").json()
    streams = client.get("/api/v1/streams/").json()
    videos = client.get("/api/v1/videos/").json()
    bands = client.get("/api/v1/bands/").json()

    assert len(events) == 7
    assert len(streams) == 7
    assert len(videos) == 3
    assert all(e["image"] for e in events)
    assert all(m["artist"] for band in bands for m in band["members"])
    assert {b["slug"]: len(b["members"]) for b in bands} == {"iron-pit": 2, "velvet-riot": 2}


def test_dates_are_refreshed_relative_to_now(seeded):
    event = Event.objects.get(slug="moshpit-live-night")
    Event.objects.filter(pk=event.pk).update(start_at=event.start_at - timezone.timedelta(days=100))

    call_command("seed_demo", verbosity=0)
    event.refresh_from_db()

    assert event.start_at < timezone.now()
    assert timezone.now() - event.start_at < timezone.timedelta(hours=2)


def test_existing_demo_data_is_updated_instead_of_duplicated(db, settings, tmp_path):
    """Ein älterer Datenbestand (alles in Wien) wird auf die neuen Orte umgestellt."""
    settings.MEDIA_ROOT = tmp_path
    old_venue = Venue.objects.create(name="Grand Arena", city="Wien", country="Österreich")
    Event.objects.create(
        title="MoshPit Live Night", slug="moshpit-live-night", venue=old_venue,
        start_at=timezone.now(), status=Event.Status.PUBLISHED,
    )

    call_command("seed_demo", verbosity=0)

    assert Event.objects.filter(slug="moshpit-live-night").count() == 1
    assert Event.objects.get(slug="moshpit-live-night").venue.city == "Hamburg"
    assert Venue.objects.filter(name="Grand Arena").count() == 1


def test_times_are_round_and_lineup_positions_start_at_zero(seeded):
    for event in Event.objects.all():
        assert event.start_at.minute == 0
        assert event.end_at > event.start_at
        positions = list(event.lineup.order_by("position").values_list("position", flat=True))
        assert positions == list(range(len(positions)))

        for entry in event.lineup.all():
            assert event.start_at <= entry.performance_start < event.end_at

    for stream in Stream.objects.all():
        assert stream.scheduled_at.minute == 0

"""Legt Demo-Daten an (idempotent): Events, Künstler, Streams, Videos.

Aufruf: python manage.py seed_demo
Als Videoquelle dient ein öffentlicher HLS-Teststream (Big Buck Bunny).
"""
from datetime import timedelta

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.artists.models import Artist, Band, Genre
from apps.events.models import Event, EventArtist, Stage, Venue
from apps.streams.models import Stream
from apps.videos.models import Video

TEST_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
TEST_BASE = "https://test-streams.mux.dev/x36xhzz/"
VARIANT = "url_6/193039199_mp4_h264_aac_hq_7.m3u8"


class Command(BaseCommand):
    help = "Legt Demo-Daten für die Entwicklung an."

    def handle(self, *args, **options):
        now = timezone.now()

        metal, _ = Genre.objects.get_or_create(name="Metal", defaults={"slug": "metal"})
        punk, _ = Genre.objects.get_or_create(name="Punk", defaults={"slug": "punk"})

        band, _ = Band.objects.get_or_create(
            slug="iron-pit", defaults={"name": "Iron Pit", "bio": "Schwere Riffs aus Wien."},
        )
        band.genres.add(metal)
        artist, _ = Artist.objects.get_or_create(
            slug="lena-noise", defaults={"name": "Lena Noise", "bio": "Solo-Punk mit Loop-Pedal."},
        )
        artist.genres.add(punk)

        venue, _ = Venue.objects.get_or_create(
            name="Arena Wien", city="Wien", defaults={"country": "Österreich", "capacity": 3000},
        )

        def make_event(slug, title, start, etype=Event.EventType.CONCERT):
            event, _ = Event.objects.get_or_create(
                slug=slug,
                defaults={
                    "title": title, "venue": venue, "start_at": start,
                    "end_at": start + timedelta(hours=4), "event_type": etype,
                    "status": Event.Status.PUBLISHED,
                    "description": "Demo-Veranstaltung für die Entwicklung.",
                },
            )
            return event

        live_event = make_event("moshpit-live-night", "MoshPit Live Night", now - timedelta(hours=1))
        future_event = make_event(
            "summer-mosh-festival", "Summer Mosh Festival",
            now + timedelta(days=14), Event.EventType.FESTIVAL,
        )
        past_event = make_event("winter-riot-2025", "Winter Riot 2025", now - timedelta(days=30))

        stage, _ = Stage.objects.get_or_create(event=live_event, name="Main Stage")
        live_perf, _ = EventArtist.objects.get_or_create(
            event=live_event, band=band, defaults={"stage": stage, "position": 1},
        )
        past_perf, _ = EventArtist.objects.get_or_create(
            event=past_event, artist=artist, defaults={"position": 1},
        )

        # Aufzeichnung: lokale Master-Playlist, die auf den Teststream zeigt.
        video, created = Video.objects.get_or_create(
            slug="winter-riot-lena-noise",
            defaults={
                "title": "Lena Noise – Live at Winter Riot",
                "description": "Kompletter Auftritt (Demo-Material).",
                "event": past_event, "performance": past_perf,
                "status": Video.Status.PUBLISHED, "published_at": now - timedelta(days=29),
                "duration_seconds": 596,
            },
        )
        if created or not video.hls_playlist:
            playlist = (
                "#EXTM3U\n"
                '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=836280,RESOLUTION=848x480\n'
                f"{TEST_BASE}{VARIANT}\n"
            )
            video.hls_playlist.save("demo.m3u8", ContentFile(playlist.encode()), save=True)

        Stream.objects.get_or_create(
            slug="moshpit-live-night-main",
            defaults={
                "title": "MoshPit Live Night – Iron Pit", "event": live_event,
                "performance": live_perf, "status": Stream.Status.LIVE,
                "scheduled_at": now - timedelta(hours=1), "started_at": now - timedelta(minutes=50),
                "playback_url": TEST_HLS, "description": "Jetzt live aus der Arena Wien.",
            },
        )
        Stream.objects.get_or_create(
            slug="summer-mosh-festival-opening",
            defaults={
                "title": "Summer Mosh Festival – Opening", "event": future_event,
                "status": Stream.Status.SCHEDULED, "scheduled_at": now + timedelta(days=14),
            },
        )
        Stream.objects.get_or_create(
            slug="winter-riot-recap",
            defaults={
                "title": "Winter Riot – Lena Noise (Stream)", "event": past_event,
                "performance": past_perf, "recording": video, "status": Stream.Status.ENDED,
                "scheduled_at": now - timedelta(days=30), "started_at": now - timedelta(days=30),
                "ended_at": now - timedelta(days=30) + timedelta(hours=1),
            },
        )
        self.stdout.write(self.style.SUCCESS("Demo-Daten angelegt."))

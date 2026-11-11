"""Legt Demo-Daten an: Orte in mehreren Städten, Acts, Events, Streams, Videos.

Aufruf:
    python manage.py seed_demo                  # anlegen bzw. aktualisieren
    python manage.py seed_demo --refresh-images # Cover neu erzeugen

Alles ist erfunden. Die Cover werden mit Pillow aus einfachen Formen in den
Markenfarben erzeugt (siehe _artwork.py), es werden keine Fotos verwendet.
Als Videoquelle dient ein öffentlicher HLS-Teststream.

Der Befehl ist idempotent und setzt die Termine bei jedem Lauf relativ zu
"jetzt", sodass der Live-Stream live und die Zukunftstermine in der Zukunft
bleiben.
"""
from datetime import timedelta

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from apps.artists.models import Artist, Band, BandMember, Genre
from apps.events.models import Event, EventArtist, Stage, Venue
from apps.streams.models import Stream
from apps.videos.models import Video

from ._artwork import cover_png, kind_for

TEST_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
TEST_BASE = "https://test-streams.mux.dev/x36xhzz/"
VARIANT = "url_6/193039199_mp4_h264_aac_hq_7.m3u8"
PLAYLIST_PATH = "videos/hls/demo.m3u8"

# 4:3 passt zu den querformatigen Karten und zum Profilbild (Zuschnitt in der Mitte).
PORTRAIT = (1200, 900)
WIDE = (1280, 720)
HERO = (1600, 900)

GENRES = ["Metal", "Punk", "Electro", "Synthwave", "Rock", "Folk"]

ARTISTS = [
    ("lena-noise", "Lena Noise", "Solo punk with a loop pedal.", "Punk"),
    ("static-bloom", "Static Bloom", "Live electronics: modular synths and a lot of fog.", "Electro"),
    ("night-tide", "Night Tide", "Synthwave duo with a soft spot for 80s drum machines.", "Synthwave"),
    ("mara-voss", "Mara Voss", "Singer-songwriter. One guitar, one voice, no click track.", "Folk"),
    ("karl-brandt", "Karl Brandt", "Vocals of Iron Pit.", "Metal"),
    ("jonas-hecht", "Jonas Hecht", "Guitar of Iron Pit.", "Metal"),
    ("ines-falk", "Ines Falk", "Lead vocals of Velvet Riot.", "Rock"),
    ("tom-reuter", "Tom Reuter", "Bass of Velvet Riot.", "Rock"),
]

BANDS = [
    (
        "iron-pit", "Iron Pit", "Heavy riffs and even bigger choruses.", "Metal",
        [("karl-brandt", "Vocals"), ("jonas-hecht", "Guitar")],
    ),
    (
        "velvet-riot", "Velvet Riot", "Garage rock with a velvet voice.", "Rock",
        [("ines-falk", "Vocals"), ("tom-reuter", "Bass")],
    ),
]

# Erfundene Veranstaltungsorte in verschiedenen Städten (Städte und Länder
# deutsch, wie sie in der Datenbank stehen; die Oberfläche übersetzt sie).
VENUES = [
    ("Hafenhalle", "Hamburg", "Deutschland", 2800, "Am Kaiufer 12", "20457"),
    ("Rheinbühne", "Köln", "Deutschland", 6000, "Uferpromenade 3", "50667"),
    ("Gaswerk Halle", "Zürich", "Schweiz", 1800, "Gaswerkstrasse 9", "8005"),
    ("Grand Arena", "Wien", "Österreich", 3000, "Donauallee 21", "1020"),
    ("Isar Loft", "München", "Deutschland", 2200, "Flussweg 5", "80331"),
    ("Werkstatt Club", "Berlin", "Deutschland", 900, "Hinterhof 4", "10997"),
]

# (slug, Titel, Ort, Typ, Start relativ zu jetzt, Dauer in Stunden, Beschreibung,
#  Line-up als (Art, Slug, Bühne, Minuten nach Start))
EVENTS = [
    (
        "moshpit-live-night", "MoshPit Live Night", "Hafenhalle", "concert",
        timedelta(hours=-1), 4, "A loud night at the harbour with three acts on two stages.",
        [("band", "iron-pit", "Main Stage", 0), ("band", "velvet-riot", "Main Stage", 90),
         ("artist", "lena-noise", "Second Stage", 30)],
    ),
    (
        "summer-mosh-festival", "Summer Mosh Festival", "Rheinbühne", "festival",
        timedelta(days=14), 7, "Open-air festival on the river: four acts, two stages, one long evening.",
        [("band", "iron-pit", "Main Stage", 0), ("artist", "static-bloom", "Second Stage", 60),
         ("artist", "night-tide", "Second Stage", 150), ("band", "velvet-riot", "Main Stage", 210)],
    ),
    (
        "alpine-echo-nights", "Alpine Echo Nights", "Gaswerk Halle", "concert",
        timedelta(days=30), 4, "Quiet songs in a big hall. Seated, with a bar in the back.",
        [("artist", "mara-voss", "Main Stage", 0), ("artist", "night-tide", "Main Stage", 75)],
    ),
    (
        "danube-distortion", "Danube Distortion", "Grand Arena", "concert",
        timedelta(days=21), 5, "Fuzz pedals, feedback and one very large arena.",
        [("band", "velvet-riot", "Main Stage", 0), ("artist", "lena-noise", "Main Stage", 70),
         ("artist", "static-bloom", "Main Stage", 140)],
    ),
    (
        "isar-open-air", "Isar Open Air", "Isar Loft", "festival",
        timedelta(days=60), 7, "A day of open-air sets on the loft terrace.",
        [("artist", "static-bloom", "Main Stage", 0), ("artist", "mara-voss", "Second Stage", 45),
         ("band", "iron-pit", "Main Stage", 120), ("artist", "night-tide", "Second Stage", 200)],
    ),
    (
        "winter-riot-2025", "Winter Riot 2025", "Werkstatt Club", "concert",
        timedelta(days=-30), 4, "Winter edition in a tight club. Sold out, loud, over too soon.",
        [("artist", "lena-noise", "Main Stage", 0), ("band", "iron-pit", "Main Stage", 75)],
    ),
    (
        "spring-static-2026", "Spring Static 2026", "Hafenhalle", "concert",
        timedelta(days=-75), 4, "Electronics meets garage rock, spring edition.",
        [("artist", "static-bloom", "Main Stage", 0), ("band", "velvet-riot", "Main Stage", 80)],
    ),
]

# (slug, Titel, Event, Performer (Art, Slug) oder None, Status, Start relativ,
#  Beschreibung, Aufzeichnung (Video-Slug) oder None)
STREAMS = [
    ("moshpit-live-night-main", "MoshPit Live Night – Iron Pit", "moshpit-live-night",
     ("band", "iron-pit"), Stream.Status.LIVE, timedelta(hours=-1),
     "Live from the harbour hall.", None),
    ("summer-mosh-festival-opening", "Summer Mosh Festival – Opening", "summer-mosh-festival",
     None, Stream.Status.SCHEDULED, timedelta(days=14), "The festival opening from the Rhine stage.", None),
    ("alpine-echo-opening", "Alpine Echo Nights – Mara Voss", "alpine-echo-nights",
     ("artist", "mara-voss"), Stream.Status.SCHEDULED, timedelta(days=30),
     "A quiet opening set, streamed from Zurich.", None),
    ("danube-distortion-main", "Danube Distortion – Velvet Riot", "danube-distortion",
     ("band", "velvet-riot"), Stream.Status.SCHEDULED, timedelta(days=21),
     "Headline set from the arena.", None),
    ("isar-open-air-day-one", "Isar Open Air – Day one", "isar-open-air",
     None, Stream.Status.SCHEDULED, timedelta(days=60), "All day, both stages.", None),
    ("winter-riot-recap", "Winter Riot – Lena Noise", "winter-riot-2025",
     ("artist", "lena-noise"), Stream.Status.ENDED, timedelta(days=-30),
     "Replay of the opening set.", "winter-riot-lena-noise"),
    ("spring-static-recap", "Spring Static – Static Bloom", "spring-static-2026",
     ("artist", "static-bloom"), Stream.Status.ENDED, timedelta(days=-75),
     "Replay of the opening set.", "spring-static-static-bloom"),
]

# (slug, Titel, Event, Performer, veröffentlicht vor X Tagen, Beschreibung)
VIDEOS = [
    ("winter-riot-lena-noise", "Lena Noise – Live at Winter Riot", "winter-riot-2025",
     ("artist", "lena-noise"), 29, "The full opening set (demo footage)."),
    ("winter-riot-iron-pit", "Iron Pit – Live at Winter Riot", "winter-riot-2025",
     ("band", "iron-pit"), 28, "Iron Pit closing the night (demo footage)."),
    ("spring-static-static-bloom", "Static Bloom – Live at Spring Static", "spring-static-2026",
     ("artist", "static-bloom"), 74, "Fog, synths and a very patient sound engineer (demo footage)."),
]


class Command(BaseCommand):
    help = "Creates demo data: venues in several cities, acts, events, streams and videos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--refresh-images",
            action="store_true",
            help="Regenerate all cover images, even if they already exist.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.refresh = options["refresh_images"]
        self.now = timezone.now()

        self.genres = self.make_genres()
        self.artists = self.make_artists()
        self.bands = self.make_bands()
        self.venues = self.make_venues()
        self.events = self.make_events()
        self.videos = self.make_videos()
        self.make_streams()

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo data ready: {len(self.venues)} venues, {len(self.artists)} artists, "
                f"{len(self.bands)} bands, {len(self.events)} events, "
                f"{len(STREAMS)} streams, {len(self.videos)} videos."
            )
        )

    # ------------------------------------------------------------ Hilfsfunktionen

    def at(self, offset):
        """Termin relativ zu jetzt, auf runde Uhrzeiten gelegt.

        Ab einem Tag Abstand beginnt die Veranstaltung um 18:00 UTC (19:00 in
        Mitteleuropa), kürzere Abstände (der laufende Termin) werden auf die
        volle Stunde abgerundet.
        """
        moment = self.now + offset

        if abs(offset) >= timedelta(days=1):
            return moment.replace(hour=18, minute=0, second=0, microsecond=0)

        return moment.replace(minute=0, second=0, microsecond=0)

    def ensure_cover(self, obj, field_name, genre, seed, size):
        """Erzeugt das Cover, falls es fehlt (oder mit --refresh-images neu)."""
        field = getattr(obj, field_name)

        if field and not self.refresh and field.storage.exists(field.name):
            return

        if field:
            field.delete(save=False)

        png = cover_png(kind_for(genre, seed), seed, *size)
        field.save(f"{seed}.png", ContentFile(png), save=True)

    def performer(self, ref):
        """Löst (Art, Slug) in das Artist- bzw. Band-Objekt auf."""
        kind, slug = ref
        return self.artists[slug] if kind == "artist" else self.bands[slug]

    def genre_of(self, ref):
        kind, slug = ref
        return self.genre_names[(kind, slug)]

    # ----------------------------------------------------------------- Stammdaten

    def make_genres(self):
        return {
            name: Genre.objects.get_or_create(name=name, defaults={"slug": slugify(name)})[0]
            for name in GENRES
        }

    def make_artists(self):
        artists = {}
        self.genre_names = {}

        for slug, name, bio, genre in ARTISTS:
            artist, _ = Artist.objects.update_or_create(
                slug=slug, defaults={"name": name, "bio": bio},
            )
            artist.genres.set([self.genres[genre]])
            self.ensure_cover(artist, "image", genre, slug, PORTRAIT)
            artists[slug] = artist
            self.genre_names[("artist", slug)] = genre

        return artists

    def make_bands(self):
        bands = {}

        for slug, name, bio, genre, members in BANDS:
            band, _ = Band.objects.update_or_create(
                slug=slug, defaults={"name": name, "bio": bio},
            )
            band.genres.set([self.genres[genre]])
            self.ensure_cover(band, "image", genre, slug, PORTRAIT)

            for artist_slug, role in members:
                BandMember.objects.update_or_create(
                    band=band, artist=self.artists[artist_slug], defaults={"role": role},
                )

            bands[slug] = band
            self.genre_names[("band", slug)] = genre

        return bands

    def make_venues(self):
        venues = {}

        for name, city, country, capacity, address, postal_code in VENUES:
            venue, _ = Venue.objects.update_or_create(
                name=name,
                defaults={
                    "city": city, "country": country, "capacity": capacity,
                    "address": address, "postal_code": postal_code,
                },
            )
            venues[name] = venue

        return venues

    # ---------------------------------------------------------------------- Events

    def make_events(self):
        events = {}

        for slug, title, venue, etype, offset, hours, description, lineup in EVENTS:
            start = self.at(offset)
            event, _ = Event.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "venue": self.venues[venue],
                    "event_type": etype,
                    "start_at": start,
                    "end_at": start + timedelta(hours=hours),
                    "description": description,
                    "status": Event.Status.PUBLISHED,
                },
            )

            # Festivals bekommen die Sonne, Konzerte die Form des Headliners.
            genre = "Synthwave" if etype == "festival" else self.genre_of(lineup[0][:2])
            self.ensure_cover(event, "image", genre, slug, HERO)

            stages = {}
            for position, (kind, performer_slug, stage_name, minutes) in enumerate(lineup):
                if stage_name not in stages:
                    stages[stage_name], _ = Stage.objects.get_or_create(event=event, name=stage_name)

                performer = self.performer((kind, performer_slug))
                performance_start = start + timedelta(minutes=minutes)

                EventArtist.objects.update_or_create(
                    event=event,
                    artist=performer if kind == "artist" else None,
                    band=performer if kind == "band" else None,
                    defaults={
                        "stage": stages[stage_name],
                        "position": position,
                        "performance_start": performance_start,
                        "performance_end": performance_start + timedelta(minutes=60),
                    },
                )

            events[slug] = event

        return events

    def lineup_entry(self, event, ref):
        kind, slug = ref
        performer = self.performer(ref)

        return EventArtist.objects.get(
            event=event,
            artist=performer if kind == "artist" else None,
            band=performer if kind == "band" else None,
        )

    # ---------------------------------------------------------------------- Videos

    def ensure_playlist(self):
        """Lokale Master-Playlist, die auf den öffentlichen Teststream zeigt."""
        if not default_storage.exists(PLAYLIST_PATH):
            playlist = (
                "#EXTM3U\n"
                "#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=836280,RESOLUTION=848x480\n"
                f"{TEST_BASE}{VARIANT}\n"
            )
            return default_storage.save(PLAYLIST_PATH, ContentFile(playlist.encode()))

        return PLAYLIST_PATH

    def make_videos(self):
        playlist = self.ensure_playlist()
        videos = {}

        for slug, title, event_slug, ref, days_ago, description in VIDEOS:
            event = self.events[event_slug]
            video, _ = Video.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "description": description,
                    "event": event,
                    "performance": self.lineup_entry(event, ref),
                    "status": Video.Status.PUBLISHED,
                    "published_at": self.now - timedelta(days=days_ago),
                    "duration_seconds": 596,
                    "hls_playlist": playlist,
                },
            )
            self.ensure_cover(video, "thumbnail", self.genre_of(ref), slug, WIDE)
            videos[slug] = video

        return videos

    # --------------------------------------------------------------------- Streams

    def make_streams(self):
        for slug, title, event_slug, ref, status, offset, description, recording in STREAMS:
            event = self.events[event_slug]
            scheduled = self.at(offset)

            # Dauer-Felder passend zum Status; sonst verlangt Stream.clean() sie.
            started = ended = None
            if status in (Stream.Status.LIVE, Stream.Status.ENDED):
                started = scheduled + (timedelta(minutes=10) if status == Stream.Status.LIVE else timedelta())
            if status == Stream.Status.ENDED:
                ended = started + timedelta(hours=1)

            stream, _ = Stream.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "description": description,
                    "event": event,
                    "performance": self.lineup_entry(event, ref) if ref else None,
                    "recording": self.videos[recording] if recording else None,
                    "status": status,
                    "scheduled_at": scheduled,
                    "started_at": started,
                    "ended_at": ended,
                    "playback_url": TEST_HLS if status == Stream.Status.LIVE else "",
                    "is_public": True,
                },
            )

            genre = self.genre_of(ref) if ref else "Synthwave"
            self.ensure_cover(stream, "thumbnail", genre, slug, WIDE)


from django.db import models
from django.db.models import Q

from apps.artists.models import Artist, Band


class Venue(models.Model):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="Deutschland")
    capacity = models.PositiveIntegerField(null=True, blank=True)
    website = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Veranstaltungsort"
        verbose_name_plural = "Veranstaltungsorte"

    def __str__(self):
        return f"{self.name} ({self.city})"


class Event(models.Model):

    class EventType(models.TextChoices):
        CONCERT = "concert", "Konzert"
        FESTIVAL = "festival", "Festival"

    class Status(models.TextChoices):
        DRAFT = "draft", "Entwurf"
        PUBLISHED = "published", "Veröffentlicht"
        CANCELLED = "cancelled", "Abgesagt"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)

    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        default=EventType.CONCERT,
    )

    venue = models.ForeignKey(
        Venue,
        on_delete=models.PROTECT,
        related_name="events",
    )

    start_at = models.DateTimeField()
    end_at = models.DateTimeField(null=True, blank=True)

    image = models.ImageField(
        upload_to="events/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at"]
        verbose_name = "Veranstaltung"
        verbose_name_plural = "Veranstaltungen"

    def __str__(self):
        return self.title


class Stage(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="stages",
    )

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["event", "name"],
                name="unique_stage_name_per_event",
            )
        ]
        verbose_name = "Bühne"
        verbose_name_plural = "Bühnen"

    def __str__(self):
        return f"{self.name} – {self.event.title}"


class EventArtist(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="lineup",
    )

    artist = models.ForeignKey(
        Artist,
        on_delete=models.CASCADE,
        related_name="event_appearances",
        null=True,
        blank=True,
    )

    band = models.ForeignKey(
        Band,
        on_delete=models.CASCADE,
        related_name="event_appearances",
        null=True,
        blank=True,
    )

    stage = models.ForeignKey(
        Stage,
        on_delete=models.SET_NULL,
        related_name="performances",
        null=True,
        blank=True,
    )

    performance_start = models.DateTimeField(null=True, blank=True)
    performance_end = models.DateTimeField(null=True, blank=True)

    position = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "performance_start"]

        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(artist__isnull=False, band__isnull=True)
                    | Q(artist__isnull=True, band__isnull=False)
                ),
                name="eventartist_exactly_one_target",
            ),
            models.UniqueConstraint(
                fields=["event", "artist"],
                condition=Q(artist__isnull=False),
                name="unique_artist_per_event",
            ),
            models.UniqueConstraint(
                fields=["event", "band"],
                condition=Q(band__isnull=False),
                name="unique_band_per_event",
            ),
        ]

        verbose_name = "Line-up-Eintrag"
        verbose_name_plural = "Line-up"

    def __str__(self):
        performer = self.artist or self.band
        return f"{performer} – {self.event.title}"

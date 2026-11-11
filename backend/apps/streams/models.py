
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.events.models import Event, EventArtist
from apps.videos.models import Video


class Stream(models.Model):

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Geplant"
        LIVE = "live", "Live"
        ENDED = "ended", "Beendet"
        CANCELLED = "cancelled", "Abgesagt"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)

    event = models.ForeignKey(
        Event,
        on_delete=models.PROTECT,
        related_name="streams",
    )

    performance = models.ForeignKey(
        EventArtist,
        on_delete=models.SET_NULL,
        related_name="streams",
        null=True,
        blank=True,
    )

    recording = models.OneToOneField(
        Video,
        on_delete=models.SET_NULL,
        related_name="source_stream",
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )

    scheduled_at = models.DateTimeField()

    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    ended_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    stream_key = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )

    playback_url = models.URLField(
        blank=True,
    )

    thumbnail = models.ImageField(
        upload_to="streams/thumbnails/",
        blank=True,
        null=True,
    )

    is_public = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_streams",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at"]
        verbose_name = "Live-Stream"
        verbose_name_plural = "Live-Streams"

    def clean(self):
        super().clean()

        if (
            self.performance_id
            and self.event_id
            and self.performance.event_id != self.event_id
        ):
            raise ValidationError({
                "performance": (
                    "Der Auftritt muss zur ausgewählten Veranstaltung gehören."
                )
            })

        if self.started_at and self.ended_at:
            if self.ended_at < self.started_at:
                raise ValidationError({
                    "ended_at": (
                        "Das Ende darf nicht vor dem Start liegen."
                    )
                })

        if self.status == self.Status.LIVE and not self.started_at:
            raise ValidationError({
                "started_at": (
                    "Ein Live-Stream benötigt eine Startzeit."
                )
            })

        if self.status == self.Status.ENDED and not self.ended_at:
            raise ValidationError({
                "ended_at": (
                    "Ein beendeter Stream benötigt eine Endzeit."
                )
            })

    def __str__(self):
        return self.title

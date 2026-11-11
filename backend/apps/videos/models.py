
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.events.models import Event, EventArtist


class Video(models.Model):

    class Status(models.TextChoices):
        DRAFT = "draft", "Entwurf"
        PROCESSING = "processing", "Wird verarbeitet"
        PUBLISHED = "published", "Veröffentlicht"
        ARCHIVED = "archived", "Archiviert"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)

    event = models.ForeignKey(
        Event,
        on_delete=models.PROTECT,
        related_name="videos",
    )

    performance = models.ForeignKey(
        EventArtist,
        on_delete=models.SET_NULL,
        related_name="videos",
        null=True,
        blank=True,
    )

    source_file = models.FileField(
        upload_to="videos/source/",
        blank=True,
        null=True,
    )

    hls_playlist = models.FileField(
        upload_to="videos/hls/",
        blank=True,
        null=True,
    )

    thumbnail = models.ImageField(
        upload_to="videos/thumbnails/",
        blank=True,
        null=True,
    )

    duration_seconds = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="uploaded_videos",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        verbose_name = "Video"
        verbose_name_plural = "Videos"

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

    def __str__(self):
        return self.title

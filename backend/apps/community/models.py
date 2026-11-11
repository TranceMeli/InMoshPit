
from django.conf import settings
from django.db import models
from django.db.models import Q


class Follow(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="follows",
    )
    artist = models.ForeignKey(
        "artists.Artist",
        on_delete=models.CASCADE,
        related_name="followers",
        blank=True,
        null=True,
    )
    band = models.ForeignKey(
        "artists.Band",
        on_delete=models.CASCADE,
        related_name="followers",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(artist__isnull=False, band__isnull=True)
                    | Q(artist__isnull=True, band__isnull=False)
                ),
                name="follow_exactly_one_target",
            ),
            models.UniqueConstraint(
                fields=["user", "artist"],
                condition=Q(artist__isnull=False),
                name="unique_user_artist_follow",
            ),
            models.UniqueConstraint(
                fields=["user", "band"],
                condition=Q(band__isnull=False),
                name="unique_user_band_follow",
            ),
        ]

    def __str__(self):
        target = self.artist or self.band
        return f"{self.user} folgt {target}"


class Like(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_likes",
    )
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "video"],
                name="unique_user_video_like",
            ),
        ]

    def __str__(self):
        return f"{self.user} liked {self.video}"


class Comment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_comments",
    )
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="comments",
    )
    content = models.TextField()
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Kommentar von {self.user} zu {self.video}"


class VideoView(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="video_views",
        blank=True,
        null=True,
    )
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="views",
    )
    watch_duration_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-viewed_at"]

    def __str__(self):
        return f"Aufruf von {self.video}"


from django.conf import settings
from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Artist(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True)

    bio = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="artists/",
        blank=True,
        null=True,
    )

    genres = models.ManyToManyField(
        Genre,
        blank=True,
        related_name="artists",
    )

    website = models.URLField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_artists",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Band(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True)

    bio = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="bands/",
        blank=True,
        null=True,
    )

    genres = models.ManyToManyField(
        Genre,
        blank=True,
        related_name="bands",
    )

    website = models.URLField(blank=True)

    members = models.ManyToManyField(
        Artist,
        through="BandMember",
        related_name="bands",
        blank=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_bands",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class BandMember(models.Model):
    band = models.ForeignKey(
        Band,
        on_delete=models.CASCADE,
        related_name="band_members",
    )

    artist = models.ForeignKey(
        Artist,
        on_delete=models.CASCADE,
        related_name="band_memberships",
    )

    role = models.CharField(max_length=100, blank=True)

    joined_on = models.DateField(
        null=True,
        blank=True,
    )

    left_on = models.DateField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["band", "artist"]
        constraints = [
            models.UniqueConstraint(
                fields=["band", "artist"],
                name="unique_band_artist",
            )
        ]

    def __str__(self):
        return f"{self.artist} – {self.band}"

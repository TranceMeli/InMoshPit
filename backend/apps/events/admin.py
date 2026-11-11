
from django.contrib import admin

from .models import Event, EventArtist, Stage, Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "country", "capacity")
    search_fields = ("name", "city", "postal_code")
    list_filter = ("country", "city")


class StageInline(admin.TabularInline):
    model = Stage
    extra = 1


class EventArtistInline(admin.TabularInline):
    model = EventArtist
    extra = 1
    autocomplete_fields = ("artist", "band", "stage")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "event_type",
        "venue",
        "start_at",
        "status",
    )

    list_filter = (
        "event_type",
        "status",
        "venue__city",
    )

    search_fields = (
        "title",
        "description",
        "venue__name",
        "venue__city",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }

    date_hierarchy = "start_at"

    inlines = [
        StageInline,
        EventArtistInline,
    ]


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ("name", "event")
    list_filter = ("event",)
    search_fields = ("name", "event__title")


@admin.register(EventArtist)
class EventArtistAdmin(admin.ModelAdmin):
    list_display = (
        "event",
        "artist",
        "band",
        "stage",
        "performance_start",
        "performance_end",
    )

    list_filter = ("event", "stage")
    search_fields = (
        "event__title",
        "artist__name",
        "band__name",
    )

    autocomplete_fields = ("event", "artist", "band", "stage")

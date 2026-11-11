
from django.contrib import admin

from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "event",
        "status",
        "duration_seconds",
        "published_at",
        "created_at",
    )

    list_filter = (
        "status",
        "event__event_type",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "event__title",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }

    autocomplete_fields = (
        "event",
        "performance",
        "created_by",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    date_hierarchy = "created_at"

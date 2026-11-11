
from django.contrib import admin

from .models import Stream


@admin.register(Stream)
class StreamAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "event",
        "status",
        "scheduled_at",
        "started_at",
        "ended_at",
        "is_public",
    )

    list_filter = (
        "status",
        "is_public",
        "event__event_type",
        "scheduled_at",
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
        "recording",
        "created_by",
    )

    readonly_fields = (
        "stream_key",
        "created_at",
        "updated_at",
    )

    date_hierarchy = "scheduled_at"

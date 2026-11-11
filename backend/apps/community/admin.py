
from django.contrib import admin

from .models import Comment, Follow, Like, VideoView


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("user", "artist", "band", "created_at")
    list_filter = ("created_at",)
    search_fields = (
        "user__username",
        "artist__name",
        "band__name",
    )
    autocomplete_fields = ("user", "artist", "band")
    readonly_fields = ("created_at",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "video", "created_at")
    list_filter = ("created_at",)
    search_fields = (
        "user__username",
        "video__title",
    )
    autocomplete_fields = ("user", "video")
    readonly_fields = ("created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "video",
        "is_visible",
        "created_at",
    )
    list_filter = ("is_visible", "created_at")
    search_fields = (
        "user__username",
        "video__title",
        "content",
    )
    autocomplete_fields = ("user", "video")
    readonly_fields = ("created_at", "updated_at")


@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    list_display = (
        "video",
        "user",
        "watch_duration_seconds",
        "completed",
        "viewed_at",
    )
    list_filter = ("completed", "viewed_at")
    search_fields = (
        "video__title",
        "user__username",
    )
    autocomplete_fields = ("user", "video")
    readonly_fields = ("viewed_at",)


from rest_framework import serializers

from .models import Video


class VideoListSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )
    event_slug = serializers.CharField(
        source="event.slug",
        read_only=True,
    )
    venue_name = serializers.CharField(
        source="event.venue.name",
        read_only=True,
    )
    venue_city = serializers.CharField(
        source="event.venue.city",
        read_only=True,
    )

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "event",
            "event_title",
            "event_slug",
            "venue_name",
            "venue_city",
            "thumbnail",
            "duration_seconds",
            "published_at",
        ]


class VideoDetailSerializer(VideoListSerializer):
    performance = serializers.SerializerMethodField()

    class Meta(VideoListSerializer.Meta):
        fields = VideoListSerializer.Meta.fields + [
            "performance",
            "hls_playlist",
            "created_at",
            "updated_at",
        ]

    def get_performance(self, obj):
        if not obj.performance:
            return None

        performance = obj.performance

        if performance.artist:
            return {
                "type": "artist",
                "name": performance.artist.name,
                "slug": performance.artist.slug,
            }

        if performance.band:
            return {
                "type": "band",
                "name": performance.band.name,
                "slug": performance.band.slug,
            }

        return None

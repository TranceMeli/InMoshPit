
from rest_framework import serializers

from .models import Event, EventArtist, Stage, Venue


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            "id",
            "name",
            "address",
            "city",
            "postal_code",
            "country",
            "capacity",
            "website",
        ]


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = [
            "id",
            "name",
            "description",
        ]


class EventArtistSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(
        source="artist.name",
        read_only=True,
        allow_null=True,
    )
    artist_slug = serializers.CharField(
        source="artist.slug",
        read_only=True,
        allow_null=True,
    )
    band_name = serializers.CharField(
        source="band.name",
        read_only=True,
        allow_null=True,
    )
    band_slug = serializers.CharField(
        source="band.slug",
        read_only=True,
        allow_null=True,
    )
    stage_name = serializers.CharField(
        source="stage.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = EventArtist
        fields = [
            "id",
            "artist",
            "artist_name",
            "artist_slug",
            "band",
            "band_name",
            "band_slug",
            "stage",
            "stage_name",
            "performance_start",
            "performance_end",
            "position",
        ]


class EventListSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    lineup_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "event_type",
            "venue",
            "start_at",
            "end_at",
            "image",
            "status",
            "lineup_count",
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    stages = StageSerializer(many=True, read_only=True)
    lineup = EventArtistSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "event_type",
            "venue",
            "start_at",
            "end_at",
            "image",
            "status",
            "stages",
            "lineup",
            "created_at",
            "updated_at",
        ]

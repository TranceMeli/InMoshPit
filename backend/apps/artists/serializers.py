
from rest_framework import serializers

from .models import Artist, Band, BandMember, Genre


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name", "slug"]


class ArtistSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ["id", "name", "slug", "image"]


class ArtistSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Artist
        fields = [
            "id",
            "name",
            "slug",
            "bio",
            "image",
            "genres",
            "website",
            "created_at",
        ]


class BandMemberSerializer(serializers.ModelSerializer):
    artist = ArtistSummarySerializer(read_only=True)

    class Meta:
        model = BandMember
        fields = [
            "id",
            "artist",
            "role",
            "joined_on",
            "left_on",
        ]


class BandSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    members = BandMemberSerializer(
        source="band_members",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Band
        fields = [
            "id",
            "name",
            "slug",
            "bio",
            "image",
            "genres",
            "website",
            "members",
            "created_at",
        ]

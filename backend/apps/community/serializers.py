from rest_framework import serializers

from .models import Comment, Follow, Like, VideoView


class FollowSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    artist = serializers.PrimaryKeyRelatedField(read_only=True)
    band = serializers.PrimaryKeyRelatedField(read_only=True)
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

    class Meta:
        model = Follow
        fields = [
            "id",
            "user",
            "artist",
            "artist_name",
            "artist_slug",
            "band",
            "band_name",
            "band_slug",
            "created_at",
        ]


class LikeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    video = serializers.PrimaryKeyRelatedField(read_only=True)
    video_title = serializers.CharField(
        source="video.title",
        read_only=True,
    )

    class Meta:
        model = Like
        fields = [
            "id",
            "user",
            "video",
            "video_title",
            "created_at",
        ]


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    video = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    user_display_name = serializers.CharField(
        source="user.profile.display_name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "username",
            "user_display_name",
            "video",
            "content",
            "is_visible",
            "created_at",
            "updated_at",
        ]


class VideoViewSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    video = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = VideoView
        fields = [
            "id",
            "user",
            "video",
            "watch_duration_seconds",
            "completed",
            "viewed_at",
        ]

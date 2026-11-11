
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.artists.models import Artist, Band
from apps.videos.models import Video

from .models import Follow, Like, Comment, VideoView
from .serializers import (
    FollowSerializer,
    LikeSerializer,
    CommentSerializer,
    VideoViewSerializer,
)


class FollowListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        follows = Follow.objects.filter(
            user=request.user
        ).select_related("artist", "band")

        serializer = FollowSerializer(follows, many=True)

        return Response(serializer.data)

    def post(self, request):
        artist_slug = request.data.get("artist_slug")
        band_slug = request.data.get("band_slug")

        if bool(artist_slug) == bool(band_slug):
            return Response(
                {"detail": "Bitte genau einen Künstler oder eine Band angeben."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if artist_slug:
            artist = get_object_or_404(Artist, slug=artist_slug)
            follow, created = Follow.objects.get_or_create(
                user=request.user,
                artist=artist,
            )
        else:
            band = get_object_or_404(Band, slug=band_slug)
            follow, created = Follow.objects.get_or_create(
                user=request.user,
                band=band,
            )

        serializer = FollowSerializer(follow)

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class FollowDeleteView(generics.DestroyAPIView):
    serializer_class = FollowSerializer
    
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        
        return [IsAuthenticated()]

    def get_queryset(self):
        return Follow.objects.filter(user=self.request.user)


class VideoLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, video_slug):
        video = get_object_or_404(
            Video,
            slug=video_slug,
            status="published",
            event__status="published",
        )

        like, created = Like.objects.get_or_create(
            user=request.user,
            video=video,
        )

        return Response(
            {
                "liked": True,
                "created": created,
                "like": LikeSerializer(like).data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    def delete(self, request, video_slug):
        video = get_object_or_404(
            Video,
            slug=video_slug,
            status="published",
            event__status="published",
        )

        deleted, _ = Like.objects.filter(
            user=request.user,
            video=video,
        ).delete()

        return Response(
            {"liked": False, "deleted": bool(deleted)},
            status=status.HTTP_200_OK,
        )

    
    def get(self, request, video_slug):
        video = get_object_or_404(
            Video,
            slug=video_slug,
            status="published",
            event__status="published",
        )

        liked = Like.objects.filter(
            user=request.user,
            video=video,
        ).exists()

        return Response({
            "liked": liked,
            "like_count": Like.objects.filter(video=video).count(),
        })


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]

        return [AllowAny()]

    def get_queryset(self):
        return (
            Comment.objects.filter(
                video__slug=self.kwargs["video_slug"],
                video__status="published",
                video__event__status="published",
                is_visible=True,
            )
            .select_related("user", "video", "user__profile")
        )

    def perform_create(self, serializer):
        video = get_object_or_404(
            Video,
            slug=self.kwargs["video_slug"],
            status="published",
            event__status="published",
        )

        serializer.save(
            user=self.request.user,
            video=video,
        )


class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            user=self.request.user,
        )


class VideoViewCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, video_slug):
        video = get_object_or_404(
            Video,
            slug=video_slug,
            status="published",
            event__status="published",
        )

        serializer = VideoViewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user if request.user.is_authenticated else None

        video_view = serializer.save(
            video=video,
            user=user,
        )

        return Response(
            VideoViewSerializer(video_view).data,
            status=status.HTTP_201_CREATED,
        )

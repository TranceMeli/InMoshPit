from rest_framework import filters, generics
from rest_framework.permissions import AllowAny

from .models import Video
from .serializers import VideoDetailSerializer, VideoListSerializer


class VideoListView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "event__title"]
    ordering_fields = ["title", "published_at", "created_at"]
    ordering = ["-published_at", "-created_at"]

    def get_queryset(self):
        return (
            Video.objects.filter(
                status=Video.Status.PUBLISHED,
                event__status="published",
            )
            .select_related("event", "event__venue")
        )


class VideoDetailView(generics.RetrieveAPIView):
    serializer_class = VideoDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Video.objects.filter(
                status=Video.Status.PUBLISHED,
                event__status="published",
            )
            .select_related(
                "event",
                "event__venue",
                "performance__artist",
                "performance__band",
            )
        )

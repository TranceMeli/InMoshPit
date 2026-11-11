
from django.db.models import Q
from rest_framework import filters, generics

from .models import Stream
from .serializers import StreamDetailSerializer, StreamListSerializer


class StreamListView(generics.ListAPIView):
    serializer_class = StreamListSerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "title",
        "description",
        "event__title",
        "event__venue__name",
        "event__venue__city",
    ]

    ordering_fields = [
        "scheduled_at",
        "started_at",
        "created_at",
        "title",
    ]

    ordering = ["scheduled_at"]

    def get_queryset(self):
        queryset = (
            Stream.objects.filter(
                is_public=True,
                event__status="published",
            )
            .filter(
                Q(status=Stream.Status.SCHEDULED)
                | Q(status=Stream.Status.LIVE)
                | Q(status=Stream.Status.ENDED)
            )
            .select_related(
                "event",
                "event__venue",
            )
        )

        status = self.request.query_params.get("status")
        event_slug = self.request.query_params.get("event")

        valid_statuses = [
            Stream.Status.SCHEDULED,
            Stream.Status.LIVE,
            Stream.Status.ENDED,
        ]

        if status in valid_statuses:
            queryset = queryset.filter(status=status)

        if event_slug:
            queryset = queryset.filter(event__slug=event_slug)

        return queryset


class StreamDetailView(generics.RetrieveAPIView):
    serializer_class = StreamDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Stream.objects.filter(
                is_public=True,
                event__status="published",
            )
            .filter(
                Q(status=Stream.Status.SCHEDULED)
                | Q(status=Stream.Status.LIVE)
                | Q(status=Stream.Status.ENDED)
            )
            .select_related(
                "event",
                "event__venue",
                "performance",
                "performance__artist",
                "performance__band",
                "recording",
            )
        )

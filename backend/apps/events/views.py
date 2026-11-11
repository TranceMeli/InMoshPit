
from django.db.models import Count, Prefetch
from rest_framework import generics, filters

from .models import Event, EventArtist, Stage
from .serializers import EventDetailSerializer, EventListSerializer


class EventListView(generics.ListAPIView):
    serializer_class = EventListSerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "title",
        "description",
        "venue__name",
        "venue__city",
    ]

    ordering_fields = [
        "start_at",
        "created_at",
        "title",
    ]

    ordering = ["start_at"]

    def get_queryset(self):
        queryset = Event.objects.filter(
            status=Event.Status.PUBLISHED
        ).select_related(
            "venue"
        ).annotate(lineup_count=Count("lineup", distinct=True))

        event_type = self.request.query_params.get("event_type")

        if event_type in Event.EventType.values:
            queryset = queryset.filter(event_type=event_type)

        return queryset


class EventDetailView(generics.RetrieveAPIView):
    serializer_class = EventDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Event.objects.filter(
                status=Event.Status.PUBLISHED
            )
            .select_related("venue")
            .prefetch_related(
                "stages",
                Prefetch(
                    "lineup",
                    queryset=EventArtist.objects.select_related(
                        "artist",
                        "band",
                        "stage",
                    ).order_by("position", "performance_start"),
                ),
            )
        )

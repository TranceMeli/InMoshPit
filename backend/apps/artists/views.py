
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny

from .models import Artist, Band, Genre
from .serializers import (
    ArtistSerializer,
    BandSerializer,
    GenreSerializer,
)


class ArtistListView(generics.ListAPIView):
    queryset = Artist.objects.prefetch_related("genres")
    serializer_class = ArtistSerializer
    permission_classes = [AllowAny]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = ["name", "bio", "genres__name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class ArtistDetailView(generics.RetrieveAPIView):
    queryset = Artist.objects.prefetch_related("genres")
    serializer_class = ArtistSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class BandListView(generics.ListAPIView):
    queryset = (
        Band.objects
        .prefetch_related(
            "genres",
            "band_members__artist",
        )
    )
    serializer_class = BandSerializer
    permission_classes = [AllowAny]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "bio",
        "genres__name",
        "band_members__artist__name",
    ]

    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class BandDetailView(generics.RetrieveAPIView):
    queryset = (
        Band.objects
        .prefetch_related(
            "genres",
            "band_members__artist",
        )
    )
    serializer_class = BandSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class GenreListView(generics.ListAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

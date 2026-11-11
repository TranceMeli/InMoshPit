
from django.urls import path

from .views import (
    ArtistDetailView,
    ArtistListView,
    BandDetailView,
    BandListView,
    GenreListView,
)


urlpatterns = [
    path("artists/", ArtistListView.as_view(), name="artist-list"),
    path(
        "artists/<slug:slug>/",
        ArtistDetailView.as_view(),
        name="artist-detail",
    ),
    path("bands/", BandListView.as_view(), name="band-list"),
    path(
        "bands/<slug:slug>/",
        BandDetailView.as_view(),
        name="band-detail",
    ),
    path("genres/", GenreListView.as_view(), name="genre-list"),
]

from django.urls import path

from .views import VideoListView, VideoDetailView

urlpatterns = [
    path("videos/", VideoListView.as_view(), name="video-list"),
    path("videos/<slug:slug>/", VideoDetailView.as_view(), name="video-detail"),
]
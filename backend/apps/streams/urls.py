from django.urls import path

from .views import StreamDetailView, StreamListView

urlpatterns = [
    path("streams/", StreamListView.as_view(), name="stream-list"),
    path("streams/<slug:slug>/", StreamDetailView.as_view(), name="stream-detail"),
]


from django.urls import path

from .views import (
    FollowListCreateView,
    FollowDeleteView,
    VideoLikeView,
    CommentListCreateView,
    CommentDeleteView,
    VideoViewCreateView,
)


urlpatterns = [
    # Follows
    path(
        "community/follows/",
        FollowListCreateView.as_view(),
        name="follow-list-create",
    ),
    path(
        "community/follows/<int:pk>/",
        FollowDeleteView.as_view(),
        name="follow-delete",
    ),

    # Likes
    path(
        "videos/<slug:video_slug>/like/",
        VideoLikeView.as_view(),
        name="video-like",
    ),

    # Comments
    path(
        "videos/<slug:video_slug>/comments/",
        CommentListCreateView.as_view(),
        name="video-comments",
    ),
    path(
        "community/comments/<int:pk>/",
        CommentDeleteView.as_view(),
        name="comment-delete",
    ),

    # Video views
    path(
        "videos/<slug:video_slug>/views/",
        VideoViewCreateView.as_view(),
        name="video-view-create",
    ),
]

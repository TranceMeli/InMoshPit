
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import health_check


urlpatterns = [
    path("admin/", admin.site.urls),

    # Health
    path("api/v1/health/", health_check, name="health-check"),

    # Authentication
    path(
        "api/v1/accounts/",
        include("apps.accounts.urls"),
    ),
    path(
        "api/v1/accounts/token/",
        TokenObtainPairView.as_view(),
        name="token-obtain-pair",
    ),
    path(
        "api/v1/accounts/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
    path("api/v1/artists/", include("apps.artists.urls")),
    path("api/v1/events/", include("apps.events.urls")),


    path("api/v1/", include("apps.streams.urls")),
    path("api/v1/", include("apps.videos.urls")),

    path("api/v1/", include("apps.community.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

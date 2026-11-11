import pytest
from rest_framework import status

from apps.events.models import Event

from .conftest import EVENTS_URL


@pytest.mark.django_db
def test_event_detail_returns_nested_event_data(
    api_client,
    published_event,
    event_lineup,
):
    response = api_client.get(f"{EVENTS_URL}{published_event.slug}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["title"] == published_event.title
    assert response.data["venue"] == {
        "id": published_event.venue.id,
        "name": published_event.venue.name,
        "address": published_event.venue.address,
        "city": published_event.venue.city,
        "postal_code": published_event.venue.postal_code,
        "country": published_event.venue.country,
        "capacity": published_event.venue.capacity,
        "website": published_event.venue.website,
    }
    assert response.data["stages"] == [
        {
            "id": event_lineup["stage"].id,
            "name": event_lineup["stage"].name,
            "description": event_lineup["stage"].description,
        }
    ]

    lineup = response.data["lineup"]
    assert [item["position"] for item in lineup] == [1, 2]
    assert lineup[0]["artist"] == event_lineup["artist"].id
    assert lineup[0]["artist_name"] == event_lineup["artist"].name
    assert lineup[0]["artist_slug"] == event_lineup["artist"].slug
    assert lineup[0]["band"] is None
    assert lineup[0]["band_name"] is None
    assert lineup[0]["stage_name"] == event_lineup["stage"].name
    assert lineup[1]["band"] == event_lineup["band"].id
    assert lineup[1]["band_name"] == event_lineup["band"].name
    assert lineup[1]["band_slug"] == event_lineup["band"].slug
    assert lineup[1]["artist"] is None


@pytest.mark.django_db
def test_event_detail_returns_not_found_for_unknown_slug(api_client):
    response = api_client.get(f"{EVENTS_URL}unknown-event/")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
@pytest.mark.parametrize(
    "status_value",
    [Event.Status.DRAFT, Event.Status.CANCELLED],
)
def test_event_detail_hides_unpublished_events(
    api_client,
    venue,
    status_value,
):
    event = Event.objects.create(
        title=f"{status_value.title()} Event",
        slug=f"{status_value}-event",
        venue=venue,
        start_at="2027-07-10T18:00:00Z",
        status=status_value,
    )

    response = api_client.get(f"{EVENTS_URL}{event.slug}/")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_event_detail_does_not_require_authentication(
    api_client,
    published_event,
):
    response = api_client.get(f"{EVENTS_URL}{published_event.slug}/")

    assert response.status_code == status.HTTP_200_OK

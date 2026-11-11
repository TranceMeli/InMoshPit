import pytest
from rest_framework import status

from apps.events.models import Event

from .conftest import EVENTS_URL


@pytest.mark.django_db
def test_event_list_returns_only_published_events(
    api_client,
    published_event,
    festival_event,
    draft_event,
    cancelled_event,
):
    response = api_client.get(EVENTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert {item["slug"] for item in response.data} == {
        published_event.slug,
        festival_event.slug,
    }
    assert all(
        item["status"] == Event.Status.PUBLISHED
        for item in response.data
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("event_type", "expected_slug"),
    [
        (Event.EventType.CONCERT, "summer-rock-night"),
        (Event.EventType.FESTIVAL, "city-sounds-festival"),
    ],
)
def test_event_list_filters_by_event_type(
    api_client,
    published_event,
    festival_event,
    event_type,
    expected_slug,
):
    response = api_client.get(EVENTS_URL, {"event_type": event_type})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [expected_slug]


@pytest.mark.django_db
def test_event_list_ignores_unknown_event_type(
    api_client,
    published_event,
    festival_event,
):
    response = api_client.get(EVENTS_URL, {"event_type": "conference"})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2


@pytest.mark.django_db
@pytest.mark.parametrize(
    "search_term",
    [
        "Summer Rock",
        "outdoor rock",
        "MoshPit Arena",
        "Karlsruhe",
    ],
)
def test_event_list_searches_event_and_venue_fields(
    api_client,
    published_event,
    search_term,
):
    response = api_client.get(EVENTS_URL, {"search": search_term})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [
        published_event.slug
    ]


@pytest.mark.django_db
def test_event_list_default_ordering_is_by_start_time(
    api_client,
    published_event,
    festival_event,
):
    response = api_client.get(EVENTS_URL)

    assert [item["slug"] for item in response.data] == [
        published_event.slug,
        festival_event.slug,
    ]


@pytest.mark.django_db
def test_event_list_supports_allowed_ordering_fields(
    api_client,
    published_event,
    festival_event,
):
    response = api_client.get(EVENTS_URL, {"ordering": "-title"})

    assert response.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in response.data] == [
        published_event.slug,
        festival_event.slug,
    ]


@pytest.mark.django_db
def test_event_list_does_not_expose_detail_only_nested_data(
    api_client,
    published_event,
    event_lineup,
):
    response = api_client.get(EVENTS_URL)

    assert response.status_code == status.HTTP_200_OK
    event_data = response.data[0]
    assert event_data["venue"]["name"] == published_event.venue.name
    assert "stages" not in event_data
    assert "lineup" not in event_data


@pytest.mark.django_db
def test_event_list_includes_lineup_count(
    api_client,
    published_event,
    event_lineup,
):
    response = api_client.get(EVENTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["lineup_count"] == 2

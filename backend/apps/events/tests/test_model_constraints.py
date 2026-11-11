import pytest
from django.db import IntegrityError, transaction

from apps.events.models import EventArtist, Stage


@pytest.mark.django_db
def test_stage_name_must_be_unique_within_an_event(published_event):
    Stage.objects.create(event=published_event, name="Main Stage")

    with pytest.raises(IntegrityError), transaction.atomic():
        Stage.objects.create(event=published_event, name="Main Stage")


@pytest.mark.django_db
def test_event_artist_requires_exactly_one_artist_or_band(published_event):
    with pytest.raises(IntegrityError), transaction.atomic():
        EventArtist.objects.create(event=published_event)

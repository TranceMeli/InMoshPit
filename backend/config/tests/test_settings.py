import runpy
from pathlib import Path

import pytest
from django.core.exceptions import ImproperlyConfigured

SETTINGS_FILE = Path(__file__).resolve().parent.parent / "settings.py"

ENV_VARS = (
    "DJANGO_DEBUG",
    "DJANGO_SECRET_KEY",
    "DJANGO_ALLOWED_HOSTS",
    "DJANGO_CORS_ALLOWED_ORIGINS",
)


def load_settings(monkeypatch, **env):
    """Führt settings.py isoliert mit der angegebenen Umgebung aus."""
    for name in ENV_VARS:
        monkeypatch.delenv(name, raising=False)

    for name, value in env.items():
        monkeypatch.setenv(name, value)

    return runpy.run_path(str(SETTINGS_FILE))


def test_local_development_works_without_any_configuration(monkeypatch):
    settings = load_settings(monkeypatch)

    assert settings["DEBUG"] is True
    assert settings["SECRET_KEY"]
    assert settings["ALLOWED_HOSTS"] == []
    assert "http://localhost:5173" in settings["CORS_ALLOWED_ORIGINS"]


def test_secret_key_is_read_from_environment(monkeypatch):
    settings = load_settings(monkeypatch, DJANGO_SECRET_KEY="from-env")

    assert settings["SECRET_KEY"] == "from-env"


def test_missing_secret_key_is_an_error_when_debug_is_off(monkeypatch):
    with pytest.raises(ImproperlyConfigured):
        load_settings(monkeypatch, DJANGO_DEBUG="0")


@pytest.mark.parametrize("value", ["0", "false", "False", "no", "off"])
def test_debug_can_be_disabled(monkeypatch, value):
    settings = load_settings(
        monkeypatch, DJANGO_DEBUG=value, DJANGO_SECRET_KEY="k"
    )

    assert settings["DEBUG"] is False


def test_production_does_not_allow_dev_origins_by_default(monkeypatch):
    settings = load_settings(
        monkeypatch, DJANGO_DEBUG="0", DJANGO_SECRET_KEY="k"
    )

    assert settings["CORS_ALLOWED_ORIGINS"] == []
    assert settings["ALLOWED_HOSTS"] == []


def test_hosts_and_origins_are_parsed_from_comma_separated_lists(monkeypatch):
    settings = load_settings(
        monkeypatch,
        DJANGO_DEBUG="0",
        DJANGO_SECRET_KEY="k",
        DJANGO_ALLOWED_HOSTS="example.com, www.example.com ,",
        DJANGO_CORS_ALLOWED_ORIGINS="https://example.com",
    )

    assert settings["ALLOWED_HOSTS"] == ["example.com", "www.example.com"]
    assert settings["CORS_ALLOWED_ORIGINS"] == ["https://example.com"]


def test_no_hardcoded_secret_key_in_source():
    source = SETTINGS_FILE.read_text(encoding="utf-8")

    assert "django-insecure-" not in source

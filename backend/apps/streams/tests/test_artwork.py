from io import BytesIO

import pytest
from PIL import Image

from apps.streams.management.commands._artwork import (
    KINDS,
    PALETTES,
    _digest,
    cover_png,
    kind_for,
    make_cover,
)


@pytest.mark.parametrize("kind", KINDS)
def test_cover_has_requested_size(kind):
    assert make_cover(kind, "seed", 320, 180).size == (320, 180)
    assert make_cover(kind, "seed", 200, 200).size == (200, 200)


@pytest.mark.parametrize("kind", KINDS)
def test_cover_is_deterministic(kind):
    assert cover_png(kind, "iron-pit", 160, 90) == cover_png(kind, "iron-pit", 160, 90)


def test_different_seeds_give_different_covers():
    covers = {cover_png("rings", f"act-{i}", 160, 90) for i in range(12)}

    assert len(covers) > 6


def test_cover_png_is_a_valid_png():
    image = Image.open(BytesIO(cover_png("zig", "x", 320, 180)))

    assert image.format == "PNG"
    assert image.size == (320, 180)


def test_cover_only_uses_brand_colors():
    seed = "iron-pit"
    palette = PALETTES[_digest(seed)[1] % len(PALETTES)]
    allowed = [tuple(int(color[i : i + 2], 16) for i in (1, 3, 5)) for color in palette]
    image = make_cover("rings", seed, 320, 180)

    near = sum(
        1
        for pixel in image.get_flattened_data()
        if any(sum(abs(pixel[c] - color[c]) for c in range(3)) <= 12 for color in allowed)
    )

    # Nur die antialiasierten Kanten dürfen davon abweichen.
    assert near / (320 * 180) > 0.95


def test_unknown_kind_is_rejected():
    with pytest.raises(ValueError):
        make_cover("sparkles", "seed", 160, 90)


@pytest.mark.parametrize(
    "genre,kind",
    [("Metal", "rings"), ("punk", "zig"), (" Electro ", "bloom"), ("Synthwave", "sun"), ("Rock", "tri")],
)
def test_genres_map_to_fixed_shapes(genre, kind):
    assert kind_for(genre, "any-seed") == kind


def test_unknown_genre_gets_a_stable_shape():
    assert kind_for("Polka", "oompah") == kind_for("Polka", "oompah")
    assert kind_for("Polka", "oompah") in KINDS
    assert kind_for(None, "x") in KINDS


@pytest.mark.parametrize("kind", ["rings", "bloom", "tri"])
def test_main_shape_is_never_cropped_in_square_covers(kind):
    """Im quadratischen Ausschnitt bleibt der Rand frei von der Hauptform."""
    for i in range(60):
        seed = f"seed-{i}"
        background = PALETTES[_digest(seed)[1] % len(PALETTES)][0]
        bg = tuple(int(background[j : j + 2], 16) for j in (1, 3, 5))
        image = make_cover(kind, seed, 120, 120)
        w, h = image.size
        edge = (
            [image.getpixel((0, y)) for y in range(h)]
            + [image.getpixel((w - 1, y)) for y in range(h)]
            + [image.getpixel((x, 0)) for x in range(w)]
            + [image.getpixel((x, h - 1)) for x in range(w)]
        )

        assert all(sum(abs(p[c] - bg[c]) for c in range(3)) <= 12 for p in edge), seed


@pytest.mark.parametrize("kind", ["rings", "bloom", "tri"])
def test_main_shape_fits_the_four_by_three_format(kind):
    for i in range(40):
        seed = f"seed-{i}"
        background = PALETTES[_digest(seed)[1] % len(PALETTES)][0]
        bg = tuple(int(background[j : j + 2], 16) for j in (1, 3, 5))
        image = make_cover(kind, seed, 160, 120)
        w, h = image.size
        edge = (
            [image.getpixel((0, y)) for y in range(h)]
            + [image.getpixel((w - 1, y)) for y in range(h)]
            + [image.getpixel((x, 0)) for x in range(w)]
            + [image.getpixel((x, h - 1)) for x in range(w)]
        )

        assert all(sum(abs(p[c] - bg[c]) for c in range(3)) <= 12 for p in edge), seed

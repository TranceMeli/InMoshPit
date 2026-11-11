"""Generiert Cover-Grafiken für die Demo-Daten (ohne Fotos, ohne Lizenzfragen).

Die Bilder bestehen nur aus einfachen Formen in den Markenfarben. Form
("kind") und Farbkombination ergeben sich aus Genre und einem Seed, sodass
jedes Cover anders aussieht, aber bei jedem Lauf identisch bleibt.
"""
import hashlib
import math
from io import BytesIO

from PIL import Image, ImageDraw

# Konstruktionsraster (16:9). Alle Formen sind in diesen Einheiten gezeichnet
# und werden auf die Zielgröße skaliert.
GRID_W, GRID_H = 160, 90

# Markenfarben: Violett #450693, Electric #8C00FF, Pink #FF3F7F, Amber #FFC400.
# Jede Palette: (Hintergrund, Farbe A, Farbe B, Farbe C). Hintergrund und
# Farbe A unterscheiden sich in jeder Palette deutlich.
PALETTES = [
    ("#450693", "#8C00FF", "#FF3F7F", "#FFC400"),
    ("#FF3F7F", "#241640", "#450693", "#FFC400"),
    ("#FFC400", "#450693", "#FF3F7F", "#8C00FF"),
    ("#24103C", "#8C00FF", "#FFC400", "#FF3F7F"),
]

KINDS = ("rings", "zig", "sun", "bloom", "tri")

# Genre -> Form. Unbekannte Genres werden anhand des Seeds verteilt.
GENRE_KINDS = {
    "metal": "rings",
    "punk": "zig",
    "electro": "bloom",
    "synthwave": "sun",
    "rock": "tri",
    "folk": "bloom",
}

# Zeichenraster: 160 x 20 = 3200 px breit, danach verkleinert (Antialiasing).
PIXELS_PER_UNIT = 20


def _digest(seed):
    return hashlib.sha256(str(seed).encode("utf-8")).digest()


def kind_for(genre, seed):
    """Wählt die Form für ein Genre (stabil auch für unbekannte Genres)."""
    key = (genre or "").strip().lower()

    if key in GENRE_KINDS:
        return GENRE_KINDS[key]

    return KINDS[_digest(seed)[0] % len(KINDS)]


def _draw_grid(kind, seed):
    """Zeichnet das Motiv im 16:9-Raster und gibt ein Bild zurück."""
    d = _digest(seed)
    bg, a, b, c = PALETTES[d[1] % len(PALETTES)]

    # Leichte Variation der Position, damit gleiche Formen nicht identisch wirken.
    cx = 98 + (d[2] % 13)  # 98..110: keeps a margin to the edge in every crop
    cy = 42 + (d[3] % 9)  # 42..50
    shift = d[4] % 20  # Phase für Zickzack

    s = PIXELS_PER_UNIT
    img = Image.new("RGB", (GRID_W * s, GRID_H * s), bg)
    draw = ImageDraw.Draw(img)

    def circle(x, y, r, fill):
        draw.ellipse([(x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s], fill=fill)

    if kind == "rings":
        circle(cx, cy, 36, a)
        circle(cx, cy, 26, bg)
        circle(cx, cy, 16, b)
        circle(cx, cy, 5, c)

    elif kind == "zig":
        for base, color in ((50, a), (74, b)):
            pts = []
            for i in range(-1, 10):
                x = i * 20 - shift
                y = base - (18 if i % 2 else 0)
                pts.append((x * s, y * s))
            draw.line(pts, fill=color, width=int(5 * s), joint="curve")

    elif kind == "sun":
        circle(cx, 44, 26, c)
        for top, h in ((cy + 2, 3), (cy + 9, 4), (cy + 17, 5)):
            draw.rectangle([(cx - 30) * s, top * s, (cx + 30) * s, (top + h) * s], fill=bg)
        draw.rectangle([0, 70 * s, GRID_W * s, GRID_H * s], fill=a)

    elif kind == "bloom":
        # Blüte aus sechs Blättern um einen Mittelpunkt.
        mx, my = cx - 4, cy + 2
        for i in range(6):
            angle = math.radians(i * 60 + (d[5] % 60))
            circle(mx + 18 * math.cos(angle), my + 18 * math.sin(angle), 13, a)
        circle(mx, my, 13, b)
        circle(mx, my, 6, c)

    elif kind == "tri":
        def tri(x, y, w, h, fill):
            draw.polygon(
                [((x - w) * s, (y + h) * s), (x * s, (y - h) * s), ((x + w) * s, (y + h) * s)],
                fill=fill,
            )

        tri(cx, cy + 2, 36, 32, a)
        tri(cx, cy + 8, 22, 18, bg)
        circle(cx, cy - 22, 5, c)

    else:
        raise ValueError(f"Unbekannte Form: {kind}")

    return img


def make_cover(kind, seed, width, height):
    """Erzeugt ein Cover der Größe width x height.

    Für nicht-16:9-Formate (z. B. quadratisch) wird der mittlere, rechts
    betonte Ausschnitt des 16:9-Motivs genutzt, in dem die Hauptform liegt.
    """
    art = _draw_grid(kind, seed)
    full_w, full_h = art.size

    target_ratio = width / height
    art_ratio = full_w / full_h

    if abs(target_ratio - art_ratio) > 0.01:
        crop_w = round(full_h * target_ratio)
        # Ausschnitt um x = 104/160 (Mitte der möglichen Hauptform-Positionen).
        center = full_w * 104 / GRID_W
        left = max(0, min(full_w - crop_w, round(center - crop_w / 2)))
        art = art.crop((left, 0, left + crop_w, full_h))

    return art.resize((width, height), Image.LANCZOS)


def cover_png(kind, seed, width, height):
    """Cover als PNG-Bytes."""
    buffer = BytesIO()
    make_cover(kind, seed, width, height).save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()

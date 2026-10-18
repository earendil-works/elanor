"""Derives Elanor Sans from Source Sans 3: the same font with a shorter natural line height.

Source Sans 3 sets its vertical metrics (ascent 1024, descent 400 per 1000) for its tallest accents, which gives a
natural line height ("line-height: normal") of 1.424. Safari does not lay out a text input's line shorter than that,
so at 18px an Input became 25.6px of text plus padding, taller than a Button beside it with the 24px line of the
type tokens. ascent-override and descent-override would fix this in CSS, but Safari does not support them properly.

Elanor Sans sets ascent 937 and descent 313 (natural line height 1.25, below every type token's line height). Their
difference stays 624, as in Source Sans 3: with an explicit line height the baseline sits at half the line height
plus half that difference, so text sits exactly where it did. Every Latin glyph up to U+024F fits (top 926, bottom
-250). Nothing else changes: outlines, spacing, kerning, features and the weight axis (200 to 900) are Source Sans 3.

The SIL Open Font License reserves the name "Source" for Adobe's own versions, so the modified font is renamed.

Usage: python3 scripts/elanor-sans.py <ofl/sourcesans3 directory of github.com/google/fonts>
Needs fontTools and brotli (pip install fonttools brotli). Writes files/ElanorSans-*.woff2.
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ASCENT = 937
DESCENT = -313
SOURCES = {
    "SourceSans3[wght].ttf": "ElanorSans-Variable.woff2",
    "SourceSans3-Italic[wght].ttf": "ElanorSans-Italic-Variable.woff2",
}
RENAMES = (("Source Sans 3", "Elanor Sans"), ("SourceSans3", "ElanorSans"))
# Family, full name, unique ID, PostScript name, typographic family, variations PostScript prefix. The copyright
# (0) and trademark (7) notices stay as Adobe wrote them.
RENAMED_IDS = {1, 3, 4, 6, 16, 25}


def derive(source: Path, target: Path) -> None:
    font = TTFont(source)
    os2, hhea = font["OS/2"], font["hhea"]
    # Ascent plus (negative) descent fixes the baseline; a source with another one would move text.
    if os2.sTypoAscender + os2.sTypoDescender != ASCENT + DESCENT:
        sys.exit(f"{source.name}: unexpected vertical metrics {os2.sTypoAscender}/{os2.sTypoDescender}")
    hhea.ascent, hhea.descent, hhea.lineGap = ASCENT, DESCENT, 0
    os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap = ASCENT, DESCENT, 0
    for record in font["name"].names:
        if record.nameID in RENAMED_IDS:
            text = record.toUnicode()
            for old, new in RENAMES:
                text = text.replace(old, new)
            record.string = text
    font.flavor = "woff2"
    font.save(target)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = Path(sys.argv[1])
    files = Path(__file__).resolve().parent.parent / "files"
    for name, output in SOURCES.items():
        derive(source / name, files / output)
        print(f"Wrote files/{output}")


if __name__ == "__main__":
    main()

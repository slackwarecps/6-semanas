"""
Anki package generator: exports cards to .apkg format (Anki deck).

Generates collection.anki2 (SQLite database) in Anki's legacy schema (ver=11)
and packages it as .apkg (ZIP file) for safe import into Anki (doesn't delete existing data).

The .apkg format is deck-based and safe to import multiple times without data loss.
"""

import json
import sqlite3
import tempfile
import zipfile
import shutil
import os
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass
import hashlib
import html


@dataclass
class Card:
    """Card data structure for export."""
    title: str
    question: str
    answer: str
    tags: Optional[List[str]] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []


def _html_escape(s: str) -> str:
    """Escape HTML special characters."""
    return html.escape(s)


def _to_field(s: str) -> str:
    """Format field for Anki: escape HTML and convert newlines to <br>."""
    if not s:
        return ""
    return _html_escape(s).replace("\n", "<br>")


def _csum_of(sfld: str) -> int:
    """Calculate checksum of field (first 8 chars of SHA1 as hex)."""
    hash_obj = hashlib.sha1(sfld.encode("utf-8"))
    return int(hash_obj.hexdigest()[:8], 16)


def _slugify_filename(name: str) -> str:
    """Convert jornada name to filename-safe slug."""
    # Replace invalid filename characters with hyphen
    invalid_chars = r'/<>:*?"|'
    slug = name.lower()
    for char in invalid_chars:
        slug = slug.replace(char, "-")
    # Replace spaces with hyphens
    slug = slug.replace(" ", "-")
    # Remove multiple consecutive hyphens
    while "--" in slug:
        slug = slug.replace("--", "-")
    # Truncate to 100 chars to avoid filesystem limits
    slug = slug[:100].rstrip("-")
    return slug


def _clean_tags(tags_json: Optional[str]) -> List[str]:
    """Parse tags from JSON, clean up legacy prefixes."""
    if not tags_json:
        return []
    try:
        raw = json.loads(tags_json) if tags_json else []
    except (json.JSONDecodeError, TypeError):
        return []

    # Remove legacy "Tags:" prefix and filter empty
    cleaned = [
        str(t).replace("Tags:", "").strip()
        for t in raw
        if str(t).replace("Tags:", "").strip()
    ]
    return cleaned


def generate_anki_package(
    cards: List[Card],
    output_path: str,
    jornada_name: Optional[str] = None,
) -> str:
    """
    Generate Anki .apkg package from cards.

    Args:
        cards: List of Card objects
        output_path: Destination path for .apkg file (or directory)
        jornada_name: Name of jornada for filename (auto-generated if None)

    Returns:
        Absolute path to generated .apkg file

    Raises:
        ValueError: If no cards provided
        IOError: If file generation fails
    """
    if not cards:
        raise ValueError("No cards provided for export")

    # Handle output path: if directory, generate filename
    output_path_obj = Path(output_path)
    if output_path_obj.is_dir() or output_path.endswith("/"):
        output_dir = output_path_obj
        filename = _get_filename(jornada_name)
        full_path = output_dir / filename
    else:
        full_path = output_path_obj
        output_dir = full_path.parent
        output_dir.mkdir(parents=True, exist_ok=True)

    # Anki database schema (v11 - legacy)
    now_ms = int(datetime.now().timestamp() * 1000)
    now_sec = now_ms // 1000
    model_id = now_ms - 3
    deck_id = now_ms  # Use unique deck ID for .apkg safety (not 1, which is default)

    # Anki model definition (template + fields)
    model = {
        str(model_id): {
            "id": str(model_id),
            "name": "Basico (Flashcards App)",
            "type": 0,
            "mod": now_sec,
            "usn": -1,
            "sortf": 0,
            "did": deck_id,
            "tmpls": [
                {
                    "name": "Card 1",
                    "ord": 0,
                    "qfmt": "{{Front}}",
                    "afmt": "{{FrontSide}}<hr id=\"answer\">{{Back}}",
                    "bqfmt": "",
                    "bafmt": "",
                    "did": None,
                    "bfont": "",
                    "bsize": 0,
                }
            ],
            "flds": [
                {
                    "name": "Front",
                    "ord": 0,
                    "sticky": False,
                    "rtl": False,
                    "font": "Arial",
                    "size": 20,
                    "media": [],
                },
                {
                    "name": "Back",
                    "ord": 1,
                    "sticky": False,
                    "rtl": False,
                    "font": "Arial",
                    "size": 20,
                    "media": [],
                },
            ],
            "css": ".card { font-family: arial; font-size: 20px; text-align: left; color: black; background-color: white; }",
            "latexPre": (
                "\\documentclass[12pt]{article}\n"
                "\\special{papersize=3in,5in}\n"
                "\\usepackage[utf8]{inputenc}\n"
                "\\usepackage{amssymb,amsmath}\n"
                "\\pagestyle{empty}\n"
                "\\setlength{\\parindent}{0in}\n"
                "\\begin{document}\n"
            ),
            "latexPost": "\\end{document}",
            "latexsvg": False,
            "req": [[0, "all", [0]]],
            "tags": [],
            "vers": [],
        }
    }

    deck_name = jornada_name if jornada_name else "Jornada"

    decks = {
        str(deck_id): {
            "id": deck_id,
            "name": deck_name,
            "mod": now_sec,
            "usn": -1,
            "lrnToday": [0, 0],
            "revToday": [0, 0],
            "newToday": [0, 0],
            "timeToday": [0, 0],
            "collapsed": False,
            "desc": "",
            "dyn": 0,
            "conf": 1,
            "extendNew": 0,
            "extendRev": 0,
        }
    }

    dconf = {
        "1": {
            "id": 1,
            "name": "Default",
            "mod": 0,
            "usn": 0,
            "maxTaken": 60,
            "autoplay": True,
            "timer": 0,
            "replayq": True,
            "new": {
                "bury": True,
                "delays": [1, 10],
                "initialFactor": 2500,
                "ints": [1, 4, 7],
                "order": 1,
                "perDay": 20,
                "separate": True,
            },
            "rev": {
                "bury": True,
                "ease4": 1.3,
                "fuzz": 0.05,
                "ivlFct": 1,
                "maxIvl": 36500,
                "minSpace": 1,
                "perDay": 200,
            },
            "lapse": {
                "delays": [10],
                "leechAction": 0,
                "leechFails": 8,
                "minInt": 1,
                "mult": 0,
            },
            "dyn": False,
        }
    }

    conf = {
        "nextPos": 1,
        "estTimes": True,
        "activeDecks": [deck_id],
        "sortType": "noteFld",
        "timeLim": 0,
        "sortBackwards": False,
        "addToCur": True,
        "curDeck": deck_id,
        "newBury": True,
        "newSpread": 0,
        "dueCounts": True,
        "curModel": str(model_id),
        "collapseTime": 1200,
    }

    # Create temporary directory for building archive
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "collection.anki2"

        # Create and populate the collection database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Create schema
        cursor.executescript(
            """
            CREATE TABLE col (
                id INTEGER PRIMARY KEY, crt INTEGER NOT NULL, mod INTEGER NOT NULL,
                scm INTEGER NOT NULL, ver INTEGER NOT NULL, dty INTEGER NOT NULL,
                usn INTEGER NOT NULL, ls INTEGER NOT NULL, conf TEXT NOT NULL,
                models TEXT NOT NULL, decks TEXT NOT NULL, dconf TEXT NOT NULL,
                tags TEXT NOT NULL
            );
            CREATE TABLE notes (
                id INTEGER PRIMARY KEY, guid TEXT NOT NULL, mid INTEGER NOT NULL,
                mod INTEGER NOT NULL, usn INTEGER NOT NULL, tags TEXT NOT NULL,
                flds TEXT NOT NULL, sfld INTEGER NOT NULL, csum INTEGER NOT NULL,
                flags INTEGER NOT NULL, data TEXT NOT NULL
            );
            CREATE TABLE cards (
                id INTEGER PRIMARY KEY, nid INTEGER NOT NULL, did INTEGER NOT NULL,
                ord INTEGER NOT NULL, mod INTEGER NOT NULL, usn INTEGER NOT NULL,
                type INTEGER NOT NULL, queue INTEGER NOT NULL, due INTEGER NOT NULL,
                ivl INTEGER NOT NULL, factor INTEGER NOT NULL, reps INTEGER NOT NULL,
                lapses INTEGER NOT NULL, left INTEGER NOT NULL, odue INTEGER NOT NULL,
                odid INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL
            );
            CREATE TABLE revlog (
                id INTEGER PRIMARY KEY, cid INTEGER NOT NULL, usn INTEGER NOT NULL,
                ease INTEGER NOT NULL, ivl INTEGER NOT NULL, lastIvl INTEGER NOT NULL,
                factor INTEGER NOT NULL, time INTEGER NOT NULL, type INTEGER NOT NULL
            );
            CREATE TABLE graves (
                usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL
            );
            CREATE INDEX ix_notes_usn ON notes (usn);
            CREATE INDEX ix_cards_usn ON cards (usn);
            CREATE INDEX ix_revlog_usn ON revlog (usn);
            CREATE INDEX ix_cards_nid ON cards (nid);
            CREATE INDEX ix_cards_sched ON cards (did, queue, due);
            CREATE INDEX ix_revlog_cid ON revlog (cid);
            CREATE INDEX ix_notes_mid ON notes (mid);
            """
        )

        # Insert collection metadata
        cursor.execute(
            "INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                1,
                now_sec,
                now_ms,
                now_ms,
                11,  # Anki legacy schema v11
                0,
                0,
                0,
                json.dumps(conf),
                json.dumps(model),
                json.dumps(decks),
                json.dumps(dconf),
                "{}",  # Must be JSON object, NOT empty string
            ),
        )

        # Insert cards as notes
        note_id = now_ms
        card_id = now_ms + 100
        for card in cards:
            note_id += 1
            card_id += 1

            # Build front and back
            front = f"<b>{_to_field(card.title)}</b><br><br>{_to_field(card.question)}"
            back = _to_field(card.answer)

            # Fields are separated by 0x1F (unit separator)
            flds = f"{front}\x1f{back}"

            # Tags as space-separated Anki format
            tags_field = (
                f" {' '.join(_clean_tags(json.dumps(card.tags)) if isinstance(card.tags, list) else card.tags)} "
                if card.tags
                else ""
            )

            # GUID for uniqueness
            import base64
            import secrets
            guid = base64.b64encode(secrets.token_bytes(8)).decode("ascii").rstrip("=")[:10]

            cursor.execute(
                "INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (note_id, guid, model_id, now_sec, -1, tags_field, flds, front, _csum_of(front), 0, ""),
            )

            cursor.execute(
                "INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (card_id, note_id, deck_id, 0, now_sec, -1, 0, 0, card_id - now_ms, 0, 0, 0, 0, 0, 0, 0, 0, "{}"),
            )

        conn.commit()
        conn.close()

        # Create media file (empty)
        media_path = Path(tmpdir) / "media"
        with open(media_path, "w") as f:
            json.dump({}, f)

        # Create ZIP archive
        with zipfile.ZipFile(str(full_path), "w", zipfile.ZIP_DEFLATED) as zf:
            zf.write(str(db_path), "collection.anki2")
            zf.write(str(media_path), "media")

    return str(full_path)


def _get_filename(jornada_name: Optional[str] = None) -> str:
    """Generate filename for export."""
    today = datetime.now().strftime("%Y-%m-%d")
    if jornada_name:
        slug = _slugify_filename(jornada_name)
        return f"jornada-{slug}-{today}.apkg"
    else:
        return f"jornada-export-{today}.apkg"

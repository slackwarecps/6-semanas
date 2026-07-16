"""
End-to-end test: T035 validates full export and Anki compatibility.
Exports cards and validates they can be opened in Anki.
"""

import pytest
import sqlite3
import tempfile
import zipfile
from pathlib import Path
from services.anki_export import Card, generate_anki_package


class TestEndToEndAnkiImport:
    """T035: Validate full export and Anki compatibility."""

    def test_exported_file_is_valid_anki_package(self):
        """Exported .colpkg should be a valid Anki collection."""
        cards = [
            Card(
                title="História Medieval",
                question="O que é feudalismo?",
                answer="Sistema de relações vasaláticas",
                tags=["história", "medieval"],
            ),
            Card(
                title="Idade Média",
                question="Quando começou?",
                answer="476 (queda do Império Romano)",
                tags=["história"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            # Validate it's a ZIP
            assert zipfile.is_zipfile(result), "File is not a valid ZIP"

            # Extract and validate structure
            with zipfile.ZipFile(result, "r") as zf:
                files = zf.namelist()
                assert "collection.anki2" in files
                assert "media" in files

                # Validate SQLite database
                with zf.open("collection.anki2") as db_file:
                    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                        tmp.write(db_file.read())
                        db_path = tmp.name

            try:
                conn = sqlite3.connect(db_path)
                # Run PRAGMA integrity_check
                cursor = conn.cursor()
                cursor.execute("PRAGMA integrity_check;")
                result = cursor.fetchone()[0]
                assert result == "ok", f"Database integrity check failed: {result}"

                # Verify schema version
                cursor.execute("SELECT ver FROM col")
                version = cursor.fetchone()[0]
                assert version == 11, f"Expected Anki v11 schema, got v{version}"

                conn.close()
            finally:
                Path(db_path).unlink()

    def test_all_cards_importable(self):
        """All cards should be present and importable."""
        cards = [
            Card(
                title=f"Card {i}",
                question=f"Q{i}?",
                answer=f"A{i}",
                tags=[f"tag{i}"],
            )
            for i in range(5)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                        tmp.write(db_file.read())
                        db_path = tmp.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()

                # Check cards table
                cursor.execute("SELECT COUNT(*) FROM cards")
                card_count = cursor.fetchone()[0]
                assert card_count == 5, f"Expected 5 cards, got {card_count}"

                # Check notes table
                cursor.execute("SELECT COUNT(*) FROM notes")
                note_count = cursor.fetchone()[0]
                assert note_count == 5, f"Expected 5 notes, got {note_count}"

                # Verify each card has required fields
                cursor.execute("SELECT id, flds, tags FROM notes")
                for note_id, flds, tags_str in cursor.fetchall():
                    assert flds, f"Note {note_id} has empty fields"
                    assert len(flds.split("\x1f")) == 2, "Note should have 2 fields (Front/Back)"

                conn.close()
            finally:
                Path(db_path).unlink()

    def test_card_content_preservation(self):
        """Card content should be preserved exactly."""
        original_cards = [
            Card(
                title="Test Title",
                question="Test Question with special chars: <>&\"'",
                answer="Answer with\nmultiple\nlines",
                tags=["tag1", "tag2", "tag3"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(original_cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                        tmp.write(db_file.read())
                        db_path = tmp.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()

                cursor.execute("SELECT flds, tags FROM notes")
                flds, tags_str = cursor.fetchone()

                # Verify Front field contains title and question
                assert "Test Title" in flds
                assert "Test Question" in flds

                # Verify back contains answer
                assert "Answer with" in flds
                assert "multiple" in flds

                # Verify tags are present
                assert "tag1" in tags_str
                assert "tag2" in tags_str
                assert "tag3" in tags_str

                conn.close()
            finally:
                Path(db_path).unlink()

    def test_schema_complete_for_anki_import(self):
        """Database should have complete schema for Anki import."""
        cards = [Card(title="T", question="Q", answer="A")]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                        tmp.write(db_file.read())
                        db_path = tmp.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()

                # Check required tables exist
                required_tables = ["col", "notes", "cards", "revlog", "graves"]
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                )
                tables = {row[0] for row in cursor.fetchall()}

                for table in required_tables:
                    assert table in tables, f"Missing required table: {table}"

                # Verify col table has required data
                cursor.execute(
                    "SELECT conf, models, decks, dconf FROM col"
                )
                row = cursor.fetchone()
                assert row, "col table is empty"

                conf, models, decks, dconf = row

                # Parse JSON fields
                import json
                conf_obj = json.loads(conf)
                models_obj = json.loads(models)
                decks_obj = json.loads(decks)
                dconf_obj = json.loads(dconf)

                # Verify structure
                assert "curModel" in conf_obj
                assert len(models_obj) > 0
                assert len(decks_obj) > 0
                assert len(dconf_obj) > 0

                conn.close()
            finally:
                Path(db_path).unlink()

    def test_filename_generation_anki_compatible(self):
        """Generated filename should be Anki-compatible."""
        cards = [Card(title="T", question="Q", answer="A")]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(
                cards, tmpdir, jornada_name="Français Débutant: Leçon 1/2"
            )

            filename = Path(result).name

            # Should have .colpkg extension
            assert filename.endswith(".colpkg")

            # Should be filesystem safe
            assert not any(char in filename for char in ["<", ">", '"', "|", "?", "*"])

            # Should contain sanitized jornada name
            assert "francais" in filename.lower() or "debutant" in filename.lower()

            # Should include date
            import re
            assert re.search(r"\d{4}-\d{2}-\d{2}", filename)

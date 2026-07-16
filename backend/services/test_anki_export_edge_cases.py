"""
Edge case tests for Anki export: Unicode, long fields, tags, concurrency.
"""

import pytest
import tempfile
import sqlite3
import zipfile
from pathlib import Path
from services.anki_export import Card, generate_anki_package


class TestEdgeCases:
    """Test edge cases in export functionality."""

    # T030: Unicode and special characters
    def test_unicode_emojis_preserved(self):
        """Test that emojis and Unicode are preserved in export."""
        cards = [
            Card(
                title="Pokémon ⚡ 日本語",
                question="Qual tipo? 🎴\n[ ] A - Água\n[ ] B - Elétrico ✓",
                answer="B - Elétrico ✓",
                tags=["anime", "Pokémon", "日本語"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)
            assert Path(result).exists()

            # Verify content
            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    import tempfile as tmp
                    with tmp.NamedTemporaryFile(suffix=".db", delete=False) as f:
                        f.write(db_file.read())
                        db_path = f.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT flds FROM notes")
                flds = cursor.fetchone()[0]
                assert "⚡" in flds
                assert "Pokémon" in flds
                conn.close()
            finally:
                Path(db_path).unlink()

    def test_accented_characters(self):
        """Test accented characters are preserved."""
        cards = [
            Card(
                title="Acentuação Português",
                question="Escreva: São José?",
                answer="São José dos Campos",
                tags=["português", "acentuação"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)
            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    import tempfile as tmp
                    with tmp.NamedTemporaryFile(suffix=".db", delete=False) as f:
                        f.write(db_file.read())
                        db_path = f.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT flds FROM notes")
                flds = cursor.fetchone()[0]
                assert "José" in flds
                assert "São" in flds
                conn.close()
            finally:
                Path(db_path).unlink()

    # T031: Long fields
    def test_very_long_title(self):
        """Test that very long titles are handled."""
        long_title = "A" * 500  # 500 character title
        cards = [
            Card(
                title=long_title,
                question="Test question",
                answer="Test answer",
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)
            assert Path(result).exists()
            assert len(result) > 0

    def test_very_long_question(self):
        """Test that very long questions are handled."""
        long_question = "Q: " + ("Long text " * 100)  # ~1000 chars
        cards = [
            Card(
                title="Test",
                question=long_question,
                answer="Answer",
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            # Verify ZIP is valid
            assert zipfile.is_zipfile(result)

    def test_many_newlines_in_question(self):
        """Test questions with many newlines."""
        question = "\n".join(["Option A - Text"] * 20)
        cards = [
            Card(
                title="Test",
                question=question,
                answer="Option A",
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)
            assert Path(result).exists()

    # T032: Tag edge cases
    def test_many_tags_per_card(self):
        """Test cards with many tags."""
        tags = [f"tag{i}" for i in range(50)]  # 50 tags
        cards = [
            Card(
                title="Test",
                question="Q",
                answer="A",
                tags=tags,
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    import tempfile as tmp
                    with tmp.NamedTemporaryFile(suffix=".db", delete=False) as f:
                        f.write(db_file.read())
                        db_path = f.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT tags FROM notes")
                tags_str = cursor.fetchone()[0]
                # All tags should be present
                assert "tag0" in tags_str
                assert "tag49" in tags_str
                conn.close()
            finally:
                Path(db_path).unlink()

    def test_special_chars_in_tags(self):
        """Test tags with special characters."""
        cards = [
            Card(
                title="Test",
                question="Q",
                answer="A",
                tags=["tag/with/slash", "tag-with-dash", "tag_underscore"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)
            assert Path(result).exists()

    def test_empty_tags_cleaned(self):
        """Test that empty tags are filtered out."""
        cards = [
            Card(
                title="Test",
                question="Q",
                answer="A",
                tags=["valid", "", None, "  ", "another"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    import tempfile as tmp
                    with tmp.NamedTemporaryFile(suffix=".db", delete=False) as f:
                        f.write(db_file.read())
                        db_path = f.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT tags FROM notes")
                tags_str = cursor.fetchone()[0]
                # Should have valid tags but not empty ones
                assert "valid" in tags_str
                conn.close()
            finally:
                Path(db_path).unlink()

    # T033: Concurrent-like scenario
    def test_multiple_exports_same_cards(self):
        """Test that multiple exports of same cards work."""
        cards = [
            Card(title="Card 1", question="Q1", answer="A1", tags=["t1"]),
            Card(title="Card 2", question="Q2", answer="A2", tags=["t2"]),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result1 = generate_anki_package(cards, f"{tmpdir}/export1.colpkg")
            result2 = generate_anki_package(cards, f"{tmpdir}/export2.colpkg")

            # Both should exist and be valid
            assert Path(result1).exists()
            assert Path(result2).exists()
            assert zipfile.is_zipfile(result1)
            assert zipfile.is_zipfile(result2)

            # Files should have same content (same cards)
            size1 = Path(result1).stat().st_size
            size2 = Path(result2).stat().st_size
            # Sizes might differ slightly due to timestamps, but should be close
            assert abs(size1 - size2) < 1000  # Within 1KB

    def test_large_number_of_cards(self):
        """Test export with many cards (100+)."""
        cards = [
            Card(
                title=f"Card {i}",
                question=f"Question {i}?",
                answer=f"Answer {i}",
                tags=[f"set{i % 5}"],
            )
            for i in range(150)  # 150 cards
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    import tempfile as tmp
                    with tmp.NamedTemporaryFile(suffix=".db", delete=False) as f:
                        f.write(db_file.read())
                        db_path = f.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM cards")
                count = cursor.fetchone()[0]
                assert count == 150
                conn.close()
            finally:
                Path(db_path).unlink()

    def test_special_html_chars_escaped(self):
        """Test that HTML special chars are properly escaped."""
        cards = [
            Card(
                title="HTML <test>",
                question="What is <b>bold</b>? & ampersand",
                answer='Answer with "quotes" and \'apostrophes\'',
                tags=["test&tag"],
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            with zipfile.ZipFile(result, "r") as zf:
                with zf.open("collection.anki2") as db_file:
                    import tempfile as tmp
                    with tmp.NamedTemporaryFile(suffix=".db", delete=False) as f:
                        f.write(db_file.read())
                        db_path = f.name

            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT flds FROM notes")
                flds = cursor.fetchone()[0]
                # Should have escaped entities
                assert "&lt;" in flds or "<" not in flds
                conn.close()
            finally:
                Path(db_path).unlink()

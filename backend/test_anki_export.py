"""
Unit tests for Anki package generation (backend/services/anki_export.py).
Tests card → Anki format transformation.
"""

import pytest
from services.anki_export import (
    Card,
    _html_escape,
    _to_field,
    _csum_of,
    _slugify_filename,
    _clean_tags,
    generate_anki_package,
)
import zipfile
import sqlite3
import json
from pathlib import Path


class TestCardToAnkiTransformation:
    """Test individual card field transformations."""

    def test_html_escape(self):
        """Test HTML escaping for special characters."""
        assert _html_escape("<div>") == "&lt;div&gt;"
        assert _html_escape("A & B") == "A &amp; B"
        assert _html_escape('Quote "test"') == 'Quote &quot;test&quot;'

    def test_to_field_with_newlines(self):
        """Test conversion of newlines to <br> tags."""
        text = "Line 1\nLine 2\nLine 3"
        expected = "Line 1<br>Line 2<br>Line 3"
        assert _to_field(text) == expected

    def test_to_field_with_html_escaping(self):
        """Test that content is HTML-escaped."""
        text = "<script>alert('xss')</script>"
        result = _to_field(text)
        assert "&lt;script&gt;" in result
        assert "<script>" not in result

    def test_csum_of(self):
        """Test checksum calculation."""
        # Checksum should be deterministic
        text = "Test content"
        csum1 = _csum_of(text)
        csum2 = _csum_of(text)
        assert csum1 == csum2
        assert isinstance(csum1, int)

    def test_slugify_filename(self):
        """Test filename slug generation."""
        assert _slugify_filename("História Medieval") == "historia-medieval"
        assert _slugify_filename("Math 101: Basic Algebra") == "math-101-basic-algebra"
        assert _slugify_filename("C++/Rust Comparison") == "crust-comparison"
        assert "jornada-" not in _slugify_filename("Test Jornada")  # No "jornada-" prefix in slug

    def test_slugify_handles_unicode(self):
        """Test that Unicode characters are handled."""
        result = _slugify_filename("Português - Acentuação")
        assert isinstance(result, str)
        # Should not contain invalid filename characters
        assert "<" not in result
        assert ">" not in result
        assert "*" not in result

    def test_clean_tags_from_json(self):
        """Test tag parsing from JSON array."""
        tags = _clean_tags('["história", "medieval", "europa"]')
        assert tags == ["história", "medieval", "europa"]

    def test_clean_tags_removes_legacy_prefix(self):
        """Test removal of 'Tags:' legacy prefix."""
        tags = _clean_tags('["Tags:história", "medieval"]')
        assert tags == ["história", "medieval"]

    def test_clean_tags_empty_input(self):
        """Test handling of empty/null tags."""
        assert _clean_tags(None) == []
        assert _clean_tags("") == []
        assert _clean_tags("[]") == []

    def test_clean_tags_invalid_json(self):
        """Test handling of invalid JSON."""
        tags = _clean_tags("not valid json")
        assert tags == []


class TestAnkiPackageGeneration:
    """Test full .colpkg file generation."""

    @pytest.fixture
    def sample_cards(self):
        """Create sample cards for testing."""
        return [
            Card(
                title="Feudalismo",
                question="O que é feudalismo?",
                answer="Sistema de relações vasaláticas",
                tags=["história", "medieval"],
            ),
            Card(
                title="Idade Média",
                question="Quando começou?",
                answer="476",
                tags=["história"],
            ),
        ]

    @pytest.fixture
    def temp_export_path(self, tmp_path):
        """Create temporary path for export."""
        return str(tmp_path / "test.colpkg")

    def test_generate_anki_package_creates_file(self, sample_cards, temp_export_path):
        """Test that .colpkg file is created."""
        result = generate_anki_package(sample_cards, temp_export_path)
        assert Path(result).exists()
        assert result.endswith(".colpkg")

    def test_generate_anki_package_is_valid_zip(self, sample_cards, temp_export_path):
        """Test that generated file is a valid ZIP."""
        result = generate_anki_package(sample_cards, temp_export_path)
        with zipfile.ZipFile(result, "r") as zf:
            namelist = zf.namelist()
            assert "collection.anki2" in namelist
            assert "media" in namelist

    def test_generate_anki_package_contains_valid_db(self, sample_cards, temp_export_path):
        """Test that collection.anki2 is valid SQLite."""
        result = generate_anki_package(sample_cards, temp_export_path)
        with zipfile.ZipFile(result, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                # Extract to temp and open with sqlite3
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path = tmp.name

        try:
            conn = sqlite3.connect(tmp_path)
            cursor = conn.cursor()
            # Verify schema exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = {row[0] for row in cursor.fetchall()}
            assert "col" in tables
            assert "notes" in tables
            assert "cards" in tables
            conn.close()
        finally:
            Path(tmp_path).unlink()

    def test_generate_anki_package_all_cards_present(self, sample_cards, temp_export_path):
        """Test that all cards are included in export."""
        result = generate_anki_package(sample_cards, temp_export_path, "Test Jornada")

        with zipfile.ZipFile(result, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path = tmp.name

        try:
            conn = sqlite3.connect(tmp_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM cards")
            count = cursor.fetchone()[0]
            assert count == len(sample_cards)

            cursor.execute("SELECT COUNT(*) FROM notes")
            note_count = cursor.fetchone()[0]
            assert note_count == len(sample_cards)
            conn.close()
        finally:
            Path(tmp_path).unlink()

    def test_generate_with_no_cards_raises_error(self, temp_export_path):
        """Test that empty card list raises error."""
        with pytest.raises(ValueError, match="No cards provided"):
            generate_anki_package([], temp_export_path)

    def test_filename_generation_with_jornada_name(self, sample_cards, tmp_path):
        """Test that jornada name is used in filename."""
        result = generate_anki_package(
            sample_cards,
            str(tmp_path),
            jornada_name="História Medieval",
        )
        assert "historia-medieval" in result

    def test_filename_generation_without_jornada_name(self, sample_cards, tmp_path):
        """Test filename generation without jornada name."""
        result = generate_anki_package(sample_cards, str(tmp_path))
        assert "jornada-export" in result
        assert result.endswith(".colpkg")

    def test_unicode_content_preserved(self, tmp_path):
        """Test that Unicode characters are preserved in export."""
        cards = [
            Card(
                title="Pokémon ⚡",
                question="Qual é o tipo do Pikachu?",
                answer="Elétrico ✓",
                tags=["anime", "Pokémon"],
            ),
        ]
        result = generate_anki_package(cards, str(tmp_path))

        with zipfile.ZipFile(result, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path_str = tmp.name

        try:
            conn = sqlite3.connect(tmp_path_str)
            cursor = conn.cursor()
            cursor.execute("SELECT flds FROM notes LIMIT 1")
            flds = cursor.fetchone()[0]
            assert "Pokémon" in flds
            assert "⚡" in flds
            conn.close()
        finally:
            Path(tmp_path_str).unlink()

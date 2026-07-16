"""
Performance tests for export: T034 validates that export completes in < 5 seconds.
"""

import pytest
import time
import tempfile
from services.anki_export import Card, generate_anki_package


class TestPerformance:
    """T034: Validate export performance."""

    @pytest.mark.performance
    def test_export_50_cards_under_5_seconds(self):
        """50 cards should export in < 5 seconds."""
        cards = [
            Card(
                title=f"Card {i}",
                question=f"Question {i}?",
                answer=f"Answer {i}",
                tags=["perf", f"batch{i % 5}"],
            )
            for i in range(50)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            start = time.time()
            result = generate_anki_package(cards, tmpdir)
            elapsed = time.time() - start

            print(f"50 cards exported in {elapsed:.2f}s")
            assert elapsed < 5.0, f"Export took {elapsed:.2f}s, expected < 5s"
            assert len(result) > 0

    @pytest.mark.performance
    def test_export_200_cards_under_5_seconds(self):
        """200 cards should export in < 5 seconds."""
        cards = [
            Card(
                title=f"Card {i}",
                question=f"Question {i}?" + " Additional content " * 10,
                answer=f"Answer {i}" + " with more text " * 5,
                tags=[f"tag{i % 10}"],
            )
            for i in range(200)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            start = time.time()
            result = generate_anki_package(cards, tmpdir)
            elapsed = time.time() - start

            print(f"200 cards exported in {elapsed:.2f}s")
            assert elapsed < 5.0, f"Export took {elapsed:.2f}s, expected < 5s"

    @pytest.mark.performance
    def test_file_size_reasonable(self):
        """File size should be reasonable (< 10MB for 200 cards)."""
        cards = [
            Card(
                title=f"Card {i}",
                question=f"Question {i}?" + " Extra content " * 20,
                answer=f"Answer {i}" + " With more text " * 10,
                tags=[f"tag{i % 5}"],
            )
            for i in range(200)
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            result = generate_anki_package(cards, tmpdir)

            import os
            file_size = os.path.getsize(result)
            file_size_mb = file_size / (1024 * 1024)

            print(f"File size: {file_size_mb:.2f} MB")
            assert file_size_mb < 10.0, f"File is {file_size_mb:.2f} MB, expected < 10 MB"
            # Should also not be too small (has content)
            assert file_size > 10000, f"File is only {file_size} bytes, seems too small"

    @pytest.mark.performance
    def test_export_scales_linearly(self):
        """Export time should scale roughly linearly with card count."""
        times = {}

        for card_count in [10, 50, 100]:
            cards = [
                Card(
                    title=f"Card {i}",
                    question=f"Question {i}?",
                    answer=f"Answer {i}",
                    tags=["test"],
                )
                for i in range(card_count)
            ]

            with tempfile.TemporaryDirectory() as tmpdir:
                start = time.time()
                generate_anki_package(cards, tmpdir)
                elapsed = time.time() - start
                times[card_count] = elapsed

        # Rough scaling check: 100 cards shouldn't take 10x more than 10 cards
        ratio = times[100] / times[10]
        print(f"Scaling ratio (100/10 cards): {ratio:.1f}x")
        # Should be between 5x and 15x (linear would be 10x)
        assert 5 < ratio < 15, f"Scaling ratio {ratio} seems off"

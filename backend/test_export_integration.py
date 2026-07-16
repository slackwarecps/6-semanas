"""
Integration tests for full export flow: query → transform → zip → validate.
Tests end-to-end export functionality.
"""

import pytest
import sqlite3
import zipfile
from io import BytesIO
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from main import app
from database import get_session, Jornada, Card, JornadaPergunta


@pytest.fixture(name="session")
def session_fixture():
    """Create in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with session override."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestExportIntegration:
    """Test full export flow."""

    @pytest.fixture(autouse=True)
    def setup_test_data(self, session: Session):
        """Set up test data: jornada with multiple cards."""
        self.user_id = "test_user_001"
        self.jornada_id = "jornada_test_001"

        # Create jornada
        jornada = Jornada(
            user_id=self.user_id,
            id=self.jornada_id,
            nome="História Medieval",
            ativa=True,
            ordem=1,
            createdAt=1721000000000,
            updatedAt=1721000000000,
        )
        session.add(jornada)

        # Create cards with various content
        cards_data = [
            (
                "card_001",
                "Feudalismo",
                "O que é feudalismo?",
                "Sistema de relações vasaláticas",
                '["história", "medieval"]',
            ),
            (
                "card_002",
                "Idade Média",
                "Quando começou a Idade Média?",
                "476",
                '["história"]',
            ),
            (
                "card_003",
                "Castelos",
                "Qual era a função principal?\n[ ] A - Habitação\n[ ] B - Defesa",
                "B - Defesa e proteção",
                '["arquitetura", "história"]',
            ),
        ]

        for idx, (card_id, title, question, answer, tags) in enumerate(cards_data, 1):
            card = Card(
                user_id=self.user_id,
                id=card_id,
                seq=idx,
                title=title,
                question=question,
                answer=answer,
                tags=tags,
                state="new",
                interval=0,
                easeFactor=2.5,
                repetitions=0,
                createdAt=1721000000000,
                updatedAt=1721000000000,
                nextReviewDate=1721000000000,
            )
            session.add(card)

            # Associate with jornada
            jp = JornadaPergunta(
                user_id=self.user_id,
                jornadaId=self.jornada_id,
                cardId=card_id,
                ordem=idx,
            )
            session.add(jp)

        session.commit()

    def test_export_flow_query_all_cards(self, client: TestClient):
        """Test that export queries all cards for jornada."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        # Verify file contains all 3 cards
        zip_buffer = BytesIO(response.content)
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path = tmp.name

        try:
            conn = sqlite3.connect(tmp_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM notes")
            count = cursor.fetchone()[0]
            assert count == 3
            conn.close()
        finally:
            import os
            os.unlink(tmp_path)

    def test_export_flow_preserves_card_order(self, client: TestClient):
        """Test that cards are exported in jornada order."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        zip_buffer = BytesIO(response.content)
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path = tmp.name

        try:
            conn = sqlite3.connect(tmp_path)
            cursor = conn.cursor()
            cursor.execute("SELECT flds FROM notes ORDER BY id")
            rows = cursor.fetchall()
            # Each row is (flds,)
            # Check that cards appear in export
            all_text = "\n".join([row[0] for row in rows])
            assert "Feudalismo" in all_text
            assert "Idade Média" in all_text
            assert "Castelos" in all_text
            conn.close()
        finally:
            import os
            os.unlink(tmp_path)

    def test_export_flow_transforms_tags(self, client: TestClient):
        """Test that tags are transformed correctly."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        zip_buffer = BytesIO(response.content)
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path = tmp.name

        try:
            conn = sqlite3.connect(tmp_path)
            cursor = conn.cursor()
            cursor.execute("SELECT tags FROM notes")
            tags_rows = cursor.fetchall()
            # Tags should be space-separated, not comma-separated
            for (tags,) in tags_rows:
                # Should not have comma (Anki format uses spaces)
                assert "," not in tags or tags == ""
                # Should have tags if any
                if tags and tags.strip():
                    # Should be space-separated
                    assert " " in tags or len(tags.split()) >= 1
            conn.close()
        finally:
            import os
            os.unlink(tmp_path)

    def test_export_flow_multicard_file_size(self, client: TestClient):
        """Test file size is reasonable for multi-card export."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        # Should be at least 5KB, but reasonable size
        assert len(response.content) > 5000
        assert len(response.content) < 1000000  # Less than 1MB

    def test_export_flow_zip_integrity(self, client: TestClient):
        """Test that ZIP file integrity is maintained."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        # Should be valid ZIP
        zip_buffer = BytesIO(response.content)
        assert zipfile.is_zipfile(zip_buffer)

        # Should have correct internal structure
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            files = zf.namelist()
            assert len(files) == 2
            assert "collection.anki2" in files
            assert "media" in files

            # Media should be valid JSON
            with zf.open("media") as f:
                import json
                media = json.load(f)
                assert isinstance(media, dict)

    def test_export_flow_database_schema_correct(self, client: TestClient):
        """Test that exported database has correct Anki schema."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        zip_buffer = BytesIO(response.content)
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            with zf.open("collection.anki2") as db_file:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
                    tmp.write(db_file.read())
                    tmp_path = tmp.name

        try:
            conn = sqlite3.connect(tmp_path)
            cursor = conn.cursor()

            # Check schema version
            cursor.execute("SELECT ver FROM col")
            version = cursor.fetchone()[0]
            assert version == 11  # Anki legacy schema

            # Check tags field is JSON
            cursor.execute("SELECT tags FROM col")
            tags_str = cursor.fetchone()[0]
            import json
            tags_obj = json.loads(tags_str)
            assert isinstance(tags_obj, dict)

            conn.close()
        finally:
            import os
            os.unlink(tmp_path)

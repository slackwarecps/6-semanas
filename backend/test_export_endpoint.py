"""
Contract tests for export endpoint: POST /jornadas/{jornadaId}/export-anki
Tests HTTP status codes, headers, and error handling.
"""

import pytest
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


class TestExportEndpointContract:
    """Test HTTP contract for export endpoint."""

    @pytest.fixture(autouse=True)
    def setup_test_data(self, session: Session):
        """Set up test data: jornada with cards."""
        user_id = "test_user_001"

        # Create jornada
        jornada = Jornada(
            user_id=user_id,
            id="jornada_test_001",
            nome="Test Jornada",
            ativa=True,
            ordem=1,
            createdAt=1721000000000,
            updatedAt=1721000000000,
        )
        session.add(jornada)

        # Create cards
        card1 = Card(
            user_id=user_id,
            id="card_001",
            seq=1,
            title="Card 1",
            question="Question 1?",
            answer="Answer 1",
            tags='["tag1"]',
            state="new",
            interval=0,
            easeFactor=2.5,
            repetitions=0,
            createdAt=1721000000000,
            updatedAt=1721000000000,
            nextReviewDate=1721000000000,
        )
        card2 = Card(
            user_id=user_id,
            id="card_002",
            seq=2,
            title="Card 2",
            question="Question 2?",
            answer="Answer 2",
            tags='["tag2"]',
            state="new",
            interval=0,
            easeFactor=2.5,
            repetitions=0,
            createdAt=1721000000000,
            updatedAt=1721000000000,
            nextReviewDate=1721000000000,
        )
        session.add(card1)
        session.add(card2)

        # Associate cards with jornada
        jp1 = JornadaPergunta(
            user_id=user_id, jornadaId="jornada_test_001", cardId="card_001", ordem=1
        )
        jp2 = JornadaPergunta(
            user_id=user_id, jornadaId="jornada_test_001", cardId="card_002", ordem=2
        )
        session.add(jp1)
        session.add(jp2)
        session.commit()

        self.user_id = user_id
        self.jornada_id = jornada.id

    def test_export_success_returns_200(self, client: TestClient):
        """Test successful export returns 200 OK."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

    def test_export_returns_binary_content(self, client: TestClient):
        """Test export returns binary .colpkg file."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/octet-stream"

    def test_export_returns_attachment_header(self, client: TestClient):
        """Test file is returned with attachment disposition."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200
        assert "attachment" in response.headers.get("content-disposition", "")
        assert ".colpkg" in response.headers.get("content-disposition", "")

    def test_export_not_found_returns_404(self, client: TestClient):
        """Test 404 when jornada doesn't exist."""
        response = client.post(
            "/jornadas/nonexistent_jornada/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 404

    def test_export_missing_header_returns_422(self, client: TestClient):
        """Test 422 when X-User-Id header is missing."""
        response = client.post(f"/jornadas/{self.jornada_id}/export-anki")
        assert response.status_code == 422

    def test_export_empty_jornada_returns_400(self, client: TestClient, session: Session):
        """Test 400 Bad Request for jornada with no cards."""
        user_id = "test_user_001"

        # Create jornada without cards
        jornada = Jornada(
            user_id=user_id,
            id="jornada_empty",
            nome="Empty Jornada",
            ativa=True,
            ordem=2,
            createdAt=1721000000000,
            updatedAt=1721000000000,
        )
        session.add(jornada)
        session.commit()

        response = client.post(
            "/jornadas/jornada_empty/export-anki",
            headers={"X-User-Id": user_id},
        )
        assert response.status_code == 400
        assert "Nenhum card" in response.json()["detail"] or "card" in response.json()["detail"].lower()

    def test_export_wrong_user_returns_404(self, client: TestClient):
        """Test 404 when different user tries to export."""
        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": "different_user"},
        )
        assert response.status_code == 404

    def test_export_returns_valid_zip(self, client: TestClient):
        """Test that returned content is valid ZIP file."""
        import zipfile
        from io import BytesIO

        response = client.post(
            f"/jornadas/{self.jornada_id}/export-anki",
            headers={"X-User-Id": self.user_id},
        )
        assert response.status_code == 200

        # Verify ZIP format
        zip_buffer = BytesIO(response.content)
        assert zipfile.is_zipfile(zip_buffer)

        # Verify structure
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            namelist = zf.namelist()
            assert "collection.anki2" in namelist
            assert "media" in namelist

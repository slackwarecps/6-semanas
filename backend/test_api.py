"""
Testes da Fase 2 (API REST de cards e config, multi-usuário via X-User-Id).

Usa o TestClient do FastAPI com a dependência get_session sobrescrita para um
banco em memória — o database.sqlite real não é tocado.

Rodar com: pytest test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool

from database import get_session
from main import app

FABAO = {"X-User-Id": "fabao"}
WALLE = {"X-User-Id": "walle"}


@pytest.fixture(name="client")
def client_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def get_session_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_session_override
    yield TestClient(app)
    app.dependency_overrides.clear()


def _card_payload(card_id: str = "card-1", title: str = "Card de teste") -> dict:
    return {
        "id": card_id,
        "title": title,
        "question": "Qual serviço AWS é serverless?",
        "answer": "Lambda",
        "options": [
            {"id": "opt-a", "text": "EC2", "isCorrect": False, "order": 0},
            {"id": "opt-b", "text": "Lambda", "isCorrect": True, "order": 1},
        ],
        "tags": ["aws", "serverless"],
        "state": "New",
        "interval": 0,
        "easeFactor": 2.5,
        "repetitions": 0,
        "attempts": [
            {
                "timestamp": 1_700_000_000_000,
                "quality": 5,
                "elapsedTime": 900,
                "wasCorrect": True,
                "userAnswer": "Lambda",
                "easeFactorBefore": 2.5,
                "easeFactorAfter": 2.6,
                "intervalBefore": 0,
                "intervalAfter": 1,
            }
        ],
        "createdAt": 1_700_000_000_000,
        "updatedAt": 1_700_000_000_000,
        "nextReviewDate": 1_700_000_000_000,
        "explanation": "Explicação gerada pela IA (cara de regenerar!)",
    }


# ── Cards ────────────────────────────────────────────────────────────────────


def test_post_e_get_cards_isolados_por_usuario(client: TestClient):
    assert client.post("/cards", json=_card_payload(), headers=FABAO).status_code == 200

    cards_fabao = client.get("/cards", headers=FABAO).json()
    cards_walle = client.get("/cards", headers=WALLE).json()

    assert len(cards_fabao) == 1
    assert cards_fabao[0]["title"] == "Card de teste"
    assert cards_fabao[0]["tags"] == ["aws", "serverless"]
    assert len(cards_fabao[0]["options"]) == 2
    assert len(cards_fabao[0]["attempts"]) == 1
    assert cards_walle == []


def test_get_card_de_outro_usuario_retorna_404(client: TestClient):
    client.post("/cards", json=_card_payload(), headers=FABAO)

    assert client.get("/cards/card-1", headers=FABAO).status_code == 200
    assert client.get("/cards/card-1", headers=WALLE).status_code == 404


def test_seq_atribuido_por_usuario(client: TestClient):
    client.post("/cards", json=_card_payload("card-1"), headers=FABAO)
    client.post("/cards", json=_card_payload("card-2"), headers=FABAO)
    resposta_walle = client.post("/cards", json=_card_payload("card-3"), headers=WALLE)

    seqs_fabao = [c["seq"] for c in client.get("/cards", headers=FABAO).json()]
    assert seqs_fabao == [1, 2]
    # O contador do Wall-E é independente do contador do Fabão
    assert resposta_walle.json()["seq"] == 1


def test_upsert_preserva_created_at_e_seq(client: TestClient):
    criado = client.post("/cards", json=_card_payload(), headers=FABAO).json()

    atualizacao = _card_payload(title="Título editado")
    atualizacao["createdAt"] = 9_999_999_999_999  # deve ser ignorado no update
    atualizacao["updatedAt"] = 1_700_000_111_111
    atualizacao["options"] = [
        {"id": "opt-nova", "text": "Fargate", "isCorrect": True, "order": 0}
    ]
    atualizado = client.post("/cards", json=atualizacao, headers=FABAO).json()

    assert atualizado["title"] == "Título editado"
    assert atualizado["createdAt"] == criado["createdAt"]
    assert atualizado["seq"] == criado["seq"]
    assert atualizado["updatedAt"] == 1_700_000_111_111
    # Options antigas foram substituídas, não acumuladas
    assert [o["id"] for o in atualizado["options"]] == ["opt-nova"]
    assert len(client.get("/cards", headers=FABAO).json()) == 1


def test_delete_remove_somente_do_usuario(client: TestClient):
    client.post("/cards", json=_card_payload(), headers=FABAO)
    client.post("/cards", json=_card_payload(), headers=WALLE)

    assert client.delete("/cards/card-1", headers=FABAO).status_code == 204

    assert client.get("/cards", headers=FABAO).json() == []
    assert len(client.get("/cards", headers=WALLE).json()) == 1
    # Delete é idempotente (semântica do frontend)
    assert client.delete("/cards/card-1", headers=FABAO).status_code == 204


def test_requisicao_sem_header_x_user_id_recebe_422(client: TestClient):
    assert client.get("/cards").status_code == 422
    assert client.post("/cards", json=_card_payload()).status_code == 422


# ── Config ───────────────────────────────────────────────────────────────────


def test_config_upsert_e_isolamento(client: TestClient):
    assert client.get("/config/LLM_QUERY_DEFAULT", headers=FABAO).status_code == 404

    put = client.put(
        "/config/LLM_QUERY_DEFAULT", json={"valor": "deepseek"}, headers=FABAO
    )
    assert put.status_code == 200

    assert client.get("/config/LLM_QUERY_DEFAULT", headers=FABAO).json() == {
        "chave": "LLM_QUERY_DEFAULT",
        "valor": "deepseek",
    }
    # Config do Fabão não vaza para o Wall-E
    assert client.get("/config/LLM_QUERY_DEFAULT", headers=WALLE).status_code == 404

    client.put("/config/LLM_QUERY_DEFAULT", json={"valor": "claude"}, headers=FABAO)
    assert (
        client.get("/config/LLM_QUERY_DEFAULT", headers=FABAO).json()["valor"] == "claude"
    )


# ── Jornadas, XP e reset (Fase 5) ────────────────────────────────────────────


def _jornada_payload(jornada_id: str = "j-1") -> dict:
    return {
        "id": jornada_id,
        "nome": "Jornada AWS",
        "ativa": True,
        "ordem": 1,
        "createdAt": 1_700_000_000_000,
        "updatedAt": 1_700_000_000_000,
        "cardIds": ["card-a", "card-b"],
    }


def test_jornada_crud_isolado_por_usuario(client: TestClient):
    assert client.post("/jornadas", json=_jornada_payload(), headers=FABAO).status_code == 200

    jornadas_fabao = client.get("/jornadas", headers=FABAO).json()
    assert len(jornadas_fabao) == 1
    assert jornadas_fabao[0]["cardIds"] == ["card-a", "card-b"]
    assert client.get("/jornadas", headers=WALLE).json() == []

    # Upsert substitui as perguntas vinculadas
    atualizada = _jornada_payload()
    atualizada["cardIds"] = ["card-c"]
    assert client.post("/jornadas", json=atualizada, headers=FABAO).json()["cardIds"] == ["card-c"]

    assert client.delete("/jornadas/j-1", headers=FABAO).status_code == 204
    assert client.get("/jornadas", headers=FABAO).json() == []


def test_progresso_upsert_e_404(client: TestClient):
    client.post("/jornadas", json=_jornada_payload(), headers=FABAO)

    assert client.get("/jornadas/j-1/progresso", headers=FABAO).status_code == 404

    progresso = {
        "jornadaId": "j-1",
        "status": "unlocked",
        "currentQuestionIndex": 2,
        "currentErrors": 1,
        "currentLives": 2,
        "lastActiveAt": 1_700_000_000_000,
    }
    assert client.put("/jornadas/j-1/progresso", json=progresso, headers=FABAO).status_code == 200

    lido = client.get("/jornadas/j-1/progresso", headers=FABAO).json()
    assert lido["status"] == "unlocked"
    assert lido["currentQuestionIndex"] == 2
    assert client.get("/jornadas/j-1/progresso", headers=WALLE).status_code == 404


def test_xp_por_usuario_e_reset_progress(client: TestClient):
    assert client.get("/learn/xp", headers=FABAO).json() == {"totalXp": 0}
    assert client.post("/learn/xp", json={"amount": 50}, headers=FABAO).json() == {"totalXp": 50}
    assert client.post("/learn/xp", json={"amount": 25}, headers=FABAO).json() == {"totalXp": 75}
    # XP do Wall-E é independente
    assert client.get("/learn/xp", headers=WALLE).json() == {"totalXp": 0}

    client.post("/jornadas", json=_jornada_payload(), headers=FABAO)
    client.put(
        "/jornadas/j-1/progresso",
        json={"jornadaId": "j-1", "status": "completed"},
        headers=FABAO,
    )

    assert client.post("/learn/reset-progress", headers=FABAO).status_code == 204
    assert client.get("/learn/xp", headers=FABAO).json() == {"totalXp": 0}
    assert client.get("/jornadas/j-1/progresso", headers=FABAO).status_code == 404
    # A jornada em si permanece (só o progresso é resetado)
    assert client.get("/jornadas/j-1", headers=FABAO).status_code == 200


def test_delete_user_data_apaga_tudo_do_usuario(client: TestClient):
    client.post("/cards", json=_card_payload(), headers=FABAO)
    client.post("/jornadas", json=_jornada_payload(), headers=FABAO)
    client.post("/learn/xp", json={"amount": 100}, headers=FABAO)
    client.put("/config/LLM_QUERY_DEFAULT", json={"valor": "claude"}, headers=FABAO)
    client.post("/cards", json=_card_payload(), headers=WALLE)

    assert client.delete("/user-data", headers=FABAO).status_code == 204

    assert client.get("/cards", headers=FABAO).json() == []
    assert client.get("/jornadas", headers=FABAO).json() == []
    assert client.get("/learn/xp", headers=FABAO).json() == {"totalXp": 0}
    assert client.get("/config/LLM_QUERY_DEFAULT", headers=FABAO).status_code == 404
    # Dados do Wall-E ficam intactos
    assert len(client.get("/cards", headers=WALLE).json()) == 1

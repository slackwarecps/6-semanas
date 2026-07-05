"""
Teste da Fase 1 (migração SQLite → backend): valida o schema SQLModel e o
isolamento de dados por usuário (`user_id`), usando um banco em memória para
não tocar no database.sqlite real.

Rodar com: pytest test_db.py -v
"""

import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlalchemy.pool import StaticPool

from database import AppConfig, Attempt, Card, CardOption, Jornada, LearnStats


@pytest.fixture(name="session")
def session_fixture():
    # StaticPool: mantém o mesmo banco em memória entre conexões do teste.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def _novo_card(user_id: str, card_id: str, title: str) -> Card:
    return Card(
        user_id=user_id,
        id=card_id,
        title=title,
        question=f"Pergunta de {title}?",
        answer="42",
        createdAt=1_700_000_000_000,
        updatedAt=1_700_000_000_000,
        nextReviewDate=1_700_000_000_000,
    )


def test_cards_isolados_por_usuario(session: Session):
    session.add(_novo_card("fabao", "card-1", "Card do Fabão"))
    session.add(_novo_card("walle", "card-2", "Card do Wall-E"))
    session.commit()

    cards_fabao = session.exec(select(Card).where(Card.user_id == "fabao")).all()
    cards_walle = session.exec(select(Card).where(Card.user_id == "walle")).all()

    assert [c.title for c in cards_fabao] == ["Card do Fabão"]
    assert [c.title for c in cards_walle] == ["Card do Wall-E"]


def test_mesmo_card_id_para_usuarios_diferentes(session: Session):
    # Cenário de restore do mesmo backup para dois usuários: o id do card se
    # repete, e a PK composta (user_id, id) deve aceitar sem colisão.
    session.add(_novo_card("fabao", "card-1", "Cópia do Fabão"))
    session.add(_novo_card("walle", "card-1", "Cópia do Wall-E"))
    session.commit()

    card_fabao = session.get(Card, ("fabao", "card-1"))
    card_walle = session.get(Card, ("walle", "card-1"))

    assert card_fabao is not None and card_fabao.title == "Cópia do Fabão"
    assert card_walle is not None and card_walle.title == "Cópia do Wall-E"


def test_relacionamentos_do_card(session: Session):
    session.add(_novo_card("fabao", "card-1", "Card com opções"))
    session.add(
        CardOption(
            user_id="fabao",
            cardId="card-1",
            optionId="opt-a",
            text="Alternativa A",
            isCorrect=True,
            optionOrder=0,
        )
    )
    session.add(
        Attempt(
            user_id="fabao",
            cardId="card-1",
            attemptId="att-1",
            timestamp=1_700_000_000_000,
            quality=5,
            elapsedTime=1200,
            wasCorrect=True,
            easeFactorBefore=2.5,
            easeFactorAfter=2.6,
            intervalBefore=0,
            intervalAfter=1,
        )
    )
    session.commit()

    options = session.exec(
        select(CardOption).where(
            CardOption.user_id == "fabao", CardOption.cardId == "card-1"
        )
    ).all()
    attempts = session.exec(
        select(Attempt).where(Attempt.user_id == "fabao", Attempt.cardId == "card-1")
    ).all()

    assert len(options) == 1 and options[0].isCorrect is True
    assert len(attempts) == 1 and attempts[0].quality == 5


def test_demais_entidades_isoladas_por_usuario(session: Session):
    session.add(
        Jornada(
            user_id="fabao",
            id="jornada-1",
            nome="AWS SAA",
            ativa=True,
            ordem=1,
            createdAt=1_700_000_000_000,
            updatedAt=1_700_000_000_000,
        )
    )
    session.add(LearnStats(user_id="fabao", totalXp=150))
    session.add(LearnStats(user_id="walle", totalXp=0))
    session.add(AppConfig(user_id="fabao", chave="LLM_QUERY_DEFAULT", valor="deepseek"))
    session.commit()

    assert session.exec(select(Jornada).where(Jornada.user_id == "walle")).all() == []
    assert session.get(LearnStats, "fabao").totalXp == 150
    assert session.get(LearnStats, "walle").totalXp == 0
    assert session.get(AppConfig, ("fabao", "LLM_QUERY_DEFAULT")).valor == "deepseek"

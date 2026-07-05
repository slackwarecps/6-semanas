"""
Camada de persistência do backend (SQLModel + SQLite).

Espelha o schema do banco local do frontend (src/app/infrastructure/storage/
sqlite.adapter.ts), acrescentando `user_id` para suporte multi-usuário via
header `X-User-Id`. O `user_id` participa da chave primária composta de cada
tabela: isso isola os dados por usuário e permite restaurar o mesmo backup
para mais de um usuário sem colisão de ids.

Notas de design:
  - Os nomes de campos ficam em camelCase para casar 1:1 com o JSON que o
    frontend já produz/consome, evitando camada de tradução nos endpoints.
  - `tags` é um array JSON serializado como string, como no frontend.
  - Timestamps são epoch em milissegundos (int), como no frontend.
  - A tabela `card_seq_counter` do frontend não é replicada: o `seq` passa a
    ser calculado por usuário no momento da inserção (Fase 2).
"""

from pathlib import Path
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine

# ── Engine ───────────────────────────────────────────────────────────────────

DB_PATH = Path(__file__).resolve().parent / "database.sqlite"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# check_same_thread=False: o FastAPI atende requisições em threads distintas.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


# ── Entidades: flashcards ────────────────────────────────────────────────────


class Card(SQLModel, table=True):
    __tablename__ = "cards"

    user_id: str = Field(primary_key=True, index=True)
    id: str = Field(primary_key=True)
    seq: Optional[int] = Field(default=None, index=True)
    title: str
    question: str
    answer: str
    tags: str = "[]"
    state: str = "New"  # New | Learning | Review | Relearning
    interval: int = 0
    easeFactor: float = 2.5
    repetitions: int = 0
    createdAt: int
    updatedAt: int
    nextReviewDate: int
    traducao: Optional[str] = None
    explanation: Optional[str] = None
    tenYearOld: Optional[str] = None


class CardOption(SQLModel, table=True):
    __tablename__ = "card_options"

    user_id: str = Field(primary_key=True, index=True)
    cardId: str = Field(primary_key=True)
    optionId: str = Field(primary_key=True)
    text: str
    isCorrect: bool = False
    optionOrder: int = 0


class Attempt(SQLModel, table=True):
    __tablename__ = "attempts"

    user_id: str = Field(primary_key=True, index=True)
    cardId: str = Field(primary_key=True)
    attemptId: str = Field(primary_key=True)
    timestamp: int
    quality: int
    elapsedTime: int
    wasCorrect: bool
    userAnswer: Optional[str] = None
    easeFactorBefore: float
    easeFactorAfter: float
    intervalBefore: int
    intervalAfter: int


# ── Entidades: jornadas (modo Learn) ─────────────────────────────────────────


class Jornada(SQLModel, table=True):
    __tablename__ = "jornadas"

    user_id: str = Field(primary_key=True, index=True)
    id: str = Field(primary_key=True)
    nome: str
    ativa: bool = False
    ordem: int = 0
    createdAt: int
    updatedAt: int


class JornadaPergunta(SQLModel, table=True):
    __tablename__ = "jornada_perguntas"

    user_id: str = Field(primary_key=True, index=True)
    jornadaId: str = Field(primary_key=True)
    cardId: str = Field(primary_key=True)
    ordem: int = 0


class JornadaProgresso(SQLModel, table=True):
    __tablename__ = "jornada_progresso"

    user_id: str = Field(primary_key=True, index=True)
    jornadaId: str = Field(primary_key=True)
    status: str
    bestErrors: Optional[int] = None
    completedAt: Optional[int] = None
    currentQuestionIndex: int = 0
    currentErrors: int = 0
    currentLives: int = 3
    lastActiveAt: Optional[int] = None
    bestTime: Optional[int] = None


class LearnStats(SQLModel, table=True):
    __tablename__ = "learn_stats"

    user_id: str = Field(primary_key=True)
    totalXp: int = 0


# ── Entidades: configuração ──────────────────────────────────────────────────


class AppConfig(SQLModel, table=True):
    __tablename__ = "app_config"

    user_id: str = Field(primary_key=True, index=True)
    chave: str = Field(primary_key=True)
    valor: str


# ── Infraestrutura de sessão ─────────────────────────────────────────────────


def create_db_and_tables() -> None:
    """Cria o arquivo SQLite e as tabelas (idempotente). Chamado no startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependência do FastAPI: fornece uma sessão por requisição."""
    with Session(engine) as session:
        yield session

"""
Rotas REST de jornadas, progresso e XP (fechamento da migração — Fase 5).

Cobrem os métodos de jornada do SqliteAdapter legado, com isolamento por
usuário via `X-User-Id`:
  - GET    /jornadas                     → loadAllJornadas (+ cardIds aninhados)
  - GET    /jornadas/{id}                → loadJornadaById (+ cardIds)
  - POST   /jornadas                     → saveJornada (upsert, substitui perguntas)
  - DELETE /jornadas/{id}                → deleteJornada (remove perguntas + progresso)
  - GET    /jornadas/{id}/progresso      → getJornadaProgress (404 se não existir)
  - PUT    /jornadas/{id}/progresso      → upsertJornadaProgress
  - GET    /learn/xp                     → getTotalXp
  - POST   /learn/xp                     → addXp (soma e retorna o novo total)
  - POST   /learn/reset-progress         → resetJornadaProgress (zera progresso + XP)
  - DELETE /user-data                    → reset total do usuário (botão da Navbar)

Timestamps são epoch em milissegundos, como no restante da API.
"""

from typing import Optional
import logging
from datetime import datetime
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Response
from starlette.responses import FileResponse
from pydantic import BaseModel
from sqlmodel import Session, select

from database import (
    AppConfig,
    Attempt,
    Card,
    CardOption,
    Jornada,
    JornadaPergunta,
    JornadaProgresso,
    LearnStats,
    get_session,
)
from routes.deps import get_user_id, validate_jornada_ownership
from services.anki_export import Card as AnkiCard, generate_anki_package

logger = logging.getLogger(__name__)

router = APIRouter(tags=["jornadas"])


# ── DTOs ─────────────────────────────────────────────────────────────────────


class JornadaDTO(BaseModel):
    id: str
    nome: str
    ativa: bool = False
    ordem: int = 0
    pontosTentativas: int = 3
    tipoJornada: str = "normal"
    duracao: int = 120
    createdAt: int
    updatedAt: int
    cardIds: list[str] = []


class ProgressoDTO(BaseModel):
    jornadaId: str
    status: str
    bestErrors: Optional[int] = None
    completedAt: Optional[int] = None
    currentQuestionIndex: int = 0
    currentErrors: int = 0
    currentLives: int = 3
    lastActiveAt: Optional[int] = None
    bestTime: Optional[int] = None
    desafioStartTimeMs: Optional[int] = None
    questionsState: Optional[str] = "[]"


class XpDTO(BaseModel):
    totalXp: int


class AddXpDTO(BaseModel):
    amount: int


# ── Helpers ──────────────────────────────────────────────────────────────────


def _card_ids(session: Session, user_id: str, jornada_id: str) -> list[str]:
    perguntas = session.exec(
        select(JornadaPergunta)
        .where(JornadaPergunta.user_id == user_id, JornadaPergunta.jornadaId == jornada_id)
        .order_by(JornadaPergunta.ordem)
    ).all()
    return [p.cardId for p in perguntas]


def _get_cards_for_export(
    session: Session, user_id: str, jornada_id: str
) -> tuple[list[Card], int]:
    """
    Retrieve all cards for a jornada in export order.

    Returns:
        Tuple of (cards list, total count)
    """
    perguntas = session.exec(
        select(JornadaPergunta)
        .where(JornadaPergunta.user_id == user_id, JornadaPergunta.jornadaId == jornada_id)
        .order_by(JornadaPergunta.ordem)
    ).all()

    if not perguntas:
        return [], 0

    card_ids = [p.cardId for p in perguntas]
    cards = session.exec(
        select(Card).where(
            Card.user_id == user_id,
            Card.id.in_(card_ids),
        )
    ).all()

    # Reconstruct in jornada order
    card_map = {card.id: card for card in cards}
    ordered_cards = [card_map[card_id] for card_id in card_ids if card_id in card_map]

    return ordered_cards, len(ordered_cards)


def _to_dto(session: Session, user_id: str, jornada: Jornada) -> JornadaDTO:
    return JornadaDTO(
        id=jornada.id,
        nome=jornada.nome,
        ativa=jornada.ativa,
        ordem=jornada.ordem,
        pontosTentativas=jornada.pontosTentativas,
        tipoJornada=jornada.tipoJornada,
        duracao=jornada.duracao,
        createdAt=jornada.createdAt,
        updatedAt=jornada.updatedAt,
        cardIds=_card_ids(session, user_id, jornada.id),
    )


def _get_stats(session: Session, user_id: str) -> LearnStats:
    stats = session.get(LearnStats, user_id)
    if stats is None:
        stats = LearnStats(user_id=user_id, totalXp=0)
    return stats


# ── Jornadas ─────────────────────────────────────────────────────────────────


@router.get("/jornadas", response_model=list[JornadaDTO])
def list_jornadas(
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> list[JornadaDTO]:
    jornadas = session.exec(
        select(Jornada).where(Jornada.user_id == user_id).order_by(Jornada.ordem)
    ).all()
    return [_to_dto(session, user_id, j) for j in jornadas]


# ── Export to Anki (before generic GET to avoid route conflict) ────────────────


@router.post("/jornadas/{jornada_id}/export-anki")
def export_jornada_to_anki(
    jornada_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> FileResponse:
    """
    Export jornada cards to Anki .colpkg format.

    Returns:
        FileResponse: .colpkg file as attachment

    Raises:
        404: Jornada not found for this user
        400: Jornada has no cards to export
        500: Error during export generation
    """
    # T011: Validate jornada exists and belongs to user
    jornada = session.get(Jornada, (user_id, jornada_id))
    if not jornada:
        raise HTTPException(status_code=404, detail="Jornada não encontrada")

    # T012: Query cards for this jornada in order
    cards, card_count = _get_cards_for_export(session, user_id, jornada_id)

    # T013: Validate jornada has at least one card
    if not cards:
        raise HTTPException(
            status_code=400, detail="Nenhum card para exportar nesta jornada"
        )

    try:
        # Convert Card objects to AnkiCard format
        anki_cards = [
            AnkiCard(
                title=card.title,
                question=card.question,
                answer=card.answer,
                tags=_parse_tags(card.tags),
            )
            for card in cards
        ]

        # T014: Generate filename
        filename = _generate_filename(jornada.nome)

        # T015: Generate .colpkg file in temporary location
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = str(Path(tmpdir) / filename)
            full_path = generate_anki_package(anki_cards, output_path, jornada.nome)

            # T017: Log export operation
            logger.info(
                f"Export: jornada_id={jornada_id}, user_id={user_id}, "
                f"card_count={card_count}, timestamp={datetime.now().isoformat()}"
            )

            # Read file content (must be done before exiting tempdir context)
            with open(full_path, "rb") as f:
                file_content = f.read()

        # Return as streaming response with proper headers
        from starlette.responses import StreamingResponse
        import io
        return StreamingResponse(
            iter([file_content]),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    except Exception as e:
        # T016: Error handling on export failure
        logger.error(
            f"Export error: jornada_id={jornada_id}, user_id={user_id}, error={str(e)}"
        )
        raise HTTPException(
            status_code=500, detail="Erro ao exportar jornada para Anki"
        )


def _parse_tags(tags_json: Optional[str]) -> list[str]:
    """Parse tags from JSON string."""
    import json

    if not tags_json:
        return []
    try:
        tags = json.loads(tags_json)
        return [str(t).replace("Tags:", "").strip() for t in tags if str(t).strip()]
    except (json.JSONDecodeError, TypeError):
        return []


def _generate_filename(jornada_nome: str) -> str:
    """Generate filename for export."""
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = jornada_nome.lower()
    for char in r'/<>:*?"|':
        slug = slug.replace(char, "-")
    slug = slug.replace(" ", "-")
    # Remove consecutive hyphens
    while "--" in slug:
        slug = slug.replace("--", "-")
    slug = slug[:100].rstrip("-")

    today = datetime.now().strftime("%Y-%m-%d")
    return f"jornada-{slug}-{today}.colpkg"


@router.get("/jornadas/{jornada_id}", response_model=JornadaDTO)
def get_jornada(
    jornada_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> JornadaDTO:
    jornada = session.get(Jornada, (user_id, jornada_id))
    if jornada is None:
        raise HTTPException(status_code=404, detail=f"Jornada '{jornada_id}' não encontrada.")
    return _to_dto(session, user_id, jornada)


@router.post("/jornadas", response_model=JornadaDTO)
def save_jornada(
    dto: JornadaDTO,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> JornadaDTO:
    existing = session.get(Jornada, (user_id, dto.id))

    if existing is not None:
        # Update: preserva createdAt (semântica do frontend)
        existing.nome = dto.nome
        existing.ativa = dto.ativa
        existing.ordem = dto.ordem
        existing.pontosTentativas = dto.pontosTentativas
        existing.tipoJornada = dto.tipoJornada
        existing.duracao = dto.duracao
        existing.updatedAt = dto.updatedAt
        session.add(existing)
        jornada = existing
    else:
        jornada = Jornada(
            user_id=user_id,
            id=dto.id,
            nome=dto.nome,
            ativa=dto.ativa,
            ordem=dto.ordem,
            pontosTentativas=dto.pontosTentativas,
            tipoJornada=dto.tipoJornada,
            duracao=dto.duracao,
            createdAt=dto.createdAt,
            updatedAt=dto.updatedAt,
        )
        session.add(jornada)

    # Substitui as perguntas vinculadas (mesma semântica do legado)
    for pergunta in session.exec(
        select(JornadaPergunta).where(
            JornadaPergunta.user_id == user_id, JornadaPergunta.jornadaId == dto.id
        )
    ):
        session.delete(pergunta)
    for i, card_id in enumerate(dto.cardIds):
        session.add(
            JornadaPergunta(user_id=user_id, jornadaId=dto.id, cardId=card_id, ordem=i)
        )

    session.commit()
    session.refresh(jornada)
    return _to_dto(session, user_id, jornada)


@router.delete("/jornadas/{jornada_id}", status_code=204)
def delete_jornada(
    jornada_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> Response:
    for pergunta in session.exec(
        select(JornadaPergunta).where(
            JornadaPergunta.user_id == user_id, JornadaPergunta.jornadaId == jornada_id
        )
    ):
        session.delete(pergunta)

    progresso = session.get(JornadaProgresso, (user_id, jornada_id))
    if progresso is not None:
        session.delete(progresso)

    jornada = session.get(Jornada, (user_id, jornada_id))
    if jornada is not None:
        session.delete(jornada)

    session.commit()
    return Response(status_code=204)


# ── Progresso ────────────────────────────────────────────────────────────────


@router.get("/jornadas/{jornada_id}/progresso", response_model=Optional[ProgressoDTO])
def get_progresso(
    jornada_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> Optional[ProgressoDTO]:
    progresso = session.get(JornadaProgresso, (user_id, jornada_id))
    if progresso is None:
        return None
    return ProgressoDTO.model_validate(progresso, from_attributes=True)


@router.put("/jornadas/{jornada_id}/progresso", response_model=ProgressoDTO)
def upsert_progresso(
    jornada_id: str,
    dto: ProgressoDTO,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> ProgressoDTO:
    progresso = session.get(JornadaProgresso, (user_id, jornada_id))
    if progresso is None:
        progresso = JornadaProgresso(user_id=user_id, jornadaId=jornada_id, status=dto.status)

    progresso.status = dto.status
    progresso.bestErrors = dto.bestErrors
    progresso.completedAt = dto.completedAt
    progresso.currentQuestionIndex = dto.currentQuestionIndex
    progresso.currentErrors = dto.currentErrors
    progresso.currentLives = dto.currentLives
    progresso.lastActiveAt = dto.lastActiveAt
    progresso.bestTime = dto.bestTime
    progresso.desafioStartTimeMs = dto.desafioStartTimeMs
    progresso.questionsState = dto.questionsState

    session.add(progresso)
    session.commit()
    session.refresh(progresso)
    return ProgressoDTO.model_validate(progresso, from_attributes=True)


# ── XP / Learn stats ─────────────────────────────────────────────────────────


@router.get("/learn/xp", response_model=XpDTO)
def get_xp(
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> XpDTO:
    return XpDTO(totalXp=_get_stats(session, user_id).totalXp)


@router.post("/learn/xp", response_model=XpDTO)
def add_xp(
    dto: AddXpDTO,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> XpDTO:
    stats = _get_stats(session, user_id)
    stats.totalXp += dto.amount
    session.add(stats)
    session.commit()
    return XpDTO(totalXp=stats.totalXp)


@router.post("/learn/reset-progress", status_code=204)
def reset_progress(
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> Response:
    for progresso in session.exec(
        select(JornadaProgresso).where(JornadaProgresso.user_id == user_id)
    ):
        session.delete(progresso)

    stats = session.get(LearnStats, user_id)
    if stats is not None:
        stats.totalXp = 0
        session.add(stats)

    session.commit()
    return Response(status_code=204)

# ── Reset total (botão "Resetar Cartões" da Navbar) ──────────────────────────


@router.delete("/user-data", status_code=204)
def delete_user_data(
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> Response:
    """Apaga TODOS os dados do usuário ativo (cards, jornadas, progresso, XP, config)."""
    for model in (Attempt, CardOption, Card, JornadaPergunta, JornadaProgresso, Jornada, LearnStats, AppConfig):
        for row in session.exec(select(model).where(model.user_id == user_id)):
            session.delete(row)
    session.commit()
    return Response(status_code=204)

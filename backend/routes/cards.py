"""
Rotas REST de cards (Fase 2 da migração SQLite → backend).

Cobre a `StorageInterface` do frontend com isolamento por usuário (`X-User-Id`):
  - GET    /cards        → loadAllCards (ordenado por seq, como no frontend)
  - GET    /cards/{id}   → loadCard
  - POST   /cards        → saveCard (upsert: update preserva createdAt e seq)
  - DELETE /cards/{id}   → deleteCard (idempotente, como no frontend)

O DTO espelha o formato `StoredCard` do sqlite.adapter.ts: options e attempts
aninhados, tags como array. Na tabela, tags vira string JSON e cada attempt
recebe `attemptId = "{cardId}:{índice}"`, replicando o comportamento legado.
"""

import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlmodel import Session, select

from database import Attempt, Card, CardOption, get_session
from routes.deps import get_user_id

router = APIRouter(prefix="/cards", tags=["cards"])


# ── DTOs (formato StoredCard do frontend) ────────────────────────────────────


class OptionDTO(BaseModel):
    id: str
    text: str
    isCorrect: bool
    order: int


class AttemptDTO(BaseModel):
    timestamp: int
    quality: int
    elapsedTime: int
    wasCorrect: bool
    userAnswer: Optional[str] = None
    easeFactorBefore: float
    easeFactorAfter: float
    intervalBefore: int
    intervalAfter: int


class CardDTO(BaseModel):
    id: str
    seq: Optional[int] = None
    title: str
    question: str
    answer: str
    options: list[OptionDTO] = []
    tags: list[str] = []
    state: str = "New"
    interval: int = 0
    easeFactor: float = 2.5
    repetitions: int = 0
    attempts: list[AttemptDTO] = []
    createdAt: int
    updatedAt: int
    nextReviewDate: int
    traducao: Optional[str] = None
    explanation: Optional[str] = None
    tenYearOld: Optional[str] = None


# ── Mapeamento entidade ↔ DTO ────────────────────────────────────────────────


def _to_dto(card: Card, options: list[CardOption], attempts: list[Attempt]) -> CardDTO:
    return CardDTO(
        id=card.id,
        seq=card.seq,
        title=card.title,
        question=card.question,
        answer=card.answer,
        options=[
            OptionDTO(id=o.optionId, text=o.text, isCorrect=o.isCorrect, order=o.optionOrder)
            for o in sorted(options, key=lambda o: o.optionOrder)
        ],
        tags=json.loads(card.tags or "[]"),
        state=card.state,
        interval=card.interval,
        easeFactor=card.easeFactor,
        repetitions=card.repetitions,
        attempts=[
            AttemptDTO(
                timestamp=a.timestamp,
                quality=a.quality,
                elapsedTime=a.elapsedTime,
                wasCorrect=a.wasCorrect,
                userAnswer=a.userAnswer,
                easeFactorBefore=a.easeFactorBefore,
                easeFactorAfter=a.easeFactorAfter,
                intervalBefore=a.intervalBefore,
                intervalAfter=a.intervalAfter,
            )
            for a in sorted(attempts, key=lambda a: a.attemptId)
        ],
        createdAt=card.createdAt,
        updatedAt=card.updatedAt,
        nextReviewDate=card.nextReviewDate,
        traducao=card.traducao,
        explanation=card.explanation,
        tenYearOld=card.tenYearOld,
    )


def _load_children(
    session: Session, user_id: str, card_id: str
) -> tuple[list[CardOption], list[Attempt]]:
    options = session.exec(
        select(CardOption).where(CardOption.user_id == user_id, CardOption.cardId == card_id)
    ).all()
    attempts = session.exec(
        select(Attempt).where(Attempt.user_id == user_id, Attempt.cardId == card_id)
    ).all()
    return list(options), list(attempts)


def _delete_children(session: Session, user_id: str, card_id: str) -> None:
    options, attempts = _load_children(session, user_id, card_id)
    for row in [*options, *attempts]:
        session.delete(row)


def _insert_children(session: Session, user_id: str, dto: CardDTO) -> None:
    for option in dto.options:
        session.add(
            CardOption(
                user_id=user_id,
                cardId=dto.id,
                optionId=option.id,
                text=option.text,
                isCorrect=option.isCorrect,
                optionOrder=option.order,
            )
        )
    for i, attempt in enumerate(dto.attempts):
        session.add(
            Attempt(
                user_id=user_id,
                cardId=dto.id,
                attemptId=f"{dto.id}:{i}",
                **attempt.model_dump(),
            )
        )


# ── Rotas ────────────────────────────────────────────────────────────────────


@router.get("", response_model=list[CardDTO])
def list_cards(
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> list[CardDTO]:
    cards = session.exec(
        select(Card).where(Card.user_id == user_id).order_by(Card.seq)
    ).all()

    # Carrega options/attempts do usuário de uma vez e agrupa por card,
    # evitando uma query por card.
    options_por_card: dict[str, list[CardOption]] = {}
    for option in session.exec(select(CardOption).where(CardOption.user_id == user_id)):
        options_por_card.setdefault(option.cardId, []).append(option)

    attempts_por_card: dict[str, list[Attempt]] = {}
    for attempt in session.exec(select(Attempt).where(Attempt.user_id == user_id)):
        attempts_por_card.setdefault(attempt.cardId, []).append(attempt)

    return [
        _to_dto(card, options_por_card.get(card.id, []), attempts_por_card.get(card.id, []))
        for card in cards
    ]


@router.get("/{card_id}", response_model=CardDTO)
def get_card(
    card_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> CardDTO:
    card = session.get(Card, (user_id, card_id))
    if card is None:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' não encontrado.")

    options, attempts = _load_children(session, user_id, card_id)
    return _to_dto(card, options, attempts)


@router.post("", response_model=CardDTO)
def save_card(
    dto: CardDTO,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> CardDTO:
    existing = session.get(Card, (user_id, dto.id))

    if existing is not None:
        # Update: preserva createdAt e seq originais (semântica do frontend)
        existing.title = dto.title
        existing.question = dto.question
        existing.answer = dto.answer
        existing.tags = json.dumps(dto.tags)
        existing.state = dto.state
        existing.interval = dto.interval
        existing.easeFactor = dto.easeFactor
        existing.repetitions = dto.repetitions
        existing.updatedAt = dto.updatedAt
        existing.nextReviewDate = dto.nextReviewDate
        existing.traducao = dto.traducao
        existing.explanation = dto.explanation
        existing.tenYearOld = dto.tenYearOld
        session.add(existing)
        _delete_children(session, user_id, dto.id)
        card = existing
    else:
        # Insert: atribui o próximo seq do usuário (substitui a card_seq_counter)
        max_seq = max(
            (s for s in session.exec(select(Card.seq).where(Card.user_id == user_id)) if s),
            default=0,
        )
        card = Card(
            user_id=user_id,
            id=dto.id,
            seq=max_seq + 1,
            title=dto.title,
            question=dto.question,
            answer=dto.answer,
            tags=json.dumps(dto.tags),
            state=dto.state,
            interval=dto.interval,
            easeFactor=dto.easeFactor,
            repetitions=dto.repetitions,
            createdAt=dto.createdAt,
            updatedAt=dto.updatedAt,
            nextReviewDate=dto.nextReviewDate,
            traducao=dto.traducao,
            explanation=dto.explanation,
            tenYearOld=dto.tenYearOld,
        )
        session.add(card)

    _insert_children(session, user_id, dto)
    session.commit()
    session.refresh(card)

    options, attempts = _load_children(session, user_id, dto.id)
    return _to_dto(card, options, attempts)


@router.delete("/{card_id}", status_code=204)
def delete_card(
    card_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> Response:
    _delete_children(session, user_id, card_id)
    card = session.get(Card, (user_id, card_id))
    if card is not None:
        session.delete(card)
    session.commit()
    return Response(status_code=204)

"""Dependências compartilhadas pelas rotas."""

from fastapi import Header, Depends, HTTPException
from sqlmodel import Session, select
from database import Jornada, get_session


def get_user_id(x_user_id: str = Header(min_length=1)) -> str:
    """
    Extrai o usuário do header `X-User-Id` (obrigatório).

    O FastAPI converte o nome do parâmetro `x_user_id` para o header
    `X-User-Id` automaticamente. Sem o header, a requisição recebe 422.
    """
    return x_user_id


def validate_jornada_ownership(
    jornada_id: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> Jornada:
    """
    Valida que jornada pertence ao usuário autenticado.

    Returns jornada se válida, raises 404 caso contrário.
    """
    jornada = session.get(Jornada, (user_id, jornada_id))
    if not jornada:
        raise HTTPException(status_code=404, detail="Jornada não encontrada")
    return jornada

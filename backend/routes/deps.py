"""Dependências compartilhadas pelas rotas."""

from fastapi import Header


def get_user_id(x_user_id: str = Header(min_length=1)) -> str:
    """
    Extrai o usuário do header `X-User-Id` (obrigatório).

    O FastAPI converte o nome do parâmetro `x_user_id` para o header
    `X-User-Id` automaticamente. Sem o header, a requisição recebe 422.
    """
    return x_user_id

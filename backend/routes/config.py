"""
Rotas de configuração por usuário (app_config).

Cobrem o getConfig/setConfig do SqliteAdapter legado, usados pelas telas
Testa Resposta e Prepara Questões (ex.: chave LLM_QUERY_DEFAULT):
  - GET /config/{chave} → 404 se não existir (o frontend aplica seu default)
  - PUT /config/{chave} → upsert
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from database import AppConfig, get_session
from routes.deps import get_user_id

router = APIRouter(prefix="/config", tags=["config"])


class ConfigValorDTO(BaseModel):
    valor: str


class ConfigDTO(ConfigValorDTO):
    chave: str


@router.get("/{chave}", response_model=ConfigDTO)
def get_config(
    chave: str,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> ConfigDTO:
    config = session.get(AppConfig, (user_id, chave))
    if config is None:
        raise HTTPException(status_code=404, detail=f"Config '{chave}' não encontrada.")
    return ConfigDTO(chave=config.chave, valor=config.valor)


@router.put("/{chave}", response_model=ConfigDTO)
def set_config(
    chave: str,
    body: ConfigValorDTO,
    user_id: str = Depends(get_user_id),
    session: Session = Depends(get_session),
) -> ConfigDTO:
    config = session.get(AppConfig, (user_id, chave))
    if config is None:
        config = AppConfig(user_id=user_id, chave=chave, valor=body.valor)
    else:
        config.valor = body.valor
    session.add(config)
    session.commit()
    return ConfigDTO(chave=chave, valor=body.valor)

"""
API simples: recebe uma pergunta e devolve a resposta de um LLM (Claude ou DeepSeek),
usando LangChain como camada de integração.

Fluxo:
  1. Cliente manda POST /perguntar com {"pergunta": "...", "provedor": "claude"}
  2. Escolhemos o "chat model" do LangChain de acordo com o provedor
  3. Chamamos o modelo (llm.ainvoke) e devolvemos o texto da resposta
"""

import json
import logging
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_anthropic import ChatAnthropic
from langchain_deepseek import ChatDeepSeek

# ── Configuração de logging ────────────────────────────────────────────────

LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[
        logging.FileHandler(LOG_DIR / "server.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger("api")

# ── Carrega as variáveis do arquivo .env ────────────────────────────────────
load_dotenv()

# Instrui o modelo a responder só com o texto da alternativa correta,
# sem explicação, justificativa ou qualquer texto adicional.
SYSTEM_PROMPT = (
    "A pergunta a seguir é de múltipla escolha, com alternativas no formato "
    "'[ ] LETRA - texto'. Responda copiando a linha INTEIRA da alternativa correta, "
    "exatamente como aparece na pergunta — incluindo o marcador '[ ]', a letra e o hífen. "
    "Não inclua explicação, justificativa, markdown ou qualquer texto adicional além dessa linha."
)

app = FastAPI(
    title="Pergunta e Resposta com LLM",
    description="Backend didático: recebe uma pergunta e responde via Claude ou DeepSeek (LangChain).",
)

# Libera CORS para o Angular em http://localhost:4200
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ── Middleware de logging de requests e responses ──────────────────────────


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Loga toda requisição recebida e a resposta devolvida."""
    # ── Request ────────────────────────────────────────────────────────────
    start_time = time.time()
    body = None
    if request.method in ("POST", "PUT", "PATCH"):
        try:
            body = await request.json()
        except Exception:
            body = "(corpo não-JSON)"

    client_host = request.client.host if request.client else "desconhecido"
    logger.info(
        ">> REQUEST  %s %s | client=%s | body=%s",
        request.method,
        request.url.path,
        client_host,
        json.dumps(body, ensure_ascii=False) if body else "-",
    )

    # ── Response ───────────────────────────────────────────────────────────
    response = await call_next(request)

    elapsed = time.time() - start_time
    status_code = response.status_code

    logger.info(
        "<< RESPONSE %s %s | status=%d | duration=%.3fs",
        request.method,
        request.url.path,
        status_code,
        elapsed,
    )

    return response


# ── Evento de startup ──────────────────────────────────────────────────────


@app.on_event("startup")
async def log_startup():
    logger.info("=" * 60)
    logger.info("SERVIDOR INICIADO")
    logger.info("FastAPI app: %s", app.title)
    logger.info("LOG_DIR: %s", LOG_DIR)
    logger.info("=" * 60)


# --- Modelos de dados (o "formato" que a API aceita e devolve) ---

class PerguntaRequest(BaseModel):
    pergunta: str
    provedor: str = "claude"  # "claude" ou "deepseek"


class RespostaResponse(BaseModel):
    resposta: str
    provedor: str
    modelo: str


# --- Escolha do LLM ---

def criar_llm(provedor: str) -> tuple[ChatAnthropic | ChatDeepSeek, str]:
    """Instancia o chat model do LangChain de acordo com o provedor escolhido."""
    if provedor == "claude":
        modelo = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8")
        return ChatAnthropic(model=modelo), modelo

    if provedor == "deepseek":
        modelo = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        return ChatDeepSeek(model=modelo), modelo

    raise HTTPException(
        status_code=400,
        detail=f"Provedor '{provedor}' desconhecido. Use 'claude' ou 'deepseek'.",
    )


# --- Rotas ---

@app.get("/")
async def raiz():
    return {
        "status": "ok",
        "mensagem": "Envie um POST para /perguntar com {'pergunta': '...', 'provedor': 'claude'}",
    }


@app.post("/perguntar", response_model=RespostaResponse)
async def perguntar(request: PerguntaRequest) -> RespostaResponse:
    if not request.pergunta.strip():
        raise HTTPException(status_code=400, detail="A pergunta não pode estar vazia.")

    llm, modelo = criar_llm(request.provedor)

    logger.info(
        "LLM REQUEST  | provedor=%s | modelo=%s | pergunta_len=%d",
        request.provedor,
        modelo,
        len(request.pergunta),
    )

    resposta = await llm.ainvoke(
        [
            ("system", SYSTEM_PROMPT),
            ("human", request.pergunta),
        ]
    )

    logger.info(
        "LLM RESPONSE | provedor=%s | modelo=%s | resposta_len=%d | resposta=%s",
        request.provedor,
        modelo,
        len(resposta.content),
        resposta.content[:200] + ("..." if len(resposta.content) > 200 else ""),
    )

    return RespostaResponse(
        resposta=resposta.content,
        provedor=request.provedor,
        modelo=modelo,
    )

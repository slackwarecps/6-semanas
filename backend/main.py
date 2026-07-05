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
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_anthropic import ChatAnthropic
from langchain_deepseek import ChatDeepSeek

from database import DB_PATH, create_db_and_tables
from routes.cards import router as cards_router
from routes.config import router as config_router
from routes.jornadas import router as jornadas_router

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

SYSTEM_PROMPT = (
    "Você receberá uma pergunta de múltipla escolha com alternativas no formato "
    "'[ ] LETRA - texto'. Sua tarefa é:\n"
    "1) analisar a pergunta e todas as alternativas;\n"
    "2) traduzir fielmente a pergunta e as alternativas para português do Brasil;\n"
    "3) explicar de forma didática para um adulto tech lead, deixando claro por que "
    "a resposta correta é a melhor escolha e por que as demais estão erradas;\n"
    "4) explicar de forma didática para uma criança de 10 anos;\n"
    "5) indicar claramente qual é a alternativa correta.\n\n"
    "O conteúdo da tradução deve preservar o sentido original, sem inventar informação. "
    "A explicação deve ser objetiva, técnica e pedagógica."
)

app = FastAPI(
    title="Pergunta e Resposta com LLM",
    description="Backend didático: recebe uma pergunta e responde via Claude ou DeepSeek (LangChain).",
)

# Libera CORS para o Angular em http://localhost:4200
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-User-Id"],
)

app.include_router(cards_router)
app.include_router(config_router)
app.include_router(jornadas_router)


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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Intercepta exceções globais, logando erro e traceback no logs/server.log"""
    logger.error("Exceção não tratada na rota %s: %s", request.url.path, str(exc), exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Verifique os logs."},
    )


# ── Evento de startup ──────────────────────────────────────────────────────


@app.on_event("startup")
async def log_startup():
    create_db_and_tables()
    logger.info("=" * 60)
    logger.info("SERVIDOR INICIADO")
    logger.info("FastAPI app: %s", app.title)
    logger.info("LOG_DIR: %s", LOG_DIR)
    logger.info("DATABASE: %s", DB_PATH)
    logger.info("=" * 60)


# --- Modelos de dados (o "formato" que a API aceita e devolve) ---

class PerguntaRequest(BaseModel):
    pergunta: str
    provedor: str = "claude"  # "claude" ou "deepseek"


class RespostaResponse(BaseModel):
    resposta: str
    explicacao: str
    explicacaoCrianca: str
    provedor: str
    modelo: str


# Schema usado apenas para a saída estruturada do LLM (with_structured_output).
class RespostaEstruturada(BaseModel):
    resposta: str = Field(
        description="A alternativa correta, identificada de forma clara, preferencialmente "
        "copiada exatamente como aparece na pergunta."
    )
    explicacao: str = Field(
        default="",
        description="Conteúdo combinado no formato:\n"
        "{traducao}\n---\n{explicacao}\n\n"
        "A primeira parte deve ser a tradução fiel para pt-BR da pergunta e alternativas. "
        "A segunda parte deve ser a explicação didática para um adulto tech lead, analisando "
        "a resposta correta e detalhando as alternativas incorretas."
    )
    explicacaoCrianca: str = Field(
        default="",
        description="A mesma explicação, reescrita de forma simples, como se "
        "estivesse explicando para uma criança de 10 anos."
    )


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

    structured_llm = llm.with_structured_output(RespostaEstruturada)
    resultado: RespostaEstruturada = await structured_llm.ainvoke(
        [
            ("system", SYSTEM_PROMPT),
            ("human", request.pergunta),
        ]
    )

    def _truncar(texto: str, tamanho: int = 200) -> str:
        return texto[:tamanho] + ("..." if len(texto) > tamanho else "")

    logger.info(
        "LLM RESPONSE | provedor=%s | modelo=%s | resposta_len=%d | resposta=%s | "
        "explicacao_len=%d | explicacao=%s | explicacaoCrianca_len=%d | explicacaoCrianca=%s",
        request.provedor,
        modelo,
        len(resultado.resposta),
        _truncar(resultado.resposta),
        len(resultado.explicacao),
        _truncar(resultado.explicacao),
        len(resultado.explicacaoCrianca),
        _truncar(resultado.explicacaoCrianca),
    )

    return RespostaResponse(
        resposta=resultado.resposta,
        explicacao=resultado.explicacao,
        explicacaoCrianca=resultado.explicacaoCrianca,
        provedor=request.provedor,
        modelo=modelo,
    )

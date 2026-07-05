"""
Restore do backup legado (Fase 5 da migração SQLite → backend).

Lê o arquivo .sqlite exportado pela tela "Backup / Restore" do frontend
(o banco sql.js que vivia em base64 no localStorage do navegador) e insere
todos os registros no banco do backend (database.sqlite), amarrados ao
user_id escolhido — preservando na íntegra o histórico de tentativas, tags
e as explicações geradas por IA (explanation/tenYearOld/traducao), evitando
regastar tokens de LLM.

Uso:
    python restore_backup.py <caminho/do/backup.sqlite> --user fabao [--dry-run]

O restore é idempotente: registros já existentes (mesma chave user_id+id)
são sobrescritos, não duplicados.
"""

import argparse
import sqlite3
import sys
from pathlib import Path

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
    create_db_and_tables,
    engine,
)


def _rows(legacy: sqlite3.Connection, table: str) -> list[sqlite3.Row]:
    """Lê todas as linhas de uma tabela do backup; tabela ausente vira lista vazia."""
    try:
        return legacy.execute(f"SELECT * FROM {table}").fetchall()
    except sqlite3.OperationalError:
        print(f"  ⚠ tabela '{table}' não existe no backup — ignorando")
        return []


def _get(row: sqlite3.Row, col: str, default=None):
    """Acesso tolerante a colunas que podem não existir em backups antigos."""
    try:
        value = row[col]
    except (IndexError, KeyError):
        return default
    return value if value is not None else default


def restore(backup_path: Path, user_id: str, dry_run: bool = False) -> dict[str, int]:
    legacy = sqlite3.connect(f"file:{backup_path}?mode=ro", uri=True)
    legacy.row_factory = sqlite3.Row

    counts: dict[str, int] = {}
    create_db_and_tables()

    with Session(engine) as session:
        # ── cards ────────────────────────────────────────────────────────────
        cards = _rows(legacy, "cards")
        explicacoes_preservadas = 0
        for r in cards:
            if _get(r, "explanation") or _get(r, "tenYearOld") or _get(r, "traducao"):
                explicacoes_preservadas += 1
            session.merge(
                Card(
                    user_id=user_id,
                    id=r["id"],
                    seq=_get(r, "seq"),
                    title=r["title"],
                    question=r["question"],
                    answer=r["answer"],
                    tags=_get(r, "tags", "[]"),
                    state=r["state"],
                    interval=r["interval"],
                    easeFactor=r["easeFactor"],
                    repetitions=r["repetitions"],
                    createdAt=r["createdAt"],
                    updatedAt=r["updatedAt"],
                    nextReviewDate=r["nextReviewDate"],
                    traducao=_get(r, "traducao"),
                    explanation=_get(r, "explanation"),
                    tenYearOld=_get(r, "tenYearOld"),
                )
            )
        counts["cards"] = len(cards)
        counts["cards com explicação IA"] = explicacoes_preservadas

        # ── card_options (legado: coluna 'id' é o id do card) ────────────────
        options = _rows(legacy, "card_options")
        for r in options:
            session.merge(
                CardOption(
                    user_id=user_id,
                    cardId=r["id"],
                    optionId=r["optionId"],
                    text=r["text"],
                    isCorrect=bool(r["isCorrect"]),
                    optionOrder=r["optionOrder"],
                )
            )
        counts["card_options"] = len(options)

        # ── attempts (legado: coluna 'id' é o id do card) ────────────────────
        attempts = _rows(legacy, "attempts")
        for r in attempts:
            session.merge(
                Attempt(
                    user_id=user_id,
                    cardId=r["id"],
                    attemptId=r["attemptId"],
                    timestamp=r["timestamp"],
                    quality=r["quality"],
                    elapsedTime=r["elapsedTime"],
                    wasCorrect=bool(r["wasCorrect"]),
                    userAnswer=_get(r, "userAnswer"),
                    easeFactorBefore=r["easeFactorBefore"],
                    easeFactorAfter=r["easeFactorAfter"],
                    intervalBefore=r["intervalBefore"],
                    intervalAfter=r["intervalAfter"],
                )
            )
        counts["attempts"] = len(attempts)

        # ── jornadas ─────────────────────────────────────────────────────────
        jornadas = _rows(legacy, "jornadas")
        for r in jornadas:
            session.merge(
                Jornada(
                    user_id=user_id,
                    id=r["id"],
                    nome=r["nome"],
                    ativa=bool(r["ativa"]),
                    ordem=r["ordem"],
                    createdAt=r["createdAt"],
                    updatedAt=r["updatedAt"],
                )
            )
        counts["jornadas"] = len(jornadas)

        perguntas = _rows(legacy, "jornada_perguntas")
        for r in perguntas:
            session.merge(
                JornadaPergunta(
                    user_id=user_id,
                    jornadaId=r["jornadaId"],
                    cardId=r["cardId"],
                    ordem=r["ordem"],
                )
            )
        counts["jornada_perguntas"] = len(perguntas)

        progressos = _rows(legacy, "jornada_progresso")
        for r in progressos:
            session.merge(
                JornadaProgresso(
                    user_id=user_id,
                    jornadaId=r["jornadaId"],
                    status=r["status"],
                    bestErrors=_get(r, "bestErrors"),
                    completedAt=_get(r, "completedAt"),
                    currentQuestionIndex=_get(r, "currentQuestionIndex", 0),
                    currentErrors=_get(r, "currentErrors", 0),
                    currentLives=_get(r, "currentLives", 3),
                    lastActiveAt=_get(r, "lastActiveAt"),
                    bestTime=_get(r, "bestTime"),
                )
            )
        counts["jornada_progresso"] = len(progressos)

        # ── learn_stats (legado: singleton id=1 → por usuário) ───────────────
        stats = _rows(legacy, "learn_stats")
        if stats:
            session.merge(LearnStats(user_id=user_id, totalXp=stats[0]["totalXp"]))
            counts["learn_stats (totalXp)"] = stats[0]["totalXp"]

        # ── app_config ───────────────────────────────────────────────────────
        configs = _rows(legacy, "app_config")
        for r in configs:
            session.merge(AppConfig(user_id=user_id, chave=r["chave"], valor=r["valor"]))
        counts["app_config"] = len(configs)

        if dry_run:
            session.rollback()
            print("\n🧪 DRY-RUN: nada foi gravado.")
        else:
            session.commit()

    legacy.close()
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description="Restaura um backup legado no banco do backend.")
    parser.add_argument("backup", type=Path, help="Arquivo .sqlite exportado pela tela Backup/Restore")
    parser.add_argument("--user", required=True, help="user_id que receberá os dados (ex: fabao)")
    parser.add_argument("--dry-run", action="store_true", help="Só conta os registros, sem gravar")
    args = parser.parse_args()

    if not args.backup.exists():
        print(f"❌ Arquivo não encontrado: {args.backup}")
        sys.exit(1)

    print(f"📦 Backup:  {args.backup}")
    print(f"👤 Usuário: {args.user}\n")

    counts = restore(args.backup, args.user, dry_run=args.dry_run)

    print("\n✅ Resumo do restore:")
    for tabela, total in counts.items():
        print(f"  {tabela}: {total}")


if __name__ == "__main__":
    main()

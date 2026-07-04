#!/usr/bin/env python3
"""
Scrape perguntas do exame Claude Certified Architect (PT)
e gerar arquivos markdown no formato de flashcards do app.
"""

import json
import os
import re
import sys
import urllib.request
from pathlib import Path


# Mapa de domínio (número) para tag do app
DOMAIN_TAGS = {
    1: "Domain_1::Agentic_Architecture_Orchestration",
    2: "Domain_2::Tool_Design_MCP_Integration",
    3: "Domain_3::Claude_Code_Configuration_Workflows",
    4: "Domain_4::Prompt_Engineering_Structured_Output",
    5: "Domain_5::Context_Management_Reliability",
}


def fetch_html(url: str) -> str:
    """Baixa o HTML da página."""
    print(f"Fazendo fetch de {url}...")
    with urllib.request.urlopen(url) as response:
        return response.read().decode("utf-8")


def extract_questions(html: str) -> list[dict]:
    """Extrai o array QUESTIONS do HTML usando regex."""
    # Busca por "const QUESTIONS = [...];" (pode ter quebras de linha e espaços)
    pattern = r"const QUESTIONS = (\[.+?\]);\s*const DOMAINS"
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        raise ValueError("Não conseguiu achar 'const QUESTIONS' no HTML")

    questions_json = match.group(1)
    # Parse direto do JSON
    return json.loads(questions_json)


def sanitize_filename(text: str, max_length: int = 80) -> str:
    """Remove caracteres inválidos em filename e trunca."""
    # Remove caracteres inválidos para filesystem
    text = re.sub(r'[/\\:*?"<>|]', "", text)
    # Colapsa espaços múltiplos em um só
    text = re.sub(r"\s+", " ", text)
    # Trunca
    text = text[:max_length].strip()
    return text


def extract_title(question: dict) -> str:
    """
    Extrai o título da pergunta.
    Usa 'scenario' se existir; caso contrário, primeira frase de 'situation'.
    Se situation for null, usa primeira frase de 'question'.
    """
    if question.get("scenario"):
        return question["scenario"]

    # Fallback 1: primeira frase de 'situation'
    situation = question.get("situation")
    if situation:
        # Pega até o primeiro ponto
        match = re.match(r"([^.]+\.)", situation)
        if match:
            return match.group(1).strip()
        # Se não achar ponto, trunca em 80 chars
        return situation[:80].strip()

    # Fallback 2: primeira frase de 'question'
    q_text = question.get("question", "")
    if q_text:
        # Pega até o primeiro ponto ou interrogação
        match = re.match(r"([^.?]+[.?])", q_text)
        if match:
            return match.group(1).strip()
        return q_text[:80].strip()

    return "(Sem título)"


def should_skip_question_field(situation: str, question: str) -> bool:
    """
    Heurística: se o 'question' for essencialmente redundante com 'situation',
    pula incluí-lo no body. Verifica se a última frase de 'situation' já termina em '?'.
    Se situation for None, nunca pula.
    """
    if not situation:
        return False
    # Remove espaços em branco do fim
    situation_trimmed = situation.rstrip()
    # Se termina em '?', a pergunta já está em 'situation'
    return situation_trimmed.endswith("?")


def build_body(question: dict) -> str:
    """Monta o corpo da pergunta (entre bloco 1 e bloco 2 de ---)."""
    situation = question.get("situation")
    question_text = question.get("question", "")

    # Se não houver situation, usa question como body
    if not situation:
        return question_text or "(Sem descrição)"

    if should_skip_question_field(situation, question_text):
        return situation

    # Se não for redundante, inclui ambos com separação
    if question_text:
        return f"{situation}\n\n{question_text}"
    return situation


def build_options_block(question: dict) -> str:
    """Monta o bloco de opções (entre bloco 2 e bloco 3 de ---)."""
    lines = []
    for option in question.get("options", []):
        letter = option.get("letter", "?")
        text = option.get("text", "")
        # Sempre deixa desmarcado: [ ]
        lines.append(f"[ ] {letter} - {text}")
    return "\n".join(lines)


def build_markdown(question: dict) -> str:
    """Monta o arquivo markdown completo no formato do app."""
    title = extract_title(question)
    body = build_body(question)
    options = build_options_block(question)
    domain = question.get("domain", 1)
    tag = DOMAIN_TAGS.get(domain, "Domain_1::Agentic_Architecture_Orchestration")

    # Template exato conforme spec
    return f"""Title: {title}
---

{body}

---
{options}

---
Tags: {tag}
"""


def get_next_number(flashcards_dir: Path) -> int:
    """
    Escaneia flashcards_dir e retorna o próximo número (zero-padded).
    Ex: se existem 001.md...015.md, retorna 16.
    """
    existing = []
    if flashcards_dir.exists():
        for f in flashcards_dir.glob("*.md"):
            # Extrai o número do início do filename (ex: "001-algo.md" -> 1)
            match = re.match(r"^(\d{3})", f.name)
            if match:
                existing.append(int(match.group(1)))

    if existing:
        return max(existing) + 1
    return 1


def main():
    """Scrape e gera os flashcards."""
    # Paths
    project_root = Path(__file__).parent.parent
    flashcards_dir = project_root / "flashcards"

    # Fetch e parse
    html = fetch_html(
        "https://ravnhq.github.io/claude-certified-architect/practical/pt.html"
    )
    questions = extract_questions(html)
    print(f"Extraído {len(questions)} perguntas.")

    # Próximo número a usar
    start_num = get_next_number(flashcards_dir)
    print(f"Começando numeração em {start_num:03d}...")

    # Gera arquivo por pergunta
    created = 0
    errors = []

    for idx, question in enumerate(questions):
        try:
            num = start_num + idx
            # Monta markdown
            markdown = build_markdown(question)

            # Cria filename
            title = extract_title(question)
            slug = sanitize_filename(title)
            filename = f"{num:03d}-{slug}.md"
            filepath = flashcards_dir / filename

            # Escreve arquivo
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(markdown)
            created += 1

            if (idx + 1) % 20 == 0:
                print(f"  ... {idx + 1} / {len(questions)} criados")

        except Exception as e:
            errors.append((question.get("id", "?"), str(e)))

    # Resumo
    print(f"\nConcluído!")
    print(f"  Criados: {created} arquivos em {flashcards_dir}/")
    print(f"  Intervalo: {start_num:03d}-{start_num + len(questions) - 1:03d}")

    if errors:
        print(f"\nErros ({len(errors)}):")
        for qid, err in errors[:5]:
            print(f"  {qid}: {err}")
        if len(errors) > 5:
            print(f"  ... e {len(errors) - 5} mais")

    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())

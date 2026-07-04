#!/usr/bin/env python3
"""
Scrape perguntas do arquivo local (Desktop)
CCA-F — Questões Interativas (329 perguntas em inglês + explicações em português)
"""

import json
import os
import re
import sys
from pathlib import Path


# Mapa de domínio (em inglês) para tag do app
DOMAIN_MAPPING = {
    "Agentic Architecture": "Domain_1::Agentic_Architecture_Orchestration",
    "Claude Code Configuration": "Domain_3::Claude_Code_Configuration_Workflows",
    "MCP Integration": "Domain_2::Tool_Design_MCP_Integration",
    "Prompt Engineering": "Domain_4::Prompt_Engineering_Structured_Output",
    "Tool Design": "Domain_2::Tool_Design_MCP_Integration",
    "Review Patterns (CI-CD)": "Domain_5::Context_Management_Reliability",
}


def load_questions_from_html(file_path: str) -> list[dict]:
    """Lê o arquivo HTML local e extrai o JSON."""
    print(f"Lendo {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Busca por "const QUESTIONS = [...];"
    pattern = r"const QUESTIONS = (\[.+?\]);"
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        raise ValueError("Não conseguiu achar 'const QUESTIONS' no HTML")

    json_str = match.group(1)
    return json.loads(json_str)


def extract_title(question: dict) -> str:
    """
    Extrai título da pergunta.
    Usa primeira frase do stem (até ponto ou interrogação).
    """
    stem = question.get("stem", "")
    if not stem:
        return "(Sem título)"

    # Pega até o primeiro ponto ou interrogação
    match = re.match(r"([^.?]+[.?])", stem)
    if match:
        return match.group(1).strip()

    # Se não achar, trunca
    return stem[:80].strip()


def sanitize_filename(text: str, max_length: int = 80) -> str:
    """Remove caracteres inválidos em filename."""
    # Remove caracteres inválidos
    text = re.sub(r'[/\\:*?"<>|]', "", text)
    # Colapsa espaços múltiplos
    text = re.sub(r"\s+", " ", text)
    # Trunca
    text = text[:max_length].strip()
    return text


def build_markdown(question: dict) -> str:
    """Monta o arquivo markdown."""
    title = extract_title(question)
    stem = question.get("stem", "")
    explanation = question.get("explanation", "")

    # Monta o corpo: pergunta + explicação se houver
    body_parts = [stem]
    if explanation:
        body_parts.append(f"\n[Resposta correta: {explanation}]")
    body = "".join(body_parts)

    # Opções: converte de lista de strings para formato [ ] A - text
    options_text = []
    for idx, option_text in enumerate(question.get("options", [])):
        letter = chr(ord('A') + idx)  # A, B, C, D
        options_text.append(f"[ ] {letter} - {option_text}")
    options = "\n".join(options_text)

    # Domain
    domain_en = question.get("domain", "Agentic Architecture")
    tag = DOMAIN_MAPPING.get(domain_en, "Domain_1::Agentic_Architecture_Orchestration")

    # Template
    return f"""Title: {title}
---

{body}

---
{options}

---
Tags: {tag}
"""


def get_next_number(flashcards_dir: Path) -> int:
    """Escaneia flashcards_dir e retorna o próximo número."""
    existing = []
    if flashcards_dir.exists():
        for f in flashcards_dir.glob("*.md"):
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
    html_file = Path.home() / "Desktop" / "claude-cert" / "questoes-interativas" / "index.html"

    if not html_file.exists():
        print(f"❌ Arquivo não encontrado: {html_file}")
        return 1

    # Fetch e parse
    try:
        questions = load_questions_from_html(str(html_file))
    except Exception as e:
        print(f"❌ Erro ao extrair JSON: {e}")
        return 1

    print(f"✓ Extraído {len(questions)} perguntas")

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

            if (idx + 1) % 50 == 0:
                print(f"  ... {idx + 1} / {len(questions)} criados")

        except Exception as e:
            errors.append((question.get("stem", "?")[:50], str(e)))

    # Resumo
    print(f"\nConcluído!")
    print(f"  Criados: {created} arquivos em {flashcards_dir}/")
    print(f"  Intervalo: {start_num:03d}-{start_num + len(questions) - 1:03d}")

    if errors:
        print(f"\nErros ({len(errors)}):")
        for stem, err in errors[:5]:
            print(f"  {stem}: {err}")
        if len(errors) > 5:
            print(f"  ... e {len(errors) - 5} mais")

    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())

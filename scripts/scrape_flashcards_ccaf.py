#!/usr/bin/env python3
"""
Scrape perguntas do site https://ccaf-anthropic.netlify.app/
120 questões em português com análises detalhadas
"""

import html
import json
import os
import re
import sys
import urllib.request
from pathlib import Path


# Mapa de domínios (classes CSS) para tags do app
DOMAIN_MAPPING = {
    "dom-mcp": "Domain_2::Tool_Design_MCP_Integration",
    "dom-ctx": "Domain_5::Context_Management_Reliability",
    "dom-cc": "Domain_3::Claude_Code_Configuration_Workflows",
    "dom-ag": "Domain_1::Agentic_Architecture_Orchestration",
    "dom-pe": "Domain_4::Prompt_Engineering_Structured_Output",
}


def fetch_html(url: str) -> str:
    """Baixa o HTML da página."""
    print(f"Fazendo fetch de {url}...")
    with urllib.request.urlopen(url) as response:
        return response.read().decode("utf-8")


def extract_questions_from_html(html_content: str) -> list[dict]:
    """
    Faz parsing do HTML para extrair as questões.
    Cada questão está em um <article class="card" id="qX">...</article>
    """
    questions = []

    # Procura por cada card (article, não div)
    card_pattern = r'<article class="card"[^>]*id="q(\d+)"[^>]*>(.*?)</article>'
    matches = re.finditer(card_pattern, html_content, re.DOTALL)

    for match in matches:
        qid = match.group(1)
        card_content = match.group(2)

        try:
            question = parse_card(qid, card_content)
            if question:
                questions.append(question)
        except Exception as e:
            print(f"  ⚠️ Erro ao parsear q{qid}: {str(e)[:60]}", file=sys.stderr)

    return questions


def parse_card(qid: str, content: str) -> dict | None:
    """Parse de um card individual."""
    # Extrai domínio do elemento span
    domain_match = re.search(r'<span class="domain dom-(mcp|ctx|cc|ag|pe)"', content)
    domain_class = f"dom-{domain_match.group(1)}" if domain_match else "dom-ag"

    # Extrai stem (pergunta)
    stem_match = re.search(r'<div class="stem"[^>]*>(.*?)</div>', content, re.DOTALL)
    stem = stem_match.group(1) if stem_match else ""
    # Remove tags HTML mas mantém o texto
    stem = re.sub(r'<[^>]+>', ' ', stem).strip()
    stem = re.sub(r'\s+', ' ', stem)

    if not stem:
        return None

    # Extrai opções
    options = []
    opt_pattern = r'<li class="opt([^"]*)"[^>]*data-letter="([A-D])"[^>]*>(.*?)</li>'
    for opt_match in re.finditer(opt_pattern, content, re.DOTALL):
        opt_full = opt_match.group(0)  # A tag completa
        letter = opt_match.group(2)
        opt_html = opt_match.group(3)

        # Texto da opção
        text_match = re.search(r'<span class="opt-text"[^>]*>(.*?)</span>', opt_html, re.DOTALL)
        text = text_match.group(1) if text_match else ""
        text = re.sub(r'<[^>]+>', ' ', text).strip()
        text = re.sub(r'\s+', ' ', text)

        # Verifica se é correta (procura por "opt-correct" na tag completa)
        is_correct = 'opt-correct' in opt_full

        if text:
            options.append({
                'letter': letter,
                'text': text,
                'isCorrect': is_correct
            })

    if len(options) != 4:
        return None

    # Extrai explicação (command + constraint + reason)
    explanation_parts = []

    # Command (o que a pergunta pede)
    command_match = re.search(
        r'<div class="step step-command"[^>]*>.*?<p>(.*?)</p>',
        content,
        re.DOTALL
    )
    if command_match:
        command_html = command_match.group(1)
        command_text = re.sub(r'<[^>]+>', ' ', command_html).strip()
        command_text = re.sub(r'\s+', ' ', command_text)
        if command_text:
            explanation_parts.append(f"O que a pergunta pede: {command_text}")

    # Constraint (pegadinha)
    constraint_match = re.search(
        r'<div class="step step-constraint"[^>]*>.*?<p>(.*?)</p>',
        content,
        re.DOTALL
    )
    if constraint_match:
        constraint_html = constraint_match.group(1)
        constraint_text = re.sub(r'<[^>]+>', ' ', constraint_html).strip()
        constraint_text = re.sub(r'\s+', ' ', constraint_text)
        if constraint_text:
            explanation_parts.append(f"A pegadinha: {constraint_text}")

    # Reason (raciocínio)
    reason_match = re.search(
        r'<div class="step step-reason"[^>]*>.*?<p>(.*?)</p>',
        content,
        re.DOTALL
    )
    if reason_match:
        reason_html = reason_match.group(1)
        reason_text = re.sub(r'<[^>]+>', ' ', reason_html).strip()
        reason_text = re.sub(r'\s+', ' ', reason_text)
        if reason_text:
            explanation_parts.append(f"Raciocínio: {reason_text}")

    explanation = "\n\n".join(explanation_parts) if explanation_parts else ""

    return {
        'id': f'ccaf-{qid}',
        'domain': domain_class,
        'stem': stem,
        'options': options,
        'explanation': explanation
    }


def extract_title(question: dict) -> str:
    """Extrai título da pergunta (primeira frase do stem)."""
    stem = question.get('stem', '')
    if not stem:
        return "(Sem título)"

    # Pega até o primeiro ponto ou interrogação
    match = re.match(r'([^.?]+[.?])', stem)
    if match:
        return match.group(1).strip()

    # Se não achar, trunca
    return stem[:80].strip()


def sanitize_filename(text: str, max_length: int = 80) -> str:
    """Remove caracteres inválidos em filename."""
    text = re.sub(r'[/\\:*?"<>|]', "", text)
    text = re.sub(r"\s+", " ", text)
    text = text[:max_length].strip()
    return text


def build_markdown(question: dict) -> str:
    """Monta o arquivo markdown."""
    title = extract_title(question)
    stem = question.get('stem', '')
    explanation = question.get('explanation', '')

    # Corpo: stem + explicação
    body_parts = [stem]
    if explanation:
        body_parts.append(f"\n{explanation}")
    body = "".join(body_parts)

    # Opções
    options_text = []
    for opt in question.get('options', []):
        letter = opt.get('letter', '?')
        text = opt.get('text', '')
        options_text.append(f"[ ] {letter} - {text}")
    options = "\n".join(options_text)

    # Domain
    domain_class = question.get('domain', 'dom-ag')
    tag = DOMAIN_MAPPING.get(domain_class, "Domain_1::Agentic_Architecture_Orchestration")

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
    project_root = Path(__file__).parent.parent
    flashcards_dir = project_root / "flashcards"

    # Fetch
    try:
        html_content = fetch_html("https://ccaf-anthropic.netlify.app/")
    except Exception as e:
        print(f"❌ Erro ao fazer fetch: {e}")
        return 1

    # Parse
    try:
        questions = extract_questions_from_html(html_content)
    except Exception as e:
        print(f"❌ Erro ao extrair JSON: {e}")
        return 1

    print(f"✓ Extraído {len(questions)} perguntas")

    # Próximo número
    start_num = get_next_number(flashcards_dir)
    print(f"Começando numeração em {start_num:03d}...")

    # Gera arquivos
    created = 0
    errors = []

    for idx, question in enumerate(questions):
        try:
            num = start_num + idx
            markdown = build_markdown(question)

            title = extract_title(question)
            slug = sanitize_filename(title)
            filename = f"{num:03d}-{slug}.md"
            filepath = flashcards_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(markdown)
            created += 1

            if (idx + 1) % 30 == 0:
                print(f"  ... {idx + 1} / {len(questions)} criados")

        except Exception as e:
            errors.append((question.get('id', '?'), str(e)))

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

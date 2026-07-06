---
name: auditoria-flashcards
user-invocable: true
description: Audita os flashcards em public/flashcards/ (contagens, tags, cards sem metadata, inconsistências) e devolve só o relatório final, rodando em contexto isolado (fork) e somente leitura.
context: fork
allowed-tools: Read, Glob, Grep
---

# Skill: Auditoria dos flashcards (read-only, contexto isolado)

Você está rodando num **contexto isolado (fork)**: suas leituras intermediárias
não aparecem na conversa principal. Faça a varredura completa e devolva
**APENAS o relatório final em markdown** como sua última mensagem.

## Passos

1. Com Glob, liste `public/flashcards/*.md` e conte o total de cards.
   Os arquivos seguem o padrão `NNN-titulo.md` (ex.: `001-...md`).
2. Leia `public/flashcards-metadata.json` e cruze com a lista de arquivos:
   - cards `.md` sem entrada no metadata;
   - entradas de metadata órfãs (sem arquivo `.md` correspondente).
3. Com Grep, levante:
   - a distribuição de tags (linhas de tags nos `.md`) — top 10;
   - cards sem alternativas de múltipla escolha (arquivos sem linhas `[ ]`).
4. Monte o relatório final:

```
# 📋 Auditoria dos Flashcards

- Total de cards: N
- Cards com metadata: N | sem metadata: N
- Metadata órfã: N
- Cards sem alternativas: N

## Top 10 tags
| Tag | Cards |
|-----|-------|

## ⚠️ Problemas
(lista de IDs inconsistentes, ou "Nenhum problema encontrado.")
```

## Restrições

- **Somente leitura.** Você só tem `Read`, `Glob` e `Grep` — não tente
  escrever arquivos, rodar comandos shell ou modificar qualquer coisa.
  Se o usuário pedir para salvar o relatório, informe que esta skill é
  read-only por design e sugira que a conversa principal salve o texto.
- Não despeje conteúdo bruto dos arquivos no relatório — só agregados e IDs.

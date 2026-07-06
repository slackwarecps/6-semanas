---
name: auditoria-flashcards
user-invocable: true
description: Audita os flashcards na pasta public/flashcards/ contra os registros no banco SQLite (backend/database.sqlite) para encontrar inconsistências, distribuir tags e gerar relatório final, rodando em contexto isolado (fork).
context: fork
allowed-tools: Read, Glob, Grep, run_command
---

# Skill: Auditoria dos flashcards (cruzamento com SQLite)

Você está rodando num **contexto isolado (fork)**. Faça a varredura completa, consulte o banco de dados e devolva **APENAS o relatório final em markdown** como sua última mensagem.

## Passos

1. **Arquivos locais:** Com Glob, liste os arquivos `public/flashcards/*.md`. Cada arquivo segue o padrão `NNN-titulo.md` (ex.: `001-Otimizar...md`). Extraia o prefixo numérico como o sequencial do card (ex: `001` -> `seq = 1`).
2. **Consulta SQLite:** Usando a ferramenta `run_command`, faça uma consulta no banco `backend/database.sqlite` na tabela `cards` para obter as colunas `seq`, `id`, `title` e `tags` de todos os cartões cadastrados para o usuário:
   ```bash
   sqlite3 backend/database.sqlite "SELECT seq, id, title, tags FROM cards ORDER BY seq;"
   ```
3. **Cruzamento de Dados:**
   - Identifique arquivos `.md` na pasta que **não possuem** um registro correspondente no banco de dados SQLite (comparando o sequencial extraído do nome do arquivo com a coluna `seq` ou título).
   - Identifique registros no banco de dados SQLite que **não possuem** um arquivo `.md` correspondente na pasta `public/flashcards/`.
4. **Levantamento de Metadados:**
   - Calcule a distribuição de tags (usando Grep nos arquivos `.md` ou puxando os dados consolidados da coluna `tags` do SQLite) — liste o top 10.
   - Identifique cartões sem alternativas de múltipla escolha (arquivos `.md` que não contêm linhas com `[ ]`).
5. **Relatório final:**
   Monte e envie exatamente a estrutura abaixo na sua resposta:

```markdown
# 📋 Auditoria dos Flashcards (SQLite vs Pasta)

- Total de arquivos .md: N
- Total de registros no SQLite: N
- Cards no SQLite órfãos (sem arquivo .md): N
- Arquivos .md órfãos (sem registro no SQLite): N
- Cards sem alternativas: N

## Top 10 tags
| Tag | Cards |
|-----|-------|

## ⚠️ Problemas
(Lista de inconsistências de IDs, arquivos órfãos, registros órfãos ou "Nenhum problema encontrado.")
```

## Restrições

- **Somente leitura no banco:** Embora você tenha `run_command`, utilize-o apenas para comandos de consulta (`SELECT`). Não modifique as tabelas.
- Não despeje conteúdo bruto dos arquivos no relatório — apenas os consolidados e listas de problemas.

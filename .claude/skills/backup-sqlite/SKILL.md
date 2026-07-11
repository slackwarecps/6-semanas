---
name: backup-sqlite
user-invocable: true
description: Faz backup completo do banco de dados SQLite em formato SQL com timestamp
context: default
allowed-tools: Bash
---

# Skill: Backup SQLite

Cria um backup completo do banco de dados SQLite com nome padronizado incluindo data e hora.

## Instruções

Execute o script bash que faz o backup do banco de dados. O script:

1. Verifica a existência do banco `backend/database.sqlite`
2. Cria o diretório `backend/backups/` se não existir
3. Executa dump do SQLite usando `.dump` para gerar SQL
4. Nomeia o arquivo com padrão: `backup-servidor-DD-MM-YYYY-HHMM.sql`
   - DD = dia (01-31)
   - MM = mês (01-12)
   - YYYY = ano (4 dígitos)
   - HHMM = hora:minuto (00-23 para hora, 00-59 para minuto)
5. Exibe resultado com tamanho do arquivo e caminho completo

## Saída esperada

```
✅ Backup criado com sucesso!
📁 Arquivo: backup-servidor-DD-MM-YYYY-HHMM.sql
📊 Tamanho: X.XX MB
📍 Caminho: /caminho/completo/backend/backups/backup-servidor-DD-MM-YYYY-HHMM.sql
```

## Como usar

O skill executa automaticamente o script `.claude/scripts/backup-sqlite.sh` que realiza o backup completo do banco de dados SQLite.

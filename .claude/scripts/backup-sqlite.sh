#!/bin/bash

# Backup SQLite Script
# Cria backup do banco de dados com timestamp DD-MM-YYYY-HHMM

# Define o diretório de trabalho
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKUPS_DIR="$BACKEND_DIR/backups"
DB_FILE="$BACKEND_DIR/database.sqlite"

# Verifica se o banco existe
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Erro: Banco de dados não encontrado em $DB_FILE"
    exit 1
fi

# Cria o diretório de backups se não existir
mkdir -p "$BACKUPS_DIR"

# Gera o nome do arquivo com data e hora no formato DD-MM-YYYY-HHMM
TIMESTAMP=$(date +"%d-%m-%Y-%H%M")
BACKUP_FILE="$BACKUPS_DIR/backup-servidor-${TIMESTAMP}.sql"

# Executa o dump do SQLite
if sqlite3 "$DB_FILE" ".dump" > "$BACKUP_FILE"; then
    # Calcula o tamanho em MB
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

    echo "✅ Backup criado com sucesso!"
    echo "📁 Arquivo: backup-servidor-${TIMESTAMP}.sql"
    echo "📊 Tamanho: $SIZE"
    echo "📍 Caminho: $BACKUP_FILE"
else
    echo "❌ Erro ao criar o backup"
    exit 1
fi

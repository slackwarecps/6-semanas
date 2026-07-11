#!/usr/bin/env python3
"""
Script de backup para SQLite do projeto
Cria um arquivo SQL com backup completo do banco de dados
"""

import sqlite3
import subprocess
from pathlib import Path
from datetime import datetime
import sys

def backup_sqlite():
    """Faz backup do banco de dados SQLite"""

    # Caminhos
    project_root = Path(__file__).parent.parent.parent
    db_path = project_root / "backend" / "database.sqlite"
    backups_dir = project_root / "backend" / "backups"

    # Verifica se o banco existe
    if not db_path.exists():
        print(f"❌ Erro: Banco de dados não encontrado em {db_path}")
        sys.exit(1)

    # Cria diretório de backups se não existir
    backups_dir.mkdir(exist_ok=True)

    # Gera nome do arquivo com timestamp
    now = datetime.now()
    timestamp = now.strftime("%d-%m-%Y-%H%M%S")
    backup_file = backups_dir / f"backup-servidor-{timestamp}.sql"

    try:
        # Conecta ao banco e faz dump SQL
        conn = sqlite3.connect(db_path)
        with open(backup_file, 'w') as f:
            for line in conn.iterdump():
                f.write(f"{line}\n")
        conn.close()

        # Obtém tamanho do arquivo
        size_mb = backup_file.stat().st_size / (1024 * 1024)

        print(f"✅ Backup criado com sucesso!")
        print(f"📁 Arquivo: {backup_file.name}")
        print(f"📊 Tamanho: {size_mb:.2f} MB")
        print(f"📍 Caminho: {backup_file}")

        return 0

    except Exception as e:
        print(f"❌ Erro ao criar backup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    backup_sqlite()

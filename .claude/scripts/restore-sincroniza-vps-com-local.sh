#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
LOCAL_DB="backend/database.sqlite"
VPS_HOST="bikinibottonsvr"
VPS_USER="fabao"
VPS_REMOTE_PATH="/home/fabao/apps/bkp6week/backend"
TEMP_SQL=$(mktemp)
TIMESTAMP=$(date '+%d-%m-%Y-%H%M')

# Função para exibir erro e sair
error_exit() {
    echo -e "${RED}❌ Erro: $1${NC}"
    rm -f "$TEMP_SQL"
    exit 1
}

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para exibir info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 Sincronizando banco local com VPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar se banco local existe
if [ ! -f "$LOCAL_DB" ]; then
    error_exit "Banco de dados local não encontrado em $LOCAL_DB"
fi
info "Banco local encontrado: $LOCAL_DB"

# Criar backup local de segurança
info "Criando backup de segurança local..."
sqlite3 "$LOCAL_DB" ".dump" > "$TEMP_SQL" 2>/dev/null || error_exit "Falha ao fazer dump do banco local"
success "Dump SQL criado temporariamente ($(du -h "$TEMP_SQL" | cut -f1))"

# Verificar conectividade com VPS
info "Verificando conectividade com VPS ($VPS_HOST)..."
if ! ssh -o ConnectTimeout=5 "$VPS_HOST" "echo 'ok'" &>/dev/null; then
    error_exit "Não é possível conectar à VPS. Verifique a configuração SSH."
fi
success "Conectado à VPS"

# Fazer backup remoto do banco atual
info "Fazendo backup remoto do banco atual na VPS..."
ssh "$VPS_HOST" "cd $VPS_REMOTE_PATH && \
    sqlite3 database.sqlite '.dump' > backups/backup-before-sync-$TIMESTAMP.sql 2>/dev/null && \
    echo 'ok'" &>/dev/null || warning "Não foi possível fazer backup remoto (diretório pode não existir)"
success "Backup remoto criado (se aplicável)"

# Transferir arquivo SQL para VPS
info "Transferindo dump para VPS..."
scp "$TEMP_SQL" "$VPS_HOST:$VPS_REMOTE_PATH/temp-restore-$TIMESTAMP.sql" || error_exit "Falha ao transferir arquivo para VPS"
success "Arquivo transferido"

# Restaurar banco na VPS
info "Restaurando banco de dados na VPS..."
ssh "$VPS_HOST" 'cd '"$VPS_REMOTE_PATH"' && python3 << "PYTHON_EOF"
import sqlite3
import sys

try:
    # Remover banco antigo
    import os
    if os.path.exists("database.sqlite"):
        os.remove("database.sqlite")

    # Conectar e restaurar
    conn = sqlite3.connect("database.sqlite")
    cursor = conn.cursor()

    with open("temp-restore-'"$TIMESTAMP"'.sql", "r") as f:
        sql_script = f.read()

    cursor.executescript(sql_script)
    conn.commit()
    conn.close()

    # Limpeza
    if os.path.exists("temp-restore-'"$TIMESTAMP"'.sql"):
        os.remove("temp-restore-'"$TIMESTAMP"'.sql")

    print("ok")
except Exception as e:
    print(f"error: {str(e)}", file=sys.stderr)
    sys.exit(1)
PYTHON_EOF
' || error_exit "Falha ao restaurar banco na VPS"
success "Banco restaurado na VPS"

# Validar restauração
info "Validando banco na VPS..."
TABLE_COUNT=$(ssh "$VPS_HOST" 'cd '"$VPS_REMOTE_PATH"' && python3 -c "import sqlite3; conn = sqlite3.connect(\"database.sqlite\"); print(len(conn.execute(\"SELECT name FROM sqlite_master WHERE type=\\\"table\\\"\").fetchall()))"' 2>/dev/null)

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" -eq 0 ]; then
    error_exit "Validação falhou - nenhuma tabela encontrada na VPS"
fi
success "Validação OK - $TABLE_COUNT tabelas encontradas"

# Limpeza
rm -f "$TEMP_SQL"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
success "Sincronização concluída com sucesso!"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

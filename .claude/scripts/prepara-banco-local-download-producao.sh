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
VPS_DB="$VPS_REMOTE_PATH/database.sqlite"
TIMESTAMP=$(date '+%d-%m-%Y-%H%M')

# Função para exibir erro e sair
error_exit() {
    echo -e "${RED}❌ Erro: $1${NC}"
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
echo -e "${BLUE}🔄 Fazendo download do banco de produção da VPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar se estamos na raiz do projeto
if [ ! -d "backend" ]; then
    error_exit "Diretório 'backend' não encontrado. Execute a partir da raiz do projeto."
fi

# Verificar se banco local existe
if [ ! -f "$LOCAL_DB" ]; then
    warning "Banco de dados local não encontrado em $LOCAL_DB"
    warning "Criando novo banco vazio..."
else
    info "Banco local encontrado: $LOCAL_DB"
    # Criar backup local de segurança
    BACKUP_FILE="$LOCAL_DB.backup-$TIMESTAMP"
    cp "$LOCAL_DB" "$BACKUP_FILE"
    success "Backup local criado: $BACKUP_FILE"
fi

# Verificar conectividade com VPS
info "Verificando conectividade com VPS ($VPS_HOST)..."
ssh -q "$VPS_HOST" "echo ok" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    error_exit "Não foi possível conectar à VPS. Verifique SSH: ssh $VPS_HOST \"echo ok\""
fi
success "Conectado à VPS"

# Verificar se banco existe na VPS
info "Verificando banco de produção na VPS..."
ssh "$VPS_HOST" "ls -lh $VPS_DB" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    error_exit "Banco de dados não encontrado na VPS em $VPS_DB"
fi
success "Banco de produção localizado na VPS"

# Fazer download do banco via SCP
info "Fazendo download do banco de produção..."
scp "$VPS_HOST:$VPS_DB" "$LOCAL_DB" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    error_exit "Falha ao fazer download do banco via SCP"
fi
success "Banco de produção baixado com sucesso!"

# Validar integridade do banco
info "Validando integridade do banco..."
sqlite3 "$LOCAL_DB" "SELECT COUNT(*) as tables FROM sqlite_master WHERE type='table';" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    error_exit "Banco baixado está corrompido ou inválido"
fi
success "Banco validado com sucesso!"

# Exibir informações do banco
echo ""
echo -e "${BLUE}📊 Informações do banco restaurado:${NC}"
echo "   Arquivo: $LOCAL_DB"
ls -lh "$LOCAL_DB" | awk '{print "   Tamanho: " $5}'
echo ""

# Listar tabelas
TABLE_COUNT=$(sqlite3 "$LOCAL_DB" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
echo "   Tabelas: $TABLE_COUNT"
sqlite3 "$LOCAL_DB" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" | sed 's/^/     - /'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
success "Banco de produção restaurado com sucesso!"
success "Pronto para começar o novo desenvolvimento! 🚀"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

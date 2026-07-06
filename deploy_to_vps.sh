#!/usr/bin/env bash
set -euo pipefail

REMOTE="bikinibottonsvr"
REMOTE_DIR="~/apps/bkp6week"
TAR_FILE="bkp6week_deploy.tar.gz"

echo "📦 Compactando arquivos do projeto (excluindo temporários)..."
tar -czf "${TAR_FILE}" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.angular' \
  --exclude='backend/venv' \
  --exclude='backend/__pycache__' \
  --exclude='backend/.pytest_cache' \
  --exclude='backend/database.sqlite' \
  --exclude='backend/database.sqlite.bak*' \
  --exclude="${TAR_FILE}" \
  .

echo "📂 Preparando diretório na VPS..."
ssh "${REMOTE}" "mkdir -p ${REMOTE_DIR}"

echo "🚀 Enviando pacote via SCP..."
scp "${TAR_FILE}" "${REMOTE}:${REMOTE_DIR}/"

# Envia o .env do backend separadamente se existir
if [[ -f "backend/.env" ]]; then
  echo "🔑 Enviando arquivo .env..."
  scp backend/.env "${REMOTE}:${REMOTE_DIR}/backend/.env"
fi

echo "🔧 Extraindo arquivos e subindo containers na VPS..."
ssh "${REMOTE}" <<EOS
  cd ${REMOTE_DIR}
  tar -xzf ${TAR_FILE}
  rm ${TAR_FILE}
  touch backend/database.sqlite
  docker compose up -d --build
EOS

echo "🧹 Limpando arquivo compactado local..."
rm "${TAR_FILE}"

echo "🎉 Deploy concluído com sucesso!"

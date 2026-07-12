---
name: prepara-banco-local-download-producao
user-invocable: true
description: Faz download do banco de dados de produção da VPS e substitui o banco local
context: default
allowed-tools: Bash
---

# Skill: Preparar Banco Local com Download de Produção

Faz download do banco de dados SQLite de produção da VPS e substitui o banco local com a versão de produção.

## O que faz

1. **Verifica banco local** — confirma que `backend/database.sqlite` existe
2. **Cria backup local** — salva backup de segurança do banco atual antes de substituir
3. **Conecta à VPS** — valida conectividade SSH com `bikinibottonsvr`
4. **Download** — faz download do banco de produção via SCP da VPS
5. **Validação** — verifica se o banco foi baixado corretamente
6. **Conclusão** — exibe informações sobre o banco restaurado

## Configuração SSH

Usa a configuração SSH de `~/.ssh/config`:

```
Host bikinibottonsvr
    HostName 195.35.42.89
    User fabao
    IdentityFile ~/.ssh/id_rsa
```

O script conecta em `bikinibottonsvr` e faz download do banco em `/home/fabao/apps/bkp6week/backend/database.sqlite`.

## Saída esperada

```
🔄 Fazendo download do banco de produção da VPS...
✅ Backup local criado: backend/database.sqlite.backup-12-07-2026-0816
✅ Banco de produção baixado com sucesso!
✅ Banco validado - restauração completa!
-rw-r--r-- 1 user staff 3.2M Jul 12 08:16 backend/database.sqlite

📊 Estrutura do banco:
Tabelas: users, cards, jornadas, attempts, etc.
✅ Pronto para começar o novo desenvolvimento!
```

## Pré-requisitos

- SSH configurado em `~/.ssh/config` com entrada `bikinibottonsvr`
- Acesso SSH válido à VPS
- `sqlite3` CLI instalado localmente
- Permissões de leitura em `/home/fabao/apps/bkp6week/backend/` na VPS

## Como usar

```bash
/prepara-banco-local-download-producao
```

Não requer parâmetros — usa configurações padrão.

## Segurança

- ✅ Cria backup local antes de substituir (em `backend/database.sqlite.backup-*`)
- ✅ Valida integridade do banco após download
- ✅ Preserva versão anterior para rollback se necessário
- ✅ Usa timestamp no nome do backup para rastreabilidade

## Troubleshooting

**"Não é possível conectar à VPS"**
- Verifique SSH: `ssh bikinibottonsvr "echo ok"`
- Verifique configuração em `~/.ssh/config`
- Verifique se a chave SSH é válida

**"Banco de dados local não encontrado"**
- Execute a partir da raiz do projeto
- Verifique se `backend/database.sqlite` existe

**"Falha ao fazer download do banco"**
- Verifique se arquivo existe na VPS: `ssh bikinibottonsvr "ls -la /home/fabao/apps/bkp6week/backend/database.sqlite"`
- Verifique permissões de leitura na VPS
- Verifique espaço em disco local: `df -h`

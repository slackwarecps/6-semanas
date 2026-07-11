---
name: restore-sincroniza-vps-com-local
user-invocable: true
description: Sincroniza o banco de dados local com a VPS via SSH/SCP
context: default
allowed-tools: Bash
---

# Skill: Sincronizar Banco Local com VPS

Envia o banco de dados SQLite local para a VPS, fazendo backup remoto do banco atual e restaurando o novo.

## O que faz

1. **Verifica banco local** — confirma que `backend/database.sqlite` existe
2. **Cria dump SQL** — extrai dados do banco local via `.dump`
3. **Conecta à VPS** — valida conectividade SSH com `bikinibottonsvr`
4. **Backup remoto** — faz backup do banco atual na VPS em `backups/backup-before-sync-*.sql`
5. **Transferência** — envia dump via SCP para a VPS
6. **Restauração** — recria o banco na VPS com os dados locais
7. **Validação** — verifica se tabelas foram restauradas corretamente
8. **Limpeza** — remove arquivos temporários

## Configuração SSH

Usa a configuração SSH de `~/.ssh/config`:

```
Host bikinibottonsvr
    HostName 195.35.42.89
    User fabao
    IdentityFile ~/.ssh/id_rsa
```

O script conecta em `bikinibottonsvr` e procura pelo banco em `/home/fabao/apps/bkp6week/backend/`.

## Saída esperada

```
🔄 Sincronizando banco local com VPS
ℹ️  Banco local encontrado: backend/database.sqlite
ℹ️  Criando backup de segurança local...
✅ Dump SQL criado temporariamente (2.7M)
ℹ️  Verificando conectividade com VPS (bikinibottonsvr)...
✅ Conectado à VPS
ℹ️  Fazendo backup remoto do banco atual na VPS...
✅ Backup remoto criado (se aplicável)
ℹ️  Transferindo dump para VPS...
✅ Arquivo transferido
ℹ️  Restaurando banco de dados na VPS...
✅ Banco restaurado na VPS
ℹ️  Validando banco na VPS...
✅ Validação OK - 7 tabelas encontradas
✅ Sincronização concluída com sucesso!
```

## Pré-requisitos

- SSH configurado em `~/.ssh/config` com entrada `bikinibottonsvr`
- Acesso SSH válido à VPS
- `sqlite3` CLI instalado localmente
- `python3` com módulo `sqlite3` na VPS (já integrado no Python)
- Permissões de escrita em `/home/fabao/apps/bkp6week/backend/` na VPS

## Como usar

```bash
/restore-sincroniza-vps-com-local
```

Não requer parâmetros — usa configurações padrão.

## Segurança

- ✅ Cria backup remoto antes de restaurar (em `backups/backup-before-sync-*.sql`)
- ✅ Valida integridade do banco após restauração
- ✅ Remove arquivo temporário após conclusão
- ✅ Usa arquivos temporários do sistema (`mktemp`)

## Troubleshooting

**"Não é possível conectar à VPS"**
- Verifique SSH: `ssh bikinibottonsvr "echo ok"`
- Verifique configuração em `~/.ssh/config`
- Verifique se a chave SSH é válida

**"Banco de dados local não encontrado"**
- Execute a partir da raiz do projeto
- Verifique se `backend/database.sqlite` existe

**"Falha ao restaurar banco na VPS"**
- Verifique se diretório existe na VPS: `ssh bikinibottonsvr "ls -la /home/fabao/apps/bkp6week/backend/"`
- Verifique permissões de escrita
- Verifique se `python3` está instalado na VPS: `ssh bikinibottonsvr "python3 --version"`

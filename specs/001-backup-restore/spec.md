# Feature Specification: Gerenciamento de Backups e Restauração do SQLite

**Feature Branch**: `001-backup-restore`

**Created**: 2026-07-15

**Status**: Draft

**Input**: Criar uma nova página que servira para criar backups e restaurar backups do banco sqlite da app.

## Clarifications

### Session 2026-07-15

- Q: Quem tem acesso à página de backups? → A: Qualquer usuário logado (sem restrição de role). Controle de acesso é apenas autenticação.
- Q: Sistema deve registrar auditoria (quem/quando)? → A: Não é necessário para MVP (P3). Auditoria é requisito futuro.
- Q: Múltiplos admins criando backup simultaneamente — é requisito formal? → A: Não é obrigatório para MVP (P2). Comportamento não definido formalmente nesta iteração.
- Q: Disponibilidade da app durante restauração? → A: Parcialmente disponível. Apenas endpoints de backup/restore ficam bloqueados; resto da app continua servindo dados.
- Q: Admin pode baixar arquivo de backup externamente? → A: Sim, permitido via UI. Deve haver botão "Baixar" na lista de backups para exportar arquivo `.sql`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar Backup Manual (Priority: P1)

Administrador da aplicação precisa criar um backup completo do banco de dados SQLite de forma manual antes de operações críticas ou como rotina de segurança. Deve ser possível disparar o backup a qualquer momento e receber confirmação de sucesso com detalhes do arquivo gerado.

**Why this priority**: Backup é a operação fundamental de proteção de dados. Sem capacidade de criar backups, toda a aplicação está exposta a perda irrecuperável de dados.

**Independent Test**: Usuário acessa página de backups, clica em "Criar Backup", sistema gera arquivo de backup, exibe confirmação com tamanho e data/hora do backup.

**Acceptance Scenarios**:

1. **Given** usuário está na página de gerenciamento de backups, **When** clica em botão "Criar Backup", **Then** sistema inicia processo de backup e exibe indicador de progresso
2. **Given** backup foi concluído com sucesso, **When** usuário visualiza a tela, **Then** sistema exibe mensagem de sucesso com: nome do arquivo, tamanho (em MB/GB), data/hora criação, e caminho armazenado
3. **Given** backup está em progresso, **When** usuário tenta criar outro backup, **Then** sistema desabilita botão de backup ou mostra mensagem indicando operação em andamento

---

### User Story 2 - Listar Backups Disponíveis (Priority: P1)

Administrador precisa visualizar todos os backups existentes com informações relevantes: data de criação, tamanho do arquivo, e status. Deve ser possível filtrar e ordenar a lista para encontrar rapidamente um backup específico.

**Why this priority**: Para restaurar um backup, primeiro é necessário poder listar e identificar qual backup restaurar. Crítico para a operação de restauração.

**Independent Test**: Página mostra lista completa de backups com metadados (data, tamanho, status). Usuário consegue identificar qual backup deseja restaurar.

**Acceptance Scenarios**:

1. **Given** página de backups está aberta, **When** página carrega, **Then** sistema exibe tabela com todos os backups existentes incluindo: data criação, tamanho arquivo, e status
2. **Given** existem múltiplos backups, **When** usuário ordena por data, **Then** backups são listados em ordem cronológica (mais recente primeiro por padrão)
3. **Given** não há backups criados, **When** página carrega, **Then** sistema exibe mensagem amigável informando que nenhum backup existe e sugere criar um

---

### User Story 3 - Restaurar Backup (Priority: P2)

Administrador precisa poder restaurar o banco de dados a partir de um backup anterior. Sistema deve permitir selecionar um backup da lista e disparar processo de restauração com confirmação prévia devido ao caráter destrutivo da operação.

**Why this priority**: Restauração é essencial para recuperação de desastres, mas menos frequente que criação de backups. Requer confirmação do usuário por ser operação irreversível.

**Independent Test**: Usuário seleciona backup, confirma restauração, banco é substituído pelos dados do backup, aplicação continua funcionando com dados restaurados.

**Acceptance Scenarios**:

1. **Given** usuário seleciona um backup da lista, **When** clica em "Restaurar", **Then** sistema exibe diálogo de confirmação com aviso sobre destructividade da operação
2. **Given** usuário confirmou restauração, **When** processo é disparado, **Then** sistema exibe indicador de progresso durante a restauração
3. **Given** restauração foi concluída, **When** processo finaliza, **Then** sistema exibe mensagem de sucesso e atualiza interface para refletir novo estado do banco
4. **Given** restauração falhou, **When** erro ocorre, **Then** sistema exibe mensagem de erro detalhada e oferece opção de tentar novamente

---

### User Story 4 - Deletar Backup Antigo (Priority: P3)

Administrador pode remover backups antigos ou desnecessários para economizar espaço em disco. Operação requer confirmação para evitar exclusão acidental.

**Why this priority**: Gerenciamento de armazenamento é importante para manutenção contínua, mas menos crítico que criar/restaurar backups. Implementável após MVP.

**Independent Test**: Usuário seleciona backup, clica delete, confirma, arquivo é removido da lista.

**Acceptance Scenarios**:

1. **Given** usuário está visualizando lista de backups, **When** clica em ícone de delete em um backup, **Then** sistema exibe diálogo de confirmação
2. **Given** usuário confirmou exclusão, **When** operação é processada, **Then** arquivo é removido do sistema de arquivos e lista é atualizada
3. **Given** múltiplos backups existem, **When** usuário deleta um, **Then** outros backups permanecem inalterados

---

### Edge Cases

- Servidor fica sem espaço em disco durante criação de backup — sistema deve parar operação e notificar usuário
- Arquivo de backup é manualmente deletado do servidor enquanto aplicação está rodando — lista mostra arquivo que não existe
- Usuário tenta restaurar backup corrompido — sistema detecta erro e oferece usar outro backup
- Aplicação é reiniciada durante processo de backup — backup incompleto não é listado como válido
- Múltiplos admins tentam criar backup simultaneamente — comportamento não definido formalmente para MVP (P2); sistema pode permitir race condition ou requerer manual intervention
- Banco de dados cresceu muito (> 500MB) — backup e restauração devem lidar com arquivos grandes sem timeout

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir usuário criar backup completo do banco SQLite com um clique
- **FR-002**: Sistema DEVE salvar backup em formato SQL (texto) no diretório `backend/backups/`
- **FR-003**: Sistema DEVE gerar nome de arquivo com padrão: `backup-servidor-DD-MM-YYYY-HHMMSS.sql` (data e hora no nome)
- **FR-004**: Sistema DEVE exibir lista de todos os backups existentes com data criação e tamanho arquivo
- **FR-005**: Sistema DEVE permitir restaurar banco de dados a partir de qualquer backup selecionado
- **FR-006**: Sistema DEVE exigir confirmação explícita antes de restaurar (operação irreversível)
- **FR-007**: Sistema DEVE exibir indicador de progresso durante backup e restauração
- **FR-008**: Sistema DEVE permitir deletar backups antigos com confirmação
- **FR-009**: Sistema DEVE exibir mensagens de erro detalhadas se backup/restauração falhar
- **FR-010**: Sistema DEVE validar integridade do arquivo de backup antes de restaurar
- **FR-011**: Sistema DEVE permitir usuário fazer download do arquivo de backup `.sql` diretamente via UI (botão "Baixar" na lista)

### Key Entities

- **Backup**: Representa um arquivo de backup completo do banco SQLite
  - Atributos: `id`, `nome_arquivo`, `data_criacao`, `tamanho_bytes`, `caminho_completo`, `status` (válido/corrompido)
  - Relações: Associado a um ponto específico no tempo do estado do banco

- **Sessão de Backup**: Representação transiente de um backup em progresso
  - Atributos: `id`, `data_inicio`, `status` (em progresso/completo/erro), `percentual_conclusao`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuário consegue criar backup em menos de 5 minutos (incluindo confirmação)
- **SC-002**: Backup completo do banco é armazenado com sucesso em disco (arquivo validável externamente)
- **SC-003**: Lista de backups carrega em menos de 2 segundos mesmo com 20+ backups existentes
- **SC-004**: Restauração de backup de 100MB completa em menos de 30 segundos
- **SC-005**: 100% dos backups criados são listáveis e restoráveis (zero falhas silenciosas)
- **SC-006**: Mensagens de erro são compreensíveis para administrador não-técnico
- **SC-007**: Operação de backup não causa degradação perceptível na usabilidade da aplicação (timeout máximo 60s)
- **SC-008**: Durante restauração, endpoints de backup/restore retornam HTTP 409 Conflict; outros endpoints continuam respondendo normalmente

## Assumptions

- **Controle de Acesso**: Página de backups é acessível por qualquer usuário autenticado (sem restrição de role). Segurança é apenas por autenticação da aplicação.
- Espaço em disco está disponível (mínimo 2x o tamanho atual do banco para operações seguras)
- Backend FastAPI já possui acesso a sistema de arquivos para ler/escrever em `backend/backups/`
- Usuário administrador tem permissões adequadas no servidor para gerenciar arquivos
- Banco SQLite está sempre em estado consistente (sem locks longos)
- Frontend Angular consegue se comunicar com backend via HTTP para disparar operações
- Usuário acessa aplicação em ambiente controlado (desktop/LAN), não mobile
- Recuperação de desastres é responsabilidade deste módulo; replicação/sincronização com VPS é separada
- Backups manuais são a abordagem inicial (backup automático agendado fica para P3 em futura iteração)

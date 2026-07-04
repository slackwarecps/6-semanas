Title: Geração de Código com Claude Code
---

Seu time criou uma skill `/migration` que gera arquivos de migração de banco. Recebe o nome da migração via `$ARGUMENTS`. Em produção você observa três problemas: (1) devs frequentemente rodam a skill sem argumentos, causando arquivos mal nomeados, (2) a skill às vezes usa detalhes de schema de conversas anteriores não relacionadas, e (3) um dev rodou acidentalmente cleanup destrutivo de teste quando a skill tinha acesso amplo a ferramentas.

Qual abordagem de configuração corrige todos os três problemas?

---
[ ] A - Usar parâmetros posicionais `$1` e `$2` em vez de `$ARGUMENTS` para forçar entradas específicas, incluir referências explícitas a schema via sintaxe `@` para controle de contexto, e adicionar uma descrição no frontmatter alertando sobre operações destrutivas.
[ ] B - Adicionar `argument-hint` no frontmatter para pedir parâmetros obrigatórios, usar `context: fork` para isolar a execução, e restringir `allowed-tools` a operações de escrita de arquivo.
[ ] C - Dividir em `/migration-create` e `/migration-apply`, adicionar instruções de validação para pedir o nome da migração se faltar e usar escopos de `allowed-tools` diferentes para cada.
[ ] D - Adicionar instruções de validação no SKILL.md para garantir que `$ARGUMENTS` seja um nome válido, adicionar prompts para ignorar contexto de conversas anteriores e listar operações proibidas.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows

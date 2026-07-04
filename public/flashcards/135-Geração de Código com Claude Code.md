Title: Geração de Código com Claude Code
---

Você está adicionando wrappers de tratamento de erros ao redor de chamadas de API externas em uma base de 120 arquivos. O trabalho tem três fases: (1) descobrir todos os call sites e padrões, (2) desenhar colaborativamente a abordagem de tratamento de erros, e (3) implementar wrappers de forma consistente. Na Fase 1, Claude gera saída grande listando centenas de call sites com contexto, enchendo rapidamente a janela de contexto antes da descoberta terminar.

Qual abordagem é mais efetiva para concluir a tarefa mantendo consistência de implementação?

---
[ ] A - Usar um subagente Explore para a Fase 1 para isolar saída verbosa de descoberta e retornar um sumário, depois continuar Fases 2–3 na conversa principal.
[ ] B - Fazer todas as fases na conversa principal, periodicamente usando `/compact` para reduzir uso de contexto enquanto avança nos arquivos.
[ ] C - Mudar para modo headless com `--continue`, passando sumários explícitos de contexto entre chamadas em batch para manter continuidade.
[ ] D - Definir o padrão de tratamento de erros no CLAUDE.md, depois processar arquivos em lotes em múltiplas sessões contando com o arquivo de memória compartilhada para consistência.

---
Tags: Domain_5::Context_Management_Reliability

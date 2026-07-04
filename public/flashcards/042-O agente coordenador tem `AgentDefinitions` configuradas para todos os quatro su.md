Title: O agente coordenador tem `AgentDefinitions` configuradas para todos os quatro subagentes especializados, cada um com descrições, prompts e restrições de ferramentas apropriadas.
---

O agente coordenador tem `AgentDefinitions` configuradas para todos os quatro subagentes especializados, cada um com descrições, prompts e restrições de ferramentas apropriadas. Durante os testes, você percebe que o coordenador raciocina corretamente sobre quando delegar — ele gera mensagens como "Vou pedir ao agente de busca na web que encontre fontes sobre este tópico" — mas nenhuma execução de subagente jamais ocorre. O coordenador então prossegue como se a delegação tivesse acontecido e continua com informações incompletas. Os logs não mostram erros.

Qual é a causa mais provável?

---
[ ] A - A configuração `max_tokens` do coordenador é baixa demais, fazendo com que a invocação da ferramenta Task seja truncada antes que o parâmetro de tipo do subagente possa ser especificado.
[ ] B - As `AgentDefinitions` estão configuradas corretamente, mas o prompt de sistema do coordenador não lista explicitamente os tipos de subagentes disponíveis, impedindo que o modelo saiba que eles podem ser invocados.
[ ] C - A configuração allowedTools do coordenador não inclui "Task", então, embora ele possa raciocinar sobre a delegação, não consegue invocar a ferramenta necessária para iniciar subagentes.
[ ] D - O isolamento de contexto dos subagentes significa que as descrições de tarefa do coordenador não chegam automaticamente aos subagentes; você precisa configurar o encaminhamento explícito de contexto em ClaudeAgentOptions.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

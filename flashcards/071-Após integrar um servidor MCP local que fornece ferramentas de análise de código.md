Title: Após integrar um servidor MCP local que fornece ferramentas de análise de código (`analyze_dependencies`, `find_dead_code`, `calculate_complexity`), você verifica que o servidor está saudável e que as ferramentas aparecem na resposta de tools/list.
---

Após integrar um servidor MCP local que fornece ferramentas de análise de código (`analyze_dependencies`, `find_dead_code`, `calculate_complexity`), você verifica que o servidor está saudável e que as ferramentas aparecem na resposta de tools/list. No entanto, você observa que o agente usa consistentemente o Grep para buscar declarações de importação em vez de chamar `analyze_dependencies` — mesmo quando os usuários perguntam explicitamente sobre "dependências de código". Ao examinar as definições das ferramentas, você encontra: MCP: `analyze_dependencies` - "Analisa o grafo de dependências" Nativa: Grep - "Busca o conteúdo de arquivos por um padrão usando expressões regulares. Retorna as linhas correspondentes com números de linha e contexto ao redor."

Qual é a abordagem mais eficaz para melhorar a seleção de ferramentas MCP pelo agente?

---
[ ] A - Remover o Grep das ferramentas disponíveis quando o servidor MCP estiver conectado, para eliminar a sobreposição funcional.
[ ] B - Adicionar instruções de roteamento ao prompt do sistema especificando que perguntas relacionadas a dependências devem usar ferramentas MCP em vez do Grep.
[ ] C - Dividir `analyze_dependencies` em ferramentas granulares (`list_imports`, `resolve_transitive_deps`, `detect_circular_deps`) para que cada uma tenha um propósito focado e menos propenso a se sobrepor ao Grep.
[ ] D - Expandir as descrições das ferramentas MCP para detalhar capacidades e saídas — por exemplo, "Constrói um grafo de dependências mostrando importações diretas, dependências transitivas e ciclos."

---
Tags: Domain_2::Tool_Design_MCP_Integration

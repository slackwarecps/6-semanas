Title: Após adicionar um servidor MCP com ferramentas especializadas de refatoração de código (`extract_function`, `rename_variable`, `inline_function`), você nota que o agente ainda usa manipulação básica de texto via Write e comandos sed do Bash para tarefas de refatoração.
---

Após adicionar um servidor MCP com ferramentas especializadas de refatoração de código (`extract_function`, `rename_variable`, `inline_function`), você nota que o agente ainda usa manipulação básica de texto via Write e comandos sed do Bash para tarefas de refatoração. O servidor MCP está conectado e saudável. Ao examinar a configuração, você descobre que cada ferramenta MCP tem uma descrição mínima como "`extract_function`: extrai uma função do código."

Qual é a maneira mais eficaz de melhorar a adoção das ferramentas de refatoração MCP?

---
[ ] A - Implementar um classificador de requisições que detecta a intenção de refatoração e roteia automaticamente essas requisições para o servidor MCP antes de o agente processá-las.
[ ] B - Remover a ferramenta Write da configuração do agente durante as sessões de refatoração, de modo que ele seja obrigado a usar as ferramentas MCP para modificações de código.
[ ] C - Aceitar isso como comportamento esperado, já que ferramentas mais simples como o sed são mais previsíveis do que ferramentas especializadas de refatoração.
[ ] D - Aprimorar as descrições das ferramentas MCP para explicar quando cada ferramenta é preferível à manipulação de texto e esclarecer as entradas e saídas esperadas.

---
Tags: Domain_2::Tool_Design_MCP_Integration

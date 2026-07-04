Title: Geração de Código com Claude Code
---

Seu time quer adicionar um servidor MCP do GitHub para buscar PRs e checar status de CI via Claude Code. Cada um dos seis devs tem seu próprio token pessoal de acesso ao GitHub. Você quer ferramental consistente em todo o time sem commitar credenciais no controle de versão.

Qual abordagem de configuração é mais efetiva?

---
[ ] A - Que cada dev adicione o servidor em escopo de usuário via `claude mcp add --scope user`.
[ ] B - Criar um wrapper de servidor MCP que leia tokens de um arquivo `.env` e proxie chamadas à API do GitHub, depois adicionar o wrapper ao `.mcp.json` do projeto.
[ ] C - Adicionar o servidor ao `.mcp.json` do projeto usando substituição de variável de ambiente (`${GITHUB_TOKEN}`) para auth e documentar a variável necessária no README.
[ ] D - Configurar o servidor no escopo de projeto com token placeholder, depois pedir aos devs que sobrescrevam no config local.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows

Title: Seu agente precisa inserir uma nova função auxiliar no meio de um módulo utilitário de 150 linhas, entre duas funções existentes.
---

Seu agente precisa inserir uma nova função auxiliar no meio de um módulo utilitário de 150 linhas, entre duas funções existentes. A ferramenta Edit falha porque seu parâmetro `old_string` não consegue encontrar um texto único para correspondência — o arquivo tem docstrings, nomes de variáveis e padrões estruturais repetitivos.

Qual é a maneira mais confiável de concluir essa inserção?

---
[ ] A - Usar o Edit com um `old_string` extremamente longo, capturando mais de 30 linhas de contexto para garantir a unicidade
[ ] B - Usar o parâmetro `replace_all` do Edit para mirar em um padrão comum e embutir a nova função no texto de substituição
[ ] C - Usar o Bash para anexar a definição da função ao final do arquivo usando a sintaxe de heredoc
[ ] D - Usar o Read para carregar o arquivo, adicionar a função no local apropriado e, então, usar o Write para gravar o arquivo atualizado

---
Tags: Domain_2::Tool_Design_MCP_Integration

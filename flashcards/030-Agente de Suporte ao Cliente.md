Title: Agente de Suporte ao Cliente
---

Você está implementando o loop do agente de suporte. Após cada chamada de API ao Claude, é preciso decidir se continua o loop (executa as ferramentas pedidas e chama Claude novamente) ou para (apresenta a resposta final ao cliente). O que determina essa decisão?

---
[ ] A - Verificar o campo `stop_reason` na resposta do Claude — continuar se for `tool_use` e parar se for `end_turn`.
[ ] B - Parsear o texto do Claude por frases como "Estou pronto" ou "Posso ajudar com mais alguma coisa?" — sinais de linguagem natural indicam conclusão.
[ ] C - Definir um número máximo de iterações (ex.: 10 chamadas) e parar quando atingido, independentemente de Claude indicar mais trabalho.
[ ] D - Verificar se a resposta contém conteúdo de texto do assistente — se Claude gerou texto explicativo, o loop deve terminar.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

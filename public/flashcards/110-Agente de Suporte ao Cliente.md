Title: Agente de Suporte ao Cliente
---

Logs de produção mostram um padrão consistente: quando clientes incluem a palavra "conta" em sua mensagem (ex.: "quero verificar minha conta de um pedido que fiz ontem"), o agente chama `get_customer` primeiro 78% das vezes. Quando clientes formulam pedidos similares sem "conta" (ex.: "quero verificar um pedido que fiz ontem"), chama `lookup_order` primeiro 93% das vezes. As descrições das ferramentas são claras e inequívocas. Qual a causa-raiz mais provável dessa discrepância?

---
[ ] A - O system prompt contém instruções sensíveis a palavras-chave que direcionam comportamento baseado em termos como "conta", criando padrões não intencionais de seleção de ferramenta.
[ ] B - O treinamento base do modelo cria associações entre terminologia de "conta" e operações relacionadas ao cliente que sobrepõem descrições de ferramentas.
[ ] C - O modelo precisa de mais dados de treino sobre mensagens multi-conceito e deveria ser fine-tuned em exemplos contendo terminologias de conta e pedido.
[ ] D - Descrições de ferramentas precisam de exemplos negativos adicionais especificando quando NÃO usar cada ferramenta para evitar essa confusão induzida por palavras-chave.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

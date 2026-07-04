Title: Claude Code para Integração Contínua
---

Sua review automatizada gera sugestões de casos de teste para cada PR. Revisando um PR que adiciona tracking de conclusão de curso, Claude sugere 10 casos de teste, mas o feedback dos devs mostra que 6 duplicam cenários já cobertos pela suíte de testes existente. Qual mudança reduz duplicação de forma mais efetiva?

---
[ ] A - Incluir o arquivo de teste existente no contexto para que Claude possa determinar quais cenários já estão cobertos.
[ ] B - Reduzir o número solicitado de sugestões de 10 para 5, assumindo que Claude prioriza os casos mais valiosos primeiro.
[ ] C - Adicionar instruções direcionando Claude a focar exclusivamente em casos de borda e condições de erro em vez de caminhos felizes.
[ ] D - Implementar pós-processamento que filtra sugestões cujas descrições casam com nomes de testes existentes via sobreposição de palavras-chave.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

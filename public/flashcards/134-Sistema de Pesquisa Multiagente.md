Title: Sistema de Pesquisa Multiagente
---

Em testes, a saída combinada do agente de busca web (85K tokens incluindo conteúdo de páginas) e do agente de análise de documentos (70K tokens incluindo cadeias de raciocínio) totaliza 155K tokens, mas o agente de síntese performa melhor com entradas abaixo de 50K tokens. Qual solução é mais efetiva?

---
[ ] A - Modificar agentes upstream para retornar dados estruturados (fatos-chave, citações, scores de relevância) em vez de conteúdo verboso e raciocínio.
[ ] B - Adicionar um agente intermediário de sumarização que condense achados antes de passá-los à síntese.
[ ] C - Fazer o agente de síntese processar achados em lotes sequenciais, mantendo estado entre chamadas.
[ ] D - Armazenar achados em uma base vetorial e dar ao agente de síntese ferramentas de busca para consultar durante o trabalho.

---
Tags: Domain_5::Context_Management_Reliability

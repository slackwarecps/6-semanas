Title: Agente de Suporte ao Cliente
---

Sua ferramenta `get_customer` retorna todas as correspondências ao buscar por nome. Atualmente, quando há múltiplos resultados, Claude escolhe o cliente com pedido mais recente, mas dados de produção mostram que isso seleciona a conta errada em 15% dos casos para correspondências ambíguas. Como você deveria tratar isso?

---
[ ] A - Implementar um sistema de pontuação de confiança que age autonomamente acima de 85% e pede esclarecimento abaixo do limiar.
[ ] B - Instruir Claude a pedir um identificador adicional (email, telefone ou número do pedido) quando `get_customer` retornar múltiplas correspondências antes de tomar qualquer ação específica do cliente.
[ ] C - Modificar `get_customer` para retornar apenas uma única correspondência mais provável com base em algoritmo de ranking, eliminando ambiguidade.
[ ] D - Adicionar exemplos few-shot ao prompt demonstrando raciocínio correto e sequenciamento de ferramentas para correspondências ambíguas.

---
Tags: Domain_2::Tool_Design_MCP_Integration

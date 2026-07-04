Title: Seu agente está tratando uma disputa de cobrança.
---

Seu agente está tratando uma disputa de cobrança. Depois de chamar `get_customer` e `lookup_order`, ele identifica que a disputa envolve um erro de preço promocional que exige aprovação gerencial — acima do nível de autorização do agente.

Como o fluxo de trabalho deve lidar com esse escalonamento no meio do processo?

---
[ ] A - Chamar `escalate_to_human` repassando apenas a mensagem original do cliente.
[ ] B - Compilar um repasse estruturado com os dados do cliente, informações do pedido e o problema identificado antes de chamar `escalate_to_human`.
[ ] C - Tentar o reembolso com `process_refund` mesmo assim, escalonando apenas se o sistema rejeitar a transação.
[ ] D - Persistir a conversa completa e o histórico de respostas das ferramentas em um banco de dados e, em seguida, chamar `escalate_to_human` com um ID de referência.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

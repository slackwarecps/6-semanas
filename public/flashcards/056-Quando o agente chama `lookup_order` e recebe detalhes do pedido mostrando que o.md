Title: Quando o agente chama `lookup_order` e recebe detalhes do pedido mostrando que o item foi comprado há 45 dias, como o loop agêntico determina se deve chamar `process_refund` ou `escalate_to_human` em seguida?
---

Quando o agente chama `lookup_order` e recebe detalhes do pedido mostrando que o item foi comprado há 45 dias, como o loop agêntico determina se deve chamar `process_refund` ou `escalate_to_human` em seguida?

---
[ ] A - A camada de orquestração roteia automaticamente para a próxima ferramenta com base no campo de status do pedido.
[ ] B - O agente segue uma árvore de decisão pré-configurada que mapeia atributos do pedido para chamadas de ferramentas específicas.
[ ] C - Os detalhes do pedido são adicionados à conversa e o modelo raciocina sobre qual ação tomar.
[ ] D - O agente executa as etapas restantes em uma sequência de ferramentas planejada no início da requisição.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

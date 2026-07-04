Title: Agente de Suporte ao Cliente
---

Métricas de produção mostram que seu agente faz em média 4+ loops de API por resolução. A análise revela que Claude frequentemente solicita `get_customer` e `lookup_order` em turnos sequenciais separados, mesmo quando ambos são necessários inicialmente. Qual é a forma mais efetiva de reduzir o número de loops?

---
[ ] A - Implementar execução especulativa que automaticamente chama ferramentas provavelmente necessárias em paralelo a qualquer ferramenta solicitada e retorna todos os resultados, independentemente do que foi pedido.
[ ] B - Aumentar `max_tokens` para dar a Claude mais espaço para planejar e combinar naturalmente solicitações de ferramenta.
[ ] C - Criar ferramentas compostas como `get_customer_with_orders` que agrupam combinações comuns de lookup em uma única chamada.
[ ] D - Instruir Claude no prompt a agrupar solicitações de ferramenta em um turno e retornar todos os resultados juntos antes da próxima chamada de API.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

Title: Sua ferramenta `process_refund` retorna dois tipos de erro: erros técnicos ("503 Service Unavailable", "Connection timeout") que são transitórios (5% das chamadas) e erros de negócio ("Order exceeds 30-day return window", "Item already refunded") que são permanentes (12% das chamadas).
---

Sua ferramenta `process_refund` retorna dois tipos de erro: erros técnicos ("503 Service Unavailable", "Connection timeout") que são transitórios (5% das chamadas) e erros de negócio ("Order exceeds 30-day return window", "Item already refunded") que são permanentes (12% das chamadas). O monitoramento mostra que o agente desperdiça de 3 a 4 turnos tentando novamente erros de negócio que nunca podem ter sucesso. Atualmente, ambos os tipos de erro retornam apenas uma mensagem de texto simples ao Claude.

Qual é a forma mais eficaz de reduzir as novas tentativas desperdiçadas e, ao mesmo tempo, melhorar a qualidade das respostas voltadas ao cliente?

---
[ ] A - Retornar respostas de erro estruturadas com retryable: false para erros de negócio e uma explicação amigável ao cliente para o Claude usar.
[ ] B - Adicionar exemplos few-shot mostrando como distinguir erros recuperáveis de não recuperáveis analisando o texto da mensagem de erro.
[ ] C - Adicionar uma ferramenta `check_refund_eligibility` que deve ser chamada antes de `process_refund` para evitar violações de regras de negócio.
[ ] D - Implementar lógica de nova tentativa automática no nível da ferramenta apenas para erros técnicos, repassando erros de negócio ao Claude sem novas tentativas.

---
Tags: Domain_2::Tool_Design_MCP_Integration

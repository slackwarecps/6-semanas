Title: Agente de Suporte ao Cliente
---

Seu agente lida com pedidos de questão única com 94% de acurácia (ex.: "preciso de reembolso para o pedido #1234"). Mas quando clientes incluem múltiplas questões em uma mensagem (ex.: "preciso de reembolso para o pedido #1234 e também atualizar o endereço de entrega do pedido #5678"), a acurácia de seleção de ferramenta cai para 58%. O agente normalmente resolve apenas uma questão ou mistura parâmetros entre os pedidos. Qual abordagem melhora confiabilidade para pedidos multi-questão de forma mais efetiva?

---
[ ] A - Implementar uma camada de pré-processamento que use uma chamada separada do modelo para decompor mensagens multi-questão em pedidos separados, lidar com cada um independentemente e mesclar resultados.
[ ] B - Combinar ferramentas relacionadas em menos ferramentas universais.
[ ] C - Adicionar exemplos few-shot ao prompt demonstrando raciocínio correto e sequenciamento de ferramentas para pedidos multi-questão.
[ ] D - Implementar validação de resposta que detecta respostas incompletas e re-prompta automaticamente o agente para resolver questões perdidas.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

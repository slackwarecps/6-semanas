Title: Um cliente levanta três questões distintas durante uma sessão: uma consulta de reembolso (turnos 1-15), uma dúvida sobre assinatura (turnos 16-30) e uma atualização de método de pagamento (turnos 31-45).
---

Um cliente levanta três questões distintas durante uma sessão: uma consulta de reembolso (turnos 1-15), uma dúvida sobre assinatura (turnos 16-30) e uma atualização de método de pagamento (turnos 31-45). No turno 48, o cliente pergunta "O que aconteceu com o meu reembolso?" A conversa está se aproximando dos limites de contexto.

Qual estratégia mantém melhor a capacidade do agente de tratar todas as questões ao longo da sessão?

---
[ ] A - Extrair e persistir dados estruturados das questões (IDs de pedidos, valores, status) em uma camada de contexto separada.
[ ] B - Confiar nas ferramentas MCP para buscar novamente as informações relevantes sob demanda quando o cliente fizer referência a questões anteriores.
[ ] C - Resumir os turnos anteriores em uma descrição narrativa, preservando o histórico completo de mensagens apenas para a questão ativa.
[ ] D - Implementar contexto em janela deslizante que retém os 30 turnos mais recentes.

---
Tags: Domain_5::Context_Management_Reliability

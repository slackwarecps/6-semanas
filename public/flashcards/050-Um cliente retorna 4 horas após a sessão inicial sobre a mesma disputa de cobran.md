Title: Um cliente retorna 4 horas após a sessão inicial sobre a mesma disputa de cobrança.
---

Um cliente retorna 4 horas após a sessão inicial sobre a mesma disputa de cobrança. A sessão anterior, com 32 turnos, contém resultados de `lookup_order` mostrando "Status: PENDING, Resolução prevista: 24-48 horas." Em testes, você observa que, ao retomar sessões com resultados de ferramentas desatualizados, o agente frequentemente faz referência aos dados obsoletos nas respostas (por exemplo, "Vejo que seu reembolso ainda está em processamento"), mesmo após chamadas de ferramentas mais recentes retornarem informações diferentes.

Qual abordagem lida de forma mais confiável com clientes que retornam?

---
[ ] A - Retomar com o histórico completo, mas filtrar as mensagens `tool_result` anteriores antes de retomar, mantendo apenas os turnos do humano/assistente para que o agente precise buscar novamente os dados necessários.
[ ] B - Iniciar uma nova sessão, injetar um resumo estruturado da interação anterior (tipo de problema, ações tomadas, status de resolução) e fazer novas chamadas de ferramentas antes de iniciar o atendimento.
[ ] C - Retomar com o histórico completo e adicionar uma instrução no prompt do sistema dizendo ao agente para sempre preferir os resultados de ferramentas mais recentes quando houver várias chamadas à mesma ferramenta no contexto.
[ ] D - Retomar com o histórico completo e configurar o agente para chamar novamente, de forma automática, todas as ferramentas usadas anteriormente no início da sessão, garantindo a atualidade dos dados.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

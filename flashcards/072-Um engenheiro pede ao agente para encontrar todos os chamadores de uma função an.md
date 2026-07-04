Title: Um engenheiro pede ao agente para encontrar todos os chamadores de uma função antes de removê-la.
---

Um engenheiro pede ao agente para encontrar todos os chamadores de uma função antes de removê-la. A função é definida em uma biblioteca central, mas também é exposta por meio de módulos wrapper que renomeiam a função para uso específico de domínio (por exemplo, calculateTax na biblioteca torna-se computeOrderTax no módulo de pedidos).

Qual estratégia de exploração identificará de forma mais confiável todos os chamadores?

---
[ ] A - Ler a biblioteca e os módulos wrapper para identificar todos os nomes sob os quais a função é exposta e, em seguida, usar o Grep para cada nome em toda a base de código.
[ ] B - Usar o Grep para encontrar todos os arquivos que importam da biblioteca ou dos módulos wrapper e, então, ler cada arquivo para verificar se ele usa a função.
[ ] C - Usar o Grep para buscar o nome original da função em toda a base de código.
[ ] D - Buscar o nome da função na documentação do projeto para entender os padrões de uso pretendidos e navegar até os pontos de integração documentados.

---
Tags: Domain_2::Tool_Design_MCP_Integration

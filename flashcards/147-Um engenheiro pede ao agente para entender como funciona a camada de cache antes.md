Title: Um engenheiro pede ao agente para entender como funciona a camada de cache antes de adicionar um novo gatilho de invalidação de cache.
---

Um engenheiro pede ao agente para entender como funciona a camada de cache antes de adicionar um novo gatilho de invalidação de cache. Após as buscas iniciais com Grep, o agente identificou que a lógica de cache se espalha por 15 arquivos, incluindo decoradores, middleware e classes de serviço (~8.000 linhas no total).

Qual é o próximo passo mais eficaz para construir o entendimento gerenciando as restrições de contexto?

---
[ ] A - Usar a ferramenta Read para carregar sequencialmente todos os 15 arquivos, construindo um entendimento completo de toda a implementação de cache.
[ ] B - Analisar as importações e hierarquias de classe para identificar a classe base de cache, ler esse arquivo para entender a interface e, então, rastrear as implementações específicas de invalidação.
[ ] C - Usar o Grep para buscar os padrões "invalidate" e "expire" em todos os arquivos e, então, ler apenas esses intervalos de linha específicos com o mínimo de contexto ao redor.
[ ] D - Usar o Glob para encontrar arquivos que correspondam a padrões comuns de cache (cache.py, caching/), priorizar os maiores arquivos lendo-os primeiro e, então, verificar os menores em busca de lacunas.

---
Tags: Domain_5::Context_Management_Reliability

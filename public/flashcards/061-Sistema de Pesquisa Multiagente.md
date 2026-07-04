Title: Sistema de Pesquisa Multiagente
---

Em testes, você observa que o agente de síntese frequentemente precisa verificar afirmações específicas ao mesclar resultados. Atualmente, quando verificação é necessária, o agente de síntese devolve o controle ao coordenador, que chama o agente de busca web e então re-invoca a síntese com os resultados. Isso adiciona 2–3 loops extras por tarefa e aumenta a latência em 40%. Sua avaliação mostra que 85% dessas verificações são checagens simples (datas, nomes, estatísticas) e 15% exigem pesquisa mais profunda. Qual abordagem é mais efetiva para reduzir overhead preservando confiabilidade?

---
[ ] A - Dar ao agente de síntese acesso a todas as ferramentas de busca web para que ele possa lidar com qualquer necessidade de verificação diretamente, sem loops do coordenador.
[ ] B - Fazer o agente de síntese acumular todas as necessidades de verificação e devolvê-las como um lote ao coordenador no fim, que então as envia todas de uma vez ao agente de busca web.
[ ] C - Fazer o agente de busca web cachear proativamente contexto extra ao redor de cada fonte durante a pesquisa inicial, antecipando necessidades da síntese.
[ ] D - Dar ao agente de síntese uma ferramenta `verify_fact` de escopo limitado para checagens simples, enquanto roteia verificações complexas pelo coordenador para o agente de busca web.

---
Tags: Domain_2::Tool_Design_MCP_Integration

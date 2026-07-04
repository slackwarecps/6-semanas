Title: Claude Code para Integração Contínua
---

Seu componente de code review é iterativo: Claude analisa o arquivo modificado, depois pode pedir arquivos relacionados (imports, classes-base, testes) via chamadas de ferramenta para entender contexto antes de prover feedback final. Sua aplicação define uma ferramenta que permite a Claude pedir conteúdo de arquivos; Claude chama a ferramenta, recebe resultados e continua a análise. Você está avaliando processamento em lote para reduzir custo de API. Qual é a principal limitação técnica ao considerar processamento em lote para esse fluxo?

---
[ ] A - O processamento em lote não inclui IDs de correlação para mapear saídas de volta às requisições de entrada.
[ ] B - O modelo assíncrono não consegue executar ferramentas no meio da requisição e devolver resultados para Claude continuar a análise.
[ ] C - A Batch API não suporta definições de ferramentas nos parâmetros da requisição.
[ ] D - A latência de até 24 horas do processamento em lote é lenta demais para feedback de pull request, embora o fluxo funcionasse no resto.

---
Tags: Domain_2::Tool_Design_MCP_Integration

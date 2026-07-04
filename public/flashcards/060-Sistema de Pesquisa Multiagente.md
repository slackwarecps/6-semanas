Title: Sistema de Pesquisa Multiagente
---

No seu desenho de sistema, você deu ao agente de análise de documentos acesso a uma ferramenta de uso geral `fetch_url` para que ele pudesse baixar documentos por URL. Logs de produção mostram que esse agente agora frequentemente baixa páginas de resultados de busca para fazer busca web ad hoc — comportamento que deveria passar pelo agente de busca web — causando resultados inconsistentes. Qual correção é mais efetiva?

---
[ ] A - Substituir `fetch_url` por uma ferramenta `load_document` que valida que URLs apontem para formatos de documento.
[ ] B - Remover `fetch_url` do agente de análise de documentos e rotear toda busca por URL pelo coordenador para o agente de busca web.
[ ] C - Implementar filtragem que bloqueia chamadas de `fetch_url` para domínios conhecidos de buscadores enquanto permite outras URLs.
[ ] D - Adicionar instruções no prompt do agente de análise de documentos dizendo que `fetch_url` só deve ser usada para baixar URLs de documentos, não para buscar.

---
Tags: Domain_2::Tool_Design_MCP_Integration

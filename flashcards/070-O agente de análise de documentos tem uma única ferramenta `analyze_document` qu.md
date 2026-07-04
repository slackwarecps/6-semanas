Title: O agente de análise de documentos tem uma única ferramenta `analyze_document` que recebe um documento e um parâmetro de instrução em texto livre.
---

O agente de análise de documentos tem uma única ferramenta `analyze_document` que recebe um documento e um parâmetro de instrução em texto livre. Durante a avaliação, solicitações como "extrair as principais métricas financeiras" frequentemente retornam resumos narrativos, enquanto "resumir a metodologia" às vezes retorna tabelas de dados brutos. O agente de síntese relata que 35% dos resultados de análise exigem novas solicitações com instruções esclarecidas.

Qual é a forma mais eficaz de melhorar a confiabilidade?

---
[ ] A - Dividir a ferramenta genérica em ferramentas específicas para cada propósito — `extract_data_points`, `summarize_content`, `verify_claim_against_source` — cada uma com contratos de entrada/saída definidos.
[ ] B - Manter a ferramenta única, mas adicionar um parâmetro enum `analysis_type` que exija a seleção explícita entre os modos de extração, resumo e verificação.
[ ] C - Fazer com que o coordenador pré-classifique cada solicitação de análise antes de passar as instruções ao agente de análise de documentos.
[ ] D - Aprimorar a descrição da ferramenta com exemplos detalhados mostrando como diferentes formulações de instrução devem mapear para diferentes formatos de saída.

---
Tags: Domain_2::Tool_Design_MCP_Integration

Title: Sistema de Pesquisa Multiagente
---

Logs de produção mostram um padrão persistente: pedidos como "analise o relatório trimestral enviado" são roteados ao agente de busca web em 45% das vezes em vez de ao agente de análise de documentos. Revisando as definições das ferramentas, você descobre que o agente de busca web tem uma ferramenta `analyze_content` descrita como "analyzes content and extracts key information", enquanto o agente de análise de documentos tem `analyze_document` descrita como "analyzes documents and extracts key information". Como corrigir o problema de roteamento errado?

---
[ ] A - Adicionar um classificador de pré-roteamento que detecta se o usuário se refere a arquivos enviados ou a conteúdo web antes de o coordenador decidir a delegação.
[ ] B - Renomear a ferramenta de busca web para `extract_web_results` e atualizar sua descrição para "processes and returns information retrieved from web search and URLs."
[ ] C - Adicionar exemplos few-shot ao prompt do coordenador mostrando o roteamento correto: "User uploads a quarterly report → document analysis agent" e "User asks about a web page → web-search agent."
[ ] D - Expandir a descrição da ferramenta de análise de documentos com exemplos de uso como "Use for uploaded PDFs, Word docs, and spreadsheets," deixando a ferramenta de busca web inalterada.

---
Tags: Domain_2::Tool_Design_MCP_Integration

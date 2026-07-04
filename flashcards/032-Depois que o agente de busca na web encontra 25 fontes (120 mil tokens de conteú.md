Title: Depois que o agente de busca na web encontra 25 fontes (120 mil tokens de conteúdo bruto), o agente de análise de documentos extrai os principais insights (15 mil tokens) e o agente de síntese produz um rascunho de narrativa coerente (3 mil tokens), o coordenador deve passar o contexto para o agente de geração de relatórios para a saída final com as devidas citações de fonte.
---

Depois que o agente de busca na web encontra 25 fontes (120 mil tokens de conteúdo bruto), o agente de análise de documentos extrai os principais insights (15 mil tokens) e o agente de síntese produz um rascunho de narrativa coerente (3 mil tokens), o coordenador deve passar o contexto para o agente de geração de relatórios para a saída final com as devidas citações de fonte.

Qual estratégia de passagem de contexto oferece o melhor equilíbrio entre completude e eficiência?

---
[ ] A - Passar apenas o rascunho de síntese e ter um pipeline de pós-processamento separado para associar afirmações às fontes e inserir citações depois que o relatório for gerado.
[ ] B - Passar o rascunho de síntese junto com um índice de fontes estruturado que mapeia as principais afirmações às URLs de suas fontes e aos trechos relevantes.
[ ] C - Passar um resumo condensado de todas as etapas anteriores que preserva as principais descobertas e as atribui às fontes apenas pelo nome.
[ ] D - Passar todo o contexto acumulado de todos os agentes anteriores.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

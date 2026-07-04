Title: Claude Code para Integração Contínua
---

Sua review automatizada média 15 achados por PR e devs reportam taxa de FP de 40%. O gargalo é tempo de investigação: devs precisam clicar em cada achado para ler a justificativa do Claude antes de decidir corrigir ou descartar. Seu CLAUDE.md já contém regras abrangentes para padrões aceitáveis e stakeholders rejeitaram qualquer abordagem que filtre achados antes de devs verem. Qual mudança melhor ataca o tempo de investigação?

---
[ ] A - Exigir que Claude inclua sua justificativa e estimativa de confiança diretamente em cada achado.
[ ] B - Adicionar um pós-processador que analisa padrões de achados e suprime automaticamente os que casam com assinaturas históricas de FP.
[ ] C - Categorizar achados como "blocking issues" vs "suggestions", com requisitos de revisão diferentes por nível.
[ ] D - Configurar Claude para mostrar apenas achados de alta confiança, filtrando flags incertas antes de devs verem.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

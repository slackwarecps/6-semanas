Title: Claude Code para Integração Contínua
---

Um pull request altera 14 arquivos em um módulo de tracking de inventário. Uma review de única passagem que analisa todos os arquivos juntos produz resultados inconsistentes: feedback detalhado em alguns arquivos mas comentários superficiais em outros, bugs óbvios não detectados e feedback contraditório (um padrão é marcado em um arquivo mas código idêntico aprovado em outro arquivo no mesmo PR). Como reestruturar a review?

---
[ ] A - Rodar três passagens independentes de review do PR completo e marcar apenas problemas que aparecem em pelo menos duas das três execuções.
[ ] B - Dividir em passagens focadas: revisar cada arquivo individualmente para problemas locais, depois rodar uma passagem separada orientada a integração para examinar fluxos de dados cross-file.
[ ] C - Exigir que devs dividam PRs grandes em submissões menores de 3–4 arquivos antes de rodar review automatizada.
[ ] D - Mudar para um modelo maior com janela de contexto maior para que ele possa atender suficientemente todos os 14 arquivos em uma passagem.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

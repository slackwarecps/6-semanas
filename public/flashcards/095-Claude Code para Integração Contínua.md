Title: Claude Code para Integração Contínua
---

Seu time usa Claude Code para gerar sugestões de código, mas você nota um padrão: questões não-óbvias — otimizações de performance que quebram casos de borda, limpezas que mudam comportamento inesperadamente — só são pegas quando outro membro do time revisa o PR. O raciocínio do Claude durante a geração mostra que ele considerou esses casos mas concluiu que sua abordagem estava correta. Qual abordagem aborda diretamente a causa-raiz dessa limitação de auto-checagem?

---
[ ] A - Rodar uma segunda instância independente do Claude Code para revisar as mudanças sem acesso ao raciocínio do gerador.
[ ] B - Habilitar modo de extended thinking na geração para permitir deliberação mais minuciosa antes de produzir sugestões.
[ ] C - Adicionar instruções explícitas de auto-review ao prompt de geração pedindo que Claude critique suas próprias sugestões antes de finalizar.
[ ] D - Incluir arquivos de teste e documentação completos no contexto do prompt para que Claude entenda melhor o comportamento esperado durante a geração.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

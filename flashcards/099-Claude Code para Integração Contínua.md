Title: Claude Code para Integração Contínua
---

Sua review automatizada analisa comentários e docstrings. O prompt atual instrui Claude a "verificar que comentários estão precisos e atualizados". Achados frequentemente sinalizam padrões aceitáveis (marcadores TODO, descrições simples) enquanto perdem comentários que descrevem comportamento que o código não implementa mais. Qual mudança ataca a causa-raiz dessa análise inconsistente?

---
[ ] A - Incluir dados de `git blame` para que Claude possa identificar comentários anteriores a mudanças recentes de código.
[ ] B - Adicionar exemplos few-shot de comentários enganosos para ajudar o modelo a reconhecer padrões similares na base.
[ ] C - Filtrar TODO, FIXME e padrões de comentários descritivos antes da análise para reduzir ruído.
[ ] D - Especificar critérios explícitos: marcar comentários apenas quando o comportamento que afirmam contradiz o comportamento real do código.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

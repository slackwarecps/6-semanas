Title: Seu sistema de extração implementa novas tentativas automáticas quando a validação falha.
---

Seu sistema de extração implementa novas tentativas automáticas quando a validação falha. A cada nova tentativa, o erro de validação específico é anexado ao prompt. Essa abordagem de nova tentativa com feedback de erro resolve a maioria das falhas em 2-3 tentativas.

Para qual padrão de falha novas tentativas seriam MENOS eficazes?

---
[ ] A - O modelo extrai palavras-chave como um objeto aninhado organizado por categoria quando o esquema exige um array plano de strings
[ ] B - O modelo extrai contagens de citações como strings formatadas conforme o local ("1,234") quando o esquema exige inteiros
[ ] C - O modelo extrai datas como strings de data e hora ISO 8601 ("2023-03-15T00:00:00Z") quando o esquema exige apenas a parte da data (YYYY-MM-DD)
[ ] D - O modelo extrai "et al." para coautores quando a lista completa existe apenas em um documento externo que não está na entrada

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

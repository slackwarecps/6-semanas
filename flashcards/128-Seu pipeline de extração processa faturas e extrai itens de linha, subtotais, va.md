Title: Seu pipeline de extração processa faturas e extrai itens de linha, subtotais, valores de impostos e totais gerais.
---

Seu pipeline de extração processa faturas e extrai itens de linha, subtotais, valores de impostos e totais gerais. Durante a avaliação, você descobre que em 18% das extrações a soma dos valores dos itens de linha extraídos não corresponde ao total geral extraído — às vezes por erros de OCR no documento de origem, às vezes por erros de extração do modelo. Os sistemas contábeis downstream rejeitam registros com totais discrepantes.

Qual é a abordagem mais eficaz para melhorar a confiabilidade da extração?

---
[ ] A - Adicionar um campo "`calculated_total`", em que o modelo soma os itens de linha extraídos, ao lado de um campo "`stated_total`". Sinalizar os registros para revisão humana quando os valores diferirem.
[ ] B - Extrair os itens de linha e os totais de forma independente e, então, usar um modelo de validação separado para reconciliar as discrepâncias, determinando quais valores extraídos são mais prováveis de estar corretos.
[ ] C - Adicionar exemplos few-shot demonstrando faturas em que os itens de linha extraídos somam corretamente ao total declarado, incentivando o modelo a produzir extrações matematicamente consistentes.
[ ] D - Implementar um pós-processamento que ajusta automaticamente os valores dos itens de linha de forma proporcional quando a soma deles não corresponde ao total declarado.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

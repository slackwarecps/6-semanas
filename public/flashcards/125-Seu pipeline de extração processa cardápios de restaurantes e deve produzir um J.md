Title: Seu pipeline de extração processa cardápios de restaurantes e deve produzir um JSON estruturado com campos para nomes dos itens, descrições, preços e tags dietéticas.
---

Seu pipeline de extração processa cardápios de restaurantes e deve produzir um JSON estruturado com campos para nomes dos itens, descrições, preços e tags dietéticas. Alguns cardápios usam formatação inconsistente — preços como "$12" vs. "12.00", informação dietética como ícones vs. texto.

Qual é a abordagem mais confiável?

---
[ ] A - Usar chamadas de extração separadas para cada campo, garantindo o tratamento consistente de cada tipo.
[ ] B - Extrair os dados como estão e normalizar os formatos em código de pós-processamento depois que o Claude retornar.
[ ] C - Solicitar várias tentativas de extração por documento e selecionar o formato mais comum.
[ ] D - Definir um esquema de saída estrito e incluir regras de normalização de formato no seu prompt.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

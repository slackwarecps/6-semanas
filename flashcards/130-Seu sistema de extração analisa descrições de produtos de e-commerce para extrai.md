Title: Seu sistema de extração analisa descrições de produtos de e-commerce para extrair especificações como dimensões, peso e materiais em JSON.
---

Seu sistema de extração analisa descrições de produtos de e-commerce para extrair especificações como dimensões, peso e materiais em JSON. Apesar de ter um esquema bem definido, o modelo extrai o campo "materials" de forma inconsistente — às vezes retornando "cotton blend", outras vezes "Cotton/Polyester mix" e, ocasionalmente, omitindo o campo quando a informação de material está claramente presente na fonte.

Qual é a maneira mais eficaz de melhorar a consistência da extração?

---
[ ] A - Tornar o campo "materials" obrigatório em vez de opcional no esquema para forçar o modelo a sempre extrair um valor
[ ] B - Migrar para um nível de modelo mais capaz, já que a extração inconsistente indica capacidade de modelo insuficiente
[ ] C - Definir a temperatura como 0 para eliminar a aleatoriedade e garantir saídas determinísticas
[ ] D - Adicionar exemplos few-shot mostrando 2-3 pares completos de entrada-saída com formatos padronizados de descrição de material

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

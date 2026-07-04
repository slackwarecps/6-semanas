Title: Depois de implementar o uso de ferramentas com definições de esquema estritas, os erros de sintaxe JSON foram eliminados, mas 5% das extrações ainda têm JSON válido com arrays vazios ou valores nulos para campos obrigatórios como citações e metodologia.
---

Depois de implementar o uso de ferramentas com definições de esquema estritas, os erros de sintaxe JSON foram eliminados, mas 5% das extrações ainda têm JSON válido com arrays vazios ou valores nulos para campos obrigatórios como citações e metodologia. Uma verificação por amostragem revela que os documentos de origem contêm essas informações, mas em formatos variados — citações inline vs. bibliografias, seções de metodologia vs. detalhes embutidos nas introduções.

Qual é a maneira mais eficaz de tratar essas falhas?

---
[ ] A - Implementar uma lógica de nova tentativa que reenvia as requisições quando a validação detecta campos obrigatórios vazios.
[ ] B - Construir uma camada de pós-processamento baseada em regex que varre os documentos de origem em busca de padrões de citação e palavras-chave de metodologia, preenchendo os campos vazios quando o modelo falha em extrair.
[ ] C - Modificar seu esquema para tornar citações e metodologia opcionais e sinalizar os registros incompletos para revisão manual em vez de falhar na validação.
[ ] D - Adicionar exemplos few-shot demonstrando extrações de documentos com estruturas variadas — mostrando como identificar citações em diferentes formatos e localizar detalhes de metodologia em tipos diferentes de seção.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

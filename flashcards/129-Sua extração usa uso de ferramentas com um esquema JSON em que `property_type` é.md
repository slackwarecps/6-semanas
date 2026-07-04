Title: Sua extração usa uso de ferramentas com um esquema JSON em que `property_type` é definido como um enum: ['house', 'apartment', 'condo', 'townhouse'].
---

Sua extração usa uso de ferramentas com um esquema JSON em que `property_type` é definido como um enum: ['house', 'apartment', 'condo', 'townhouse']. Após a implantação, 8% das extrações falham na validação do esquema. A investigação revela que os anúncios mencionam muitos tipos de imóvel incomuns — "studio", "loft", "duplex", "mobile home", "tiny house", "converted warehouse" — e novos tipos continuam surgindo regularmente.

Qual é a solução de longo prazo mais eficaz?

---
[ ] A - Expandir continuamente o enum para incluir os tipos de imóvel recém-observados e adicionar monitoramento para casos extremos adicionais.
[ ] B - Adicionar um valor "other" ao seu enum, com um campo string `property_type_detail` separado para as especificidades quando "other" for selecionado.
[ ] C - Mudar `property_type` de enum para uma string de formato livre e implementar uma etapa de normalização no pós-processamento.
[ ] D - Adicionar exemplos few-shot ao seu prompt demonstrando como mapear tipos de imóvel inesperados para o valor de enum existente mais próximo.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

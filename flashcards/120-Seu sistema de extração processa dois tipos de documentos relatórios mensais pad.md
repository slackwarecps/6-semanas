Title: Seu sistema de extração processa dois tipos de documentos: relatórios mensais padrão (arquivados após o processamento) e relatórios de exceção urgentes (que devem disparar alertas de negócio em até 30 minutos do recebimento).
---

Seu sistema de extração processa dois tipos de documentos: relatórios mensais padrão (arquivados após o processamento) e relatórios de exceção urgentes (que devem disparar alertas de negócio em até 30 minutos do recebimento). Ambos usam o mesmo esquema JSON. Você quer minimizar os custos de API atendendo aos requisitos de latência.

Como você deve arquitetar o pipeline de processamento?

---
[ ] A - Enviar todos os documentos para a Messages API em tempo real, garantindo latência de processamento consistente entre os tipos de documento.
[ ] B - Enviar todos os documentos para a `Batch API` com `custom_ids` para rastreamento. Quando os resultados chegarem, processar imediatamente os documentos urgentes e disparar alertas atrasados para as exceções.
[ ] C - Enfileirar todos os documentos e enviar batches a cada hora, sinalizando os documentos urgentes para tratamento acelerado quando os resultados do batch retornarem.
[ ] D - Rotear os relatórios padrão para a `Batch API`, obtendo 50% de economia de custo, e rotear os relatórios de exceção urgentes para a Messages API em tempo real.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

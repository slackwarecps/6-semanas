Title: After two iterations describing requirements in prose, the output structure still doesn't match — fields nested differently, timestamps wrong.
---

After two iterations describing requirements in prose, the output structure still doesn't match — fields nested differently, timestamps wrong. Claude interprets prose differently each time. What's the most effective approach for the next iteration?
O que a pergunta pede: most effective approach for the next iteration → o próximo passo mais eficaz.

A pegadinha: A prosa já falhou duas vezes → mostre exemplos concretos em vez de descrever.

Raciocínio: A prosa (descrição) já falhou repetidamente — mais prosa precisa ( D ) é "mais do mesmo". Exemplos concretos de entrada-saída são a forma mais confiável de comunicar a estrutura exata (few-shot). A valida mas não comunica a intenção; C é diagnóstico, não solução. B .

---
[ ] A - Write a JSON schema and validate output against it each iteration.
[ ] B - Provide 2-3 concrete input-output examples showing the expected transformation.
[ ] C - Ask Claude to explain its current interpretation to find where it diverges.
[ ] D - Rewrite requirements with greater technical precision (field mappings, nesting rules, timestamp format).

---
Tags: Domain_3::Claude_Code_Configuration_Workflows

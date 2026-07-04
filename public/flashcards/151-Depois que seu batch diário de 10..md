Title: Depois que seu batch diário de 10.
---

Depois que seu batch diário de 10.000 documentos é concluído, 300 documentos (3%) falharam com erros "`context_length_exceeded`". O arquivo de resultados identifica cada falha por `custom_id`.

Qual é a abordagem mais econômica para processar essas falhas?

---
[ ] A - Reprocessar o batch inteiro com prompt caching habilitado para reduzir o custo de repetir requisições com prompts de sistema idênticos
[ ] B - Reenviar apenas os 300 documentos que falharam, após dividi-los em pedaços menores, e então combinar as extrações parciais
[ ] C - Reenviar o batch inteiro de 10.000 documentos usando um nível de modelo com uma janela de contexto maior
[ ] D - Aumentar o parâmetro `max_tokens` para os 300 documentos que falharam e reenviá-los em um novo batch

---
Tags: Domain_5::Context_Management_Reliability

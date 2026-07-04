Title: Agente de Suporte ao Cliente
---

Logs de produção mostram um padrão: clientes referenciam valores específicos (ex.: "o desconto de 15% que mencionei"), mas o agente responde com valores incorretos. Investigação mostra que esses detalhes foram mencionados 20+ turnos atrás e condensados em sumários vagos como "preços promocionais foram discutidos". Qual correção é mais efetiva?

---
[ ] A - Aumentar o limiar de sumarização de 70% para 85% para que conversas tenham mais espaço antes de a sumarização disparar.
[ ] B - Armazenar histórico completo da conversa em armazenamento externo e implementar recuperação quando o agente detectar referências como "como mencionei".
[ ] C - Extrair fatos transacionais (valores, datas, números de pedido) para um bloco persistente de "case facts" incluído em todo prompt fora do histórico sumarizado.
[ ] D - Revisar o prompt de sumarização para preservar explicitamente todos os números, percentuais, datas e expectativas declaradas pelo cliente verbatim.

---
Tags: Domain_5::Context_Management_Reliability

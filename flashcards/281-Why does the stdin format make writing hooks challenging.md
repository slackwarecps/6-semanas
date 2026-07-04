Title: Why does the stdin format make writing hooks challenging?
---

Why does the stdin format make writing hooks challenging?
[Resposta correta: A estrutura do stdin varia por tipo de hook e, em Pre/PostToolUse, o tool_input muda conforme a tool chamada. As demais afirmações sobre o formato são incorretas.]

---
[ ] A - The stdin is always binary and needs manual decoding
[ ] B - The input changes according to the hook type and, in Pre/PostToolUse, the tool_input still varies according to the tool
[ ] C - The stdin only accepts plain text, never JSON
[ ] D - The format is fixed and identical for all hooks, which is confusing

---
Tags: Domain_3::Claude_Code_Configuration_Workflows

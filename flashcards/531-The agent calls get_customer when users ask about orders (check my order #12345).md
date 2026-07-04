Title: The agent calls get_customer when users ask about orders ("check my order #12345") instead of lookup_order .
---

The agent calls get_customer when users ask about orders ("check my order #12345") instead of lookup_order . Both have minimal descriptions and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?
O que a pergunta pede: most effective first step → o primeiro passo (comece pelo mais básico).

A pegadinha: Descrições mínimas e formatos parecidos → a raiz é a descrição pobre.

Raciocínio: O primeiro passo é sempre o mais fundamental e barato: corrigir as descrições pobres (a causa direta). Few-shot ( B ) é o passo seguinte se ainda persistir; C muda a arquitetura (drástico); D adiciona infraestrutura. A . (Compare com a Q48, onde a pergunta já fixava few-shot.)

---
[ ] A - Expand each description with input formats, example queries, edge cases, and boundaries explaining when to use one vs the other.
[ ] B - Add 5-8 few-shot examples routing order queries to lookup_order.
[ ] C - Consolidate both into a single lookup_entity tool.
[ ] D - A routing layer that parses input and pre-selects by keywords.

---
Tags: Domain_2::Tool_Design_MCP_Integration

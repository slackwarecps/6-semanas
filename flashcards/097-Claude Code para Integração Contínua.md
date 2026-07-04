Title: Claude Code para Integração Contínua
---

Suas reviews automatizadas encontram problemas reais, mas devs reportam que o feedback não é acionável. Achados incluem frases como "lógica complexa de roteamento de tickets" ou "potencial null pointer" sem especificar o que exatamente mudar. Quando você adiciona instruções detalhadas como "sempre inclua sugestões concretas de correção", o modelo ainda produz saída inconsistente — às vezes detalhada, às vezes vaga. Qual técnica de prompting produz feedback consistentemente acionável de forma mais confiável?

---
[ ] A - Refinar mais as instruções com requisitos mais explícitos para cada parte do formato de feedback (location, issue, severity, proposed fix).
[ ] B - Expandir a janela de contexto para incluir mais código adjacente para que o modelo tenha informação suficiente para propor correções concretas.
[ ] C - Implementar uma abordagem em duas passagens em que um prompt identifica problemas e outro gera correções, permitindo especialização.
[ ] D - Adicionar 3–4 exemplos few-shot mostrando o formato exato exigido: problema identificado, localização no código, sugestão concreta de correção.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

Title: A colleague suggests the document analysis agent send output directly to synthesis instead of routing through the coordinator.
---

A colleague suggests the document analysis agent send output directly to synthesis instead of routing through the coordinator. What is the main advantage of keeping the coordinator as the central hub?
O que a pergunta pede: main advantage of keeping the coordinator as the central hub → a vantagem do hub central.

Raciocínio: O valor do hub é controle e observabilidade : ver tudo, padronizar o tratamento de erros e controlar o fluxo de informação. A é um detalhe que outros desenhos também fariam; B é falso (o hub adiciona um salto, não reduz latência); D é tecnicamente impreciso. C .

---
[ ] A - It enables automatic retry logic that direct calls can't support.
[ ] B - It batches requests, reducing API calls and latency.
[ ] C - It can observe all interactions, handle errors consistently, and decide what information each subagent receives.
[ ] D - Subagents have isolated memory, and direct communication needs complex serialization only the coordinator can do.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

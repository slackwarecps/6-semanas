Title: Padrões de Arquitetura de IA Conversacional
---

Sua ferramenta `remove_team_member` usa um parâmetro `dry_run: boolean` para visualizar impactos antes da execução. Monitoramento de produção mostra que o agente burla o passo de preview chamando com `dry_run=false` diretamente. Você precisa garantir que toda remoção seja precedida por um preview que o usuário confirme explicitamente.

Qual é a abordagem mais confiável?

---
[ ] A - Adicionar validação no servidor que permite `dry_run=false` apenas quando uma chamada `dry_run=true` com parâmetros idênticos ocorreu nos últimos 60 segundos.
[ ] B - Anotar a ferramenta como exigindo confirmação e configurar a camada de orquestração para pedir aprovação ao usuário antes de encaminhar quaisquer chamadas a ferramentas anotadas.
[ ] C - Adicionar instruções detalhadas e exemplos few-shot na descrição da ferramenta exigindo que o agente sempre chame com `dry_run=true` primeiro e espere confirmação antes de chamar de novo.
[ ] D - Substituir por duas ferramentas: `preview_remove_member` retorna detalhes de impacto e um token de confirmação de uso único; `execute_remove_member` exige esse token, ligando a execução ao preview.

---
Tags: Domain_2::Tool_Design_MCP_Integration

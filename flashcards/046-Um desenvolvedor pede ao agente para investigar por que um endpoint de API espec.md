Title: Um desenvolvedor pede ao agente para investigar por que um endpoint de API específico retorna erros 500 de forma intermitente.
---

Um desenvolvedor pede ao agente para investigar por que um endpoint de API específico retorna erros 500 de forma intermitente. A base de código tem mais de 200 arquivos e o desenvolvedor não sabe quais componentes estão envolvidos. O agente precisa rastrear o erro pelas camadas de roteamento, middleware, lógica de negócio e banco de dados.

Qual abordagem de decomposição de tarefas seria mais eficaz?

---
[ ] A - Fazer o agente primeiro criar um plano abrangente mapeando todos os caminhos de código pelo endpoint antes de iniciar qualquer exploração de arquivos ou leitura de código.
[ ] B - Fazer o agente gerar dinamicamente subtarefas de investigação com base no que descobre a cada passo, adaptando seu plano de exploração à medida que novas informações sobre o caminho do erro surgem.
[ ] C - Definir antecipadamente uma sequência fixa de passos de investigação — fazer grep de padrões de erro, depois ler os tratadores de erro, depois verificar as consultas ao banco de dados, depois examinar o middleware — executando cada passo independentemente das descobertas intermediárias.
[ ] D - Executar agentes de trabalho paralelos que investigam simultaneamente todas as quatro camadas e, então, sintetizar suas descobertas para identificar onde o erro se origina.

---
Tags: Domain_1::Agentic_Architecture_Orchestration

Title: Após a implantação, você descobre que 12% das extrações contêm erros semânticos que passam na validação do esquema JSON (por exemplo, uma duração como "30 minutes" colocada incorretamente em um campo de quantidade de ingrediente).
---

Após a implantação, você descobre que 12% das extrações contêm erros semânticos que passam na validação do esquema JSON (por exemplo, uma duração como "30 minutes" colocada incorretamente em um campo de quantidade de ingrediente). Os revisores humanos têm capacidade para verificar apenas 20% das extrações.

Qual abordagem aloca a atenção dos revisores de forma mais eficaz?

---
[ ] A - Fazer o modelo gerar pontuações de confiança no nível de campo e, então, calibrar os limiares de revisão usando um conjunto de validação rotulado.
[ ] B - Amostrar aleatoriamente 20% das extrações para revisão, usando as correções para acompanhar a precisão e identificar padrões de erro.
[ ] C - Priorizar a revisão de todas as extrações em que campos obrigatórios estão vazios ou explicitamente marcados como não encontrados.
[ ] D - Revisar todas as extrações de documentos com anomalias de formatação, como layouts incomuns ou tipos de conteúdo mistos.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output

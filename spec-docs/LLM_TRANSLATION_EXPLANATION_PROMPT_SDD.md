# SDD - Prompt de Tradução e Explicação por IA

## 1. Objetivo

Ajustar o prompt do LLM no backend para que, ao devolver a explicação de uma pergunta:

- analise a pergunta e todas as alternativas;
- traduza fielmente pergunta e alternativas para português do Brasil;
- explique de forma didática para um **adulto tech lead**;
- explique de forma didática para uma **criança de 10 anos**;
- indique claramente a alternativa correta;

---

## 2. Requisitos de Saída

O prompt deve produzir a `explicacao` no seguinte formato:

```text
{Tradução fiel para português pergunta e alternativas}
--
{Explicação didática com análise das alternativas}

- Alternativa Correta: [X]
```

### 2.1 Diretrizes do conteúdo

- Traduzir com fidelidade o enunciado e todas as alternativas.
- Explicar o raciocínio da resposta correta.
- Detalhar por que as alternativas incorretas não são as melhores escolhas.
- Manter tom claro, técnico e didático.
- Incluir uma parte voltada a um público adulto tech lead e outra adaptada para criança.

---

## 3. Escopo

### 3.1 Dentro do escopo

- Localizar o prompt atual no backend.
- Ajustar o template de saída da explicação.
- Garantir consistência com o formato esperado pela UI/consumidor.

### 3.2 Fora do escopo

- Alterar a lógica de seleção da resposta correta.
- Mudar o fluxo de tradução/explicação além do prompt.
- Alterar a UI, exceto se necessário para consumo do novo formato.

---

## 4. Critérios de Aceite

- O prompt analisa pergunta e alternativas.
- A tradução vem fiel em pt-BR.
- A explicação atende adulto tech lead e criança de 10 anos.
- A alternativa correta fica explícita.
- O encerramento pergunta se o usuário quer enviar outra questão.
- O formato de saída segue o padrão definido.

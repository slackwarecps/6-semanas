---
name: exporta-sqlite-para-anki
user-invocable: true
description: Exporta perguntas do banco do app (backend/database.sqlite) para um pacote .colpkg importavel no Anki, escolhendo quantidade, IDs (seq) especificos ou intervalo.
argument-hint: "--quantidade N | --ids 001,010,050 | --intervalo 001-020 | --todas  [--output caminho/arquivo.colpkg]"
---

# Skill: Exportar perguntas para Anki (.colpkg)

Gera um pacote `.colpkg` importável no Anki a partir das perguntas do banco do
app — `backend/database.sqlite`, tabela `cards` (título, pergunta com
alternativas, alternativa correta em `answer`, `explanation` e tags). Os antigos
`public/flashcards/*.md` + `flashcards-metadata.json` eram só o seed original e
não são mais usados.

## Uso

```
/exporta-sqlite-para-anki --quantidade 10
/exporta-sqlite-para-anki --ids 001,005,010
/exporta-sqlite-para-anki --intervalo 001-020
/exporta-sqlite-para-anki --todas
/exporta-sqlite-para-anki --quantidade 5 --output public/anki/lote1.colpkg
```

## Parâmetros

| Parâmetro | Descrição |
|---|---|
| `--quantidade N` | Exporta as N primeiras perguntas (ordem do campo `seq`) |
| `--ids 001,010,050` | Exporta só as perguntas com esses `seq` (com ou sem zeros à esquerda) |
| `--intervalo 001-020` | Exporta o intervalo de `seq` (inclusive) |
| `--todas` | Exporta todas as perguntas do banco |
| `--output caminho` | Caminho de saída (padrão: `public/anki/anki-exported.colpkg`) |

Use exatamente um entre `--quantidade`, `--ids`, `--intervalo` ou `--todas`.

## Como executar

Rode o script Node incluído nesta skill a partir da raiz do projeto:

```bash
node .claude/skills/exporta-sqlite-para-anki/export.js --quantidade 10
```

O script já resolve o caminho do projeto sozinho (usa `__dirname`), então funciona
de qualquer diretório. Ele reutiliza o `sql.js` já presente em `node_modules/`.

## Mapeamento para o card do Anki

- **Front**: `<b>Título</b><br><br>Pergunta` (a pergunta já inclui as alternativas `[ ] A - ...`)
- **Back**: conteúdo do campo `answer` do banco, exatamente como está (sem prefixo e sem `explanation`)
- **Tags**: tags do card separadas por espaço, sem vírgula (formato nativo do Anki);
  resíduos do seed antigo com prefixo `Tags:` são limpos na exportação

## Detalhes técnicos do formato gerado

Gera um `collection.anki2` em schema legado do Anki (`ver=11`) — o mesmo formato
que a biblioteca `genanki` produz e que o Anki importa nativamente (upgrade
automático no import). Esse formato foi validado ponta a ponta com a biblioteca
oficial `anki` (Python/Rust) via `import_anki_package`, e várias armadilhas já
foram descobertas e corrigidas no script (`export.js`) — **não remova nem
"simplifique" estes pontos sem testar de novo**, pois cada um já quebrou o
import pelo menos uma vez:

- `col.tags` tem que ser o JSON `'{}'`, nunca string vazia (era `''` na primeira
  tentativa e quebrava o import com `JsonError: EOF while parsing a value`)
- os campos de cada nota (`flds`) precisam do separador `0x1F` entre Front e Back
- `id` do note type (`models[...].id`) precisa ser **string**, não number
- o note type precisa da chave `tags: []`
- `dconf[...].new` precisa de `separate`; `dconf[...].rev` precisa de `fuzz` e `minSpace`
- o HTML de layout (`<b>`, `<br>`) não pode passar pelo escapador de HTML —
  só o texto do usuário (título/pergunta/resposta) é escapado antes de ser envolto nas tags

Se o Anki voltar a rejeitar o arquivo, o jeito mais confiável de depurar é
instalar temporariamente o pacote Python `anki` (`pip install anki`) e testar
com `Collection(...).import_anki_package(...)` — dá o erro real do backend em
vez de "arquivo inválido". Lembre de desinstalar o pacote e restaurar a versão
do `protobuf` depois (ele sobe a versão do protobuf globalmente e pode quebrar
outros projetos Python que dependam de uma versão mais antiga).

## Após gerar

1. Rode `PRAGMA integrity_check;` no `collection.anki2` extraído do zip (deve
   retornar `ok`) como sanity check rápido.
2. Informe ao Fabão o caminho do arquivo gerado e a lista de perguntas exportadas.
3. Um aviso do Anki pedindo para atualizar para o "v3 scheduler" ao importar é
   normal e não tem relação com o arquivo — é uma preferência da coleção do
   próprio usuário, pode aceitar.

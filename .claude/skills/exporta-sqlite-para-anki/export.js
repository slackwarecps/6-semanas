#!/usr/bin/env node
/**
 * Exporta perguntas do banco do app (backend/database.sqlite, tabela cards)
 * para um pacote .colpkg importavel no Anki.
 *
 * Fonte dos dados: backend/database.sqlite (SQLModel/FastAPI) — a fonte da
 * verdade do app. O campo `question` ja inclui as alternativas ([ ] A - ...),
 * `answer` traz a alternativa correta ("D - texto") e `explanation` a
 * justificativa. Os antigos public/flashcards/*.md + flashcards-metadata.json
 * eram apenas o seed original e nao sao mais usados aqui.
 *
 * Sem dependencias npm: usa o CLI `sqlite3` do macOS tanto para ler o banco
 * (-json) quanto para gerar o collection.anki2 (script SQL).
 *
 * Uso:
 *   node export.js --quantidade 10
 *   node export.js --ids 001,005,010
 *   node export.js --intervalo 001-020
 *   node export.js --todas
 *   node export.js --quantidade 5 --output public/anki/meu-arquivo.colpkg
 *
 * Os IDs/intervalos referem-se ao campo `seq` do card (1..540), aceitando com
 * ou sem zeros a esquerda ("7" == "007").
 *
 * Formato do card gerado no Anki:
 *   Front = <b>Titulo</b><br><br>Pergunta (com alternativas)
 *   Back  = Alternativa correta: X - texto\n\nExplicacao
 *   Tags  = tags separadas por espaco (sem virgula), formato nativo do Anki
 *
 * Schema usado: Anki legado (collection.anki2, ver=11), o mesmo formato que a
 * biblioteca genanki gera e que o Anki moderno importa nativamente (upgrade
 * automatico no import). Detalhes criticos ja validados na pratica com a lib
 * oficial "anki" (python) via import_anki_package:
 *   - col.tags DEVE ser '{}' (JSON), nunca string vazia
 *   - flds das notes usa separador 0x1F entre campos
 *   - model.id deve ser STRING (nao numero)
 *   - model precisa da chave "tags": []
 *   - dconf.new precisa de "separate"; dconf.rev precisa de "fuzz" e "minSpace"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const DB_PATH = path.join(ROOT, 'backend', 'database.sqlite');

function parseArgs(argv) {
  const args = { quantidade: null, ids: null, intervalo: null, todas: false, output: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--quantidade') args.quantidade = parseInt(argv[++i], 10);
    else if (a === '--ids') args.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--intervalo') args.intervalo = argv[++i].trim();
    else if (a === '--todas') args.todas = true;
    else if (a === '--output') args.output = argv[++i];
  }
  return args;
}

function selectRows(rows, args) {
  if (args.ids) {
    const wanted = new Set(args.ids.map(id => parseInt(id, 10)));
    const selected = rows.filter(r => wanted.has(r.seq));
    const found = new Set(selected.map(r => r.seq));
    const missing = [...wanted].filter(seq => !found.has(seq));
    if (missing.length) throw new Error(`seq nao encontrados no banco: ${missing.join(', ')}`);
    return selected;
  }
  if (args.intervalo) {
    const [start, end] = args.intervalo.split('-').map(s => parseInt(s.trim(), 10));
    if (!start || !end) throw new Error('Formato de --intervalo invalido, use ex: 001-020');
    return rows.filter(r => r.seq >= start && r.seq <= end);
  }
  if (args.quantidade) {
    if (args.quantidade <= 0) throw new Error('--quantidade deve ser maior que zero');
    return rows.slice(0, args.quantidade);
  }
  if (args.todas) return rows;
  throw new Error('Especifique --quantidade N, --ids 001,002, --intervalo 001-020 ou --todas');
}

function parseTags(tagsJson) {
  let raw;
  try {
    raw = JSON.parse(tagsJson || '[]');
  } catch {
    raw = [];
  }
  // Remove residuos do seed antigo (ex: "Tags:feijao" veio da linha "Tags:" do markdown)
  return raw
    .map(t => String(t).replace(/^Tags:/, '').trim())
    .filter(Boolean);
}

function buildCard(row) {
  // Verso do card = campo `answer` do banco, exatamente como esta (sem prefixo
  // e sem anexar `explanation`)
  return {
    title: row.title,
    question: row.question,
    answer: row.answer || '',
    tags: parseTags(row.tags)
  };
}

function htmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toField(s) {
  return htmlEscape(s).replace(/\n/g, '<br>');
}

function csumOf(sfld) {
  const hash = crypto.createHash('sha1').update(sfld, 'utf8').digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

// Literal SQL de string: aspas simples duplicadas (unico escape do SQLite)
function q(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(DB_PATH)) throw new Error(`Banco nao encontrado: ${DB_PATH}`);

  const rowsJson = execFileSync('sqlite3', [
    '-json', '-readonly', DB_PATH,
    'SELECT seq, title, question, answer, explanation, tags FROM cards WHERE seq IS NOT NULL ORDER BY seq'
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const rows = rowsJson.trim() ? JSON.parse(rowsJson) : [];
  if (!rows.length) throw new Error('Nenhum card encontrado na tabela cards.');

  const selected = selectRows(rows, args);
  if (selected.length === 0) throw new Error('Nenhum card selecionado.');

  const cards = selected.map(buildCard);

  console.log(`Exportando ${cards.length} card(s):`);
  cards.forEach((c, i) => console.log(`  ${i + 1}. ${c.title} [tags: ${c.tags.join(' ')}]`));

  const now = Date.now();
  const nowSec = Math.floor(now / 1000);
  const modelId = now - 3;
  const deckId = 1;

  const model = {
    [modelId]: {
      id: String(modelId),
      name: 'Basico (Flashcards App)',
      type: 0,
      mod: nowSec,
      usn: -1,
      sortf: 0,
      did: deckId,
      tmpls: [{
        name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{FrontSide}}<hr id="answer">{{Back}}',
        bqfmt: '', bafmt: '', did: null, bfont: '', bsize: 0
      }],
      flds: [
        { name: 'Front', ord: 0, sticky: false, rtl: false, font: 'Arial', size: 20, media: [] },
        { name: 'Back', ord: 1, sticky: false, rtl: false, font: 'Arial', size: 20, media: [] }
      ],
      css: '.card { font-family: arial; font-size: 20px; text-align: left; color: black; background-color: white; }',
      latexPre: '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      latexPost: '\\end{document}',
      latexsvg: false,
      req: [[0, 'all', [0]]],
      tags: [],
      vers: []
    }
  };

  const decks = {
    [deckId]: {
      id: deckId, name: 'Default', mod: nowSec, usn: -1,
      lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0],
      collapsed: false, desc: '', dyn: 0, conf: 1, extendNew: 0, extendRev: 0
    }
  };

  const dconf = {
    1: {
      id: 1, name: 'Default', mod: 0, usn: 0, maxTaken: 60, autoplay: true, timer: 0, replayq: true,
      new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true },
      rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 200 },
      lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 },
      dyn: false
    }
  };

  const conf = {
    nextPos: 1, estTimes: true, activeDecks: [deckId], sortType: 'noteFld', timeLim: 0,
    sortBackwards: false, addToCur: true, curDeck: deckId, newBury: true, newSpread: 0,
    dueCounts: true, curModel: String(modelId), collapseTime: 1200
  };

  const sql = [];
  sql.push(`
    CREATE TABLE col (
      id INTEGER PRIMARY KEY, crt INTEGER NOT NULL, mod INTEGER NOT NULL, scm INTEGER NOT NULL,
      ver INTEGER NOT NULL, dty INTEGER NOT NULL, usn INTEGER NOT NULL, ls INTEGER NOT NULL,
      conf TEXT NOT NULL, models TEXT NOT NULL, decks TEXT NOT NULL, dconf TEXT NOT NULL, tags TEXT NOT NULL
    );
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY, guid TEXT NOT NULL, mid INTEGER NOT NULL, mod INTEGER NOT NULL,
      usn INTEGER NOT NULL, tags TEXT NOT NULL, flds TEXT NOT NULL, sfld INTEGER NOT NULL,
      csum INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL
    );
    CREATE TABLE cards (
      id INTEGER PRIMARY KEY, nid INTEGER NOT NULL, did INTEGER NOT NULL, ord INTEGER NOT NULL,
      mod INTEGER NOT NULL, usn INTEGER NOT NULL, type INTEGER NOT NULL, queue INTEGER NOT NULL,
      due INTEGER NOT NULL, ivl INTEGER NOT NULL, factor INTEGER NOT NULL, reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL, left INTEGER NOT NULL, odue INTEGER NOT NULL, odid INTEGER NOT NULL,
      flags INTEGER NOT NULL, data TEXT NOT NULL
    );
    CREATE TABLE revlog (
      id INTEGER PRIMARY KEY, cid INTEGER NOT NULL, usn INTEGER NOT NULL, ease INTEGER NOT NULL,
      ivl INTEGER NOT NULL, lastIvl INTEGER NOT NULL, factor INTEGER NOT NULL, time INTEGER NOT NULL,
      type INTEGER NOT NULL
    );
    CREATE TABLE graves (usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL);
    CREATE INDEX ix_notes_usn ON notes (usn);
    CREATE INDEX ix_cards_usn ON cards (usn);
    CREATE INDEX ix_revlog_usn ON revlog (usn);
    CREATE INDEX ix_cards_nid ON cards (nid);
    CREATE INDEX ix_cards_sched ON cards (did, queue, due);
    CREATE INDEX ix_revlog_cid ON revlog (cid);
    CREATE INDEX ix_notes_mid ON notes (mid);
  `);

  sql.push(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) VALUES ` +
    `(1, ${nowSec}, ${now}, ${now}, 11, 0, 0, 0, ${q(JSON.stringify(conf))}, ${q(JSON.stringify(model))}, ` +
    `${q(JSON.stringify(decks))}, ${q(JSON.stringify(dconf))}, '{}');`
  );

  let noteId = now;
  let cardId = now + 100;
  for (const card of cards) {
    noteId += 1;
    cardId += 1;

    const front = `<b>${toField(card.title)}</b><br><br>${toField(card.question)}`;
    const back = toField(card.answer);
    const flds = `${front}\x1f${back}`; // Anki separa campos com 0x1F
    const tagsField = card.tags.length ? ` ${card.tags.join(' ')} ` : '';
    const guid = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);

    sql.push(
      `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) VALUES ` +
      `(${noteId}, ${q(guid)}, ${modelId}, ${nowSec}, -1, ${q(tagsField)}, ${q(flds)}, ${q(front)}, ${csumOf(front)}, 0, '');`
    );
    sql.push(
      `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) VALUES ` +
      `(${cardId}, ${noteId}, ${deckId}, 0, ${nowSec}, -1, 0, 0, ${cardId - now}, 0, 0, 0, 0, 0, 0, 0, 0, '{}');`
    );
  }

  const outputRel = args.output || 'public/anki/anki-exported.colpkg';
  const outputPath = path.isAbsolute(outputRel) ? outputRel : path.join(ROOT, outputRel);
  const buildDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'anki-export-'));

  const sqlPath = path.join(buildDir, 'build.sql');
  fs.writeFileSync(sqlPath, sql.join('\n'), 'utf8');
  execFileSync('sqlite3', [path.join(buildDir, 'collection.anki2')], {
    input: fs.readFileSync(sqlPath)
  });
  fs.writeFileSync(path.join(buildDir, 'media'), '{}');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  execFileSync('zip', ['-X', outputPath, 'collection.anki2', 'media'], { cwd: buildDir });
  fs.rmSync(buildDir, { recursive: true, force: true });

  console.log(`\nPacote gerado: ${outputPath}`);
}

try {
  main();
} catch (err) {
  console.error('Erro:', err.message);
  process.exit(1);
}

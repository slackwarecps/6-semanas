# 🔄 Migração: localStorage → SQLite

## Resumo Executivo

A aplicação foi migrada de **localStorage puro** para **SQLite com sql.js**, melhorando significativamente a capacidade de armazenamento e performance para grandes conjuntos de dados.

### O que mudou?

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Storage** | JSON em localStorage (~5MB limit) | SQLite via WASM (~50MB+ disponível) |
| **Performance** | Parse JSON completo em cada acesso | Queries SQL diretas |
| **Estrutura** | Array JSON flat | Tabelas relacionais normalizadas |
| **Migração** | Manual | Automática na primeira execução |

---

## 🏗️ Arquitetura Implementada

### Camadas de Storage

```
┌─────────────────────────┐
│   Angular Components    │
│   (NavBar, StudyPage)   │
└────────────┬────────────┘
             │
┌────────────▼────────────────────────┐
│   SqliteAdapter                     │
│   (implements StorageInterface)     │
├─────────────────────────────────────┤
│ • saveCard(card)                    │
│ • loadCard(id)                      │
│ • loadAllCards()                    │
│ • deleteCard(id)                    │
│ • initialize()                      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   sql.js (SQLite in WASM)           │
│   • Database em memória             │
│   • Persistência em localStorage    │
│   • Base64 encoded                  │
└─────────────────────────────────────┘
```

### Fluxo de Inicialização

```
1. App Bootstrap (app.component.ts)
   │
   ├─→ MigrationService.migrateFromLocalStorage()
   │   ├─→ Verifica flag 'flashcards:migration:completed'
   │   ├─→ Se não migrado:
   │   │   ├─→ Carrega dados antigos de 'flashcards:cards:v1'
   │   │   ├─→ Inicializa SqliteAdapter
   │   │   └─→ Insere cada card no SQLite
   │   └─→ Marca migration como completo
   │
   └─→ Aplicação pronta para usar SQLite
```

---

## 📊 Esquema de Banco de Dados

### Tabela: `cards`

Armazena metadados dos cartões:

```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT NOT NULL,           -- JSON array como string
  state TEXT NOT NULL,           -- 'New' | 'Learning' | 'Review' | 'Relearning'
  interval INTEGER NOT NULL,     -- Dias até próxima revisão
  easeFactor REAL NOT NULL,      -- Fator SM-2 (1.3 - 5.0)
  repetitions INTEGER NOT NULL,  -- Número de repetições corretas
  createdAt INTEGER NOT NULL,    -- Timestamp
  updatedAt INTEGER NOT NULL,    -- Timestamp
  nextReviewDate INTEGER NOT NULL -- Timestamp
);
```

### Tabela: `card_options`

Opções de múltipla escolha:

```sql
CREATE TABLE card_options (
  id TEXT NOT NULL,
  optionId TEXT NOT NULL,
  text TEXT NOT NULL,
  isCorrect INTEGER NOT NULL,    -- 0 ou 1
  optionOrder INTEGER NOT NULL,
  PRIMARY KEY (id, optionId),
  FOREIGN KEY (id) REFERENCES cards(id)
);
```

### Tabela: `attempts`

Histórico de tentativas:

```sql
CREATE TABLE attempts (
  id TEXT NOT NULL,
  attemptId TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  quality INTEGER NOT NULL,      -- 1-4 (SM-2 quality)
  elapsedTime INTEGER NOT NULL,  -- Milissegundos
  wasCorrect INTEGER NOT NULL,   -- 0 ou 1
  userAnswer TEXT,               -- Resposta do usuário
  easeFactorBefore REAL NOT NULL,
  easeFactorAfter REAL NOT NULL,
  intervalBefore INTEGER NOT NULL,
  intervalAfter INTEGER NOT NULL,
  PRIMARY KEY (id, attemptId),
  FOREIGN KEY (id) REFERENCES cards(id)
);
```

---

## 🔄 Fluxo de Persistência

### Salvar um Card

```typescript
// 1. Chamada do repositório
await cardRepository.save(card);

// 2. SqliteAdapter.saveCard()
//    ├─→ Converte Card para formato SQLite
//    ├─→ INSERT ou UPDATE em 'cards'
//    ├─→ DELETE e INSERT de 'card_options'
//    ├─→ DELETE e INSERT de 'attempts'
//    ├─→ COMMIT implícito
//    └─→ persist() → localStorage

// 3. Banco é exportado e salvo como base64
const data = this.db.export();  // Uint8Array
const base64 = btoa(String.fromCharCode.apply(null, data));
localStorage.setItem('flashcards:sqlite:db', base64);
```

### Carregar Cards

```typescript
// 1. SqliteAdapter.loadAllCards()
//    ├─→ SELECT * FROM cards
//    ├─→ Para cada card, busca options e attempts
//    ├─→ Reconstrói objetos de domínio
//    └─→ Retorna Card[]

// 2. Sem chamadas adicionais ao localStorage
//    (todo banco já está carregado em memória)
```

---

## 🎯 Pontos de Integração

### 1. CardRepository
- **Antes:** Injetava `LocalStorageAdapter`
- **Depois:** Injetar `SqliteAdapter`
- Implementação permanece idêntica (respeita `StorageInterface`)

### 2. App Component
- Executa `MigrationService.migrateFromLocalStorage()` no `ngOnInit()`
- Garante dados migrados antes da app inicializar

### 3. Navbar Component
- Método `resetCards()` agora limpa:
  - `flashcards:sqlite:db` (banco SQLite)
  - `flashcards:cards:v1` (backup antigo)
  - `flashcards:migration:completed` (flag de migração)

### 4. Import Cards Page
- Mesmo fluxo, mas limpa SQLite + localStorage antes de importar
- Reinicializa a migração para importar novos dados

---

## 📋 Checklist de Validação

- [x] SqliteAdapter implementa StorageInterface
- [x] Tabelas criadas corretamente no banco
- [x] Dados antigos migrados automaticamente
- [x] Persistência em localStorage funcionando
- [x] Carregamento do banco na inicialização
- [x] Reset limpa SQLite + localStorage
- [x] Import limpa e reinicializa
- [x] Build sem erros
- [x] README atualizado
- [x] CardRepository atualizado para usar SqliteAdapter

---

## 🚀 Rollback (Se Necessário)

Se precisar voltar para localStorage:

1. Editar `src/app/features/flashcard/data/repositories/card.repository.ts`
   ```typescript
   // Trocar: import { SqliteAdapter }
   // Por:     import { LocalStorageAdapter }
   
   // Trocar: constructor(private storageAdapter: SqliteAdapter)
   // Por:     constructor(private storageAdapter: LocalStorageAdapter)
   ```

2. Comentar migração em `src/app/app.component.ts`:
   ```typescript
   // await this.migrationService.migrateFromLocalStorage();
   ```

3. Rebuild: `npm run build`

---

## 📚 Referências

- **sql.js:** https://sql.js.org/
- **StorageInterface:** `src/app/infrastructure/storage/storage.interface.ts`
- **SqliteAdapter:** `src/app/infrastructure/storage/sqlite.adapter.ts`
- **MigrationService:** `src/app/infrastructure/storage/migration.service.ts`

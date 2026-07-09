# 📋 Sumário de Endpoints - Flashcards API

## 📊 Resumo Rápido

| # | Método | Endpoint | Descrição | Arquivo |
|---|--------|----------|-----------|---------|
| 1 | GET | `/` | Status da API | `01_base.http` |
| 2 | POST | `/perguntar` | Enviar pergunta ao LLM (Claude) | `02_perguntar_claude.http` |
| 3 | POST | `/perguntar` | Enviar pergunta ao LLM (DeepSeek) | `03_perguntar_deepseek.http` |
| 4 | GET | `/cards` | Listar todos os cards | `04_cards_list.http` |
| 5 | GET | `/cards/{id}` | Obter card específico | `05_cards_get.http` |
| 6 | POST | `/cards` | Criar novo card | `06_cards_create.http` |
| 7 | POST | `/cards` | Atualizar card existente | `07_cards_update.http` |
| 8 | DELETE | `/cards/{id}` | Deletar card | `08_cards_delete.http` |
| 9 | GET | `/config/{chave}` | Obter configuração | `09_config_get.http` |
| 10 | PUT | `/config/{chave}` | Atualizar config (LLM) | `10_config_set_llm.http` |
| 11 | PUT | `/config/{chave}` | Atualizar config (Tema) | `11_config_set_theme.http` |
| 12 | GET | `/jornadas` | Listar jornadas | `12_jornadas_list.http` |
| 13 | GET | `/jornadas/{id}` | Obter jornada | `13_jornadas_get.http` |
| 14 | POST | `/jornadas` | Criar jornada | `14_jornadas_create.http` |
| 15 | POST | `/jornadas` | Atualizar jornada | `15_jornadas_update.http` |
| 16 | DELETE | `/jornadas/{id}` | Deletar jornada | `16_jornadas_delete.http` |
| 17 | GET | `/jornadas/{id}/progresso` | Obter progresso | `17_progresso_get.http` |
| 18 | PUT | `/jornadas/{id}/progresso` | Progresso em andamento | `18_progresso_update_in_progress.http` |
| 19 | PUT | `/jornadas/{id}/progresso` | Progresso completo | `19_progresso_update_completed.http` |
| 20 | GET | `/learn/xp` | Obter XP total | `20_xp_get.http` |
| 21 | POST | `/learn/xp` | Adicionar XP | `21_xp_add.http` |
| 22 | POST | `/learn/xp` | Adicionar bonus XP | `22_xp_add_bonus.http` |
| 23 | POST | `/learn/reset-progress` | Resetar progresso | `23_reset_progress.http` |
| 24 | DELETE | `/user-data` | ⚠️ Deletar TUDO | `24_delete_all_user_data.http` |

---

## 🏗️ Organização por Módulo

### 🔌 Base
- **GET /** → Status (arquivo: `01_base.http`)

### 🤖 LLM Integration
- **POST /perguntar** → Claude (arquivo: `02_perguntar_claude.http`)
- **POST /perguntar** → DeepSeek (arquivo: `03_perguntar_deepseek.http`)

### 📝 Cards (CRUD)
- **GET /cards** → Listar (arquivo: `04_cards_list.http`)
- **GET /cards/{id}** → Obter (arquivo: `05_cards_get.http`)
- **POST /cards** → Criar (arquivo: `06_cards_create.http`)
- **POST /cards** → Atualizar (arquivo: `07_cards_update.http`)
- **DELETE /cards/{id}** → Deletar (arquivo: `08_cards_delete.http`)

### ⚙️ Configuration
- **GET /config/{chave}** → Obter (arquivo: `09_config_get.http`)
- **PUT /config/{chave}** → Set LLM (arquivo: `10_config_set_llm.http`)
- **PUT /config/{chave}** → Set Theme (arquivo: `11_config_set_theme.http`)

### 🚀 Jornadas (Learning Paths)
- **GET /jornadas** → Listar (arquivo: `12_jornadas_list.http`)
- **GET /jornadas/{id}** → Obter (arquivo: `13_jornadas_get.http`)
- **POST /jornadas** → Criar (arquivo: `14_jornadas_create.http`)
- **POST /jornadas** → Atualizar (arquivo: `15_jornadas_update.http`)
- **DELETE /jornadas/{id}** → Deletar (arquivo: `16_jornadas_delete.http`)

### 📊 Progresso
- **GET /jornadas/{id}/progresso** → Obter (arquivo: `17_progresso_get.http`)
- **PUT /jornadas/{id}/progresso** → Em Andamento (arquivo: `18_progresso_update_in_progress.http`)
- **PUT /jornadas/{id}/progresso** → Completa (arquivo: `19_progresso_update_completed.http`)

### ✨ XP & Learn Stats
- **GET /learn/xp** → Obter Total (arquivo: `20_xp_get.http`)
- **POST /learn/xp** → Adicionar (arquivo: `21_xp_add.http`)
- **POST /learn/xp** → Bonus (arquivo: `22_xp_add_bonus.http`)

### 🔄 Reset & Cleanup
- **POST /learn/reset-progress** → Reset (arquivo: `23_reset_progress.http`)
- **DELETE /user-data** → ⚠️ Delete All (arquivo: `24_delete_all_user_data.http`)

---

## 🔑 Headers Requeridos

**Todos os endpoints requerem:**
```
X-User-Id: user123
```

**POST/PUT endpoints requerem:**
```
Content-Type: application/json
```

---

## 📥 Importar no Postman

1. Abra Postman
2. Clique em **Import**
3. Selecione: `FlashcardsAPI.postman_collection.json`
4. Use as requisições pré-configuradas

---

## 💻 Usar com VS Code

1. Instale extensão **REST Client** (humao.rest-client)
2. Abra qualquer arquivo `.http`
3. Clique em **Send Request**

---

## 🚀 Fluxo Recomendado para Teste

```bash
1. GET /                                    # Verificar API
2. POST /perguntar (Claude)                # Testar LLM
3. POST /cards                             # Criar card
4. GET /cards                              # Listar cards
5. GET /cards/{id}                         # Obter card
6. POST /jornadas                          # Criar jornada
7. GET /jornadas                           # Listar jornadas
8. PUT /jornadas/{id}/progresso            # Atualizar progresso
9. GET /learn/xp                           # Ver XP
10. POST /learn/xp                         # Adicionar XP
```

---

## ⚠️ Operações Destrutivas

Cuidado com estas operações:

1. **DELETE /cards/{id}** - Remove um card
2. **DELETE /jornadas/{id}** - Remove uma jornada
3. **POST /learn/reset-progress** - Reseta progresso e XP
4. **DELETE /user-data** - ⚠️ **IRREVERSÍVEL** - Remove TUDO

---

## 📍 Base URL

```
http://127.0.0.1:8000
```

Para rodar localmente:
```bash
cd backend
uvicorn main:app --reload
```

---

**Total: 24 endpoints | 3 módulos principais | Documentação completa incluída**

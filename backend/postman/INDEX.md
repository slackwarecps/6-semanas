# 🚀 Flashcards API - Pasta Postman

Documentação completa e coleção de endpoints para testar a API de Flashcards.

## 📂 Estrutura de Arquivos

```
postman/
├── 📄 chamada1.http                          [ORIGINAL] Exemplo de pergunta ao LLM
├── 📋 ENDPOINTS.md                          [NOVO] Sumário rápido de todos endpoints
├── 📖 README.md                             [NOVO] Documentação completa
├── 📥 FlashcardsAPI.postman_collection.json [NOVO] Coleção JSON para Postman
│
├── 🔌 01_base.http                          GET /
├── 🤖 02_perguntar_claude.http              POST /perguntar (Claude)
├── 🤖 03_perguntar_deepseek.http            POST /perguntar (DeepSeek)
│
├── 📝 04_cards_list.http                    GET /cards
├── 📝 05_cards_get.http                     GET /cards/{id}
├── 📝 06_cards_create.http                  POST /cards (create)
├── 📝 07_cards_update.http                  POST /cards (update)
├── 📝 08_cards_delete.http                  DELETE /cards/{id}
│
├── ⚙️  09_config_get.http                   GET /config/{chave}
├── ⚙️  10_config_set_llm.http               PUT /config/LLM_QUERY_DEFAULT
├── ⚙️  11_config_set_theme.http             PUT /config/THEME
│
├── 🚀 12_jornadas_list.http                 GET /jornadas
├── 🚀 13_jornadas_get.http                  GET /jornadas/{id}
├── 🚀 14_jornadas_create.http               POST /jornadas (create)
├── 🚀 15_jornadas_update.http               POST /jornadas (update)
├── 🚀 16_jornadas_delete.http               DELETE /jornadas/{id}
│
├── 📊 17_progresso_get.http                 GET /jornadas/{id}/progresso
├── 📊 18_progresso_update_in_progress.http  PUT /progresso (in-progress)
├── 📊 19_progresso_update_completed.http    PUT /progresso (completed)
│
├── ✨ 20_xp_get.http                        GET /learn/xp
├── ✨ 21_xp_add.http                        POST /learn/xp (100)
├── ✨ 22_xp_add_bonus.http                  POST /learn/xp (500)
│
└── 🔄 23_reset_progress.http                POST /learn/reset-progress
└── 🔄 24_delete_all_user_data.http          DELETE /user-data
```

## 🎯 Como Usar

### 1️⃣ Com Postman (Recomendado)

```bash
1. Abra Postman
2. Clique em "Import"
3. Selecione: FlashcardsAPI.postman_collection.json
4. Configure base URL: http://127.0.0.1:8000
5. Adicione variável: X-User-Id = user123
6. Use as requisições pré-configuradas
```

### 2️⃣ Com VS Code

```bash
1. Instale extensão: REST Client (humao.rest-client)
2. Abra qualquer arquivo .http
3. Clique em "Send Request" acima da requisição
```

### 3️⃣ Com curl

```bash
curl -X GET http://127.0.0.1:8000/cards \
  -H "X-User-Id: user123"
```

## 📊 Estatísticas

| Item | Quantidade |
|------|-----------|
| **Endpoints Total** | 24 |
| **Arquivos HTTP** | 24 |
| **Módulos** | 6 |
| **Documentação** | 3 files |

### Por Módulo:

| Módulo | Endpoints |
|--------|-----------|
| Base | 1 |
| LLM | 2 |
| Cards | 5 |
| Config | 3 |
| Jornadas | 5 |
| Progresso | 3 |
| XP | 3 |
| Reset | 2 |

## 🔑 Headers Obrigatórios

```
X-User-Id: user123              # Isolamento por usuário
Content-Type: application/json  # Para POST/PUT
```

## 🚀 Fluxo de Teste Recomendado

```mermaid
1. Status (01_base.http)
   ↓
2. Pergunta LLM (02 ou 03)
   ↓
3. Criar Card (06_cards_create.http)
   ↓
4. Listar Cards (04_cards_list.http)
   ↓
5. Criar Jornada (14_jornadas_create.http)
   ↓
6. Atualizar Progresso (18 ou 19)
   ↓
7. Adicionar XP (21_xp_add.http)
   ↓
8. Verificar XP (20_xp_get.http)
```

## 📚 Documentação

### `README.md`
Documentação técnica completa:
- Descrição detalhada de cada endpoint
- DTOs com exemplos
- Troubleshooting
- Código de exemplo

### `ENDPOINTS.md`
Sumário visual rápido:
- Tabela de todos endpoints
- Organização por módulo
- Operações destrutivas

### Arquivos .http
Cada arquivo é uma requisição executável:
- Headers pré-configurados
- Body com dados de exemplo
- Comentários explicativos

### FlashcardsAPI.postman_collection.json
Coleção JSON para importar no Postman:
- Todas as 24 requisições
- Variáveis de ambiente
- Agrupadas por módulo

## ⚠️ Cuidado!

Operações destrutivas:

```
❌ DELETE /cards/{id}              # Remove um card
❌ DELETE /jornadas/{id}           # Remove uma jornada
❌ POST /learn/reset-progress      # Reseta progresso + XP
❌ DELETE /user-data               # ⚠️ APAGA TUDO!
```

## 🔧 Setup Local

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Testar
# Abra VS Code ou Postman e use os arquivos
```

## 🌐 Base URL

```
http://127.0.0.1:8000
```

## 📝 Notas

- ✅ Todos os arquivos foram testados durante a criação
- ✅ Exemplos com dados realistas
- ✅ Comentários explicativos em cada requisição
- ✅ Timestamps em milissegundos (epoch)
- ✅ Isolamento completo por usuário (X-User-Id)

## 🎓 Exemplo Completo

```http
### Fluxo Básico

# 1. Verificar status
GET http://127.0.0.1:8000/
X-User-Id: user123

# 2. Criar card
POST http://127.0.0.1:8000/cards
X-User-Id: user123
Content-Type: application/json

{
  "id": "card-001",
  "title": "React",
  "question": "O que é React?",
  "answer": "Uma biblioteca JavaScript...",
  ...
}

# 3. Listar cards
GET http://127.0.0.1:8000/cards
X-User-Id: user123

# 4. Criar jornada
POST http://127.0.0.1:8000/jornadas
X-User-Id: user123
Content-Type: application/json

{
  "id": "jornada-1",
  "nome": "React Basics",
  "cardIds": ["card-001"]
}
```

---

**Última atualização:** 2024-07-05
**API Base:** FastAPI + SQLModel + LangChain
**Provedores LLM:** Claude (Anthropic) + DeepSeek

# Phase 1: Quickstart Validation — Export Jornada para Anki

**Date**: 2026-07-15 | **Feature**: Export Jornada para Anki

## Overview

Guia prático para validar que a feature funciona end-to-end após implementação. Não inclui código de implementação completo, apenas passos de teste.

## Prerequisites

### Environment Setup

1. **Backend Running**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Frontend Running**
   ```bash
   npm start  # Angular dev server at http://localhost:4200
   ```

3. **Database Seeded**
   - Backend deve estar conectado a `backend/database.sqlite`
   - Dados de teste: usuário com pelo menos 1 jornada com ≥ 2 cards
   - Para testar: use script de seed ou import manual

4. **Anki Installed**
   - Anki 2.1.66+ instalado no sistema (para import manual)

### Test Data

Use a seguinte jornada de teste:

| Field | Value |
|-------|-------|
| User ID | `test_user_001` |
| Jornada ID | `jornada_test_001` |
| Jornada Name | "História Medieval" |
| Cards | 3 cards (sequência 1, 2, 3) |

**Card 1**:
- title: "Feudalismo"
- question: "O que é feudalismo?\n[ ] A - Sistema\n[ ] B - Outro\n[ ] C - Mais\n[ ] D - Correto"
- answer: "D - Sistema de relações vasaláticas"
- tags: '["história", "medieval"]'

**Card 2**:
- title: "Idade Média"
- question: "Quando começou a Idade Média?\n[ ] A - 1000\n[ ] B - 476\n[ ] C - 1500\n[ ] D - Erro"
- answer: "B - 476 (queda do Império Romano)"
- tags: '["história"]'

**Card 3**:
- title: "Castelos Medievais"
- question: "Qual era a função principal de um castelo medieval?\n[ ] A - Habitação\n[ ] B - Defesa\n[ ] C - Comércio\n[ ] D - Religião"
- answer: "B - Defesa e proteção"
- tags: '["arquitetura", "história"]'

---

## Validation Scenarios

### Scenario 1: Basic Export (Happy Path)

**Goal**: Validar fluxo principal: clique botão → download → import no Anki

**Steps**:

1. **Setup**
   ```bash
   # Verificar jornada existe no banco
   sqlite3 backend/database.sqlite \
     "SELECT * FROM jornadas WHERE id='jornada_test_001';"
   
   # Verificar cards associados
   sqlite3 backend/database.sqlite \
     "SELECT jp.ordem, c.title, c.seq FROM jornada_perguntas jp \
      JOIN cards c ON c.id = jp.cardId \
      WHERE jp.jornadaId='jornada_test_001' \
      ORDER BY jp.ordem;"
   ```

2. **Frontend**
   - Abrir http://localhost:4200/admin/jornada
   - Localizar jornada "História Medieval"
   - Clicar botão "📥 Exportar para Anki"
   - Verificar: Toast/spinner aparece

3. **Download**
   - Verificar arquivo `jornada-historia-medieval-YYYY-MM-DD.colpkg` é salvo
   - Confirmação visual no navegador (download completo)
   - Toast desaparece

4. **Validation**
   ```bash
   # Verificar arquivo é ZIP válido
   file ~/Downloads/jornada-historia-medieval-*.colpkg
   # output: Zip archive data, at least v2.0 to extract
   
   # Extrair e validar estrutura
   unzip -l ~/Downloads/jornada-historia-medieval-*.colpkg
   # output:
   #   Length     Date   Time    Name
   #   ------  ---------- -----   ----
   #     xxxxx  2026-07-15 12:30  collection.anki2
   #        2  2026-07-15 12:30  media
   ```

5. **Anki Import**
   - Abrir Anki
   - Ir para: File → Import
   - Selecionar arquivo `.colpkg`
   - Verificar: "3 cards successfully imported"
   - Verificar deck "Default" agora tem 3 cards

6. **Content Validation**
   - Clicar em um card no deck
   - Verificar Front: "**Feudalismo**\n\nO que é feudalismo?..."
   - Verificar Back: "D - Sistema de relações vasaláticas"
   - Verificar Tags: "história medieval" (espaço-separado)

**Expected Result**: ✅ Export completo, arquivo importa sem erros, cards aparecem corretamente

---

### Scenario 2: Empty Jornada Error

**Goal**: Validar que sistema rejeita jornadas sem cards

**Steps**:

1. **Setup**
   ```bash
   # Criar jornada vazia
   sqlite3 backend/database.sqlite \
     "INSERT INTO jornadas (user_id, id, nome, ativa, ordem, createdAt, updatedAt) \
      VALUES ('test_user_001', 'jornada_empty', 'Vazia', 0, 99, 1721000000000, 1721000000000);"
   ```

2. **Frontend**
   - Abrir http://localhost:4200/admin/jornada
   - Localizar jornada "Vazia"
   - Clicar "Exportar para Anki"

3. **Validation**
   - Backend retorna: `400 Bad Request`
   - Frontend exibe: "Nenhum card para exportar nesta jornada"
   - Nenhum arquivo é baixado

**Expected Result**: ✅ Rejeição clara, mensagem amigável

---

### Scenario 3: Special Characters & Unicode

**Goal**: Validar que caracteres especiais são preservados

**Steps**:

1. **Setup**
   ```bash
   # Inserir card com Unicode/emojis
   sqlite3 backend/database.sqlite \
     "INSERT INTO cards VALUES ('test_user_001', 'card_unicode', 4, 'Pokémon Pikachu ⚡', \
      'Qual é o tipo do Pikachu? ⚡\n[ ] A - Água\n[ ] B - Elétrico ✓', \
      'B - Elétrico ✓', '[\"anime\", \"Pokémon\"]', 'new', 0, 2.5, 0, 1721000000000, 1721000000000, 1721000000000, NULL, NULL, NULL, 0);"
   
   # Adicionar à jornada
   sqlite3 backend/database.sqlite \
     "INSERT INTO jornada_perguntas VALUES ('test_user_001', 'jornada_test_001', 'card_unicode', 4);"
   ```

2. **Export & Import**
   - Exportar jornada (agora com 4 cards)
   - Importar no Anki

3. **Validation**
   - Abrir card "Pokémon Pikachu ⚡" no Anki
   - Verificar Front contém: "Pokémon Pikachu ⚡"
   - Verificar Back contém: "B - Elétrico ✓"
   - Verificar Tags: "anime Pokémon" (sem quebra de encoding)

**Expected Result**: ✅ Caracteres especiais preservados, sem corruption

---

### Scenario 4: Multiple Jornadas Isolation

**Goal**: Validar que exportação de uma jornada não inclui cards de outras

**Steps**:

1. **Setup**
   ```bash
   # Jornada A: Cards 1-3 (História)
   # Jornada B: Cards 4-6 (Biologia) — criar nova jornada e associar diferentes cards
   sqlite3 backend/database.sqlite \
     "INSERT INTO jornadas VALUES ('test_user_001', 'jornada_bio', 'Biologia Básica', 0, 1, 1721000000000, 1721000000000, 3, 'normal', 120);"
   ```

2. **Export Both**
   - Exportar "História Medieval" (jornada_test_001)
   - Exportar "Biologia Básica" (jornada_bio)

3. **Validation**
   - Anki Import 1: Histórico, 3 cards (Feudalismo, Idade Média, Castelos)
   - Anki Import 2: Biologia, 3 cards (diferentes)
   - Verificar: 0 cards overlap entre dois imports

**Expected Result**: ✅ Cada jornada exporta apenas seus próprios cards

---

### Scenario 5: Performance (Large Jornada)

**Goal**: Validar performance com jornada grande (~200 cards)

**Steps**:

1. **Setup** (opcional, apenas se tiver dados)
   ```bash
   # Verificar jornada com muitos cards
   sqlite3 backend/database.sqlite \
     "SELECT COUNT(*) as total_cards FROM jornada_perguntas \
      WHERE jornadaId IN (SELECT id FROM jornadas WHERE nome LIKE '%Historia%');"
   ```

2. **Export & Measure**
   - Abrir DevTools (F12) → Network tab
   - Clicar "Exportar para Anki"
   - Medir tempo até download completo (deve ser < 5s)
   - Verificar file size (típico: 50-200 KB por 200 cards)

3. **Validation**
   - Response time: ≤ 5 segundos
   - File size: Razoável (< 10 MB)
   - No timeout ou memory errors

**Expected Result**: ✅ Performance aceitável

---

### Scenario 6: Concurrent Exports

**Goal**: Validar que múltiplas exportações simultâneas funcionam

**Steps**:

1. **Setup**
   ```bash
   # Abrir 2 abas do navegador, ambas em /admin/jornada
   ```

2. **Execute**
   - Aba 1: Clicar "Exportar para Anki" da jornada A
   - Aba 2: Clicar "Exportar para Anki" da jornada A (simultaneamente)

3. **Validation**
   - Ambos os downloads completam sem erro
   - Ambos os arquivos são idênticos (verificar size/hash)
   - Nenhum race condition ou corrupted file

**Expected Result**: ✅ Concurrent requests handled correctly

---

## Automated Test Commands

### Quick Smoke Test (Curl)

```bash
#!/bin/bash

# Variáveis
BACKEND_URL="http://localhost:8000"
USER_ID="test_user_001"
JORNADA_ID="jornada_test_001"
OUTPUT_FILE="/tmp/test_export.colpkg"

# Test 1: Success case
echo "Test 1: Exporting jornada..."
HTTP_CODE=$(curl -s -X POST \
  "$BACKEND_URL/jornadas/$JORNADA_ID/export-anki" \
  -H "X-User-Id: $USER_ID" \
  -o "$OUTPUT_FILE" \
  -w "%{http_code}")

if [ "$HTTP_CODE" = "200" ]; then
  FILE_SIZE=$(stat -f%z "$OUTPUT_FILE")
  echo "✅ Success: Status $HTTP_CODE, File size: $FILE_SIZE bytes"
  
  # Verify ZIP structure
  unzip -t "$OUTPUT_FILE" > /dev/null && echo "✅ ZIP valid" || echo "❌ ZIP corrupted"
else
  echo "❌ Failed: Status $HTTP_CODE"
  cat "$OUTPUT_FILE"
fi

# Test 2: Empty jornada
echo -e "\nTest 2: Empty jornada error..."
curl -s -X POST \
  "$BACKEND_URL/jornadas/jornada_empty/export-anki" \
  -H "X-User-Id: $USER_ID" | grep -q "Nenhum card" && echo "✅ Correct error" || echo "❌ Wrong error"

# Test 3: 404 Not found
echo -e "\nTest 3: Non-existent jornada..."
curl -s -w "%{http_code}" -X POST \
  "$BACKEND_URL/jornadas/nonexistent/export-anki" \
  -H "X-User-Id: $USER_ID" | grep -q "404" && echo "✅ Correct 404" || echo "❌ Wrong status"
```

### Database Validation

```bash
# Verificar dados de teste
sqlite3 backend/database.sqlite << EOF
  SELECT 'Jornadas:' as section;
  SELECT id, nome, (SELECT COUNT(*) FROM jornada_perguntas jp WHERE jp.jornadaId = j.id) as total_cards
  FROM jornadas j
  WHERE user_id = 'test_user_001';
  
  SELECT '' as blank, 'Cards na jornada de teste:' as section;
  SELECT jp.ordem, c.seq, c.title
  FROM jornada_perguntas jp
  JOIN cards c ON c.id = jp.cardId
  WHERE jp.jornadaId = 'jornada_test_001'
  ORDER BY jp.ordem;
EOF
```

---

## Acceptance Checklist

After completing all scenarios, verify:

- [ ] Scenario 1: Basic Export ✅
- [ ] Scenario 2: Empty Jornada ✅
- [ ] Scenario 3: Unicode/Special Chars ✅
- [ ] Scenario 4: Isolation ✅
- [ ] Scenario 5: Performance ✅
- [ ] Scenario 6: Concurrent ✅
- [ ] HTTP Contract validated (200, 400, 404, 500) ✅
- [ ] File format `.colpkg` is valid ZIP ✅
- [ ] Anki imports successfully ✅
- [ ] No data loss or corruption ✅
- [ ] UI feedback (spinner/toast) appears ✅

---

## Troubleshooting

### Issue: "jornada not found" (404)

**Cause**: Jornada ID mismatch ou usuário errado

**Solution**:
```bash
# Verificar IDs no banco
sqlite3 backend/database.sqlite "SELECT id, nome FROM jornadas LIMIT 5;"
```

### Issue: "No cards to export" (400)

**Cause**: Jornada não tem cards associados

**Solution**:
```bash
# Adicionar cards à jornada
sqlite3 backend/database.sqlite \
  "INSERT INTO jornada_perguntas VALUES ('test_user_001', 'jornada_id', 'card_id', 1);"
```

### Issue: ZIP corrupted

**Cause**: Erro na geração do arquivo

**Solution**:
```bash
# Verificar logs do backend
# Reexportar com debug output
# Validar SQL de geração do collection.anki2
```

### Issue: Anki refuses import

**Cause**: Schema incompatível ou missing required fields

**Solution**:
- Verificar `collection.anki2` tem todas as tabelas obrigatórias
- Validar JSON em `col.tags` (deve ser `'{}'`, não `''`)
- Verificar encoding UTF-8

---

## Next Steps

Once all scenarios pass:
1. ✅ Feature ready for `/speckit-tasks` (generate implementation tasks)
2. ✅ Tasks will have clear acceptance criteria from this validation plan
3. ✅ Implementation can follow task list
4. ✅ Validation repeats with actual product after implementation

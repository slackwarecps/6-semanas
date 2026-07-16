# Feature Specification: Export Jornada para Anki

**Feature Branch**: `002-export-jornada-anki`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "Crie um novo botão na tela /admin/jornada para exportar as perguntas da jornada no formato Flashcards do anki"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Exports Jornada to Anki (Priority: P1)

Um admin está na página `/admin/jornada` visualizando uma jornada específica e quer baixar os flashcards dessa jornada para estudar no Anki. Ele clica no botão "Exportar para Anki" e recebe um arquivo `.colpkg` contendo todos os cards daquela jornada em formato compatível com Anki, pronto para importação imediata.

**Why this priority**: É o fluxo principal e核心 da feature — sem isso, não há exportação possível. Desbloqueia todo o valor da integração.

**Independent Test**: Pode ser totalmente testado por: clicar no botão de exportação → fazer download do arquivo → abrir em Anki → verificar que todos os cards aparecem corretamente. Entrega valor imediato.

**Acceptance Scenarios**:

1. **Given** um admin está visualizando a jornada "História Medieval" em `/admin/jornada`, **When** clica no botão "Exportar para Anki", **Then** recebe um arquivo `.colpkg` contendo todos os 50 cards daquela jornada
2. **Given** o arquivo foi baixado com sucesso, **When** o admin abre o Anki e importa o arquivo, **Then** todos os 50 cards aparecem no deck com títulos, perguntas, respostas e tags preservadas
3. **Given** múltiplas jornadas existem no sistema, **When** o admin exporta a jornada "A", **Then** apenas os cards da jornada "A" estão no `.colpkg`, não cards de outras jornadas

---

### User Story 2 - Visual Feedback During Export (Priority: P2)

Quando o admin clica em exportar, especialmente em jornadas grandes (100+ cards), ele vê um feedback visual indicando que a exportação está em progresso. Isso evita que ele pense que a aplicação travou.

**Why this priority**: Melhora a experiência do usuário em casos de jornadas grandes, mas não impede que a feature funcione sem isso (fallback é simples: arquivo baixa direto).

**Independent Test**: Pode ser testado por: disparar exportação de jornada grande → observar spinner/toast de progresso → validar que desaparece quando download completa.

**Acceptance Scenarios**:

1. **Given** uma jornada com 100+ cards, **When** admin clica em "Exportar para Anki", **Then** um indicador de progresso aparece (spinner, toast, ou modal)
2. **Given** a exportação está em progresso, **When** o arquivo fica pronto, **Then** o download inicia automaticamente e o indicador desaparece


---

### Edge Cases

- O que acontece se a jornada não tem nenhum card? → Sistema deve avisar "Nenhum card para exportar" e não gerar arquivo vazio
- Como o sistema comporta-se se a jornada tem cards muito longos (títulos/perguntas gigantes)? → Deve processar normalmente; Anki renderizará com scroll se necessário
- E se um card tem caracteres especiais ou unicode (emojis, caracteres acentuados)? → Deve preservar corretamente no arquivo `.colpkg`
- O que acontece se o admin tenta exportar a mesma jornada duas vezes rapidamente? → Segunda requisição deve funcionar normalmente (sem race condition)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página `/admin/jornada`, deve haver um botão "Exportar para Anki" visível para cada jornada (ou na tela de detalhe da jornada)
- **FR-002**: Ao clicar em "Exportar para Anki", o sistema deve filtrar APENAS os cards associados àquela jornada específica
- **FR-003**: O sistema deve gerar um arquivo `.colpkg` no formato legado do Anki (collection.anki2 + media.json em ZIP), compatível com a versão atual do Anki
- **FR-004**: O arquivo gerado deve conter: título, pergunta (com alternativas), resposta correta e tags dos cards — exatamente como o skill `/exporta-sqlite-para-anki` faz
- **FR-005**: O download do arquivo deve iniciar automaticamente com um nome descritivo (ex: `jornada-historia-medieval-2026-07-15.colpkg`)
- **FR-006**: O sistema deve validar que a jornada tem pelo menos 1 card antes de permitir a exportação
- **FR-007**: Tags dos cards devem ser preservadas no formato Anki (espaço-separado, sem vírgula) durante a exportação

### Key Entities

- **Jornada**: Entidade que agrupa um conjunto de cards; cada card pertence a uma jornada via relacionamento 1:N
- **Card**: Entidade com título, pergunta, resposta, explicação e tags; muitos cards pertencem a uma jornada
- **Export Job**: Metadados da exportação (jornada_id, timestamp, quantidade_cards exportados)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin consegue exportar uma jornada com 50 cards em menos de 5 segundos
- **SC-002**: 100% dos cards da jornada selecionada aparecem no arquivo `.colpkg` gerado
- **SC-003**: Arquivo gerado abre sem erros no Anki e todos os cards são importados com sucesso
- **SC-004**: Tags dos cards são preservadas corretamente no import (sem perda de dados)
- **SC-005**: Sistema rejeita exportação se jornada tem 0 cards (com mensagem clara ao usuário)
- **SC-006**: Arquivo baixado tem nome descritivo contendo o nome da jornada e data (ex: `jornada-x-2026-07-15.colpkg`)

## Assumptions

- Existe um relacionamento cards ↔ jornadas no banco de dados (`backend/database.sqlite`), com chave estrangeira clara (ex: `card.jornada_id`)
- A página `/admin/jornada` já existe e é acessível apenas por admins autenticados
- A lógica do skill `/exporta-sqlite-para-anki` pode ser reutilizada/refatorada, adicionando um filtro por `jornada_id`
- Formato `.colpkg` é o padrão esperado e compatível com Anki moderno (versão 2.1.66+)
- O backend (FastAPI) consegue processar a exportação em tempo real (< 5s para jornadas típicas com até 200 cards)
- Não há requisito de permissões granulares — apenas admins do sistema podem exportar

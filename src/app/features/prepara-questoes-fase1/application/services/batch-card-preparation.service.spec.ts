import { Card } from '../../../flashcard/domain/entities/card.entity';
import { CardId } from '../../../flashcard/domain/value-objects/card-id.value-object';
import { EaseFactor } from '../../../flashcard/domain/value-objects/ease-factor.value-object';
import { Interval } from '../../../flashcard/domain/value-objects/interval.value-object';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';
import { BatchCardPreparationService } from './batch-card-preparation.service';

function makeCard(seq: number, tagNames: string[]): Card {
  const now = new Date();
  return new Card({
    id: CardId.generate(),
    seq,
    title: `Card ${seq}`,
    question: `Pergunta ${seq}`,
    answer: 'A - resposta',
    tags: tagNames.map((name) => new Tag(name)),
    state: 'New',
    interval: new Interval(0),
    easeFactor: new EaseFactor(EaseFactor.DEFAULT),
    repetitions: 0,
    attempts: [],
    createdAt: now,
    updatedAt: now,
    nextReviewDate: now,
  });
}

describe('BatchCardPreparationService (modo tags-cenario)', () => {
  let savedCards: Card[];
  let classifiedTitles: string[];
  let service: BatchCardPreparationService;

  beforeEach(() => {
    savedCards = [];
    classifiedTitles = [];

    const fakeCardRepository = {
      save: async (card: Card) => {
        savedCards.push(card);
      },
    };

    const fakePerguntaLlmService = {
      perguntar: async () => {
        throw new Error('perguntar não deveria ser chamado no modo tags-cenario');
      },
    };

    const fakeClassificaCenarioService = {
      classificar: async (request: { titulo: string; pergunta: string }) => {
        classifiedTitles.push(request.titulo);
        return {
          cenario: 'Scenario_5::Claude_Code_CI_CD',
          dominios: ['Domain_3::Claude_Code_Configuration_Workflows'],
          justificativa: 'Contexto de pipeline CI/CD.',
          provedor: 'claude',
          modelo: 'claude-opus-4-8',
        };
      },
    };

    service = new BatchCardPreparationService(
      fakeCardRepository as never,
      fakePerguntaLlmService as never,
      fakeClassificaCenarioService as never,
    );
  });

  it('classifica e salva cenário e domínios preservando as tags que não são de classificação', async () => {
    const cards = [makeCard(1, ['Tags:', 'Domain_1::Agentic_Architecture_Orchestration'])];

    const result = await service.processRange(
      cards,
      1,
      1,
      0,
      () => false,
      false,
      {},
      'tags-cenario',
    );

    expect(result.processed).toBe(1);
    expect(savedCards.length).toBe(1);
    expect(savedCards[0].tags.map((t) => t.name)).toEqual([
      'Tags:',
      'Domain_3::Claude_Code_Configuration_Workflows',
      'Scenario_5::Claude_Code_CI_CD',
    ]);
  });

  it('se o classificador retornar domínios vazios, salva com a tag ForaDosDominios', async () => {
    const cards = [makeCard(1, ['Tags:'])];
    
    const serviceWithEmptyDominios = new BatchCardPreparationService(
      { save: async (c: Card) => { savedCards.push(c); } } as never,
      {} as never,
      {
        classificar: async (req: { titulo: string }) => {
          classifiedTitles.push(req.titulo);
          return {
            cenario: 'Scenario_5::Claude_Code_CI_CD',
            dominios: [],
            justificativa: 'Nenhum domínio correspondente.',
            provedor: 'claude',
            modelo: 'claude-opus-4-8',
          };
        }
      } as never
    );

    await serviceWithEmptyDominios.processRange(
      cards,
      1,
      1,
      0,
      () => false,
      false,
      {},
      'tags-cenario',
    );

    expect(savedCards.length).toBe(1);
    expect(savedCards[0].tags.map((t) => t.name)).toEqual([
      'Tags:',
      'ForaDosDominios',
      'Scenario_5::Claude_Code_CI_CD',
    ]);
  });

  it('com "só pendentes" ligado, pula cards que já têm tag de cenário', async () => {
    const cards = [
      makeCard(1, ['Domain_1::Agentic_Architecture_Orchestration', 'ForaDoCenario']),
      makeCard(2, ['Domain_2::Tool_Design_MCP_Integration']),
    ];

    await service.processRange(cards, 1, 2, 0, () => false, true, {}, 'tags-cenario');

    expect(classifiedTitles).toEqual(['Card 2']);
    expect(savedCards.length).toBe(1);
    expect(savedCards[0].seq).toBe(2);
  });

  it('com "só pendentes" desligado, reprocessa e substitui a tag de cenário existente', async () => {
    const cards = [makeCard(1, ['ForaDoCenario'])];

    await service.processRange(cards, 1, 1, 0, () => false, false, {}, 'tags-cenario');

    expect(savedCards[0].tags.map((t) => t.name)).toEqual([
      'Domain_3::Claude_Code_Configuration_Workflows',
      'Scenario_5::Claude_Code_CI_CD',
    ]);
  });

  it('respeita o range de seq', async () => {
    const cards = [makeCard(1, []), makeCard(5, []), makeCard(9, [])];

    await service.processRange(cards, 4, 6, 0, () => false, false, {}, 'tags-cenario');

    expect(savedCards.map((c) => c.seq)).toEqual([5]);
  });

  it('respeita o cancelamento cooperativo', async () => {
    const cards = [makeCard(1, []), makeCard(2, [])];
    let calls = 0;

    await service.processRange(
      cards,
      1,
      2,
      0,
      () => {
        calls += 1;
        return calls > 2; // as duas checagens da 1ª iteração passam; cancela na 2ª
      },
      false,
      {},
      'tags-cenario',
    );

    expect(savedCards.length).toBe(1);
  });
});

import { Injectable } from '@angular/core';
import { FilterCardsByScenariosAndDomainsUseCase } from '../../../flashcard/application/use-cases/filter-cards-by-scenarios-and-domains.use-case';
import { JornadaRepository } from '../../../jornada/data/repositories/jornada.repository';
import { Jornada } from '../../../jornada/domain/entities/jornada.entity';

export interface CreateJornadaInput {
  title: string;
  scenarios: string[];
  domains: string[];
  quantityQuestions: number;
  maxErrors: number;
  selectionMethod: 'random' | 'sequential';
  sequentialStart?: number;
  sequentialEnd?: number;
}

export interface JornadaCreated {
  id: string;
  nome: string;
  ativa: boolean;
  ordem: number;
  cardIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CreateJornadaUseCase {
  constructor(
    private readonly filterCardsUseCase: FilterCardsByScenariosAndDomainsUseCase,
    private readonly jornadaRepository: JornadaRepository
  ) {}

  async execute(input: CreateJornadaInput): Promise<JornadaCreated> {
    // 1. Filtrar as perguntas disponíveis
    const filteredCards = await this.filterCardsUseCase.execute({
      scenarios: input.scenarios,
      domains: input.domains
    });

    if (filteredCards.length === 0) {
      throw new Error('Nenhuma pergunta disponível com os cenários e domínios selecionados.');
    }

    // 2. Selecionar as perguntas de acordo com o método de seleção
    let selectedCardIds: string[];

    if (input.selectionMethod === 'sequential') {
      // Seleção sequencial: ordenar por seq e pegar do início
      const sorted = filteredCards
        .filter(card => (card.seq ?? 0) >= (input.sequentialStart ?? 0) && (card.seq ?? 0) <= (input.sequentialEnd ?? 2000))
        .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
      selectedCardIds = sorted.slice(0, input.quantityQuestions).map(c => c.id.value);
    } else {
      // Seleção aleatória
      const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
      selectedCardIds = shuffled.slice(0, input.quantityQuestions).map(c => c.id.value);
    }

    // 3. Obter a maior ordem existente
    const allJornadas = await this.jornadaRepository.findAll();
    const maxOrder = allJornadas.length > 0 ? Math.max(...allJornadas.map(j => j.ordem)) : 0;
    const newOrder = maxOrder + 1;

    // 4. Criar a jornada usando a factory method
    const jornada = Jornada.create({
      nome: input.title,
      ativa: true,
      ordem: newOrder,
      pontosTentativas: input.maxErrors,
      questionCardIds: selectedCardIds
    });

    // 5. Persistir a jornada
    await this.jornadaRepository.save(jornada);

    return {
      id: jornada.id,
      nome: jornada.nome,
      ativa: jornada.ativa,
      ordem: jornada.ordem,
      cardIds: jornada.questionCardIds
    };
  }
}

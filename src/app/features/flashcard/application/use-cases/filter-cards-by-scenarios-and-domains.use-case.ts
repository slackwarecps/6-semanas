import { Injectable } from '@angular/core';
import { Card } from '../../domain/entities/card.entity';
import { CardRepository } from '../../data/repositories/card.repository';

export interface FilterCardsInput {
  scenarios: string[];
  domains: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FilterCardsByScenariosAndDomainsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(input: FilterCardsInput): Promise<Card[]> {
    const allCards = await this.cardRepository.findAll();

    if (input.scenarios.length === 0 || input.domains.length === 0) {
      return [];
    }

    return allCards.filter(card => {
      const cardScenarios = this.extractScenarios(card);
      const cardDomains = this.extractDomains(card);

      // Verifica se pelo menos um cenário selecionado está no card
      const hasSelectedScenario = input.scenarios.some(scenario => {
        if (scenario === 'ForaDosCenarios') {
          return cardScenarios.length === 0;
        }
        return cardScenarios.includes(scenario);
      });

      // Verifica se pelo menos um domínio selecionado está no card
      const hasSelectedDomain = input.domains.some(domain => {
        if (domain === 'ForaDosDominios') {
          return cardDomains.length === 0;
        }
        return cardDomains.includes(domain);
      });

      return hasSelectedScenario && hasSelectedDomain;
    });
  }

  private extractScenarios(card: Card): string[] {
    return card.tags
      .map(tag => tag.name)
      .filter(tagName => this.isScenarioTag(tagName));
  }

  private extractDomains(card: Card): string[] {
    return card.tags
      .map(tag => tag.name)
      .filter(tagName => this.isDomainTag(tagName));
  }

  private isScenarioTag(tagName: string): boolean {
    return tagName.startsWith('Scenario_');
  }

  private isDomainTag(tagName: string): boolean {
    return tagName.startsWith('Domain_');
  }
}

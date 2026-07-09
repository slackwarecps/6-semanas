import { Injectable } from '@angular/core';
import { CardRepository } from '../../data/repositories/card.repository';

@Injectable({ providedIn: 'root' })
export class GetAvailableDomainsByScenariosUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(scenarios: string[]): Promise<string[]> {
    if (scenarios.length === 0) {
      return [];
    }

    try {
      const allCards = await this.cardRepository.findAll();

      // Identificar domínios presentes nos cards que correspondem aos cenários selecionados
      const domainSet = new Set<string>();

      allCards.forEach(card => {
        if (!card.tags || card.tags.length === 0) {
          return;
        }

        // Verificar se o card tem algum dos cenários selecionados
        const hasScenario = scenarios.some(scenario => {
          if (scenario === 'ForaDosCenarios') {
            // ForaDosCenarios = cards que não têm nenhuma tag de cenário
            const hasNoScenario = !card.tags.some(
              tag => this.isScenarioTag(tag.name)
            );
            return hasNoScenario;
          }
          return card.tags.some(tag => tag.name === scenario);
        });

        if (hasScenario) {
          // Adicionar domínios do card ao set
          card.tags.forEach(tag => {
            if (this.isDomainTag(tag.name)) {
              domainSet.add(tag.name);
            }
          });
        }
      });

      // Se algum cenário selecionado é "ForaDosCenarios", adicionar "ForaDosDominios"
      if (scenarios.includes('ForaDosCenarios')) {
        const hasCardsWithoutDomains = allCards.some(card => {
          const hasNoScenario = !card.tags.some(
            tag => this.isScenarioTag(tag.name)
          );
          const hasNoDomain = !card.tags.some(
            tag => this.isDomainTag(tag.name)
          );
          return hasNoScenario && hasNoDomain;
        });

        if (hasCardsWithoutDomains) {
          domainSet.add('ForaDosDominios');
        }
      }

      // Se nenhum domínio foi encontrado, retornar lista vazia
      return Array.from(domainSet);
    } catch (err) {
      console.error('[GetAvailableDomainsByScenariosUseCase] Erro:', err);
      return [];
    }
  }

  private isScenarioTag(tagName: string): boolean {
    return tagName.startsWith('Scenario_');
  }

  private isDomainTag(tagName: string): boolean {
    return tagName.startsWith('Domain_');
  }
}

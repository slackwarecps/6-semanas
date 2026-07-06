import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FilterCardsByScenariosAndDomainsUseCase } from '../../../flashcard/application/use-cases/filter-cards-by-scenarios-and-domains.use-case';
import { GetAvailableDomainsByScenariosUseCase } from '../../../flashcard/application/use-cases/get-available-domains-by-scenarios.use-case';
import { CreateJornadaUseCase } from '../../application/use-cases/create-jornada.use-case';

type SelectionMethod = 'random' | 'sequential';

interface FormState {
  scenarios: string[];
  domains: string[];
  quantityQuestions: number;
  maxErrors: number;
  title: string;
  selectionMethod: SelectionMethod;
  sequentialStart: number;
  sequentialEnd: number;
}

@Component({
  selector: 'app-criador-de-fases-automatico-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './criador-de-fases-automatico.page.html',
  styleUrls: ['./criador-de-fases-automatico.page.scss']
})
export class CriadorDeFasesAutomaticoPage {
  readonly scenarios = signal<string[]>([
    'Scenario_1::Customer_Support_Agent',
    'Scenario_2::Code_Generation_Claude_Code',
    'Scenario_3::Multi_Agent_Research',
    'Scenario_4::Developer_Productivity',
    'Scenario_5::Claude_Code_CI_CD',
    'Scenario_6::Structured_Data_Extraction',
    'ForaDosCenarios'
  ]);

  readonly domains = signal<string[]>([
    'Domain_1::Agentic_Architecture_Orchestration',
    'Domain_2::Tool_Design_MCP_Integration',
    'Domain_3::Claude_Code_Configuration_Workflows',
    'Domain_4::Prompt_Engineering_Structured_Output',
    'Domain_5::Context_Management_Reliability',
    'ForaDosDominios'
  ]);

  readonly form = signal<FormState>({
    scenarios: [],
    domains: [],
    quantityQuestions: 10,
    maxErrors: 3,
    title: '',
    selectionMethod: 'random',
    sequentialStart: 1,
    sequentialEnd: 2000
  });

  readonly isCreating = signal(false);
  readonly recordCount = signal(0);
  readonly availableDomains = signal<string[]>([]);

  readonly canCreateJornada = computed(() => {
    const currentForm = this.form();
    return (
      currentForm.title.trim().length > 0 &&
      currentForm.scenarios.length > 0 &&
      currentForm.domains.length > 0 &&
      this.recordCount() > 0 &&
      currentForm.quantityQuestions > 0 &&
      currentForm.quantityQuestions <= this.recordCount()
    );
  });

  private readonly router = inject(Router);
  private readonly filterCardsUseCase = inject(FilterCardsByScenariosAndDomainsUseCase);
  private readonly getAvailableDomainsUseCase = inject(GetAvailableDomainsByScenariosUseCase);
  private readonly createJornadaUseCase = inject(CreateJornadaUseCase);

  constructor() {
    // Monitorar mudanças de cenários para atualizar domínios disponíveis
    effect(() => {
      const scenarios = this.form().scenarios;
      this.updateAvailableDomains(scenarios);
    });

    // Monitorar mudanças de domínios disponíveis para limpar seleção inválida
    effect(() => {
      const available = this.availableDomains();
      this.form.update(current => {
        const validDomains = current.domains.filter(d => available.includes(d));
        // Só atualiza se realmente mudou algo
        if (validDomains.length !== current.domains.length) {
          return { ...current, domains: validDomains };
        }
        return current;
      });
    });

    // Monitorar mudanças de cenários e domínios para contar registros
    effect(() => {
      const currentForm = this.form();
      if (currentForm.scenarios.length > 0 && currentForm.domains.length > 0) {
        this.countRecords();
      } else {
        this.recordCount.set(0);
      }
    });
  }

  private async updateAvailableDomains(scenarios: string[]): Promise<void> {
    try {
      const available = await this.getAvailableDomainsUseCase.execute(scenarios);
      this.availableDomains.set(available);
    } catch (err) {
      console.error('[CriadorDeFasesAutomatico] Erro ao atualizar domínios disponíveis:', err);
      this.availableDomains.set([]);
    }
  }

  private async countRecords(): Promise<void> {
    try {
      const currentForm = this.form();
      const results = await this.filterCardsUseCase.execute({
        scenarios: currentForm.scenarios,
        domains: currentForm.domains
      });
      this.recordCount.set(results.length);
    } catch (err) {
      console.error('[CriadorDeFasesAutomatico] Erro ao contar registros:', err);
      this.recordCount.set(0);
    }
  }

  toggleScenario(scenario: string): void {
    this.form.update(current => {
      const isSelected = current.scenarios.includes(scenario);
      return {
        ...current,
        scenarios: isSelected
          ? current.scenarios.filter(s => s !== scenario)
          : [...current.scenarios, scenario]
      };
    });
  }

  toggleDomain(domain: string): void {
    this.form.update(current => {
      const isSelected = current.domains.includes(domain);
      return {
        ...current,
        domains: isSelected
          ? current.domains.filter(d => d !== domain)
          : [...current.domains, domain]
      };
    });
  }

  isScenarioSelected(scenario: string): boolean {
    return this.form().scenarios.includes(scenario);
  }

  isDomainSelected(domain: string): boolean {
    return this.form().domains.includes(domain);
  }

  isDomainEnabled(domain: string): boolean {
    return this.availableDomains().includes(domain);
  }

  setSelectionMethod(method: SelectionMethod): void {
    this.form.update(current => ({
      ...current,
      selectionMethod: method
    }));
  }

  updateQuantityQuestions(value: number): void {
    // Limita o valor ao recordCount
    const maxAllowed = this.recordCount() || 1000;
    const validValue = Math.min(value, maxAllowed);
    this.form.update(current => ({
      ...current,
      quantityQuestions: Math.max(1, validValue)
    }));
  }

  updateMaxErrors(value: number): void {
    this.form.update(current => ({
      ...current,
      maxErrors: value
    }));
  }

  updateTitle(value: string): void {
    this.form.update(current => ({
      ...current,
      title: value
    }));
  }

  updateSequentialStart(value: number): void {
    this.form.update(current => ({
      ...current,
      sequentialStart: value
    }));
  }

  updateSequentialEnd(value: number): void {
    this.form.update(current => ({
      ...current,
      sequentialEnd: value
    }));
  }

  async createJornada(): Promise<void> {
    const currentForm = this.form();

    if (!currentForm.title.trim()) {
      alert('⚠️ Por favor, insira o título da jornada.');
      return;
    }

    if (currentForm.scenarios.length === 0) {
      alert('⚠️ Por favor, selecione pelo menos um cenário.');
      return;
    }

    if (currentForm.domains.length === 0) {
      alert('⚠️ Por favor, selecione pelo menos um domínio.');
      return;
    }

    if (this.recordCount() === 0) {
      alert('⚠️ Nenhum registro encontrado com os cenários e domínios selecionados.');
      return;
    }

    if (currentForm.quantityQuestions > this.recordCount()) {
      alert(`⚠️ A quantidade de perguntas não pode ser maior que ${this.recordCount()} registros existentes.`);
      return;
    }

    this.isCreating.set(true);

    try {
      const jornada = await this.createJornadaUseCase.execute({
        title: currentForm.title,
        scenarios: currentForm.scenarios,
        domains: currentForm.domains,
        quantityQuestions: currentForm.quantityQuestions,
        maxErrors: currentForm.maxErrors,
        selectionMethod: currentForm.selectionMethod,
        sequentialStart: currentForm.sequentialStart,
        sequentialEnd: currentForm.sequentialEnd
      });

      console.log('[CriadorDeFasesAutomatico] Jornada criada com sucesso:', jornada);
      alert(`✅ Jornada "${jornada.nome}" criada com sucesso!\n🎯 ${jornada.cardIds.length} perguntas selecionadas.`);

      // Navega para admin de jornadas
      this.router.navigate(['/admin/jornada']);
    } catch (err) {
      console.error('[CriadorDeFasesAutomatico] Erro ao criar jornada:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`❌ Erro ao criar jornada: ${errorMessage}`);
    } finally {
      this.isCreating.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}

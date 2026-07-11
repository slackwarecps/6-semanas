import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { Question } from '../../domain/question.entity';
import { GetScenario1QuestionsUseCase } from '../../application/use-cases/get-scenario-1-questions.use-case';
import { GetScenario2QuestionsUseCase } from '../../application/use-cases/get-scenario-2-questions.use-case';
import { GetScenario3QuestionsUseCase } from '../../application/use-cases/get-scenario-3-questions.use-case';
import { GetScenario4QuestionsUseCase } from '../../application/use-cases/get-scenario-4-questions.use-case';
import { GetScenario5QuestionsUseCase } from '../../application/use-cases/get-scenario-5-questions.use-case';
import { GetScenario6QuestionsUseCase } from '../../application/use-cases/get-scenario-6-questions.use-case';
import { GetForaDosCenariosQuestionsUseCase } from '../../application/use-cases/get-fora-dos-cenarios-questions.use-case';
import { GetAllQuestionsUseCase } from '../../application/use-cases/get-all-questions.use-case';
import { GetUnclassifiedQuestionsUseCase } from '../../application/use-cases/get-unclassified-questions.use-case';

type ScenarioType =
  | 'scenario1'
  | 'scenario2'
  | 'scenario3'
  | 'scenario4'
  | 'scenario5'
  | 'scenario6'
  | 'fora-do-cenario'
  | 'sem-classificacao'
  | 'todas';

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {
  @ViewChild('reportContent') reportContent!: ElementRef;

  questions: Question[] = [];
  isLoading = true;
  isGeneratingPdf = false;
  currentScenario: ScenarioType = 'scenario1';
  currentDate = new Date();

  constructor(
    private readonly getScenario1QuestionsUseCase: GetScenario1QuestionsUseCase,
    private readonly getScenario2QuestionsUseCase: GetScenario2QuestionsUseCase,
    private readonly getScenario3QuestionsUseCase: GetScenario3QuestionsUseCase,
    private readonly getScenario4QuestionsUseCase: GetScenario4QuestionsUseCase,
    private readonly getScenario5QuestionsUseCase: GetScenario5QuestionsUseCase,
    private readonly getScenario6QuestionsUseCase: GetScenario6QuestionsUseCase,
    private readonly getForaDosCenariosQuestionsUseCase: GetForaDosCenariosQuestionsUseCase,
    private readonly getAllQuestionsUseCase: GetAllQuestionsUseCase,
    private readonly getUnclassifiedQuestionsUseCase: GetUnclassifiedQuestionsUseCase,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadQuestions();
  }

  async loadQuestions(scenario: ScenarioType = 'scenario1'): Promise<void> {
    this.ngZone.run(() => {
      this.currentScenario = scenario;
      this.isLoading = true;
      this.questions = [];
      this.cdr.markForCheck();
    });

    try {
      switch (scenario) {
        case 'scenario1':
          this.questions = await this.getScenario1QuestionsUseCase.execute();
          break;
        case 'scenario2':
          this.questions = await this.getScenario2QuestionsUseCase.execute();
          break;
        case 'scenario3':
          this.questions = await this.getScenario3QuestionsUseCase.execute();
          break;
        case 'scenario4':
          this.questions = await this.getScenario4QuestionsUseCase.execute();
          break;
        case 'scenario5':
          this.questions = await this.getScenario5QuestionsUseCase.execute();
          break;
        case 'scenario6':
          this.questions = await this.getScenario6QuestionsUseCase.execute();
          break;
        case 'fora-do-cenario':
          this.questions = await this.getForaDosCenariosQuestionsUseCase.execute();
          break;
        case 'sem-classificacao':
          this.questions = await this.getUnclassifiedQuestionsUseCase.execute();
          break;
        case 'todas':
          this.questions = await this.getAllQuestionsUseCase.execute();
          break;
      }
      console.log(`[Relatorios] ${scenario} carregado com ${this.questions.length} perguntas`);
    } catch (err) {
      console.error('[Relatorios] Erro ao carregar perguntas:', err);
      this.questions = [];
    }

    this.ngZone.run(() => {
      this.isLoading = false;
      this.currentDate = new Date();
      this.cdr.markForCheck();
    });
  }

  async generatePdf(): Promise<void> {
    if (!this.reportContent) {
      console.error('Conteúdo do relatório não encontrado');
      return;
    }

    this.isGeneratingPdf = true;
    try {
      const element = this.reportContent.nativeElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileNames: Record<ScenarioType, string> = {
        scenario1: 'Perguntas_do_Scenario_1.pdf',
        scenario2: 'Perguntas_do_Scenario_2.pdf',
        scenario3: 'Perguntas_do_Scenario_3.pdf',
        scenario4: 'Perguntas_do_Scenario_4.pdf',
        scenario5: 'Perguntas_do_Scenario_5.pdf',
        scenario6: 'Perguntas_do_Scenario_6.pdf',
        'fora-do-cenario': 'Perguntas_Fora_do_Cenario.pdf',
        'sem-classificacao': 'Perguntas_Sem_Classificacao.pdf',
        todas: 'Todas_as_Perguntas.pdf',
      };
      pdf.save(fileNames[this.currentScenario]);
    } catch (err) {
      console.error('[Relatorios] Erro ao gerar PDF:', err);
    } finally {
      this.isGeneratingPdf = false;
    }
  }

  goToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}

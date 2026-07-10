import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { Question } from '../../domain/question.entity';
import { GetScenario1QuestionsUseCase } from '../../application/use-cases/get-scenario-1-questions.use-case';

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

  constructor(
    private readonly getScenario1QuestionsUseCase: GetScenario1QuestionsUseCase,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadQuestions();
  }

  async loadQuestions(): Promise<void> {
    this.isLoading = true;
    try {
      this.questions = await this.getScenario1QuestionsUseCase.execute();
    } catch (err) {
      console.error('[Relatorios] Erro ao carregar perguntas:', err);
    } finally {
      this.isLoading = false;
    }
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

      pdf.save('Perguntas_do_Scenario_1.pdf');
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

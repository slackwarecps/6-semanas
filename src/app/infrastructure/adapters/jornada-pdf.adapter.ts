import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Card } from '../../features/flashcard/domain/entities/card.entity';
import { Jornada } from '../../features/jornada/domain/entities/jornada.entity';

@Injectable({
  providedIn: 'root'
})
export class JornadaPdfAdapter {
  async exportToPdf(jornada: Jornada, cards: Card[]): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    let isFirstPage = true;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (!isFirstPage) {
        pdf.addPage();
      }

      this.addQuestionPage(pdf, card, i + 1, cards.length, margin, pageWidth, pageHeight, contentWidth);

      pdf.addPage();
      this.addAnswerPage(pdf, card, margin, pageWidth, pageHeight, contentWidth);

      isFirstPage = false;
    }

    pdf.save(`${jornada.nome.replace(/\s+/g, '_')}.pdf`);
  }

  private addQuestionPage(
    pdf: jsPDF,
    card: Card,
    cardNumber: number,
    totalCards: number,
    margin: number,
    pageWidth: number,
    pageHeight: number,
    contentWidth: number,
  ): void {
    const fontSize = 12;
    const titleFontSize = 16;
    const lineHeight = 7;
    const questionFontSize = 14;

    let yPosition = margin;

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, margin - 5, contentWidth, 15, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const seqText = card.seq ? ` (seq: ${card.seq})` : '';
    pdf.text(`Pergunta ${cardNumber} de ${totalCards}${seqText}`, margin + 5, margin + 2);

    yPosition += 15;

    pdf.setFontSize(titleFontSize);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('', 'bold');
    const titleLines = pdf.splitTextToSize(card.title, contentWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * lineHeight + 5;

    pdf.setFontSize(questionFontSize);
    pdf.setFont('', 'normal');
    pdf.setTextColor(40, 40, 40);
    const questionLines = pdf.splitTextToSize(card.question, contentWidth);
    pdf.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * lineHeight + 10;

    if (card.options && card.options.length > 0) {
      pdf.setFontSize(fontSize);
      pdf.setFont('', 'bold');
      pdf.text('Opções:', margin, yPosition);
      yPosition += lineHeight + 3;

      pdf.setFont('', 'normal');
      for (const option of card.options) {
        const optionText = `${String.fromCharCode(65 + card.options.indexOf(option))}) ${option.text}`;
        const optionLines = pdf.splitTextToSize(optionText, contentWidth - 5);
        pdf.text(optionLines, margin + 5, yPosition);
        yPosition += optionLines.length * lineHeight + 2;

        if (yPosition > pageHeight - margin - 10) {
          break;
        }
      }
    }
  }

  private addAnswerPage(
    pdf: jsPDF,
    card: Card,
    margin: number,
    pageWidth: number,
    pageHeight: number,
    contentWidth: number,
  ): void {
    const fontSize = 12;
    const titleFontSize = 14;
    const lineHeight = 7;

    let yPosition = margin;

    pdf.setFillColor(230, 245, 230);
    pdf.rect(margin, margin - 5, contentWidth, 15, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(60, 120, 60);
    pdf.text('RESPOSTA', margin + 5, margin + 2);

    yPosition += 15;

    pdf.setFontSize(titleFontSize);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('', 'bold');
    pdf.text('Resposta:', margin, yPosition);
    yPosition += lineHeight + 3;

    pdf.setFontSize(fontSize);
    pdf.setFont('', 'normal');
    pdf.setTextColor(40, 40, 40);
    const answerLines = pdf.splitTextToSize(card.answer, contentWidth);
    pdf.text(answerLines, margin, yPosition);
    yPosition += answerLines.length * lineHeight + 8;

    if (card.explanation) {
      pdf.setFontSize(titleFontSize);
      pdf.setFont('', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Explicação:', margin, yPosition);
      yPosition += lineHeight + 3;

      pdf.setFontSize(fontSize);
      pdf.setFont('', 'normal');
      pdf.setTextColor(40, 40, 40);
      const explanationLines = pdf.splitTextToSize(card.explanation, contentWidth);
      pdf.text(explanationLines, margin, yPosition);
      yPosition += explanationLines.length * lineHeight + lineHeight;
    }

    if (card.tenYearOld) {
      pdf.setFontSize(titleFontSize);
      pdf.setFont('', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Explicação Simples (Para Crianças):', margin, yPosition);
      yPosition += lineHeight + 2;

      pdf.setFontSize(fontSize);
      pdf.setFont('', 'normal');
      pdf.setTextColor(60, 120, 60);
      const childExplLines = pdf.splitTextToSize(card.tenYearOld, contentWidth);
      pdf.text(childExplLines, margin, yPosition);
    }
  }
}

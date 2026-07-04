import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    // marked.parse retorna uma Promise em versões assíncronas, mas marked.parseSync roda de forma síncrona
    // Na v18+ do marked, marked.parseSync é a melhor forma para Pipes síncronos
    try {
      const html = marked.parse(value) as string;
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (e) {
      console.error('Falha ao renderizar markdown:', e);
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}

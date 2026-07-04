import { Injectable } from '@angular/core';
import { ParsedCard, ParsedOption } from './markdown.models';

@Injectable({
  providedIn: 'root'
})
export class MarkdownParser {
  
  parse(content: string, cardIdFromFileName?: string, metadata?: any): ParsedCard {
    // Normaliza quebras de linha para simplificar o processamento
    const normalizedContent = content.replace(/\r\n/g, '\n').trim();
    
    // Divide o conteúdo pelos blocos separadores '---'
    const blocks = normalizedContent.split(/\n---\n/);
    
    if (blocks.length < 3) {
      throw new Error(`Invalid markdown format. Expected at least 3 sections separated by '---'. Blocks found: ${blocks.length}`);
    }

    let title = '';
    let question = '';
    let optionsRaw = '';
    let tagsRaw = '';

    // Mapeamento dos blocos com base no conteúdo
    // Bloco 0: Cabeçalho (Title: ...)
    const titleLine = blocks[0].split('\n').find(line => line.startsWith('Title:'));
    if (titleLine) {
      title = titleLine.substring('Title:'.length).trim();
    } else {
      title = 'Sem título';
    }

    // Bloco 1: Pergunta / Contexto
    question = blocks[1].trim();

    // Bloco 2: Opções de múltipla escolha
    optionsRaw = blocks[2].trim();

    // Bloco 3: Tags (se houver, senão tenta ler do último bloco)
    if (blocks.length >= 4) {
      tagsRaw = blocks[3].trim();
    } else {
      // Tenta achar a linha de tags dentro do bloco de opções ou no final do arquivo
      const lines = normalizedContent.split('\n');
      const tagsLine = lines.find(line => line.startsWith('Tags:'));
      if (tagsLine) {
        tagsRaw = tagsLine;
      }
    }

    // Processamento das opções de múltipla escolha
    const options: ParsedOption[] = [];
    const optionLines = optionsRaw.split('\n');
    let order = 0;

    // Regex para bater com opções no formato "[ ] A - Texto" ou "[x] B - Texto"
    const optionRegex = /^\[\s*([xX\s]?)\s*\]\s*([A-D])\s*-\s*(.*)$/;

    for (const line of optionLines) {
      const trimmedLine = line.trim();
      const match = trimmedLine.match(optionRegex);
      if (match) {
        const isMarkedCorrect = match[1].toLowerCase() === 'x';
        const optionId = match[2]; // 'A', 'B', 'C', 'D'
        const optionText = match[3].trim();

        options.push({
          id: optionId,
          text: optionText,
          isCorrect: isMarkedCorrect,
          order: order++
        });
      }
    }

    // Processamento das Tags
    const tags: string[] = [];
    if (tagsRaw) {
      const tagsLine = tagsRaw.startsWith('Tags:') ? tagsRaw : tagsRaw.split('\n').find(l => l.startsWith('Tags:')) || '';
      if (tagsLine) {
        // Separa as tags por espaço
        const tagParts = tagsLine.substring('Tags:'.length).trim().split(/\s+/);
        for (const part of tagParts) {
          if (part.trim()) {
            tags.push(part.trim());
          }
        }
      }
    }

    // Se tivermos metadados externos fornecidos, aplicamos a resposta correta mapeada
    let correctOption = '';
    let explanation = '';
    if (cardIdFromFileName && metadata && metadata[cardIdFromFileName]) {
      const cardMeta = metadata[cardIdFromFileName];
      correctOption = cardMeta.correctOption;
      explanation = cardMeta.explanation;

      // Atualiza a opção correspondente para isCorrect: true
      options.forEach(opt => {
        opt.isCorrect = opt.id === correctOption;
      });
    }

    return {
      title,
      question,
      options,
      tags,
      correctOption,
      explanation
    };
  }

  parseMultiple(contents: Map<string, string>, metadata?: any): ParsedCard[] {
    const results: ParsedCard[] = [];
    contents.forEach((content, fileName) => {
      // Extrai o ID do arquivo (ex: "001" de "001-Otimizar custos CI-CD com Claude.md")
      const fileIdMatch = fileName.match(/^(\d{3})/);
      const fileId = fileIdMatch ? fileIdMatch[1] : undefined;

      try {
        results.push(this.parse(content, fileId, metadata));
      } catch (err) {
        console.error(`Error parsing card file ${fileName}:`, err);
      }
    });
    return results;
  }
}

import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { Jornada } from '../../domain/entities/jornada.entity';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

export interface SaveJornadaInput {
  id?: string;
  nome: string;
  ordem: number;
  ativa: boolean;
  pontosTentativas?: number;
  questionCardIds: string[];
  tipoJornada?: 'normal' | 'desafio';
  duracao?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SaveJornadaUseCase {
  constructor(
    private repository: JornadaRepository,
    private progressRepository: JornadaProgressRepository
  ) {}

  async execute(input: SaveJornadaInput): Promise<Jornada> {
    let jornada: Jornada;

    if (input.id) {
      const existing = await this.repository.findById(input.id);
      if (!existing) {
        throw new Error(`Jornada com ID ${input.id} não encontrada.`);
      }

      const pontosTentativasChanged =
        input.pontosTentativas !== undefined &&
        input.pontosTentativas !== existing.pontosTentativas;

      jornada = new Jornada({
        id: existing.id,
        nome: input.nome,
        ativa: input.ativa,
        ordem: input.ordem,
        pontosTentativas: input.pontosTentativas ?? existing.pontosTentativas,
        questionCardIds: input.questionCardIds,
        tipoJornada: input.tipoJornada ?? existing.tipoJornada,
        duracao: input.duracao ?? existing.duracao,
        createdAt: existing.createdAt,
        updatedAt: new Date()
      });

      await this.repository.save(jornada);

      // Se pontosTentativas mudou, reseta o progresso em andamento para evitar inconsistência
      if (pontosTentativasChanged) {
        const progress = await this.progressRepository.getProgress(existing.id);
        if (progress && progress.status === 'unlocked') {
          // Reseta progresso de jornada em andamento
          await this.progressRepository.saveProgress(
            new JornadaProgress({
              jornadaId: progress.jornadaId,
              status: 'unlocked',
              bestErrors: progress.bestErrors,
              completedAt: progress.completedAt,
              currentQuestionIndex: 0,
              currentErrors: 0,
              currentLives: jornada.pontosTentativas,
              lastActiveAt: new Date()
            })
          );
        }
      }
    } else {
      jornada = Jornada.create({
        nome: input.nome,
        ordem: input.ordem,
        pontosTentativas: input.pontosTentativas ?? 3,
        questionCardIds: input.questionCardIds,
        ativa: input.ativa,
        tipoJornada: input.tipoJornada ?? 'normal',
        duracao: input.duracao ?? 120
      });

      await this.repository.save(jornada);
    }

    return jornada;
  }
}

import { Injectable } from '@angular/core';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

@Injectable({
  providedIn: 'root'
})
export class ResetJornadaUseCase {
  constructor(private progressRepository: JornadaProgressRepository) {}

  async execute(jornadaId: string): Promise<JornadaProgress> {
    const resetProgress = JornadaProgress.createDefault(jornadaId, 'unlocked');
    await this.progressRepository.saveProgress(resetProgress);
    return resetProgress;
  }
}

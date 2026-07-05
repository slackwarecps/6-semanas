import { Injectable } from '@angular/core';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

@Injectable({
  providedIn: 'root'
})
export class CompleteJornadaUseCase {
  constructor(
    private progressRepository: JornadaProgressRepository,
    private jornadaRepository: JornadaRepository
  ) {}

  async execute(jornadaId: string, errors: number, xpEarnedThisAttempt: number, timeSpentSeconds: number): Promise<void> {
    const existing = await this.progressRepository.getProgress(jornadaId);
    const now = new Date();

    if (existing && existing.status === 'completed') {
      // Já concluída antes (replay)
      // Só atualiza os erros se o novo resultado for melhor (menos erros), ou se o tempo for menor
      const currentBest = existing.bestErrors !== null ? existing.bestErrors : Infinity;
      const currentBestTime = existing.bestTime !== null && existing.bestTime !== undefined ? existing.bestTime : Infinity;

      const nextBestErrors = errors < currentBest ? errors : currentBest;
      const nextBestTime = timeSpentSeconds < currentBestTime ? timeSpentSeconds : currentBestTime;

      if (errors < currentBest || timeSpentSeconds < currentBestTime) {
        await this.progressRepository.saveProgress(new JornadaProgress({
          jornadaId,
          status: 'completed',
          bestErrors: nextBestErrors,
          completedAt: existing.completedAt,
          bestTime: nextBestTime,
          currentQuestionIndex: 0,
          currentErrors: 0,
          currentLives: 3
        }));
      }
      // Replay não ganha XP de novo nem desbloqueia nada novamente
      return;
    }

    // Primeira conclusão da jornada
    const newProgress = new JornadaProgress({
      jornadaId,
      status: 'completed',
      bestErrors: errors,
      completedAt: now,
      bestTime: timeSpentSeconds,
      currentQuestionIndex: 0,
      currentErrors: 0,
      currentLives: 3
    });

    await this.progressRepository.saveProgress(newProgress);

    // Soma XP (XP da tentativa + 50 de bônus)
    const xpBonus = 50;
    const totalGained = xpEarnedThisAttempt + xpBonus;
    await this.progressRepository.addXp(totalGained);

    // Desbloquear a próxima jornada ativa na ordem
    const all = await this.jornadaRepository.findAll();
    const active = all.filter(j => j.ativa).sort((a, b) => a.ordem - b.ordem);

    const currentIndex = active.findIndex(j => j.id === jornadaId);
    if (currentIndex !== -1 && currentIndex < active.length - 1) {
      const nextJornada = active[currentIndex + 1];
      const nextProgress = await this.progressRepository.getProgress(nextJornada.id);

      if (!nextProgress || nextProgress.status === 'locked') {
        await this.progressRepository.saveProgress(new JornadaProgress({
          jornadaId: nextJornada.id,
          status: 'unlocked',
          bestErrors: null,
          completedAt: null,
          currentQuestionIndex: 0,
          currentErrors: 0,
          currentLives: 3,
          bestTime: null
        }));
      }
    }
  }
}

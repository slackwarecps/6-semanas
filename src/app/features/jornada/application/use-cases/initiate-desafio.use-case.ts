import { Injectable } from '@angular/core';
import { DesafioTimer } from '../../../jornada/domain/value-objects/desafio-timer.value-object';
import { JornadaProgress } from '../../../jornada/domain/entities/jornada-progress.entity';
import { JornadaProgressRepository } from '../../../jornada/data/repositories/jornada-progress.repository';

@Injectable({ providedIn: 'root' })
export class InitiateDesafioUseCase {
  constructor(private progressRepository: JornadaProgressRepository) {}

  async execute(jornadaId: string, durationMinutes: number = 120): Promise<DesafioTimer> {
    const progress = await this.progressRepository.getProgress(jornadaId);

    let startTimeMs = Date.now();

    if (progress?.desafioStartTimeMs) {
      startTimeMs = progress.desafioStartTimeMs;
      if (progress.lastActiveAt) {
        const lastActiveTime = new Date(progress.lastActiveAt).getTime();
        const timeAway = Date.now() - lastActiveTime;
        if (timeAway > 0) {
          startTimeMs += timeAway;
        }
      }
    }

    const timer = new DesafioTimer({
      startTimeMs,
      durationMinutes,
    });

    await this.progressRepository.saveProgress(
      new JornadaProgress({
        jornadaId,
        status: progress?.status ?? 'unlocked',
        bestErrors: progress?.bestErrors ?? null,
        completedAt: progress?.completedAt ?? null,
        currentQuestionIndex: progress?.currentQuestionIndex ?? 0,
        currentErrors: progress?.currentErrors ?? 0,
        currentLives: progress?.currentLives ?? 3,
        lastActiveAt: new Date(),
        bestTime: progress?.bestTime ?? null,
        desafioStartTimeMs: startTimeMs,
      }),
    );

    return timer;
  }
}

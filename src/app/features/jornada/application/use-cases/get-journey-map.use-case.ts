import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { Jornada } from '../../domain/entities/jornada.entity';
import { JourneyProgressStatus, JornadaProgress } from '../../domain/entities/jornada-progress.entity';
import { JourneyStats } from '../../domain/value-objects/journey-stats.value-object';

export interface JourneyMapItem {
  jornada: Jornada;
  status: JourneyProgressStatus;
  bestErrors: number | null;
  bestTime?: number | null;
}

export interface JourneyMapResult {
  jornadas: JourneyMapItem[];
  stats: JourneyStats;
}

@Injectable({
  providedIn: 'root'
})
export class GetJourneyMapUseCase {
  constructor(
    private jornadaRepository: JornadaRepository,
    private progressRepository: JornadaProgressRepository
  ) {}

  async execute(): Promise<JourneyMapResult> {
    const all = await this.jornadaRepository.findAll();
    const active = all.filter(j => j.ativa).sort((a, b) => a.ordem - b.ordem);

    const items: JourneyMapItem[] = [];
    let completedCount = 0;

    for (let i = 0; i < active.length; i++) {
      const j = active[i];
      const prog = await this.progressRepository.getProgress(j.id);

      let status: JourneyProgressStatus = 'locked';
      let bestErrors: number | null = null;
      let bestTime: number | null = null;

      if (prog) {
        status = prog.status;
        bestErrors = prog.bestErrors;
        bestTime = prog.bestTime;
        if (status === 'completed') {
          completedCount++;
        }
      } else {
        // Se for a primeira da fila, vem desbloqueada por padrão
        if (i === 0) {
          status = 'unlocked';
        } else {
          // Se a anterior estiver concluída, esta fica desbloqueada
          const prevItem = items[i - 1];
          if (prevItem && prevItem.status === 'completed') {
            status = 'unlocked';
          } else {
            status = 'locked';
          }
        }
      }

      items.push({
        jornada: j,
        status,
        bestErrors,
        bestTime
      });
    }

    const totalXp = await this.progressRepository.getTotalXp();
    const stats = new JourneyStats(totalXp, completedCount, active.length);

    return {
      jornadas: items,
      stats
    };
  }
}

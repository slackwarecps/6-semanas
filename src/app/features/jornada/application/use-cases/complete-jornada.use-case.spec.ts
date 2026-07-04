import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CompleteJornadaUseCase } from './complete-jornada.use-case';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { Jornada } from '../../domain/entities/jornada.entity';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

describe('CompleteJornadaUseCase', () => {
  let useCase: CompleteJornadaUseCase;
  let mockProgressRepo: any;
  let mockJornadaRepo: any;

  beforeEach(() => {
    mockProgressRepo = {
      getProgress: vi.fn(),
      saveProgress: vi.fn(),
      getTotalXp: vi.fn(),
      addXp: vi.fn()
    };

    mockJornadaRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn()
    };

    useCase = new CompleteJornadaUseCase(
      mockProgressRepo as unknown as JornadaProgressRepository,
      mockJornadaRepo as unknown as JornadaRepository
    );
  });

  it('deve registrar progresso como concluído e somar bônus de XP na primeira conclusão', async () => {
    mockProgressRepo.getProgress.mockResolvedValue(null);
    mockProgressRepo.getTotalXp.mockResolvedValue(100);
    mockJornadaRepo.findAll.mockResolvedValue([]);

    await useCase.execute('jornada-1', 2, 30); // 30 XP de acertos + 50 bônus = 80 XP

    expect(mockProgressRepo.saveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        jornadaId: 'jornada-1',
        status: 'completed',
        bestErrors: 2
      })
    );
    expect(mockProgressRepo.addXp).toHaveBeenCalledWith(80);
  });

  it('não deve somar XP novamente ou desbloquear próxima jornada se for um replay', async () => {
    const existingProgress = new JornadaProgress({
      jornadaId: 'jornada-1',
      status: 'completed',
      bestErrors: 3,
      completedAt: new Date()
    });
    mockProgressRepo.getProgress.mockResolvedValue(existingProgress);

    await useCase.execute('jornada-1', 1, 30); // Novo resultado com menos erros (1 < 3)

    // Deve atualizar bestErrors para 1
    expect(mockProgressRepo.saveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        jornadaId: 'jornada-1',
        status: 'completed',
        bestErrors: 1
      })
    );
    // Não deve adicionar XP no replay
    expect(mockProgressRepo.addXp).not.toHaveBeenCalled();
  });

  it('deve desbloquear a próxima jornada ativa na ordem', async () => {
    mockProgressRepo.getProgress.mockResolvedValue(null);
    
    const j1 = new Jornada({
      id: 'jornada-1',
      nome: 'Fase 1',
      ativa: true,
      ordem: 1,
      questionCardIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const j2 = new Jornada({
      id: 'jornada-2',
      nome: 'Fase 2',
      ativa: true,
      ordem: 2,
      questionCardIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockJornadaRepo.findAll.mockResolvedValue([j2, j1]); // Desordenadas de propósito
    mockProgressRepo.getProgress.mockImplementation((id: string) => {
      return Promise.resolve(null);
    });

    await useCase.execute('jornada-1', 0, 10);

    // Deve desbloquear j2 (jornada-2) que é a próxima ativa
    expect(mockProgressRepo.saveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        jornadaId: 'jornada-2',
        status: 'unlocked'
      })
    );
  });
});
